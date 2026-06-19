<?php

use App\Http\Controllers\AlternativeController;
use App\Http\Controllers\AlternativeValueController;
use App\Http\Controllers\CalculationController;
use App\Http\Controllers\CriterionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ResultController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('criteria', CriterionController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->parameters(['criteria' => 'criterion']);

    Route::resource('alternatives', AlternativeController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::get('values', [AlternativeValueController::class, 'index'])->name('values.index');
    Route::put('values', [AlternativeValueController::class, 'update'])->name('values.update');

    Route::get('calculation', [CalculationController::class, 'index'])->name('calculation.index');
    Route::get('result', [ResultController::class, 'index'])->name('result.index');
});

require __DIR__.'/settings.php';
