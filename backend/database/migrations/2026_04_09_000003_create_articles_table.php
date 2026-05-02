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
        Schema::create('articles', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->foreignId('author_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->string('title', 255);
            $table->text('abstract');
            $table->text('keywords');
            $table->enum('status', [
                'submitted',
                'under_review',
                'accepted',
                'rejected',
                'revision_required',
                'published',
            ])->default('submitted');
            $table->foreignId('current_version_id')->nullable();
            $table->dateTime('submitted_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('author_id');
            $table->index('category_id');
            $table->index('status');
            $table->index('submitted_at');
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
