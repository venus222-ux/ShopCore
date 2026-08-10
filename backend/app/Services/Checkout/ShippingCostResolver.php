<?php

namespace App\Services\Checkout;

use App\Models\ShippingMethod;
use App\Services\Checkout\DTO\ShippingResult;

class ShippingCostResolver
{
    public function resolve(?int $shippingMethodId): ShippingResult
    {
        $method = ShippingMethod::where('is_active', true)->findOrFail($shippingMethodId);

        return new ShippingResult($method, (float) $method->price);
    }
}
