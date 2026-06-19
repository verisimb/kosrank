<?php

use App\Models\User;
use Database\Seeders\AlternativeSeeder;
use Database\Seeders\CriteriaSeeder;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('menampilkan ranking terurut dan rekomendasi terbaik ketika data valid', function () {
    $this->seed([CriteriaSeeder::class, AlternativeSeeder::class]);

    $this->actingAs($this->user)
        ->get(route('result.index'))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('result/index')
                ->where('validationErrors', [])
                ->has('ranking', 5)
                ->where('ranking.0.rank', 1)
                ->where('ranking.0.name', 'Kos C')
                ->where('ranking.4.rank', 5)
                ->where('ranking.4.name', 'Kos D')
                ->where('best.name', 'Kos C')
        );
});

it('memastikan ranking diurutkan dari nilai tertinggi ke terendah', function () {
    $this->seed([CriteriaSeeder::class, AlternativeSeeder::class]);

    $this->actingAs($this->user)
        ->get(route('result.index'))
        ->assertInertia(
            fn ($page) => $page->where('ranking', function ($ranking): bool {
                $scores = collect($ranking)->pluck('score')->all();
                $sorted = $scores;
                rsort($sorted);

                return $scores === $sorted;
            })
        );
});

it('menampilkan error blokir ketika data belum lengkap', function () {
    $this->actingAs($this->user)
        ->get(route('result.index'))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->where('best', null)
                ->where('ranking', [])
                ->where('validationErrors', fn ($errors) => count($errors) > 0)
        );
});

it('mewajibkan pengguna login untuk mengakses hasil', function () {
    $this->get(route('result.index'))->assertRedirect(route('login'));
});
