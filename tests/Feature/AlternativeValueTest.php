<?php

use App\Models\Alternative;
use App\Models\Criterion;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('menampilkan matriks nilai alternatif', function () {
    Criterion::factory()->benefit()->create(['code' => 'C1']);
    Alternative::factory()->create(['code' => 'A1']);

    $this->actingAs($this->user)
        ->get(route('values.index'))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('values/index')
                ->has('criteria', 1)
                ->has('alternatives', 1)
                ->has('values')
        );
});

it('dapat menyimpan nilai alternatif yang valid', function () {
    $criterion = Criterion::factory()->benefit()->create();
    $alternative = Alternative::factory()->create();

    $this->actingAs($this->user)
        ->put(route('values.update'), [
            'values' => [
                $alternative->id => [
                    $criterion->id => 4,
                ],
            ],
        ])
        ->assertRedirect(route('values.index'));

    $this->assertDatabaseHas('alternative_values', [
        'alternative_id' => $alternative->id,
        'criterion_id' => $criterion->id,
        'value' => 4,
    ]);
});

it('memperbarui nilai yang sudah ada tanpa menduplikasi', function () {
    $criterion = Criterion::factory()->benefit()->create();
    $alternative = Alternative::factory()->create();
    $alternative->alternativeValues()->create([
        'criterion_id' => $criterion->id,
        'value' => 2,
    ]);

    $this->actingAs($this->user)
        ->put(route('values.update'), [
            'values' => [
                $alternative->id => [
                    $criterion->id => 5,
                ],
            ],
        ])
        ->assertRedirect(route('values.index'));

    $this->assertDatabaseCount('alternative_values', 1);
    $this->assertDatabaseHas('alternative_values', [
        'alternative_id' => $alternative->id,
        'criterion_id' => $criterion->id,
        'value' => 5,
    ]);
});

it('menolak nilai kosong', function () {
    $criterion = Criterion::factory()->benefit()->create();
    $alternative = Alternative::factory()->create();

    $this->actingAs($this->user)
        ->put(route('values.update'), [
            'values' => [
                $alternative->id => [
                    $criterion->id => '',
                ],
            ],
        ])
        ->assertSessionHasErrors("values.{$alternative->id}.{$criterion->id}");
});

it('menolak nilai non-angka', function () {
    $criterion = Criterion::factory()->benefit()->create();
    $alternative = Alternative::factory()->create();

    $this->actingAs($this->user)
        ->put(route('values.update'), [
            'values' => [
                $alternative->id => [
                    $criterion->id => 'abc',
                ],
            ],
        ])
        ->assertSessionHasErrors("values.{$alternative->id}.{$criterion->id}");
});

it('menolak nilai nol pada kriteria cost (pembagian nol)', function () {
    $criterion = Criterion::factory()->cost()->create();
    $alternative = Alternative::factory()->create();

    $this->actingAs($this->user)
        ->put(route('values.update'), [
            'values' => [
                $alternative->id => [
                    $criterion->id => 0,
                ],
            ],
        ])
        ->assertSessionHasErrors("values.{$alternative->id}.{$criterion->id}");

    $this->assertDatabaseCount('alternative_values', 0);
});

it('mewajibkan pengguna login untuk mengakses nilai alternatif', function () {
    $this->get(route('values.index'))->assertRedirect(route('login'));
});
