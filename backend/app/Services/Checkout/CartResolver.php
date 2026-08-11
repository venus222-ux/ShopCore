<?php

namespace App\Services\Checkout;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\Checkout\DTO\CartResolution;

class CartResolver
{
    public function resolve(array $cartItems): CartResolution
    {
        $subtotal = 0;
        $orderItemsData = [];
        $reservationLines = [];

        foreach ($cartItems as $item) {
            $product = Product::findOrFail($item['id']);

            $variant = ! empty($item['variant_id'])
                ? ProductVariant::where('product_id', $product->id)->findOrFail($item['variant_id'])
                : $product->defaultVariant;

            if (! $variant) {
                throw new \RuntimeException("Product #{$product->id} has no purchasable variant.");
            }

            $quantity = (int) $item['quantity'];
            $price = (float) $variant->final_price;

            $subtotal += $price * $quantity;

            $orderItemsData[] = [
                'product_id' => $product->id,
                'product_variant_id' => $variant->id,
                'quantity' => $quantity,
                'price' => $price,
            ];

            $reservationLines[] = ['variant' => $variant, 'quantity' => $quantity];
        }

        return new CartResolution($subtotal, $orderItemsData, $reservationLines);
    }
}
