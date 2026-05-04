<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Ensures `user_notifications` exists: renames legacy `notifications` (in-app feed)
 * or creates the table if neither exists (e.g. DB out of sync with code).
 */
return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('user_notifications')) {
            return;
        }

        if (Schema::hasTable('notifications')) {
            Schema::rename('notifications', 'user_notifications');

            return;
        }

        Schema::create('user_notifications', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type', 120);
            $table->string('title', 180);
            $table->text('body');
            $table->json('data')->nullable();
            $table->dateTime('read_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'read_at']);
            $table->index('type');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        // Non-destructive: keep data on rollback.
    }
};
