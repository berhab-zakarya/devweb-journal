<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Review
 */
class ReviewResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $assignment = $this->relationLoaded('assignment') ? $this->assignment : null;
        $isSubmitted = $assignment ? $assignment->status === 'complete' : true;

        return [
            'id' => $this->id,
            'assignment_id' => $this->assignment_id,
            'article_version_id' => $this->article_version_id,
            'originality_score' => $this->originality_score,
            'methodology_score' => $this->methodology_score,
            'clarity_score' => $this->clarity_score,
            'overall_score' => $this->overall_score,
            'comments' => $this->comments,
            'is_draft' => !$isSubmitted,
            'is_submitted' => $isSubmitted,
            'submitted_at' => $this->submitted_at,
            'assignment' => $this->whenLoaded('assignment'),
            'article_version' => $this->whenLoaded('articleVersion'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
