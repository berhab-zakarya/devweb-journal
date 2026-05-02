<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'assignment_id',
        'article_version_id',
        'originality_score',
        'methodology_score',
        'clarity_score',
        'overall_score',
        'comments',
        'decision_suggestion',
        'submitted_at',
    ];

    /**
     * Native type casts.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
        ];
    }

    /**
     * Associated reviewer assignment.
     */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(ReviewerAssignment::class, 'assignment_id');
    }

    /**
     * Article version evaluated.
     */
    public function articleVersion(): BelongsTo
    {
        return $this->belongsTo(ArticleVersion::class, 'article_version_id');
    }

    /**
     * Status check helpers
     */
    public function isSubmitted(): bool
    {
        return $this->submitted_at !== null;
    }

    public function isDraft(): bool
    {
        return $this->submitted_at === null;
    }

    /**
     * Get reviewer user
     */
    public function reviewer()
    {
        return $this->assignment?->reviewer;
    }
}
