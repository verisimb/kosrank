<?php

namespace Database\Factories;

use App\Enums\CriterionType;
use App\Models\Criterion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Criterion>
 */
class CriterionFactory extends Factory
{
    protected $model = Criterion::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => 'C'.fake()->unique()->numberBetween(1, 9999),
            'name' => fake()->words(2, true),
            'type' => fake()->randomElement(CriterionType::cases()),
            'weight' => fake()->randomFloat(2, 5, 50),
            'unit' => fake()->randomElement(['Rp', 'km', 'skala 1-5', null]),
        ];
    }

    public function benefit(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => CriterionType::Benefit,
        ]);
    }

    public function cost(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => CriterionType::Cost,
        ]);
    }
}
