<?php

namespace App\Services;

/**
 * Immutable result of a SAW calculation, containing every stage of the process
 * so the UI can display the computation transparently.
 *
 * @phpstan-type CriterionInfo array{id: int, code: string, name: string, type: string, weight: float, weight_normalized: float}
 * @phpstan-type AlternativeInfo array{id: int, code: string, name: string}
 * @phpstan-type MinMaxInfo array{min: float, max: float}
 * @phpstan-type RankingRow array{rank: int, alternative_id: int, code: string, name: string, score: float}
 */
class SawResult
{
    /**
     * @param  array<int, CriterionInfo>  $criteria  Criteria with raw and normalized weights.
     * @param  array<int, AlternativeInfo>  $alternatives  Alternatives in input order.
     * @param  array<int, array<int, float>>  $decisionMatrix  [alternative_id][criterion_id] => raw value.
     * @param  array<int, MinMaxInfo>  $minMax  [criterion_id] => min/max across alternatives.
     * @param  array<int, array<int, float>>  $normalizedMatrix  [alternative_id][criterion_id] => normalized value.
     * @param  array<int, array<int, float>>  $weightedMatrix  [alternative_id][criterion_id] => weighted value.
     * @param  array<int, float>  $scores  [alternative_id] => preference score (Vi).
     * @param  list<RankingRow>  $ranking  Ordered from highest score to lowest.
     */
    public function __construct(
        public readonly array $criteria,
        public readonly array $alternatives,
        public readonly array $decisionMatrix,
        public readonly array $minMax,
        public readonly array $normalizedMatrix,
        public readonly array $weightedMatrix,
        public readonly array $scores,
        public readonly array $ranking,
    ) {}

    /**
     * The best alternative (highest preference score), or null when empty.
     *
     * @return RankingRow|null
     */
    public function best(): ?array
    {
        return $this->ranking[0] ?? null;
    }

    /**
     * @return array{
     *     criteria: array<int, CriterionInfo>,
     *     alternatives: array<int, AlternativeInfo>,
     *     decision_matrix: array<int, array<int, float>>,
     *     min_max: array<int, MinMaxInfo>,
     *     normalized_matrix: array<int, array<int, float>>,
     *     weighted_matrix: array<int, array<int, float>>,
     *     scores: array<int, float>,
     *     ranking: list<RankingRow>,
     *     best: RankingRow|null
     * }
     */
    public function toArray(): array
    {
        return [
            'criteria' => $this->criteria,
            'alternatives' => $this->alternatives,
            'decision_matrix' => $this->decisionMatrix,
            'min_max' => $this->minMax,
            'normalized_matrix' => $this->normalizedMatrix,
            'weighted_matrix' => $this->weightedMatrix,
            'scores' => $this->scores,
            'ranking' => $this->ranking,
            'best' => $this->best(),
        ];
    }
}
