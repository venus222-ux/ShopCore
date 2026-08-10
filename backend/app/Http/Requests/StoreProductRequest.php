<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'short_description' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',

            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'discount_fixed'      => 'nullable|numeric|min:0',

            'discount_starts_at' => 'nullable|date',           // very tolerant
            'discount_ends_at'   => 'nullable|date|after_or_equal:discount_starts_at',

            'category_id' => 'required|exists:categories,id',
            'is_published' => 'required|boolean',
            'asset_type' => 'required|string|in:digital,physical,service',

            'preview_images' => 'nullable|array',
            'preview_images.*' => 'image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            'asset_file' => 'nullable|file|mimes:zip,rar,pdf,psd|max:102400',
        ];
    }

    protected function prepareForValidation()
    {
        $starts = $this->discount_starts_at;
        $ends   = $this->discount_ends_at;

        $this->merge([
            'discount_starts_at' => $starts && trim((string)$starts) !== '' ? trim((string)$starts) : null,
            'discount_ends_at'   => $ends   && trim((string)$ends)   !== '' ? trim((string)$ends)   : null,
        ]);
    }
}
