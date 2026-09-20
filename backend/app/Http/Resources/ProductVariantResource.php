<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'price' => (float) $this->final_price,
            'old_price' => (float) $this->getEffectivePriceAttribute(),
            'discount_percentage' => $this->discount_percentage !== null ? (float) $this->discount_percentage : null,
            'has_discount' => $this->hasActiveDiscount(),
            'is_default' => (bool) $this->is_default,

            'attribute_values' => $this->whenLoaded('attributeValues', function () {
                return $this->attributeValues->map(fn ($av) => [
                    'attribute_slug' => $av->attribute->slug,
                    'attribute_name' => $av->attribute->name,
                    'value' => $av->value,
                    'value_id' => $av->id,
                ]);
            }),

            'in_stock' => $this->whenLoaded('inventory', function () {
                return $this->inventory
                    ? ($this->inventory->track_stock ? $this->inventory->available > 0 : true)
                    : true;
            }),

            'images' => $this->whenLoaded('attributeValues', function () {
                $collection = 'images-product-'.$this->product_id;

                $withImages = $this->attributeValues->first(
                    fn ($av) => $av->relationLoaded('media')
                        && $av->getMedia($collection)->isNotEmpty()
                );

                return $withImages
                    ? $withImages->getMedia($collection)->map(fn ($m) => $m->getFullUrl())->values()
                    : [];
            }),
        ];
    }
}
