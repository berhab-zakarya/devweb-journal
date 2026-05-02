<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('editorial_decisions', function (Blueprint $table): void {
            $table->enum('stage', ['proposition', 'finale'])
                ->default('finale')
                ->after('decision');

            $table->index(['article_id', 'stage', 'decided_at'], 'editorial_decisions_article_stage_decided_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('editorial_decisions', function (Blueprint $table): void {
            $table->dropIndex('editorial_decisions_article_stage_decided_idx');
            $table->dropColumn('stage');
        });
    }
};
