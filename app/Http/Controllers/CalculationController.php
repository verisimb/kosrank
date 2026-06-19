<?php

namespace App\Http\Controllers;

use App\Exceptions\SawCalculationException;
use App\Models\Alternative;
use App\Models\Criterion;
use App\Services\SawCalculatorService;
use App\Services\SawDataValidator;
use Inertia\Inertia;
use Inertia\Response;

class CalculationController extends Controller
{
    public function __construct(
        private readonly SawDataValidator $validator,
        private readonly SawCalculatorService $calculator,
    ) {}

    /**
     * Show the SAW calculation process, or blocking validation errors.
     */
    public function index(): Response
    {
        $criteria = Criterion::orderBy('code')->get();
        $alternatives = Alternative::with('alternativeValues')->orderBy('code')->get();

        $errors = $this->validator->validate($criteria, $alternatives);

        if ($errors !== []) {
            return Inertia::render('calculation/index', [
                'validationErrors' => $errors,
                'result' => null,
            ]);
        }

        try {
            $result = $this->calculator->calculate($criteria, $alternatives);
        } catch (SawCalculationException $exception) {
            return Inertia::render('calculation/index', [
                'validationErrors' => [$exception->getMessage()],
                'result' => null,
            ]);
        }

        return Inertia::render('calculation/index', [
            'validationErrors' => [],
            'result' => $result->toArray(),
        ]);
    }
}
