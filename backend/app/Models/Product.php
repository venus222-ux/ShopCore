<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Product extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    // Add to $fillable
    protected $fillable = [
        'title',
        'slug',
        'short_description',
        'description',
        'price',
        'asset_type',
        'is_published',
        'category_id',
        'user_id',
        'discount_percentage',
        'discount_fixed',
        'discount_starts_at',
        'discount_ends_at',
        'preview_image',
        'parent_id',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'price' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'discount_fixed' => 'decimal:2',
        'discount_starts_at' => 'datetime:Y-m-d H:i:s',   // ← use space + seconds
        'discount_ends_at' => 'datetime:Y-m-d H:i:s',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // ================= VARIANTS (new) =================
    // Every product gets at least a "default" variant (see the backfill
    // command). Product::getFinalPriceAttribute() below is untouched for
    // now - it keeps driving search/resource/frontend pricing until the
    // cart/checkout cutover step redirects it to defaultVariant->final_price.

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function defaultVariant()
    {
        return $this->hasOne(ProductVariant::class)->where('is_default', true);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('previews')
            ->useDisk('public')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'])
            ->singleFile(false)           // ← Very important
            ->onlyKeepLatest(999);       // null = keep all files

        $this->addMediaCollection('asset')
            ->useDisk('public')
            ->singleFile(true);
    }

    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    public function wishedByUsers()
    {
        return $this->belongsToMany(
            User::class,
            'wishlists'
        )->withTimestamps();
    }

    // ================= DISCOUNT LOGIC (SAFE) =================

    public function getFinalPriceAttribute()
    {
        $price = (float) ($this->attributes['price'] ?? $this->price ?? 0);

        $discountAmount = $this->getActiveDiscountAmount();

        return max(0, round($price - $discountAmount, 2));
    }

    public function getEffectiveDiscountPercentageAttribute(): float
    {
        return $this->getActiveDiscountPercentage();
    }

    public function getOldPriceAttribute()
    {
        return $this->hasActiveDiscount() ? $this->price : null;
    }

    public function hasActiveDiscount(): bool
    {
        return $this->getActiveDiscountPercentage() > 0;
    }

    /**
     * Get active discount percentage (Product > Category)
     */
    private function getActiveDiscountPercentage(): float
    {
        // Check if column exists first
        if (! $this->hasColumn('discount_percentage')) {
            return 0;
        }

        // Product discount (priority)
        if ((float) ($this->attributes['discount_percentage'] ?? 0) > 0) {
            if ($this->isDiscountActive()) {
                return (float) $this->attributes['discount_percentage'];
            }
        }

        // Category discount
        if ($this->category && method_exists($this->category, 'hasActiveDiscount')) {
            if ($this->category->hasActiveDiscount()) {
                return (float) ($this->category->discount_percentage ?? 0);
            }
        }

        return 0;
    }

    private function getActiveDiscountAmount(): float
    {
        $price = (float) ($this->attributes['price'] ?? 0);
        $perc = $this->getActiveDiscountPercentage();

        if ($perc > 0) {
            return $price * ($perc / 100);
        }

        // Fixed discount (product only)
        if ($this->hasColumn('discount_fixed') && (float) ($this->attributes['discount_fixed'] ?? 0) > 0) {
            if ($this->isDiscountActive()) {
                return (float) $this->attributes['discount_fixed'];
            }
        }

        return 0;
    }

    private function isDiscountActive(): bool
    {
        if (! $this->hasColumn('discount_starts_at')) {
            return true;
        }

        $now = now();

        if (! empty($this->attributes['discount_starts_at']) && $now->lt($this->attributes['discount_starts_at'])) {
            return false;
        }

        if (! empty($this->attributes['discount_ends_at']) && $now->gt($this->attributes['discount_ends_at'])) {
            return false;
        }

        return true;
    }

    private function hasColumn(string $column): bool
    {
        try {
            return Schema::hasColumn($this->getTable(), $column);
        } catch (\Exception $e) {
            return false;
        }
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    // 👇 accessors to fetch Spatie Media URLs 👇
    public function getPreviewUrlsAttribute(): array
    {
        return $this->getMedia('previews')
            ->sortBy('order_column')
            ->map(fn ($m) => $m->getFullUrl())
            ->toArray();
    }

    public function getPreviewUrlAttribute(): ?string
    {
        $urls = $this->preview_urls;

        return $urls[0] ?? null;
    }
}
