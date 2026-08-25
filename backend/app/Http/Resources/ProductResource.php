<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray($request)
    {
        $media = $this->media ?? collect();

        $previews = $media
            ->where('collection_name', 'previews')
            ->sortBy('order_column');

        $asset = $media
            ->firstWhere('collection_name', 'asset');

        // Extract media collection URLs
        $previewUrls = $previews
            ->map(fn ($m) => $m->getFullUrl())
            ->values()
            ->toArray();

        // 💡 FALLBACK: If media collection is empty, use database `preview_image` column
        if (empty($previewUrls) && !empty($this->preview_image)) {
            $fallbackUrl = str_starts_with($this->preview_image, 'http')
                ? $this->preview_image
                : asset('storage/' . ltrim($this->preview_image, '/'));

            $previewUrls = [$fallbackUrl];
        }

        $mainImageUrl = $previewUrls[0] ?? null;

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,

            'price' => (float) $this->price,
            'final_price' => (float) ($this->final_price ?? $this->price),
            'old_price' => $this->old_price ? (float) $this->old_price : null,

            'discount_percentage' => $this->discount_percentage ?? 0,
            'discount_fixed' => $this->discount_fixed ?? 0,

            'discount_starts_at' => optional($this->discount_starts_at)?->toISOString(),
            'discount_ends_at' => optional($this->discount_ends_at)?->toISOString(),

            'has_discount' => method_exists($this->resource, 'hasActiveDiscount') 
                ? $this->hasActiveDiscount() 
                : ($this->discount_percentage > 0),

            'category_id' => $this->category_id,

            'short_description' => $this->short_description,
            'description' => $this->description,

            'asset_type' => $this->asset_type ?? 'physical',
            'is_published' => (bool) $this->is_published,

            'category' => $this->category?->only(['id', 'name']),

            // 💡 Always return all image key variations so React receives valid URLs
            'preview_image' => $mainImageUrl,
            'preview_url'   => $mainImageUrl,
            'preview_urls'  => $previewUrls,

            'previews' => $previews
                ->map(fn ($m) => [
                    'id' => $m->id,
                    'url' => $m->getFullUrl(),
                    'name' => $m->file_name,
                    'size' => $m->size,
                ])
                ->values()
                ->toArray(),

            'asset' => ($this->asset_type === 'digital' && $asset) ? [
                'id' => $asset->id,
                'url' => $asset->getFullUrl(),
                'file_name' => $asset->file_name,
                'size' => $asset->size,
                'mime_type' => $asset->mime_type,
            ] : null,

            'is_wishlisted' => $this->is_wishlisted ?? false,

            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
        ];
    }
}