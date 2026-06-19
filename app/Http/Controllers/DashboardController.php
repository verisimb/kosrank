<?php

namespace App\Http\Controllers;

use App\Exceptions\SawCalculationException;
use App\Models\Alternative;
use App\Models\Criterion;
use App\Services\SawCalculatorService;
use App\Services\SawDataValidator;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly SawDataValidator $validator,
        private readonly SawCalculatorService $calculator,
    ) {}

    /**
     * Show the dashboard summary.
     */
    public function index(): Response
    {
        $criteria = Criterion::orderBy('code')->get();
        $alternatives = Alternative::with('alternativeValues')->orderBy('code')->get();

        $totalWeight = (float) $criteria->sum(fn (Criterion $criterion): float => (float) $criterion->weight);
        $errors = $this->validator->validate($criteria, $alternatives);

        $best = null;
        if ($errors === []) {
            try {
                $best = $this->calculator->calculate($criteria, $alternatives)->best();
            } catch (SawCalculationException) {
                $best = null;
            }
        }

        return Inertia::render('dashboard', [
            'summary' => [
                'criteriaCount' => $criteria->count(),
                'alternativesCount' => $alternatives->count(),
                'totalWeight' => $totalWeight,
                'method' => 'Simple Additive Weighting (SAW)',
                'isReady' => $errors === [],
                'best' => $best,
            ],
        ]);
    }
}
