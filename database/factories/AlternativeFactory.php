<?php

namespace Database\Factories;

use App\Models\Alternative;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Alternative>
 */
class AlternativeFactory extends Factory
{
    protected $model = Alternative::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'code' => 'A'.fake()->unique()->numberBetween(1, 9999),
            'name' => 'Kos '.fake()->lastName(),
            'location' => fake()->streetAddress(),
        ];
    }
}
