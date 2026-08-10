<?php

namespace App\Services\Payment;

use App\Contracts\PaymentHandler;
use App\Models\Order;
use App\Services\Checkout\DTO\CheckoutResult;
use App\Services\StripeService;

class StripePaymentHandler implements PaymentHandler
{
    public function __construct(private readonly StripeService $stripe) {}

    public function process(Order $order): CheckoutResult
    {
        $session = $this->stripe->createCheckoutSession($order);
        $order->update(['stripe_session_id' => $session->id]);

        return new CheckoutResult($order, $session->url);
    }

    public function isAvailableFor(bool $requiresShipping, float $orderTotal): bool
    {
        return true; // card payment has no restrictions
    }

    public function key(): string
    {
        return 'card';
    }
}
