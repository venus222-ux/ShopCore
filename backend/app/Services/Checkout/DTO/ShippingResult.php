<?php
// app/Services/Checkout/DTO/ShippingResult.php

namespace App\Services\Checkout\DTO;

use App\Models\ShippingMethod;

class ShippingResult
{
    public function __construct(
        public readonly ?ShippingMethod $method,
        public readonly float $cost,
    ) {}

    public static function none(): self
    {
        return new self(null, 0.0);
    }
}
