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
        Schema::create('reviewer_assignments', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->foreignId('article_id')->constrained('articles')->cascadeOnDelete();
            $table->foreignId('reviewer_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('assigned_by')->constrained('users')->restrictOnDelete();
            $table->dateTime('assigned_at');
            $table->enum('status', ['en_attente', 'accepte', 'decline', 'complete'])->default('en_attente');
            $table->dateTime('due_date')->nullable();
            $table->timestamps();

            $table->index(['article_id', 'status']);
            $table->index(['reviewer_id', 'status']);
            $table->index('due_date');
        });

        Schema::create('reviews', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->foreignId('assignment_id')->constrained('reviewer_assignments')->cascadeOnDelete();
            $table->foreignId('article_version_id')->constrained('article_versions')->restrictOnDelete();
            $table->unsignedTinyInteger('originality_score');
            $table->unsignedTinyInteger('methodology_score');
            $table->unsignedTinyInteger('clarity_score');
            $table->unsignedTinyInteger('overall_score');
            $table->text('comments');
            $table->enum('decision_suggestion', ['accepter', 'rejeter', 'revision_mineure', 'revision_majeure']);
            $table->dateTime('submitted_at');
            $table->timestamps();

            $table->unique('assignment_id');
            $table->index('article_version_id');
            $table->index('decision_suggestion');
        });

        Schema::create('editorial_decisions', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->foreignId('article_id')->constrained('articles')->cascadeOnDelete();
            $table->foreignId('editor_id')->constrained('users')->restrictOnDelete();
            $table->enum('decision', ['accepte', 'rejete', 'revision_requise']);
            $table->text('comments');
            $table->dateTime('decided_at');
            $table->timestamps();

            $table->index(['article_id', 'decided_at']);
            $table->index('decision');
        });

        Schema::create('publications', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->foreignId('article_id')->unique()->constrained('articles')->cascadeOnDelete();
            $table->foreignId('article_version_id')->constrained('article_versions')->restrictOnDelete();
            $table->dateTime('published_at');
            $table->string('doi', 120)->nullable()->unique();
            $table->string('volume', 30)->nullable();
            $table->string('issue', 30)->nullable();
            $table->timestamps();

            $table->index('published_at');
            $table->index(['volume', 'issue']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('publications');
        Schema::dropIfExists('editorial_decisions');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('reviewer_assignments');
    }
};
