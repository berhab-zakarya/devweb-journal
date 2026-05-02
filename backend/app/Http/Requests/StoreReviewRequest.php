<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReviewRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isDraft = $this->boolean('is_draft');

        return [
            'is_draft' => ['nullable', 'boolean'],
            'comments' => [
                Rule::requiredIf(!$isDraft),
                'nullable',
                'string',
            ],
            'originality_score' => [
                Rule::requiredIf(!$isDraft),
                'nullable',
                'integer',
                'min:0',
                'max:10',
            ],
            'methodology_score' => [
                Rule::requiredIf(!$isDraft),
                'nullable',
                'integer',
                'min:0',
                'max:10',
            ],
            'clarity_score' => [
                Rule::requiredIf(!$isDraft),
                'nullable',
                'integer',
                'min:0',
                'max:10',
            ],
            'overall_score' => [
                Rule::requiredIf(!$isDraft),
                'nullable',
                'integer',
                'min:0',
                'max:10',
            ],
            'recommendation' => [
                Rule::requiredIf(!$isDraft),
                'nullable',
                Rule::in(['accept', 'reject', 'minor_revision', 'major_revision']),
            ],
        ];
    }
}
