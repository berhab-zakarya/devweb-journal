<?php

namespace App\Enums;

enum ArticleStatus: string
{
    case SUBMITTED = 'submitted';
    case UNDER_REVIEW = 'under_review';
    case ACCEPTED = 'accepted';
    case REJECTED = 'rejected';
    case REVISION_REQUIRED = 'revision_required';
    case PUBLISHED = 'published';

    /**
     * Returns all status values.
     *
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
