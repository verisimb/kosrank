<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCriterionRequest;
use App\Http\Requests\UpdateCriterionRequest;
use App\Models\Criterion;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CriterionController extends Controller
{
    /**
     * Display the list of criteria with the total weight.
     */
    public function index(): Response
    {
        $criteria = Criterion::orderBy('code')->get();

        return Inertia::render('criteria/index', [
            'criteria' => $criteria->map(fn (Criterion $criterion): array => [
                'id' => $criterion->id,
                'code' => $criterion->code,
                'name' => $criterion->name,
                'type' => $criterion->type->value,
                'weight' => (float) $criterion->weight,
                'unit' => $criterion->unit,
            ]),
            'totalWeight' => (float) $criteria->sum(fn (Criterion $criterion): float => (float) $criterion->weight),
        ]);
    }

    /**
     * Store a newly created criterion.
     */
    public function store(StoreCriterionRequest $request): RedirectResponse
    {
        Criterion::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Kriteria berhasil ditambahkan.']);

        return to_route('criteria.index');
    }

    /**
     * Update the specified criterion.
     */
    public function update(UpdateCriterionRequest $request, Criterion $criterion): RedirectResponse
    {
        $criterion->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Kriteria berhasil diperbarui.']);

        return to_route('criteria.index');
    }

    /**
     * Remove the specified criterion.
     */
    public function destroy(Criterion $criterion): RedirectResponse
    {
        $criterion->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Kriteria berhasil dihapus.']);

        return to_route('criteria.index');
    }
}
