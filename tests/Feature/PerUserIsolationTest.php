<?php

use App\Models\Alternative;
use App\Models\Criterion;
use App\Models\User;

beforeEach(function () {
    $this->userA = User::factory()->create();
    $this->userB = User::factory()->create();
});

it('hanya menampilkan kriteria milik pengguna yang login', function () {
    Criterion::factory()->for($this->userA)->create(['code' => 'C1']);
    Criterion::factory()->for($this->userB)->create(['code' => 'C1']);
    Criterion::factory()->for($this->userB)->create(['code' => 'C2']);

    $this->actingAs($this->userA)
        ->get(route('criteria.index'))
        ->assertInertia(fn ($page) => $page->has('criteria', 1));
});

it('hanya menampilkan alternatif milik pengguna yang login', function () {
    Alternative::factory()->for($this->userA)->count(2)->create();
    Alternative::factory()->for($this->userB)->count(3)->create();

    $this->actingAs($this->userA)
        ->get(route('alternatives.index'))
        ->assertInertia(fn ($page) => $page->has('alternatives', 2));
});

it('mengembalikan 404 saat mencoba mengubah kriteria milik pengguna lain', function () {
    $criterionB = Criterion::factory()->for($this->userB)->create(['code' => 'C1']);

    $this->actingAs($this->userA)
        ->put(route('criteria.update', $criterionB), [
            'code' => 'C1',
            'name' => 'Diretas',
            'type' => 'benefit',
            'weight' => 10,
        ])
        ->assertNotFound();

    expect($criterionB->fresh()->name)->not->toBe('Diretas');
});

it('mengembalikan 404 saat mencoba menghapus alternatif milik pengguna lain', function () {
    $alternativeB = Alternative::factory()->for($this->userB)->create();

    $this->actingAs($this->userA)
        ->delete(route('alternatives.destroy', $alternativeB))
        ->assertNotFound();

    $this->assertDatabaseHas('alternatives', ['id' => $alternativeB->id]);
});

it('mengizinkan kode yang sama pada pengguna berbeda', function () {
    Criterion::factory()->for($this->userB)->create(['code' => 'C1']);

    $this->actingAs($this->userA)
        ->post(route('criteria.store'), [
            'code' => 'C1',
            'name' => 'Harga',
            'type' => 'cost',
            'weight' => 35,
        ])
        ->assertRedirect(route('criteria.index'));

    $this->assertDatabaseHas('criteria', ['user_id' => $this->userA->id, 'code' => 'C1']);
    $this->assertDatabaseHas('criteria', ['user_id' => $this->userB->id, 'code' => 'C1']);
});

it('tidak menyimpan nilai untuk kriteria/alternatif milik pengguna lain', function () {
    $criterionA = Criterion::factory()->for($this->userA)->benefit()->create();
    $alternativeB = Alternative::factory()->for($this->userB)->create();

    $this->actingAs($this->userA)
        ->put(route('values.update'), [
            'values' => [
                $alternativeB->id => [
                    $criterionA->id => 5,
                ],
            ],
        ]);

    // Alternatif milik B tidak boleh kebagian nilai dari aksi user A.
    $this->assertDatabaseMissing('alternative_values', [
        'alternative_id' => $alternativeB->id,
        'criterion_id' => $criterionA->id,
    ]);
});
