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
     * Demo accounts and workflow fixtures (local, testing, and other envs that run DatabaseSeeder).
     */
    public function run(): void
    {
        $now = Carbon::now();

        $admin = $this->ensureUser('admin@journal.local', 'Admin Principal', 'Admin@12345', $now);
        $editor = $this->ensureUser('editeur@journal.local', 'Éditeur Démo', 'Editor@12345', $now);
        $reviewer1 = $this->ensureUser('relecteur1@journal.local', 'Relecteur Un', 'Reviewer@12345', $now);
        $reviewer2 = $this->ensureUser('relecteur2@journal.local', 'Relecteur Deux', 'Reviewer@12345', $now);
        $author1 = $this->ensureUser('auteur1@journal.local', 'Auteur Un', 'Author@12345', $now);
        $author2 = $this->ensureUser('auteur2@journal.local', 'Auteur Deux', 'Author@12345', $now);
        $author3 = $this->ensureUser('auteur3@journal.local', 'Auteur Trois', 'Author@12345', $now);
        $reader = $this->ensureUser('lecteur@journal.local', 'Lecteur Démo', 'Reader@12345', $now);

        $this->attachRoleToUser('admin', $admin->id);
        $this->attachRoleToUser('editor', $editor->id);
        $this->attachRoleToUser('reviewer', $reviewer1->id);
        $this->attachRoleToUser('reviewer', $reviewer2->id);
        $this->attachRoleToUser('author', $author1->id);
        $this->attachRoleToUser('author', $author2->id);
        $this->attachRoleToUser('author', $author3->id);
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

        // Article A1: submitted (author1)
        $a1 = $this->ensureArticle(
            authorId: $author1->id,
            categoryId: (int) $categoryId,
            title: 'Démo — Article soumis',
            status: 'submitted',
            now: $now
        );

        // Article A2: under_review with two completed reviews (author2)
        $a2 = $this->ensureArticle(
            authorId: $author2->id,
            categoryId: (int) $categoryId,
            title: 'Démo — Article en révision',
            status: 'under_review',
            now: $now
        );
        $this->ensureCompletedReviewsForArticle(
            articleId: $a2,
            editorId: $editor->id,
            reviewer1Id: $reviewer1->id,
            reviewer2Id: $reviewer2->id,
            now: $now
        );

        // Article A3: published (author3)
        $a3 = $this->ensureArticle(
            authorId: $author3->id,
            categoryId: (int) $categoryId,
            title: 'Démo — Article publié',
            status: 'published',
            now: $now
        );
        $this->ensurePublicationForArticle(
            articleId: $a3,
            now: $now,
            volume: '1',
            issue: '1'
        );
    }

    private function ensureUser(string $email, string $name, string $passwordPlain, Carbon $now): User
    {
        return User::query()->firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($passwordPlain),
                'email_verified_at' => $now,
            ]
        );
    }

    /**
     * Creates article + v1 if missing; returns article id.
     */
    private function ensureArticle(int $authorId, int $categoryId, string $title, string $status, Carbon $now): int
    {
        $articleId = DB::table('articles')
            ->where('author_id', $authorId)
            ->where('title', $title)
            ->value('id');

        if (!$articleId) {
            $articleId = DB::table('articles')->insertGetId([
                'author_id' => $authorId,
                'category_id' => $categoryId,
                'title' => $title,
                'abstract' => 'Résumé de démonstration pour les données de seed.',
                'keywords' => 'démo, journal, seed',
                'status' => $status,
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
                'pdf_original_name' => 'demo-v1.pdf',
                'pdf_size' => 320000,
                'change_summary' => null,
                'submitted_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        DB::table('articles')->where('id', $articleId)->update([
            'status' => $status,
            'current_version_id' => $versionId,
            'submitted_at' => $now,
            'updated_at' => $now,
        ]);

        return (int) $articleId;
    }

    private function ensureCompletedReviewsForArticle(
        int $articleId,
        int $editorId,
        int $reviewer1Id,
        int $reviewer2Id,
        Carbon $now,
    ): void {
        $versionId = (int) DB::table('articles')->where('id', $articleId)->value('current_version_id');
        if (!$versionId) {
            return;
        }

        $assignment1Id = $this->ensureAssignment(
            articleId: $articleId,
            reviewerId: $reviewer1Id,
            editorId: $editorId,
            now: $now
        );
        $assignment2Id = $this->ensureAssignment(
            articleId: $articleId,
            reviewerId: $reviewer2Id,
            editorId: $editorId,
            now: $now
        );

        $this->ensureReview($assignment1Id, $versionId, $now, 'Relecture complète (relecteur 1).');
        $this->ensureReview($assignment2Id, $versionId, $now, 'Relecture complète (relecteur 2).');
    }

    private function ensureAssignment(int $articleId, int $reviewerId, int $editorId, Carbon $now): int
    {
        $existing = DB::table('reviewer_assignments')
            ->where('article_id', $articleId)
            ->where('reviewer_id', $reviewerId)
            ->value('id');

        if ($existing) {
            DB::table('reviewer_assignments')->where('id', $existing)->update([
                'assigned_by' => $editorId,
                'status' => 'complete',
                'assigned_at' => $now,
                'updated_at' => $now,
            ]);

            return (int) $existing;
        }

        return (int) DB::table('reviewer_assignments')->insertGetId([
            'article_id' => $articleId,
            'reviewer_id' => $reviewerId,
            'assigned_by' => $editorId,
            'assigned_at' => $now,
            'status' => 'complete',
            'due_date' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    private function ensureReview(int $assignmentId, int $articleVersionId, Carbon $now, string $comments): void
    {
        $existing = DB::table('reviews')->where('assignment_id', $assignmentId)->value('id');
        $payload = [
            'article_version_id' => $articleVersionId,
            'originality_score' => 8,
            'methodology_score' => 8,
            'clarity_score' => 8,
            'overall_score' => 8,
            'comments' => $comments,
            'decision_suggestion' => 'accept',
            'submitted_at' => $now,
            'updated_at' => $now,
        ];

        if ($existing) {
            DB::table('reviews')->where('id', $existing)->update($payload);
        } else {
            DB::table('reviews')->insert(array_merge($payload, [
                'assignment_id' => $assignmentId,
                'created_at' => $now,
            ]));
        }
    }

    private function ensurePublicationForArticle(int $articleId, Carbon $now, string $volume, string $issue): void
    {
        $versionId = (int) DB::table('articles')->where('id', $articleId)->value('current_version_id');
        if (!$versionId) {
            return;
        }

        $pubId = DB::table('publications')->where('article_id', $articleId)->value('id');
        if ($pubId) {
            DB::table('publications')->where('id', $pubId)->update([
                'article_version_id' => $versionId,
                'published_at' => $now,
                'volume' => $volume,
                'issue' => $issue,
                'updated_at' => $now,
            ]);

            return;
        }

        DB::table('publications')->insert([
            'article_id' => $articleId,
            'article_version_id' => $versionId,
            'published_at' => $now,
            'doi' => '10.4242/journal.demo.' . $articleId,
            'volume' => $volume,
            'issue' => $issue,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

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
