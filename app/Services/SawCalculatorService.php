<?php

namespace App\Services;

use App\Enums\CriterionType;
use App\Exceptions\SawCalculationException;
use App\Models\Alternative;
use App\Models\Criterion;
use Illuminate\Support\Collection;

/**
 * Performs the Simple Additive Weighting (SAW) calculation.
 *
 * Normalization rules:
 * - Benefit: r_ij = x_ij / max(x_j)
 * - Cost:    r_ij = min(x_j) / x_ij
 *
 * Preference score: V_i = Σ_j (w_j_normalized * r_ij), where weights are
 * normalized by their own total (w_j / Σw) so the result stays valid even if
 * the raw weights do not sum to exactly 100.
 *
 * Internal computation uses full float precision; rounding is left to the
 * presentation layer.
 */
class SawCalculatorService
{
    /**
     * Calculate the SAW ranking.
     *
     * @param  Collection<int, Criterion>  $criteria
     * @param  Collection<int, Alternative>  $alternatives  Each must have `alternativeValues` loaded.
     *
     * @throws SawCalculationException When data is incomplete or would divide by zero.
     */
    public function calculate(Collection $criteria, Collection $alternatives): SawResult
    {
        if ($criteria->isEmpty()) {
            throw new SawCalculationException('Belum ada kriteria untuk dihitung.');
        }

        if ($alternatives->isEmpty()) {
            throw new SawCalculationException('Belum ada alternatif untuk dihitung.');
        }

        $decisionMatrix = $this->buildDecisionMatrix($criteria, $alternatives);
        $minMax = $this->computeMinMax($criteria, $decisionMatrix);
        $weightTotal = $this->totalWeight($criteria);
        $normalizedMatrix = $this->normalize($criteria, $alternatives, $decisionMatrix, $minMax);
        $weightedMatrix = $this->applyWeights($criteria, $alternatives, $normalizedMatrix, $weightTotal);
        $scores = $this->scores($alternatives, $weightedMatrix);
        $ranking = $this->rank($alternatives, $scores);

        return new SawResult(
            criteria: $criteria->map(fn (Criterion $criterion): array => [
                'id' => $criterion->id,
                'code' => $criterion->code,
                'name' => $criterion->name,
                'type' => $criterion->type->value,
                'weight' => (float) $criterion->weight,
                'weight_normalized' => $weightTotal > 0 ? (float) $criterion->weight / $weightTotal : 0.0,
            ])->values()->all(),
            alternatives: $alternatives->map(fn (Alternative $alternative): array => [
                'id' => $alternative->id,
                'code' => $alternative->code,
                'name' => $alternative->name,
            ])->values()->all(),
            decisionMatrix: $decisionMatrix,
            minMax: $minMax,
            normalizedMatrix: $normalizedMatrix,
            weightedMatrix: $weightedMatrix,
            scores: $scores,
            ranking: $ranking,
        );
    }

    /**
     * Build [alternative_id][criterion_id] => raw value, ensuring completeness.
     *
     * @param  Collection<int, Criterion>  $criteria
     * @param  Collection<int, Alternative>  $alternatives
     * @return array<int, array<int, float>>
     *
     * @throws SawCalculationException
     */
    private function buildDecisionMatrix(Collection $criteria, Collection $alternatives): array
    {
        $matrix = [];

        foreach ($alternatives as $alternative) {
            $values = $alternative->alternativeValues->keyBy('criterion_id');

            foreach ($criteria as $criterion) {
                $value = $values->get($criterion->id);

                if ($value === null) {
                    throw new SawCalculationException(
                        "Nilai untuk alternatif \"{$alternative->name}\" pada kriteria \"{$criterion->name}\" belum diisi.",
                    );
                }

                $matrix[$alternative->id][$criterion->id] = (float) $value->value;
            }
        }

        return $matrix;
    }

    /**
     * @param  Collection<int, Criterion>  $criteria
     * @param  array<int, array<int, float>>  $decisionMatrix
     * @return array<int, array{min: float, max: float}>
     */
    private function computeMinMax(Collection $criteria, array $decisionMatrix): array
    {
        $minMax = [];

        foreach ($criteria as $criterion) {
            $column = array_column($decisionMatrix, $criterion->id);

            $minMax[$criterion->id] = [
                'min' => count($column) > 0 ? (float) min($column) : 0.0,
                'max' => count($column) > 0 ? (float) max($column) : 0.0,
            ];
        }

        return $minMax;
    }

