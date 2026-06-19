<?php

use App\Exceptions\SawCalculationException;
use App\Models\Alternative;
use App\Models\Criterion;
use App\Services\SawCalculatorService;
use Database\Seeders\AlternativeSeeder;
use Database\Seeders\CriteriaSeeder;

function sawService(): SawCalculatorService
{
    return app(SawCalculatorService::class);
}

/**
 * Load seeded criteria and alternatives in a deterministic order.
 *
 * @return array{0: \Illuminate\Support\Collection<int, Criterion>, 1: \Illuminate\Support\Collection<int, Alternative>}
 */
function loadSawData(): array
{
    $criteria = Criterion::orderBy('code')->get();
    $alternatives = Alternative::with('alternativeValues')->orderBy('code')->get();

    return [$criteria, $alternatives];
}

it('menghitung skor preferensi (Vi) sesuai perhitungan manual', function () {
    $this->seed([CriteriaSeeder::class, AlternativeSeeder::class]);
    [$criteria, $alternatives] = loadSawData();

    $result = sawService()->calculate($criteria, $alternatives);

    $scores = collect($result->ranking)->keyBy('name');

    // Nilai hasil perhitungan manual (lihat catatan verifikasi SAW di implementation-plan.md).
    expect($scores['Kos A']['score'])->toEqualWithDelta(0.675000, 0.0001)
        ->and($scores['Kos B']['score'])->toEqualWithDelta(0.644167, 0.0001)
        ->and($scores['Kos C']['score'])->toEqualWithDelta(0.846471, 0.0001)
        ->and($scores['Kos D']['score'])->toEqualWithDelta(0.580000, 0.0001)
        ->and($scores['Kos E']['score'])->toEqualWithDelta(0.691667, 0.0001);
});

it('mengurutkan ranking dari skor tertinggi dan menetapkan Kos C sebagai terbaik', function () {
    $this->seed([CriteriaSeeder::class, AlternativeSeeder::class]);
    [$criteria, $alternatives] = loadSawData();

    $result = sawService()->calculate($criteria, $alternatives);

    $orderedNames = collect($result->ranking)->pluck('name')->all();

    expect($orderedNames)->toBe(['Kos C', 'Kos E', 'Kos A', 'Kos B', 'Kos D'])
        ->and($result->best()['name'])->toBe('Kos C')
        ->and($result->ranking[0]['rank'])->toBe(1)
        ->and($result->ranking[4]['rank'])->toBe(5);
});

it('menghitung normalisasi benefit (x/max) dan cost (min/x) dengan benar', function () {
    $this->seed([CriteriaSeeder::class, AlternativeSeeder::class]);
    [$criteria, $alternatives] = loadSawData();

    $result = sawService()->calculate($criteria, $alternatives);

    $kosA = Alternative::where('code', 'A1')->first();
    $c1 = Criterion::where('code', 'C1')->first(); // cost, min 550000
    $c3 = Criterion::where('code', 'C3')->first(); // benefit, max 5

    // Cost C1 untuk Kos A: 550000 / 700000
    expect($result->normalizedMatrix[$kosA->id][$c1->id])->toEqualWithDelta(0.785714, 0.0001)
        // Benefit C3 untuk Kos A: 4 / 5
        ->and($result->normalizedMatrix[$kosA->id][$c3->id])->toEqualWithDelta(0.800000, 0.0001);
});

it('menormalisasi bobot dengan w/Σw walau total bobot bukan 100', function () {
    Criterion::factory()->benefit()->create(['code' => 'X1', 'weight' => 70]);
    Criterion::factory()->benefit()->create(['code' => 'X2', 'weight' => 40]); // total 110

    $alternative = Alternative::factory()->create();
    foreach (Criterion::all() as $criterion) {
        $alternative->alternativeValues()->create(['criterion_id' => $criterion->id, 'value' => 10]);
    }

    [$criteria, $alternatives] = loadSawData();
    $result = sawService()->calculate($criteria, $alternatives);

    // Satu alternatif benefit → setiap r_ij = 1, sehingga Vi = Σ(w/Σw) = 1.0
    expect($result->ranking[0]['score'])->toEqualWithDelta(1.0, 0.0001);
});

it('menolak perhitungan bila ada nilai alternatif yang belum diisi', function () {
    Criterion::factory()->benefit()->create(['weight' => 100]);
    Alternative::factory()->create(); // tanpa nilai

    [$criteria, $alternatives] = loadSawData();

    expect(fn () => sawService()->calculate($criteria, $alternatives))
        ->toThrow(SawCalculationException::class);
});

it('menolak perhitungan kriteria cost dengan nilai nol (pembagian nol)', function () {
    $criterion = Criterion::factory()->cost()->create(['weight' => 100]);
    $alternative = Alternative::factory()->create();
    $alternative->alternativeValues()->create(['criterion_id' => $criterion->id, 'value' => 0]);

    [$criteria, $alternatives] = loadSawData();

    expect(fn () => sawService()->calculate($criteria, $alternatives))
        ->toThrow(SawCalculationException::class);
});

it('menolak perhitungan bila tidak ada kriteria atau alternatif', function () {
    [$criteria, $alternatives] = loadSawData();

    expect(fn () => sawService()->calculate($criteria, $alternatives))
        ->toThrow(SawCalculationException::class);
});
