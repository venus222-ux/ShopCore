<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductVariant extends Model  //Acesta gestionează variantele de produs (diferite culori, mărimi etc.) și logica de preț.
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'sku',
        'price',
        'discount_percentage',
        'discount_fixed',
        'discount_starts_at',
        'discount_ends_at',
        'is_default',
    ];

    protected $casts = [
        'price'                => 'decimal:2',
        'discount_percentage'  => 'decimal:2',
        'discount_fixed'       => 'decimal:2',
        'discount_starts_at'   => 'datetime:Y-m-d H:i:s',
        'discount_ends_at'     => 'datetime:Y-m-d H:i:s',
        'is_default'           => 'boolean',
    ];

    protected static function booted(): void
    {
        // MySQL can't enforce "one default variant per product" with a
        // partial unique index, so it's enforced here: saving a variant
        // as default un-defaults any sibling variant for the same product.
        static::saving(function (ProductVariant $variant) {
            if ($variant->is_default) {
                static::where('product_id', $variant->product_id)
                    ->when($variant->exists, fn ($q) => $q->whereKeyNot($variant->getKey()))
                    ->update(['is_default' => false]);
            }
        });
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function attributeValues()
    {
        return $this->belongsToMany(AttributeValue::class, 'variant_attribute_value');
    }

    public function inventory()
    {
        return $this->hasOne(Inventory::class);
    }

    // ================= PRICING (mirrors Product's discount algorithm) =================
    // Falls back to the parent product's price/discount fields whenever the
    // variant leaves its own pricing columns null, so a single-variant
    // (legacy/digital) product behaves exactly like Product's own accessors did.

    public function getEffectivePriceAttribute(): float  //fallback la prețul produsului părinte dacă varianta nu are preț propriu.
    {
        return (float) ($this->attributes['price'] ?? $this->product?->price ?? 0);
    }

    public function getFinalPriceAttribute(): float
    {
        $price = $this->getEffectivePriceAttribute();
        $discountAmount = $this->getActiveDiscountAmount();

        return max(0, round($price - $discountAmount, 2));
    }

    public function hasActiveDiscount(): bool
    {
        return $this->getActiveDiscountAmount() > 0;
    }

    private function getActiveDiscountPercentage(): float
    {
        $percent = (float) ($this->attributes['discount_percentage'] ?? $this->product?->discount_percentage ?? 0);

        if ($percent > 0 && $this->isDiscountActive()) {
            return $percent;
        }

        // Fall through to category discount, same priority order as Product
        if ($this->product?->category && method_exists($this->product->category, 'hasActiveDiscount')) {
            if ($this->product->category->hasActiveDiscount()) {
                return (float) ($this->product->category->discount_percentage ?? 0);
            }
        }

        return 0;
    }

    private function getActiveDiscountAmount(): float
    {
        $price = $this->getEffectivePriceAttribute();
        $percent = $this->getActiveDiscountPercentage();

        if ($percent > 0) {
            return $price * ($percent / 100);
        }

        $fixed = (float) ($this->attributes['discount_fixed'] ?? $this->product?->discount_fixed ?? 0);
        if ($fixed > 0 && $this->isDiscountActive()) {
            return $fixed;
        }

        return 0;
    }

    private function isDiscountActive(): bool
    {
        $now = now();
        $starts = $this->attributes['discount_starts_at'] ?? $this->product?->discount_starts_at ?? null;
        $ends   = $this->attributes['discount_ends_at'] ?? $this->product?->discount_ends_at ?? null;

        if (!empty($starts) && $now->lt($starts)) {
            return false;
        }
        if (!empty($ends) && $now->gt($ends)) {
            return false;
        }

        return true;
    }
}
