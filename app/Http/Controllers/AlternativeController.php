<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAlternativeRequest;
use App\Http\Requests\UpdateAlternativeRequest;
use App\Models\Alternative;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AlternativeController extends Controller
{
    /**
     * Display the list of alternatives (kos).
     */
    public function index(): Response
    {
        $alternatives = Alternative::orderBy('code')->get();

        return Inertia::render('alternatives/index', [
            'alternatives' => $alternatives->map(fn (Alternative $alternative): array => [
                'id' => $alternative->id,
                'code' => $alternative->code,
                'name' => $alternative->name,
                'location' => $alternative->location,
            ]),
        ]);
    }

    /**
     * Store a newly created alternative.
     */
    public function store(StoreAlternativeRequest $request): RedirectResponse
    {
        Alternative::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Alternatif kos berhasil ditambahkan.']);

        return to_route('alternatives.index');
    }

    /**
     * Update the specified alternative.
     */
    public function update(UpdateAlternativeRequest $request, Alternative $alternative): RedirectResponse
    {
        $alternative->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Alternatif kos berhasil diperbarui.']);

        return to_route('alternatives.index');
    }

    /**
     * Remove the specified alternative.
     */
    public function destroy(Alternative $alternative): RedirectResponse
    {
        $alternative->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Alternatif kos berhasil dihapus.']);

        return to_route('alternatives.index');
    }
}
