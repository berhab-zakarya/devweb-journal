<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        $admin = User::query()->firstOrCreate(
            ['email' => 'admin@journal.local'],
            [
                'name' => 'Admin Principal',
                'password' => Hash::make('Admin@12345'),
                'email_verified_at' => $now,
            ]
        );

        $editor = User::query()->firstOrCreate(
            ['email' => 'editor@journal.local'],
            [
                'name' => 'Editor Demo',
                'password' => Hash::make('Editor@12345'),
                'email_verified_at' => $now,
            ]
        );

        $reviewer = User::query()->firstOrCreate(
            ['email' => 'reviewer@journal.local'],
            [
                'name' => 'Reviewer Demo',
                'password' => Hash::make('Reviewer@12345'),
                'email_verified_at' => $now,
            ]
        );

        $author = User::query()->firstOrCreate(
            ['email' => 'author@journal.local'],
            [
                'name' => 'Author Demo',
                'password' => Hash::make('Author@12345'),
                'email_verified_at' => $now,
            ]
        );

        $reader = User::query()->firstOrCreate(
            ['email' => 'reader@journal.local'],
            [
                'name' => 'Reader Demo',
                'password' => Hash::make('Reader@12345'),
                'email_verified_at' => $now,
            ]
        );

        $this->attachRoleToUser('admin', $admin->id);
        $this->attachRoleToUser('editor', $editor->id);
        $this->attachRoleToUser('reviewer', $reviewer->id);
        $this->attachRoleToUser('author', $author->id);
        $this->attachRoleToUser('reader', $reader->id);

        $categoryId = DB::table('categories')->where('slug', 'artificial-intelligence')->value('id');

        if (!$categoryId) {
            $categoryId = DB::table('categories')->insertGetId([
                'name' => 'Artificial Intelligence',
                'slug' => 'artificial-intelligence',
                'description' => 'Articles on AI models and applications.',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $articleId = DB::table('articles')
            ->where('author_id', $author->id)
            ->where('title', 'Evaluation of hybrid classification models')
            ->value('id');

        if (!$articleId) {
            $articleId = DB::table('articles')->insertGetId([
                'author_id' => $author->id,
                'category_id' => $categoryId,
                'title' => 'Evaluation of hybrid classification models',
                'abstract' => 'Comparative study of hybrid models in an academic context.',
                'keywords' => 'classification, hybridization, AI',
                'status' => 'submitted',
                'current_version_id' => null,
                'submitted_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $versionId = DB::table('article_versions')
            ->where('article_id', $articleId)
            ->where('version_number', 1)
            ->value('id');

        if (!$versionId) {
            $versionId = DB::table('article_versions')->insertGetId([
                'article_id' => $articleId,
                'version_number' => 1,
                'pdf_path' => 'private/articles/' . $articleId . '/demo-v1.pdf',
                'pdf_original_name' => 'article-demo-v1.pdf',
                'pdf_size' => 320000,
                'change_summary' => null,
                'submitted_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        DB::table('articles')->where('id', $articleId)->update([
            'current_version_id' => $versionId,
            'submitted_at' => $now,
            'updated_at' => $now,
        ]);
    }

    /**
     * Attach a role to a user via the Spatie pivot table.
     */
    private function attachRoleToUser(string $roleName, int $userId): void
    {
        $roleId = Role::query()->where('name', $roleName)->value('id');

        if (!$roleId) {
            return;
        }

        DB::table('model_has_roles')->updateOrInsert(
            [
                'role_id' => $roleId,
                'model_type' => User::class,
                'model_id' => $userId,
            ],
            []
        );
    }
}
