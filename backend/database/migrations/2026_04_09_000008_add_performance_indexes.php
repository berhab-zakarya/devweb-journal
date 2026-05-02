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
        Schema::table('articles', function (Blueprint $table) {
            // Optimise les listes filtrees (statut + categorie + date).
            $table->index(['status', 'category_id', 'submitted_at'], 'articles_status_category_submitted_idx');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->index('submitted_at');
        });

        Schema::table('editorial_decisions', function (Blueprint $table) {
            $table->index(['article_id', 'decision'], 'editorial_decisions_article_decision_idx');
        });

        Schema::table('publications', function (Blueprint $table) {
            $table->index(['published_at', 'volume', 'issue'], 'publications_published_volume_issue_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('publications', function (Blueprint $table) {
            $table->dropIndex('publications_published_volume_issue_idx');
        });

        Schema::table('editorial_decisions', function (Blueprint $table) {
            $table->dropIndex('editorial_decisions_article_decision_idx');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex(['submitted_at']);
        });

        Schema::table('articles', function (Blueprint $table) {
            $table->dropIndex('articles_status_category_submitted_idx');
        });
    }
};
