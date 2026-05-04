<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Always seed IAM foundations.
        $this->call(RolePermissionSeeder::class);

        $this->call(CategorySeeder::class);

        // Demo accounts are useful for local/testing onboarding only.
        if (app()->environment(['local', 'development', 'testing'])) {
            $this->call(DemoDataSeeder::class);
        }
    }
}
