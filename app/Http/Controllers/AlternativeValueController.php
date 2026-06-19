<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateAlternativeValuesRequest;
use App\Models\Alternative;
use App\Models\Criterion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AlternativeValueController extends Controller
{
    /**
     * Show the editable matrix of alternative values per criterion.
     */
    public function index(): Response
    {
        $criteria = Criterion::orderBy('code')->get();
        $alternatives = Alternative::with('alternativeValues')->orderBy('code')->get();

        $values = [];
        foreach ($alternatives as $alternative) {
            $valuesByCriterion = $alternative->alternativeValues->keyBy('criterion_id');

            foreach ($criteria as $criterion) {
                $existing = $valuesByCriterion->get($criterion->id);
                $values[$alternative->id][$criterion->id] = $existing !== null ? (float) $existing->value : null;
            }
        }

        return Inertia::render('values/index', [
            'criteria' => $criteria->map(fn (Criterion $criterion): array => [
                'id' => $criterion->id,
                'code' => $criterion->code,
                'name' => $criterion->name,
                'type' => $criterion->type->value,
                'unit' => $criterion->unit,
            ]),
            'alternatives' => $alternatives->map(fn (Alternative $alternative): array => [
                'id' => $alternative->id,
                'code' => $alternative->code,
                'name' => $alternative->name,
            ]),
            'values' => $values,
        ]);
    }

    /**
     * Persist the submitted matrix of values.
     */
    public function update(UpdateAlternativeValuesRequest $request): RedirectResponse
    {
        /** @var array<array-key, mixed> $values */
        $values = $request->validated()['values'];

        $alternativeIds = Alternative::pluck('id')->all();
        $criterionIds = Criterion::pluck('id')->all();

        DB::transaction(function () use ($values, $alternativeIds, $criterionIds): void {
            foreach ($values as $alternativeId => $criterionValues) {
                if (! in_array((int) $alternativeId, $alternativeIds, true) || ! is_array($criterionValues)) {
                    continue;
                }

                foreach ($criterionValues as $criterionId => $value) {
                    if (! in_array((int) $criterionId, $criterionIds, true)) {
                        continue;
                    }

                    Alternative::find((int) $alternativeId)
                        ?->alternativeValues()
                        ->updateOrCreate(
                            ['criterion_id' => (int) $criterionId],
                            ['value' => (float) $value],
                        );
                }
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Nilai alternatif berhasil disimpan.']);

        return to_route('values.index');
    }
}
