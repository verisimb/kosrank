<?php

namespace App\Http\Controllers;

use App\Exceptions\SawCalculationException;
use App\Models\Alternative;
use App\Models\Criterion;
use App\Services\SawCalculatorService;
use App\Services\SawDataValidator;
use Inertia\Inertia;
use Inertia\Response;

class ResultController extends Controller
{
    public function __construct(
        private readonly SawDataValidator $validator,
        private readonly SawCalculatorService $calculator,
    ) {}

    /**
     * Show the final ranking and recommendation.
     */
    public function index(): Response
    {
        $criteria = Criterion::orderBy('code')->get();
        $alternatives = Alternative::with('alternativeValues')->orderBy('code')->get();

        $errors = $this->validator->validate($criteria, $alternatives);

        if ($errors !== []) {
            return Inertia::render('result/index', [
                'validationErrors' => $errors,
                'ranking' => [],
                'best' => null,
            ]);
        }

        try {
            $result = $this->calculator->calculate($criteria, $alternatives);
        } catch (SawCalculationException $exception) {
            return Inertia::render('result/index', [
                'validationErrors' => [$exception->getMessage()],
                'ranking' => [],
                'best' => null,
            ]);
        }

        return Inertia::render('result/index', [
            'validationErrors' => [],
            'ranking' => $result->ranking,
            'best' => $result->best(),
        ]);
    }
}
