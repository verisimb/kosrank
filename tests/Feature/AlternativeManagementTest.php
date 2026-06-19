<?php

use App\Models\Alternative;
use App\Models\AlternativeValue;
use App\Models\Criterion;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('menampilkan halaman daftar alternatif', function () {
    Alternative::factory()->for($this->user)->count(3)->create();

    $this->actingAs($this->user)
        ->get(route('alternatives.index'))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('alternatives/index')
                ->has('alternatives', 3)
        );
});

it('dapat menambah alternatif baru', function () {
    $this->actingAs($this->user)
        ->post(route('alternatives.store'), [
            'code' => 'A1',
            'name' => 'Kos Mawar',
            'location' => 'Jl. Mawar No. 1',
        ])
        ->assertRedirect(route('alternatives.index'));

    $this->assertDatabaseHas('alternatives', [
        'user_id' => $this->user->id,
        'code' => 'A1',
        'name' => 'Kos Mawar',
        'location' => 'Jl. Mawar No. 1',
    ]);
});

it('dapat mengubah alternatif', function () {
    $alternative = Alternative::factory()->for($this->user)->create(['code' => 'A1', 'name' => 'Kos Lama']);

    $this->actingAs($this->user)
        ->put(route('alternatives.update', $alternative), [
            'code' => 'A1',
            'name' => 'Kos Baru',
            'location' => 'Jl. Melati No. 2',
        ])
        ->assertRedirect(route('alternatives.index'));

    expect($alternative->fresh())
        ->name->toBe('Kos Baru')
        ->location->toBe('Jl. Melati No. 2');
});

it('dapat menghapus alternatif beserta nilainya', function () {
    $alternative = Alternative::factory()->for($this->user)->create();
    $criterion = Criterion::factory()->for($this->user)->create();
    AlternativeValue::factory()->create([
        'alternative_id' => $alternative->id,
        'criterion_id' => $criterion->id,
    ]);

    $this->actingAs($this->user)
        ->delete(route('alternatives.destroy', $alternative))
        ->assertRedirect(route('alternatives.index'));

    $this->assertDatabaseMissing('alternatives', ['id' => $alternative->id]);
    $this->assertDatabaseMissing('alternative_values', ['alternative_id' => $alternative->id]);
});

it('menolak alternatif tanpa nama dan lokasi', function () {
    $this->actingAs($this->user)
        ->post(route('alternatives.store'), [
            'code' => 'A1',
            'name' => '',
            'location' => '',
        ])
        ->assertSessionHasErrors(['name', 'location']);

    $this->assertDatabaseCount('alternatives', 0);
});

it('menolak kode alternatif yang duplikat dalam satu pengguna', function () {
    Alternative::factory()->for($this->user)->create(['code' => 'A1']);

    $this->actingAs($this->user)
        ->post(route('alternatives.store'), [
            'code' => 'A1',
            'name' => 'Kos lain',
            'location' => 'Jl. Anggrek No. 3',
        ])
        ->assertSessionHasErrors('code');
});

it('mewajibkan pengguna login untuk mengakses alternatif', function () {
    $this->get(route('alternatives.index'))->assertRedirect(route('login'));
});
