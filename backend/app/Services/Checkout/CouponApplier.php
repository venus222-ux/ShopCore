<?php

namespace App\Services\Checkout;

use App\Exceptions\InvalidCouponException;
use App\Models\Coupon;
use App\Services\Checkout\DTO\CouponResult;

class CouponApplier
{
    public function apply(?string $code, float $subtotal): CouponResult
    {
        if (empty($code)) {
            return CouponResult::none();
        }

        // Locked so two concurrent checkouts against a usage-limited
        // coupon can't both squeeze past the limit.
        $coupon = Coupon::where('code', $code)->lockForUpdate()->first();

        if (! $coupon || ! $coupon->isValidFor($subtotal)) {
            throw new InvalidCouponException('This coupon is invalid or cannot be applied to this order.');
        }

        $discountTotal = $coupon->discountFor($subtotal);
        $coupon->increment('used_count');

        return new CouponResult($coupon, $discountTotal);
    }
}
