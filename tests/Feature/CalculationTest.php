<?php

use App\Models\User;
use Database\Seeders\AlternativeSeeder;
use Database\Seeders\CriteriaSeeder;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('menolak perhitungan ketika belum ada data', function () {
    $this->actingAs($this->user)
        ->get(route('calculation.index'))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('calculation/index')
                ->where('result', null)
                ->has('validationErrors')
                ->where('validationErrors', fn ($errors) => count($errors) > 0)
        );
});

it('menolak perhitungan ketika total bobot tidak 100%', function () {
    $this->seed([CriteriaSeeder::class, AlternativeSeeder::class]);

    // Ubah bobot salah satu kriteria sehingga total ≠ 100.
    \App\Models\Criterion::where('code', 'C1')->update(['weight' => 50]);

    $this->actingAs($this->user)
        ->get(route('calculation.index'))
        ->assertInertia(
            fn ($page) => $page
                ->where('result', null)
                ->where('validationErrors', fn ($errors) => collect($errors)->contains(
                    fn ($e) => str_contains($e, 'Total bobot')
                ))
        );
});

it('menolak perhitungan ketika jumlah alternatif kurang dari lima', function () {
    $this->seed([CriteriaSeeder::class]);
    \App\Models\Alternative::factory()->count(3)->create()->each(function ($alternative) {
        foreach (\App\Models\Criterion::all() as $criterion) {
            $alternative->alternativeValues()->create([
                'criterion_id' => $criterion->id,
                'value' => $criterion->type->value === 'cost' ? 5 : 4,
            ]);
        }
    });

    $this->actingAs($this->user)
        ->get(route('calculation.index'))
        ->assertInertia(
            fn ($page) => $page
                ->where('result', null)
                ->where('validationErrors', fn ($errors) => collect($errors)->contains(
                    fn ($e) => str_contains($e, 'minimal 5')
                ))
        );
});

it('menampilkan seluruh tahapan perhitungan ketika data valid', function () {
    $this->seed([CriteriaSeeder::class, AlternativeSeeder::class]);

    $this->actingAs($this->user)
        ->get(route('calculation.index'))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('calculation/index')
                ->where('validationErrors', [])
                ->has('result.criteria', 4)
                ->has('result.alternatives', 5)
                ->has('result.decision_matrix')
                ->has('result.min_max')
                ->has('result.normalized_matrix')
                ->has('result.weighted_matrix')
                ->has('result.scores')
                ->has('result.ranking', 5)
                ->where('result.best.name', 'Kos C')
                ->where('result.ranking.0.rank', 1)
        );
});

it('mewajibkan pengguna login untuk mengakses perhitungan', function () {
    $this->get(route('calculation.index'))->assertRedirect(route('login'));
});
