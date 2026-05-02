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
        Schema::create('article_versions', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->foreignId('article_id')->constrained('articles')->cascadeOnDelete();
            $table->unsignedInteger('version_number');
            $table->string('pdf_path', 255);
            $table->string('pdf_original_name', 255);
            $table->unsignedBigInteger('pdf_size');
            $table->text('change_summary')->nullable();
            $table->dateTime('submitted_at');
            $table->timestamps();

            $table->unique(['article_id', 'version_number']);
            $table->index('submitted_at');
        });

        // La FK est ajoutee apres creation de article_versions pour eviter une dependance circulaire.
        Schema::table('articles', function (Blueprint $table) {
            $table
                ->foreign('current_version_id')
                ->references('id')
                ->on('article_versions')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropForeign(['current_version_id']);
        });

        Schema::dropIfExists('article_versions');
    }
};
