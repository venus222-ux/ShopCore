<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'parent_id'];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    // Attributes applicable to this category (e.g. Clothing -> Size, Color)
    public function attributes()
    {
        return $this->belongsToMany(Attribute::class, 'category_attribute');
    }

    public function hasActiveDiscount(): bool
    {
        if (! Schema::hasColumn('categories', 'discount_percentage')) {
            return false;
        }

        $perc = (float) ($this->discount_percentage ?? 0);
        if ($perc <= 0) {
            return false;
        }

        $now = now();

        if (! empty($this->discount_starts_at) && $now->lt($this->discount_starts_at)) {
            return false;
        }
        if (! empty($this->discount_ends_at) && $now->gt($this->discount_ends_at)) {
            return false;
        }

        return true;
    }
}
