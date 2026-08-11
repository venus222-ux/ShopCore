<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $fillable = ['product_variant_id', 'track_stock', 'quantity', 'reserved'];

    protected $casts = [
        'track_stock' => 'boolean',
    ];

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    // Quantity actually available to sell right now
    public function getAvailableAttribute(): ?int
    {
        if (! $this->track_stock) {
            return null; // unlimited - digital goods, or stock not tracked
        }

        return max(0, $this->quantity - $this->reserved);
    }

    public function inStock(int $requested = 1): bool
    {
        if (! $this->track_stock) {
            return true;
        }

        return $this->available >= $requested;
    }
}