    /**
     * @param  Collection<int, Criterion>  $criteria
     * @param  Collection<int, Alternative>  $alternatives
     * @param  array<int, array<int, float>>  $decisionMatrix
     * @param  array<int, array{min: float, max: float}>  $minMax
     * @return array<int, array<int, float>>
     *
     * @throws SawCalculationException
     */
    private function normalize(Collection $criteria, Collection $alternatives, array $decisionMatrix, array $minMax): array
    {
        $normalized = [];

        foreach ($alternatives as $alternative) {
            foreach ($criteria as $criterion) {
                $value = $decisionMatrix[$alternative->id][$criterion->id];
                $min = $minMax[$criterion->id]['min'];
                $max = $minMax[$criterion->id]['max'];

                if ($criterion->type === CriterionType::Benefit) {
                    if ($max <= 0.0) {
                        throw new SawCalculationException(
                            "Kriteria benefit \"{$criterion->name}\" memiliki nilai maksimum nol sehingga tidak dapat dinormalisasi.",
                        );
                    }

                    $normalized[$alternative->id][$criterion->id] = $value / $max;
                } else {
                    if ($value <= 0.0) {
                        throw new SawCalculationException(
                            "Kriteria cost \"{$criterion->name}\" memiliki nilai nol pada alternatif \"{$alternative->name}\" sehingga menyebabkan pembagian tidak valid.",
                        );
                    }

                    $normalized[$alternative->id][$criterion->id] = $min / $value;
                }
            }
        }

        return $normalized;
    }

    /**
     * @param  Collection<int, Criterion>  $criteria
     * @param  Collection<int, Alternative>  $alternatives
     * @param  array<int, array<int, float>>  $normalizedMatrix
     * @return array<int, array<int, float>>
     */
    private function applyWeights(Collection $criteria, Collection $alternatives, array $normalizedMatrix, float $weightTotal): array
    {
        $weighted = [];

        foreach ($alternatives as $alternative) {
            foreach ($criteria as $criterion) {
                $weight = $weightTotal > 0 ? (float) $criterion->weight / $weightTotal : 0.0;
                $weighted[$alternative->id][$criterion->id] = $normalizedMatrix[$alternative->id][$criterion->id] * $weight;
            }
        }

        return $weighted;
    }

    /**
     * @param  Collection<int, Alternative>  $alternatives
     * @param  array<int, array<int, float>>  $weightedMatrix
     * @return array<int, float>
     */
    private function scores(Collection $alternatives, array $weightedMatrix): array
    {
        $scores = [];

        foreach ($alternatives as $alternative) {
            $scores[$alternative->id] = array_sum($weightedMatrix[$alternative->id]);
        }

        return $scores;
    }

    /**
     * @param  Collection<int, Alternative>  $alternatives
     * @param  array<int, float>  $scores
     * @return list<array{rank: int, alternative_id: int, code: string, name: string, score: float}>
     */
    private function rank(Collection $alternatives, array $scores): array
    {
        $rows = $alternatives->map(fn (Alternative $alternative): array => [
            'alternative_id' => $alternative->id,
            'code' => $alternative->code,
            'name' => $alternative->name,
            'score' => $scores[$alternative->id],
        ])->values()->all();

        usort($rows, fn (array $a, array $b): int => $b['score'] <=> $a['score']);

        $ranking = [];

        foreach ($rows as $index => $row) {
            $ranking[] = [
                'rank' => $index + 1,
                'alternative_id' => $row['alternative_id'],
                'code' => $row['code'],
                'name' => $row['name'],
                'score' => $row['score'],
            ];
        }

        return $ranking;
    }

    /**
     * @param  Collection<int, Criterion>  $criteria
     */
    private function totalWeight(Collection $criteria): float
    {
        return (float) $criteria->sum(fn (Criterion $criterion): float => (float) $criterion->weight);
    }
}
