<?php

namespace Database\Seeders;

use App\Enums\CriterionType;
use App\Models\Criterion;
use Illuminate\Database\Seeder;

class CriteriaSeeder extends Seeder
{
    /**
     * Seed the initial criteria (total weight = 100%).
     */
    public function run(): void
    {
        $criteria = [
            ['code' => 'C1', 'name' => 'Harga sewa per bulan', 'type' => CriterionType::Cost, 'weight' => 35, 'unit' => 'Rp'],
            ['code' => 'C2', 'name' => 'Jarak ke kampus', 'type' => CriterionType::Cost, 'weight' => 30, 'unit' => 'km'],
            ['code' => 'C3', 'name' => 'Kelengkapan fasilitas', 'type' => CriterionType::Benefit, 'weight' => 20, 'unit' => 'skala 1-5'],
            ['code' => 'C4', 'name' => 'Keamanan', 'type' => CriterionType::Benefit, 'weight' => 15, 'unit' => 'skala 1-5'],
        ];

        foreach ($criteria as $criterion) {
            Criterion::updateOrCreate(['code' => $criterion['code']], $criterion);
        }
    }
}
