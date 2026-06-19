<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add nullable user_id + FK so existing rows can be backfilled.
        Schema::table('criteria', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
        });

        // 2. Backfill existing (global) rows to the first user, if any.
        $firstUserId = DB::table('users')->orderBy('id')->value('id');

        if ($firstUserId !== null) {
            DB::table('criteria')->whereNull('user_id')->update(['user_id' => $firstUserId]);
        }

        // 3. Remove any rows that still cannot be assigned an owner.
        DB::table('criteria')->whereNull('user_id')->delete();

        // 4. Enforce NOT NULL and switch the unique constraint to be per-user.
        Schema::table('criteria', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();
            $table->dropUnique('criteria_code_unique');
            $table->unique(['user_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('criteria', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropUnique(['user_id', 'code']);
            $table->dropColumn('user_id');
            $table->unique('code');
        });
    }
};
