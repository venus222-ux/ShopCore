<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'is_active',
        'type',
        'value',
        'min_subtotal',
        'usage_limit',
        'used_count',
        'starts_at',
        'ends_at',
    ];

    protected $casts = [
        'is_active'    => 'boolean',
        'value'        => 'decimal:2',
        'min_subtotal' => 'decimal:2',
        'starts_at'    => 'datetime',
        'ends_at'      => 'datetime',
    ];

    public function isValidFor(float $subtotal): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();

        if (!empty($this->starts_at) && $now->lt($this->starts_at)) {
            return false;
        }
        if (!empty($this->ends_at) && $now->gt($this->ends_at)) {
            return false;
        }
        if (!is_null($this->usage_limit) && $this->used_count >= $this->usage_limit) {
            return false;
        }
        if (!is_null($this->min_subtotal) && $subtotal < (float) $this->min_subtotal) {
            return false;
        }

        return true;
    }

    public function discountFor(float $subtotal): float
    {
        if (!$this->isValidFor($subtotal)) {
            return 0;
        }

        $discount = $this->type === 'percent'
            ? $subtotal * ((float) $this->value / 100)
            : (float) $this->value;

        return round(min($discount, $subtotal), 2);
    }

    public function isExpired(): bool
    {
        return $this->ends_at && now()->gt($this->ends_at);
    }
}
