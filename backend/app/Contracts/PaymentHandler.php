<?php

namespace App\Contracts;

use App\Models\Order;
use App\Services\Checkout\DTO\CheckoutResult;

interface PaymentHandler
{
    /**
     * Called after the Order + OrderItems already exist, inside the same
     * DB transaction as the rest of checkout.
     */
    public function process(Order $order): CheckoutResult;

    /**
     * Whether this payment method is currently available.
     */
    public function isAvailableFor(bool $requiresShipping, float $orderTotal): bool;

    public function key(): string;
}
