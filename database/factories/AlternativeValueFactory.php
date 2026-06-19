<?php

namespace Database\Factories;

use App\Models\Alternative;
use App\Models\AlternativeValue;
use App\Models\Criterion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AlternativeValue>
 */
class AlternativeValueFactory extends Factory
{
    protected $model = AlternativeValue::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'alternative_id' => Alternative::factory(),
            'criterion_id' => Criterion::factory(),
            'value' => fake()->randomFloat(2, 1, 100),
        ];
    }
}
