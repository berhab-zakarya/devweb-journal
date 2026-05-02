<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Article extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'author_id',
        'category_id',
        'title',
        'abstract',
        'keywords',
        'status',
        'current_version_id',
        'submitted_at',
    ];

    /**
     * Author of the article.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Category of the article.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Versions of the article.
     */
    public function versions(): HasMany
    {
        return $this->hasMany(ArticleVersion::class);
    }

    /**
     * Reviewer assignments linked to the article.
     */
    public function reviewerAssignments(): HasMany
    {
        return $this->hasMany(ReviewerAssignment::class);
    }

    /**
     * History of editorial decisions.
     */
    public function editorialDecisions(): HasMany
    {
        return $this->hasMany(EditorialDecision::class);
    }

    /**
     * Current version of the article.
     */
    public function currentVersion(): BelongsTo
    {
        return $this->belongsTo(ArticleVersion::class, 'current_version_id');
    }

    /**
     * Associated publication (if article is published).
     */
    public function publication(): HasOne
    {
        return $this->hasOne(Publication::class);
    }

    /**
     * Status check helpers
     */
    public function isPending(): bool
    {
        return $this->status === 'submitted';
    }

    public function isUnderReview(): bool
    {
        return $this->status === 'under_review';
    }

    public function isAccepted(): bool
    {
        return $this->status === 'accepted';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function requiresRevision(): bool
    {
        return $this->status === 'revision_required';
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }
}
