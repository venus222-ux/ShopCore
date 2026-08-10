<?php

namespace App\Services\Checkout;

use App\Models\Product;

class ShippingRequirementResolver
{
    public function requiresShipping(array $cartItems): bool
    {
        $productIds = collect($cartItems)->pluck('id')->unique();

        return Product::whereIn('id', $productIds)
            ->where('asset_type', 'physical')
            ->exists();
    }
}
