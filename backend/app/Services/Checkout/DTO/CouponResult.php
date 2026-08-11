<?php

// app/Services/Checkout/DTO/CouponResult.php

namespace App\Services\Checkout\DTO;

use App\Models\Coupon;

class CouponResult
{
    public function __construct(
        public readonly ?Coupon $coupon,
        public readonly float $discountTotal,
    ) {}

    public static function none(): self
    {
        return new self(null, 0.0);
    }
}
