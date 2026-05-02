<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DashboardApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_dashboard_summary_requires_authentication(): void
    {
        $this->getJson('/api/v1/dashboard/summary')->assertUnauthorized();
    }

    public function test_author_dashboard_summary_returns_actionable_counts(): void
    {
        $author = User::factory()->create();
        $author->assignRole('author');

        $categoryId = DB::table('categories')->insertGetId([
            'name' => 'Science',
            'slug' => 'science-' . uniqid(),
            'description' => 'Categorie dashboard test',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        DB::table('articles')->insert([
            [
                'author_id' => $author->id,
                'category_id' => $categoryId,
                'title' => 'Article revision',
                'abstract' => 'A',
                'keywords' => 'k1',
                'status' => 'revision_required',
                'current_version_id' => null,
                'submitted_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
                'deleted_at' => null,
            ],
            [
                'author_id' => $author->id,
                'category_id' => $categoryId,
                'title' => 'Article en revision',
                'abstract' => 'B',
                'keywords' => 'k2',
                'status' => 'under_review',
                'current_version_id' => null,
                'submitted_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
                'deleted_at' => null,
            ],
        ]);

        $response = $this->actingAs($author)
            ->getJson('/api/v1/dashboard/summary')
            ->assertOk();

        $this->assertSame('author', $response->json('data.role'));
        $this->assertSame(1, $response->json('data.requires_attention.0.count'));
        $this->assertSame(1, $response->json('data.pending.0.count'));
    }

    public function test_admin_dashboard_summary_includes_pending_final_validations_and_publish_queue(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $editor = User::factory()->create();
        $editor->assignRole('editor');

        $author = User::factory()->create();
        $author->assignRole('author');

        $categoryId = DB::table('categories')->insertGetId([
            'name' => 'Medecine',
            'slug' => 'medecine-' . uniqid(),
            'description' => 'Categorie admin dashboard',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $articleInReviewId = DB::table('articles')->insertGetId([
            'author_id' => $author->id,
            'category_id' => $categoryId,
            'title' => 'Article a valider',
            'abstract' => 'A',
            'keywords' => 'k',
            'status' => 'under_review',
            'current_version_id' => null,
            'submitted_at' => Carbon::now(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
            'deleted_at' => null,
        ]);

        DB::table('editorial_decisions')->insert([
            'article_id' => $articleInReviewId,
            'editor_id' => $editor->id,
            'decision' => 'accepted',
            'stage' => 'proposition',
            'comments' => 'Proposition envoyee.',
            'decided_at' => Carbon::now(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        DB::table('articles')->insert([
            'author_id' => $author->id,
            'category_id' => $categoryId,
            'title' => 'Article accepte',
            'abstract' => 'B',
            'keywords' => 'k2',
            'status' => 'accepted',
            'current_version_id' => null,
            'submitted_at' => Carbon::now(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
            'deleted_at' => null,
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/v1/dashboard/summary')
            ->assertOk();

        $this->assertSame('admin', $response->json('data.role'));
        $this->assertSame(1, $response->json('data.requires_attention.0.count'));
        $this->assertSame(1, $response->json('data.requires_attention.1.count'));
    }
}
