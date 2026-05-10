<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

/**
 * CreateAdminUser command.
 *
 * This command is for LOCAL and DEVELOPMENT SETUP ONLY.
 * It creates or updates an admin user account for testing and local development.
 *
 * Usage:
 *   php artisan app:create-admin-user              Create or update admin user
 *   php artisan app:create-admin-user --reset-password  Reset password if user exists
 *   php artisan app:create-admin-user --force      Allow running in production (not recommended)
 *
 * Security:
 *   - This command should only be used in development/staging environments.
 *   - In production, use a secure user creation process instead.
 */
class CreateAdminUser extends Command
{
    private const DIVIDER = '═══════════════════════════════════════';

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-admin-user
                            {--reset-password : Reset password if user already exists}
                            {--force : Force creation even in production (not recommended)}';

    /**
     * The description of the console command.
     *
     * @var string
     */
    protected $description = 'Create or update an admin user for local/development testing. Use in development only.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        // Prevent accidental use in production unless --force is passed
        if ($this->isProduction() && !$this->option('force')) {
            $this->error('❌ This command cannot run in production without --force flag.');
            $this->warn('   To run in production, use: php artisan app:create-admin-user --force');
            $this->warn('   (Not recommended: Use a secure user creation process instead)');

            return self::FAILURE;
        }

        if ($this->isProduction() && $this->option('force')) {
            $this->warn('⚠️  Running in PRODUCTION mode. Use caution!');
        }

        try {
            // Step 1: Ensure admin role exists
            $this->ensureAdminRoleExists();

            // Step 2: Create or retrieve admin user
            $user = $this->ensureAdminUserExists();

            // Step 3: Handle password reset if requested
            if ($user->wasRecentlyCreated) {
                $this->info("✅ Admin user created successfully!");
            } else {
                if ($this->option('reset-password')) {
                    // Force password update even if user exists
                    $user->update(['password' => 'alae2004']);
                    $user->refresh();
                    $this->info("✅ Admin password has been reset!");
                } else {
                    $this->info("ℹ️  Admin user already exists.");
                }
            }

            // Step 4: Assign admin role
            $this->assignAdminRole($user);

            // Display final information
            $this->displayAdminInfo();

            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error("❌ Error creating admin user: {$e->getMessage()}");

            return self::FAILURE;
        }
    }

    /**
     * Ensure admin role exists in the database.
     *
     * @throws \RuntimeException
     */
    private function ensureAdminRoleExists(): void
    {
        try {
            $role = Role::firstOrCreate(
                ['name' => 'admin'],
                ['guard_name' => 'web']
            );

            if ($role->wasRecentlyCreated) {
                $this->line("   ✓ Created admin role");
            } else {
                $this->line("   ✓ Admin role already exists");
            }
        } catch (\Exception $e) {
            throw new \RuntimeException("Failed to create/retrieve admin role: {$e->getMessage()}");
        }
    }

    /**
     * Ensure admin user exists, creating if necessary.
     *
     * @throws \RuntimeException
     */
    private function ensureAdminUserExists(): User
    {
        try {
            return User::firstOrCreate(
                ['email' => 'admin@journal.local'],
                [
                    'name' => 'Admin User',
                    'password' => 'alae2004', // Let the 'hashed' cast handle password hashing
                    'email_verified_at' => now(),
                ]
            );
        } catch (\Exception $e) {
            throw new \RuntimeException("Failed to create/retrieve admin user: {$e->getMessage()}");
        }
    }

    /**
     * Assign admin role to user.
     *
     * @throws \RuntimeException
     */
    private function assignAdminRole(User $user): void
    {
        try {
            // Use syncRoles to ensure exactly one admin role
            $user->syncRoles(['admin']);
            $this->line("   ✓ Admin role assigned to user");
        } catch (\Exception $e) {
            throw new \RuntimeException("Failed to assign admin role: {$e->getMessage()}");
        }
    }

    /**
     * Display admin user information.
     */
    private function displayAdminInfo(): void
    {
        $this->newLine();
        $this->info(self::DIVIDER);
        $this->info("  Admin User Created/Updated");
        $this->info(self::DIVIDER);
        $this->line("  Email:    admin@journal.local");
        $this->line("  Password: alae2004");
        $this->line("  Role:     admin");
        $this->info(self::DIVIDER);
        $this->newLine();
        $this->line("You can now log in to the application using these credentials.");
        $this->line("Remember to change the password in production!");
    }

    /**
     * Check if the application is running in production.
     */
    private function isProduction(): bool
    {
        return app()->environment('production');
    }
}
