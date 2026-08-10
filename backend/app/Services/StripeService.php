<?php

namespace App\Services;

use App\Models\Order;
use Stripe\Checkout\Session;
use Stripe\Stripe;

class StripeService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function createCheckoutSession(Order $order): Session
    {
        $lineItems = [];

        // Discount is distributed across product line items only (never
        // shipping/VAT), matching the same rule CheckoutService used when
        // it originally computed discount_total against the product
        // subtotal alone. Stripe doesn't support negative unit_amount, so
        // instead of a separate "Discount" line, the discount is baked
        // directly into each product's unit price here.
        $productSubtotal = (float) $order->subtotal;
        $discountRatio = $productSubtotal > 0
            ? min(1, (float) $order->discount_total / $productSubtotal)
            : 0;

        foreach ($order->items as $item) {
            if (!$item->product) {
                continue;
            }

            $product = $item->product;
            $discountedUnitPrice = round($item->price * (1 - $discountRatio), 2);

            $lineItems[] = [
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => $product->title,
                        'description' => $product->short_description,
                    ],
                    'unit_amount' => (int) round($discountedUnitPrice * 100),
                ],
                'quantity' => $item->quantity,
            ];
        }

        if ($order->shipping_total > 0) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => 'Shipping',
                    ],
                    'unit_amount' => (int) round($order->shipping_total * 100),
                ],
                'quantity' => 1,
            ];
        }

        if ($order->vat > 0) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => 'VAT',
                    ],
                    'unit_amount' => (int) round($order->vat * 100),
                ],
                'quantity' => 1,
            ];
        }

        return Session::create([
            'payment_method_types' => ['card'],

            'line_items' => $lineItems,

            'mode' => 'payment',

            'success_url' =>
                'http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}',

            'cancel_url' =>
                'http://localhost:5173/cancel',

            'metadata' => [
                'order_id' => (string) $order->id,
                'user_id' => (string) $order->user_id,
            ],

            'payment_intent_data' => [
                'metadata' => [
                    'order_id' => (string) $order->id,
                    'user_id' => (string) $order->user_id,
                ],
            ],
        ]);
    }
}
