<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'short_description' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0',

            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'discount_fixed'      => 'nullable|numeric|min:0',

            // Same rules as Store + tolerant
            'discount_starts_at' => 'nullable|date',
            'discount_ends_at'   => 'nullable|date|after_or_equal:discount_starts_at',

            'asset_type' => 'sometimes|required|string|in:digital,physical,service',
            'category_id' => 'sometimes|required|exists:categories,id',
            'is_published' => 'sometimes|boolean',

            'preview_images' => 'nullable|array',
            'preview_images.*' => 'image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            'asset_file' => 'nullable|file|mimes:zip,rar,pdf,psd|max:102400',
        ];
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'discount_starts_at' => $this->filled('discount_starts_at')
                && trim((string)$this->discount_starts_at) !== ''
                ? trim((string)$this->discount_starts_at)
                : null,

            'discount_ends_at' => $this->filled('discount_ends_at')
                && trim((string)$this->discount_ends_at) !== ''
                ? trim((string)$this->discount_ends_at)
                : null,
        ]);
    }
}
