<?php

use App\Models\Criterion;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('menampilkan halaman daftar kriteria beserta total bobot', function () {
    Criterion::factory()->for($this->user)->benefit()->create(['code' => 'C1', 'weight' => 60]);
    Criterion::factory()->for($this->user)->cost()->create(['code' => 'C2', 'weight' => 40]);

    $this->actingAs($this->user)
        ->get(route('criteria.index'))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('criteria/index')
                ->has('criteria', 2)
                ->where('totalWeight', 100)
        );
});

it('dapat menambah kriteria baru', function () {
    $this->actingAs($this->user)
        ->post(route('criteria.store'), [
            'code' => 'C1',
            'name' => 'Harga sewa per bulan',
            'type' => 'cost',
            'weight' => 35,
            'unit' => 'Rp',
        ])
        ->assertRedirect(route('criteria.index'));

    $this->assertDatabaseHas('criteria', [
        'user_id' => $this->user->id,
        'code' => 'C1',
        'name' => 'Harga sewa per bulan',
        'type' => 'cost',
        'weight' => 35,
    ]);
});

it('dapat mengubah kriteria', function () {
    $criterion = Criterion::factory()->for($this->user)->benefit()->create(['code' => 'C1', 'weight' => 20]);

    $this->actingAs($this->user)
        ->put(route('criteria.update', $criterion), [
            'code' => 'C1',
            'name' => 'Keamanan',
            'type' => 'benefit',
            'weight' => 25,
            'unit' => 'skala 1-5',
        ])
        ->assertRedirect(route('criteria.index'));

    expect($criterion->fresh())
        ->name->toBe('Keamanan')
        ->weight->toBe('25.00');
});

it('dapat menghapus kriteria', function () {
    $criterion = Criterion::factory()->for($this->user)->create();

    $this->actingAs($this->user)
        ->delete(route('criteria.destroy', $criterion))
        ->assertRedirect(route('criteria.index'));

    $this->assertDatabaseMissing('criteria', ['id' => $criterion->id]);
});

it('menolak kriteria tanpa nama dan bobot tidak valid', function () {
    $this->actingAs($this->user)
        ->post(route('criteria.store'), [
            'code' => 'C1',
            'name' => '',
            'type' => 'benefit',
            'weight' => 0,
        ])
        ->assertSessionHasErrors(['name', 'weight']);

    $this->assertDatabaseCount('criteria', 0);
});

it('menolak kode kriteria yang duplikat dalam satu pengguna', function () {
    Criterion::factory()->for($this->user)->create(['code' => 'C1']);

    $this->actingAs($this->user)
        ->post(route('criteria.store'), [
            'code' => 'C1',
            'name' => 'Kriteria lain',
            'type' => 'benefit',
            'weight' => 10,
        ])
        ->assertSessionHasErrors('code');
});

it('mewajibkan pengguna login untuk mengakses kriteria', function () {
    $this->get(route('criteria.index'))->assertRedirect(route('login'));
});
