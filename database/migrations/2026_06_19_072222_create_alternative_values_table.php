<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('alternative_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alternative_id')->constrained()->cascadeOnDelete();
            $table->foreignId('criterion_id')->constrained('criteria')->cascadeOnDelete();
            $table->decimal('value', 12, 2);
            $table->timestamps();

            $table->unique(['alternative_id', 'criterion_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alternative_values');
    }
};
