<?php

namespace Database\Seeders;

use App\Models\Alternative;
use App\Models\Criterion;
use App\Models\User;
use Illuminate\Database\Seeder;

class AlternativeSeeder extends Seeder
{
    /**
     * Seed the initial alternatives (Kos A–E) and their criterion values for
     * the first user. Value order per row matches criteria C1..C4.
     */
    public function run(): void
    {
        $userId = User::query()->orderBy('id')->value('id');

        if ($userId === null) {
            return;
        }

        $alternatives = [
            ['code' => 'A1', 'name' => 'Kos A', 'location' => 'Jl. Mawar No. 1', 'values' => ['C1' => 700000, 'C2' => 1.0, 'C3' => 4, 'C4' => 3]],
            ['code' => 'A2', 'name' => 'Kos B', 'location' => 'Jl. Melati No. 2', 'values' => ['C1' => 600000, 'C2' => 1.8, 'C3' => 3, 'C4' => 4]],
            ['code' => 'A3', 'name' => 'Kos C', 'location' => 'Jl. Anggrek No. 3', 'values' => ['C1' => 850000, 'C2' => 0.5, 'C3' => 5, 'C4' => 4]],
            ['code' => 'A4', 'name' => 'Kos D', 'location' => 'Jl. Kenanga No. 4', 'values' => ['C1' => 550000, 'C2' => 2.5, 'C3' => 2, 'C4' => 3]],
            ['code' => 'A5', 'name' => 'Kos E', 'location' => 'Jl. Dahlia No. 5', 'values' => ['C1' => 750000, 'C2' => 1.2, 'C3' => 4, 'C4' => 5]],
        ];

        $criteria = Criterion::where('user_id', $userId)->pluck('id', 'code');

        foreach ($alternatives as $data) {
            $alternative = Alternative::updateOrCreate(
                ['user_id' => $userId, 'code' => $data['code']],
                ['name' => $data['name'], 'location' => $data['location']],
            );

            foreach ($data['values'] as $criterionCode => $value) {
                if (! isset($criteria[$criterionCode])) {
                    continue;
                }

                $alternative->alternativeValues()->updateOrCreate(
                    ['criterion_id' => $criteria[$criterionCode]],
                    ['value' => $value],
                );
            }
        }
    }
}
