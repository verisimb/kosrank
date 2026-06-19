<?php

namespace Database\Seeders;

use App\Actions\CreateDefaultCriteria;
use App\Models\User;
use Illuminate\Database\Seeder;

class CriteriaSeeder extends Seeder
{
    /**
     * Seed the default criteria (total weight = 100%) for the first user.
     */
    public function run(): void
    {
        $user = User::query()->orderBy('id')->first();

        if ($user === null) {
            return;
        }

        app(CreateDefaultCriteria::class)->handle($user);
    }
}
