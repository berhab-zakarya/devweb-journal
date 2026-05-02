<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreArticleRequest extends FormRequest
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
        return [
            'title' => ['required', 'string', 'max:255'],
            'abstract' => ['required', 'string'],
            'keywords' => ['required', 'string'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'pdf' => ['required', 'file', 'mimetypes:application/pdf', 'max:10240'],
        ];
    }
}
