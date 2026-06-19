<?php

namespace App\Services;

use App\Enums\CriterionType;
use App\Models\Alternative;
use App\Models\Criterion;
use Illuminate\Support\Collection;

/**
 * Validates whether the current data set is ready for a SAW calculation.
 * Returns human-readable error messages (Bahasa Indonesia) instead of throwing,
 * so the UI can present all blocking issues at once.
 */
class SawDataValidator
{
    /**
     * Minimum number of alternatives required for a final calculation.
     */
    public const int MINIMUM_ALTERNATIVES = 5;

    /**
     * @param  Collection<int, Criterion>  $criteria
     * @param  Collection<int, Alternative>  $alternatives  Each must have `alternativeValues` loaded.
     * @return list<string> Empty when the data is ready to calculate.
     */
    public function validate(Collection $criteria, Collection $alternatives): array
    {
        $errors = [];

        if ($criteria->isEmpty()) {
            $errors[] = 'Belum ada kriteria. Tambahkan minimal satu kriteria terlebih dahulu.';
        }

        if ($alternatives->isEmpty()) {
            $errors[] = 'Belum ada alternatif. Tambahkan minimal satu alternatif terlebih dahulu.';
        }

        if ($criteria->isEmpty() || $alternatives->isEmpty()) {
            return $errors;
        }

        if ($alternatives->count() < self::MINIMUM_ALTERNATIVES) {
            $errors[] = sprintf(
                'Jumlah alternatif minimal %d untuk perhitungan (saat ini %d).',
                self::MINIMUM_ALTERNATIVES,
                $alternatives->count(),
            );
        }

        $totalWeight = (float) $criteria->sum(fn (Criterion $criterion): float => (float) $criterion->weight);
        if (abs($totalWeight - 100.0) > 0.01) {
            $errors[] = sprintf(
                'Total bobot kriteria harus tepat 100%% (saat ini %s%%).',
                rtrim(rtrim(number_format($totalWeight, 2, '.', ''), '0'), '.'),
            );
        }

        $missing = 0;
        $invalidCost = [];

        foreach ($alternatives as $alternative) {
            $valuesByCriterion = $alternative->alternativeValues->keyBy('criterion_id');

            foreach ($criteria as $criterion) {
                $value = $valuesByCriterion->get($criterion->id);

                if ($value === null) {
                    $missing++;

                    continue;
                }

                if ($criterion->type === CriterionType::Cost && (float) $value->value <= 0) {
                    $invalidCost[] = sprintf('%s pada %s', $criterion->name, $alternative->name);
                }
            }
        }

        if ($missing > 0) {
            $errors[] = sprintf('Masih ada %d nilai alternatif yang belum diisi.', $missing);
        }

        if ($invalidCost !== []) {
            $errors[] = 'Terdapat nilai 0 pada kriteria cost yang menyebabkan pembagian tidak valid: '.implode(', ', $invalidCost).'.';
        }

        return $errors;
    }
}
