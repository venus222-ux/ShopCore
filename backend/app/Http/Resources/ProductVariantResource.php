<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'sku'          => $this->sku,
            'price'        => (float) $this->final_price,
            'has_discount' => $this->hasActiveDiscount(),
            'is_default'   => (bool) $this->is_default,

            'attribute_values' => $this->whenLoaded('attributeValues', function () {
                return $this->attributeValues->map(fn ($av) => [
                    'attribute_slug' => $av->attribute->slug,
                    'attribute_name' => $av->attribute->name,
                    'value'          => $av->value,
                    'value_id'       => $av->id,
                ]);
            }),

            // true = in stock, false = out of stock, true (default) if
            // inventory isn't tracked at all (digital goods = unlimited)
            'in_stock' => $this->whenLoaded('inventory', function () {
                return $this->inventory
                    ? ($this->inventory->track_stock ? $this->inventory->available > 0 : true)
                    : true;
            }),
        ];
    }
}
