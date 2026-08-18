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

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,

            'price' => $this->price,
            'final_price' => $this->final_price,
            'old_price' => $this->old_price,

            'discount_percentage' => $this->discount_percentage,
            'discount_fixed' => $this->discount_fixed,

            'discount_starts_at' => optional($this->discount_starts_at)?->toISOString(),
            'discount_ends_at' => optional($this->discount_ends_at)?->toISOString(),

            'has_discount' => $this->hasActiveDiscount(),

            'category_id' => $this->category_id,

            'short_description' => $this->short_description,
            'description' => $this->description,

            'asset_type' => $this->asset_type ?? 'Premium',
            'is_published' => (bool) $this->is_published,

            'category' => $this->category?->only(['id', 'name']),

            'preview_urls' => $previews
                ->map(fn ($m) => $m->getFullUrl())
                ->values()
                ->toArray(),

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
            // set by controller (no query in resource)
            'is_wishlisted' => $this->is_wishlisted ?? false,

            // ⭐ NEW - only present when the controller eager-loads
            // 'variants.attributeValues.attribute' + 'variants.inventory'
            // (currently just PublicProductController::show). Listing
            // endpoints that don't load this relation get an empty array
            // here instead of triggering an N+1 query.
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
        ];
    }
}
