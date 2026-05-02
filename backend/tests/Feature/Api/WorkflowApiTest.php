<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class WorkflowApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        Storage::fake('local');
    }

    public function test_editor_assigns_only_reviewers_to_article(): void
    {
        $editor = User::factory()->create();
        $editor->assignRole('editeur');

        $author = User::factory()->create();
        $author->assignRole('auteur');

        $reviewer = User::factory()->create();
        $reviewer->assignRole('relecteur');

        $nonReviewer = User::factory()->create();
        $nonReviewer->assignRole('lecteur');

        $articleId = $this->createArticleWithVersion($author, 'soumis')['article_id'];

        $this->actingAs($editor);

        $this->postJson("/api/v1/articles/{$articleId}/assignments", [
            'reviewer_ids' => [$reviewer->id, $nonReviewer->id],
            'due_date' => Carbon::now()->addDays(7)->toDateString(),
        ])->assertCreated();

        $this->assertDatabaseHas('reviewer_assignments', [
            'article_id' => $articleId,
            'reviewer_id' => $reviewer->id,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $reviewer->id,
            'type' => 'reviewer_assigned',
        ]);

        $this->assertDatabaseMissing('reviewer_assignments', [
            'article_id' => $articleId,
            'reviewer_id' => $nonReviewer->id,
        ]);
    }

    public function test_editor_can_search_reviewers_by_partial_email_for_assignment(): void
    {
        $editor = User::factory()->create();
        $editor->assignRole('editeur');

        $author = User::factory()->create();
        $author->assignRole('auteur');

        $reviewerMatch = User::factory()->create([
            'name' => 'Ali Reviewer',
            'email' => 'ali.reviewer@gmail.com',
        ]);
        $reviewerMatch->assignRole('relecteur');

        $alreadyAssignedReviewer = User::factory()->create([
            'name' => 'Already Assigned',
            'email' => 'already.assigned@gmail.com',
        ]);
        $alreadyAssignedReviewer->assignRole('relecteur');

        $nonReviewer = User::factory()->create([
            'name' => 'Reader Gmail',
            'email' => 'reader.gmail@example.com',
        ]);
        $nonReviewer->assignRole('lecteur');

        $articleId = $this->createArticleWithVersion($author, 'soumis')['article_id'];

        DB::table('reviewer_assignments')->insert([
            'article_id' => $articleId,
            'reviewer_id' => $alreadyAssignedReviewer->id,
            'assigned_by' => $editor->id,
            'assigned_at' => Carbon::now(),
            'status' => 'en_attente',
            'due_date' => null,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->actingAs($editor)
            ->getJson("/api/v1/articles/{$articleId}/reviewers/search?q=gmail")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $reviewerMatch->id)
            ->assertJsonPath('data.0.email', 'ali.reviewer@gmail.com')
            ->assertJsonPath('data.0.name', 'Ali Reviewer');
    }

    public function test_editor_reviewer_search_requires_minimum_query_length(): void
    {
        $editor = User::factory()->create();
        $editor->assignRole('editeur');

        $author = User::factory()->create();
        $author->assignRole('auteur');

        $articleId = $this->createArticleWithVersion($author, 'soumis')['article_id'];

        $this->actingAs($editor)
            ->getJson("/api/v1/articles/{$articleId}/reviewers/search?q=a")
            ->assertStatus(422)
            ->assertJsonValidationErrors(['q']);
    }

    public function test_reviewer_can_only_access_assigned_articles(): void
    {
        $editor = User::factory()->create();
        $editor->assignRole('editeur');

        $reviewer = User::factory()->create();
        $reviewer->assignRole('relecteur');

        $author = User::factory()->create();
        $author->assignRole('auteur');

        $assignedArticle = $this->createArticleWithVersion($author, 'en_revision');
        $unassignedArticle = $this->createArticleWithVersion($author, 'en_revision');

        DB::table('reviewer_assignments')->insert([
            'article_id' => $assignedArticle['article_id'],
            'reviewer_id' => $reviewer->id,
            'assigned_by' => $editor->id,
            'assigned_at' => Carbon::now(),
            'status' => 'accepte',
            'due_date' => null,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->actingAs($reviewer)
            ->getJson('/api/v1/articles')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $assignedArticle['article_id']);

        $this->actingAs($reviewer)
            ->getJson("/api/v1/articles/{$assignedArticle['article_id']}")
            ->assertOk();

        $this->actingAs($reviewer)
            ->getJson("/api/v1/articles/{$unassignedArticle['article_id']}")
            ->assertForbidden();

        $this->actingAs($reviewer)
            ->get("/api/v1/articles/{$assignedArticle['article_id']}/download")
            ->assertOk();

        $this->actingAs($reviewer)
            ->get("/api/v1/articles/{$unassignedArticle['article_id']}/download")
            ->assertForbidden();
    }

    public function test_only_owner_reviewer_can_respond_to_assignment(): void
    {
        $reviewer = User::factory()->create();
        $reviewer->assignRole('relecteur');

        $otherReviewer = User::factory()->create();
        $otherReviewer->assignRole('relecteur');

        $author = User::factory()->create();
        $author->assignRole('auteur');

        $articleId = $this->createArticleWithVersion($author, 'soumis')['article_id'];

        $assignmentId = DB::table('reviewer_assignments')->insertGetId([
            'article_id' => $articleId,
            'reviewer_id' => $reviewer->id,
            'assigned_by' => $author->id,
            'assigned_at' => Carbon::now(),
            'status' => 'en_attente',
            'due_date' => null,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->actingAs($otherReviewer);
        $this->patchJson("/api/v1/assignments/{$assignmentId}/respond", [
            'response' => 'accepte',
        ])->assertForbidden();

        $this->actingAs($reviewer);
        $this->patchJson("/api/v1/assignments/{$assignmentId}/respond", [
            'response' => 'accepte',
        ])->assertOk();

        $this->assertDatabaseHas('reviewer_assignments', [
            'id' => $assignmentId,
            'status' => 'accepte',
        ]);
    }

    public function test_reviewer_cannot_respond_to_already_processed_assignment(): void
    {
        $reviewer = User::factory()->create();
        $reviewer->assignRole('relecteur');

        $author = User::factory()->create();
        $author->assignRole('auteur');

        $articleId = $this->createArticleWithVersion($author, 'soumis')['article_id'];

        $assignmentId = DB::table('reviewer_assignments')->insertGetId([
            'article_id' => $articleId,
            'reviewer_id' => $reviewer->id,
            'assigned_by' => $author->id,
            'assigned_at' => Carbon::now(),
            'status' => 'accepte',
            'due_date' => null,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->actingAs($reviewer)
            ->patchJson("/api/v1/assignments/{$assignmentId}/respond", [
                'response' => 'decline',
            ])
            ->assertStatus(409);
    }

    public function test_reviewer_can_submit_review_for_accepted_assignment(): void
    {
        $editor = User::factory()->create();
        $editor->assignRole('editeur');

        $reviewer = User::factory()->create();
        $reviewer->assignRole('relecteur');

        $author = User::factory()->create();
        $author->assignRole('auteur');

        $fixture = $this->createArticleWithVersion($author, 'en_revision');

        $assignmentId = DB::table('reviewer_assignments')->insertGetId([
            'article_id' => $fixture['article_id'],
            'reviewer_id' => $reviewer->id,
            'assigned_by' => $editor->id,
            'assigned_at' => Carbon::now(),
            'status' => 'accepte',
            'due_date' => null,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->actingAs($reviewer);

        $this->postJson("/api/v1/assignments/{$assignmentId}/review", [
            'comments' => 'Evaluation complete.',
        ])->assertCreated();

        $this->assertDatabaseHas('reviews', [
            'assignment_id' => $assignmentId,
            'comments' => 'Evaluation complete.',
        ]);

        $this->assertDatabaseHas('reviewer_assignments', [
            'id' => $assignmentId,
            'status' => 'complete',
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $editor->id,
            'type' => 'review_submitted',
        ]);
    }

    public function test_reviewer_can_save_draft_before_final_submission(): void
    {
        $editor = User::factory()->create();
        $editor->assignRole('editeur');

        $reviewer = User::factory()->create();
        $reviewer->assignRole('relecteur');

        $author = User::factory()->create();
        $author->assignRole('auteur');

        $fixture = $this->createArticleWithVersion($author, 'en_revision');

        $assignmentId = DB::table('reviewer_assignments')->insertGetId([
            'article_id' => $fixture['article_id'],
            'reviewer_id' => $reviewer->id,
            'assigned_by' => $editor->id,
            'assigned_at' => Carbon::now(),
            'status' => 'accepte',
            'due_date' => null,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->actingAs($reviewer)
            ->postJson("/api/v1/assignments/{$assignmentId}/review", [
                'comments' => 'Brouillon initial.',
                'is_draft' => true,
            ])
            ->assertCreated();

        $this->assertDatabaseHas('reviews', [
            'assignment_id' => $assignmentId,
            'comments' => 'Brouillon initial.',
        ]);

        $this->assertDatabaseHas('reviewer_assignments', [
            'id' => $assignmentId,
            'status' => 'accepte',
        ]);

        $this->assertDatabaseMissing('notifications', [
            'user_id' => $editor->id,
            'type' => 'review_submitted',
        ]);

        $this->actingAs($reviewer)
            ->postJson("/api/v1/assignments/{$assignmentId}/review", [
                'comments' => 'Version finale de la relecture.',
                'is_draft' => false,
            ])
            ->assertOk();

        $this->assertDatabaseHas('reviews', [
            'assignment_id' => $assignmentId,
            'comments' => 'Version finale de la relecture.',
        ]);

        $this->assertDatabaseHas('reviewer_assignments', [
            'id' => $assignmentId,
            'status' => 'complete',
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $editor->id,
            'type' => 'review_submitted',
        ]);
    }

    public function test_reviewer_cannot_submit_review_when_assignment_is_not_accepted(): void
    {
        $reviewer = User::factory()->create();
        $reviewer->assignRole('relecteur');

        $author = User::factory()->create();
        $author->assignRole('auteur');

        $fixture = $this->createArticleWithVersion($author, 'en_revision');

        $assignmentId = DB::table('reviewer_assignments')->insertGetId([
            'article_id' => $fixture['article_id'],
            'reviewer_id' => $reviewer->id,
            'assigned_by' => $author->id,
            'assigned_at' => Carbon::now(),
            'status' => 'en_attente',
            'due_date' => null,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->actingAs($reviewer)
            ->postJson("/api/v1/assignments/{$assignmentId}/review", [
                'comments' => 'Evaluation en attente.',
            ])
            ->assertStatus(409);
    }

    public function test_reviewer_cannot_edit_review_after_final_submission(): void
    {
        $reviewer = User::factory()->create();
        $reviewer->assignRole('relecteur');

        $author = User::factory()->create();
        $author->assignRole('auteur');

        $fixture = $this->createArticleWithVersion($author, 'en_revision');

        $assignmentId = DB::table('reviewer_assignments')->insertGetId([
            'article_id' => $fixture['article_id'],
            'reviewer_id' => $reviewer->id,
            'assigned_by' => $author->id,
            'assigned_at' => Carbon::now(),
            'status' => 'accepte',
            'due_date' => null,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        DB::table('reviews')->insert([
            'assignment_id' => $assignmentId,
            'article_version_id' => $fixture['version_id'],
            'originality_score' => 7,
            'methodology_score' => 7,
            'clarity_score' => 7,
            'overall_score' => 7,
            'comments' => 'Relecture finale deja soumise',
            'decision_suggestion' => 'accepter',
            'submitted_at' => Carbon::now(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        DB::table('reviewer_assignments')
            ->where('id', $assignmentId)
            ->update([
                'status' => 'complete',
                'updated_at' => Carbon::now(),
            ]);

        $this->actingAs($reviewer)
            ->postJson("/api/v1/assignments/{$assignmentId}/review", [
                'comments' => 'Tentative de modification apres soumission.',
            ])
            ->assertStatus(409);
    }

    public function test_editor_final_decision_updates_status_and_notifies_author(): void
    {
        $editor = User::factory()->create();
        $editor->assignRole('editeur');

        $author = User::factory()->create();
        $author->assignRole('auteur');

        $fixture = $this->createArticleWithVersion($author, 'en_revision');

        $this->actingAs($editor);

        $this->postJson("/api/v1/articles/{$fixture['article_id']}/decision", [
            'decision' => 'accepte',
            'comments' => 'Article valide pour publication.',
        ])->assertCreated();

        $this->assertDatabaseHas('articles', [
            'id' => $fixture['article_id'],
            'status' => 'accepte',
        ]);

        $this->assertDatabaseHas('editorial_decisions', [
            'article_id' => $fixture['article_id'],
            'editor_id' => $editor->id,
            'decision' => 'accepte',
            'stage' => 'finale',
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $author->id,
            'type' => 'decision_made',
        ]);
    }

    public function test_editor_can_edit_final_decision_with_single_record_per_article(): void
    {
        $editor = User::factory()->create();
        $editor->assignRole('editeur');

        $author = User::factory()->create();
        $author->assignRole('auteur');

        $fixture = $this->createArticleWithVersion($author, 'en_revision');

        $this->actingAs($editor)
            ->postJson("/api/v1/articles/{$fixture['article_id']}/decision", [
                'decision' => 'revision_requise',
                'comments' => 'Premiere decision finale.',
            ])
            ->assertCreated();

        $this->actingAs($editor)
            ->postJson("/api/v1/articles/{$fixture['article_id']}/decision", [
                'decision' => 'rejete',
                'comments' => 'Decision finale mise a jour.',
            ])
            ->assertCreated();

        $this->assertDatabaseHas('articles', [
            'id' => $fixture['article_id'],
            'status' => 'rejete',
        ]);

        $this->assertDatabaseHas('editorial_decisions', [
            'article_id' => $fixture['article_id'],
            'editor_id' => $editor->id,
            'decision' => 'rejete',
            'stage' => 'finale',
        ]);

        $this->assertSame(
            1,
            DB::table('editorial_decisions')
                ->where('article_id', $fixture['article_id'])
                ->where('stage', 'finale')
                ->count()
        );
    }

    public function test_editor_decision_returns_conflict_for_invalid_transition(): void
    {
        $editor = User::factory()->create();
        $editor->assignRole('editeur');

        $author = User::factory()->create();
        $author->assignRole('auteur');

        $fixture = $this->createArticleWithVersion($author, 'soumis');

        $this->actingAs($editor);

        $this->postJson("/api/v1/articles/{$fixture['article_id']}/decision", [
            'decision' => 'accepte',
            'comments' => 'Tentative prematuree.',
        ])->assertStatus(409);

        $this->assertDatabaseHas('articles', [
            'id' => $fixture['article_id'],
            'status' => 'soumis',
        ]);
    }

    public function test_admin_cannot_create_final_decision(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $author = User::factory()->create();
        $author->assignRole('auteur');

        $fixture = $this->createArticleWithVersion($author, 'en_revision');

        $this->actingAs($admin)
            ->postJson("/api/v1/articles/{$fixture['article_id']}/decision", [
                'decision' => 'accepte',
                'comments' => 'Tentative admin.',
            ])
            ->assertForbidden();
    }

    public function test_editor_decision_requires_comments(): void
    {
        $editor = User::factory()->create();
        $editor->assignRole('editeur');

        $author = User::factory()->create();
        $author->assignRole('auteur');

        $fixture = $this->createArticleWithVersion($author, 'en_revision');

        $this->actingAs($editor)
            ->postJson("/api/v1/articles/{$fixture['article_id']}/decision", [
                'decision' => 'accepte',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['comments']);
    }

    public function test_admin_can_publish_only_accepted_article_and_notify_author(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $author = User::factory()->create();
        $author->assignRole('auteur');

        $fixture = $this->createArticleWithVersion($author, 'accepte');

        $this->actingAs($admin)
            ->postJson("/api/v1/articles/{$fixture['article_id']}/publish", [
                'volume' => '2026',
                'issue' => '4',
            ])
            ->assertCreated();

        $this->assertDatabaseHas('articles', [
            'id' => $fixture['article_id'],
            'status' => 'publie',
        ]);

        $this->assertDatabaseHas('publications', [
            'article_id' => $fixture['article_id'],
            'article_version_id' => $fixture['version_id'],
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $author->id,
            'type' => 'article_published',
        ]);
    }

    public function test_editor_can_publish_only_accepted_article_and_notify_author(): void
    {
        $editor = User::factory()->create();
        $editor->assignRole('editeur');

        $author = User::factory()->create();
        $author->assignRole('auteur');

        $fixture = $this->createArticleWithVersion($author, 'accepte');

        $this->actingAs($editor)
            ->postJson("/api/v1/articles/{$fixture['article_id']}/publish", [
                'volume' => '2026',
                'issue' => '5',
            ])
            ->assertCreated();

        $this->assertDatabaseHas('articles', [
            'id' => $fixture['article_id'],
            'status' => 'publie',
        ]);

        $this->assertDatabaseHas('publications', [
            'article_id' => $fixture['article_id'],
            'article_version_id' => $fixture['version_id'],
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $author->id,
            'type' => 'article_published',
        ]);
    }

    public function test_admin_cannot_publish_rejected_article(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $author = User::factory()->create();
        $author->assignRole('auteur');

        $fixture = $this->createArticleWithVersion($author, 'rejete');

        $this->actingAs($admin)
            ->postJson("/api/v1/articles/{$fixture['article_id']}/publish")
            ->assertStatus(409);

        $this->assertDatabaseMissing('publications', [
            'article_id' => $fixture['article_id'],
        ]);
    }

    public function test_editor_cannot_delete_completed_assignment(): void
    {
        $editor = User::factory()->create();
        $editor->assignRole('editeur');

        $author = User::factory()->create();
        $author->assignRole('auteur');

        $articleId = $this->createArticleWithVersion($author, 'en_revision')['article_id'];

        $assignmentId = DB::table('reviewer_assignments')->insertGetId([
            'article_id' => $articleId,
            'reviewer_id' => User::factory()->create()->id,
            'assigned_by' => $editor->id,
            'assigned_at' => Carbon::now(),
            'status' => 'complete',
            'due_date' => null,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->actingAs($editor)
            ->deleteJson("/api/v1/assignments/{$assignmentId}")
            ->assertStatus(409);
    }

    public function test_author_cannot_view_decision_of_another_author_article(): void
    {
        $editor = User::factory()->create();
        $editor->assignRole('editeur');

        $ownerAuthor = User::factory()->create();
        $ownerAuthor->assignRole('auteur');

        $otherAuthor = User::factory()->create();
        $otherAuthor->assignRole('auteur');

        $fixture = $this->createArticleWithVersion($ownerAuthor, 'en_revision');

        DB::table('editorial_decisions')->insert([
            'article_id' => $fixture['article_id'],
            'editor_id' => $editor->id,
            'decision' => 'revision_requise',
            'comments' => 'Merci de corriger les sections 2 et 3.',
            'decided_at' => Carbon::now(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->actingAs($otherAuthor)
            ->getJson("/api/v1/articles/{$fixture['article_id']}/decision")
            ->assertForbidden();
    }

    public function test_author_resubmission_creates_new_version_and_returns_en_revision_status(): void
    {
        $author = User::factory()->create();
        $author->assignRole('auteur');

        $fixture = $this->createArticleWithVersion($author, 'revision_requise');

        $this->actingAs($author);

        $this->postJson("/api/v1/articles/{$fixture['article_id']}/versions", [
            'pdf' => UploadedFile::fake()->create('revision-v2.pdf', 200, 'application/pdf'),
            'change_summary' => 'Corrections suite aux retours.',
        ])->assertCreated();

        $this->assertDatabaseHas('articles', [
            'id' => $fixture['article_id'],
            'status' => 'en_revision',
        ]);

        $this->assertEquals(
            2,
            DB::table('article_versions')->where('article_id', $fixture['article_id'])->count()
        );
    }

    /**
     * @return array{article_id:int,version_id:int,category_id:int}
     */
    private function createArticleWithVersion(User $author, string $status): array
    {
        $categoryId = DB::table('categories')->insertGetId([
            'name' => 'Categorie ' . $author->id,
            'slug' => 'categorie-' . $author->id . '-' . uniqid(),
            'description' => 'Categorie de test',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $articleId = DB::table('articles')->insertGetId([
            'author_id' => $author->id,
            'category_id' => $categoryId,
            'title' => 'Article test ' . uniqid(),
            'abstract' => 'Resume test',
            'keywords' => 'php,laravel',
            'status' => $status,
            'current_version_id' => null,
            'submitted_at' => Carbon::now(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
            'deleted_at' => null,
        ]);

        $versionId = DB::table('article_versions')->insertGetId([
            'article_id' => $articleId,
            'version_number' => 1,
            'pdf_path' => 'private/articles/' . $articleId . '/version-1.pdf',
            'pdf_original_name' => 'version-1.pdf',
            'pdf_size' => 1200,
            'change_summary' => null,
            'submitted_at' => Carbon::now(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        DB::table('articles')->where('id', $articleId)->update([
            'current_version_id' => $versionId,
            'updated_at' => Carbon::now(),
        ]);

        Storage::disk('local')->put('private/articles/' . $articleId . '/version-1.pdf', 'PDF');

        return [
            'article_id' => $articleId,
            'version_id' => $versionId,
            'category_id' => $categoryId,
        ];
    }
}
