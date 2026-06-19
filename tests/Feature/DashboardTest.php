<?php

use App\Models\User;
use Database\Seeders\AlternativeSeeder;
use Database\Seeders\CriteriaSeeder;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

it('menampilkan ringkasan jumlah kriteria, alternatif, dan alternatif terbaik saat data lengkap', function () {
    $user = User::factory()->create();
    $this->seed([CriteriaSeeder::class, AlternativeSeeder::class]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('dashboard')
                ->where('summary.criteriaCount', 4)
                ->where('summary.alternativesCount', 5)
                ->where('summary.totalWeight', 100)
                ->where('summary.isReady', true)
                ->where('summary.best.name', 'Kos C')
        );
});

it('menandai data belum siap ketika belum lengkap', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->where('summary.isReady', false)
                ->where('summary.best', null)
                ->where('summary.criteriaCount', 0)
        );
});
