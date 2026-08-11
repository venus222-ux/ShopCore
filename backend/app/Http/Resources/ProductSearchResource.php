<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductSearchResource extends JsonResource
{
    public function toArray($request)
    {
        $r = $this->resource;

        return [
            'id' => $r->id ?? null,
            'slug' => $r->slug ?? null,
            'title' => $r->title ?? null,
            'price' => (float) ($r->price ?? 0),
            'final_price' => (float) ($r->final_price ?? $r->price ?? 0),
            'has_discount' => (bool) ($r->has_discount ?? false),
            'asset_type' => $r->asset_type ?? 'Premium',
            'preview_url' => $r->preview_urls[0] ?? $r->preview_url ?? null,
            'preview_urls' => $r->preview_urls ?? [],

            'category' => isset($r->category_name)
                ? ['name' => $r->category_name]
                : ($r->category ?? null),

            'score' => $r->score ?? null,

            // Already shaped identically to ProductVariantResource's output
            // by ProductSearchService::variantsPayload() at index time - no
            // further mapping needed here, just pass it through.
            'variants' => $r->variants ?? [],
        ];
    }
}
