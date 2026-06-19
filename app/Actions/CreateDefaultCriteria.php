<?php

namespace App\Actions;

use App\Enums\CriterionType;
use App\Models\User;

/**
 * Creates the four default decision criteria (total weight 100%) for a user so
 * they have a valid starting point. Idempotent per user (matched by code).
 */
class CreateDefaultCriteria
{
    /**
     * @var list<array{code: string, name: string, type: CriterionType, weight: int, unit: string}>
     */
    private const DEFAULTS = [
        ['code' => 'C1', 'name' => 'Harga sewa per bulan', 'type' => CriterionType::Cost, 'weight' => 35, 'unit' => 'Rp'],
        ['code' => 'C2', 'name' => 'Jarak ke kampus', 'type' => CriterionType::Cost, 'weight' => 30, 'unit' => 'km'],
        ['code' => 'C3', 'name' => 'Kelengkapan fasilitas', 'type' => CriterionType::Benefit, 'weight' => 20, 'unit' => 'skala 1-5'],
        ['code' => 'C4', 'name' => 'Keamanan', 'type' => CriterionType::Benefit, 'weight' => 15, 'unit' => 'skala 1-5'],
    ];

    public function handle(User $user): void
    {
        foreach (self::DEFAULTS as $criterion) {
            $user->criteria()->firstOrCreate(
                ['code' => $criterion['code']],
                [
                    'name' => $criterion['name'],
                    'type' => $criterion['type'],
                    'weight' => $criterion['weight'],
                    'unit' => $criterion['unit'],
                ],
            );
        }
    }
}
