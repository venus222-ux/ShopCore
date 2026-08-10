<?php

namespace App\Services\Checkout\DTO;

use App\Models\Order;

class CheckoutResult
{
    public function __construct(
        public readonly Order $order,
        public readonly ?string $checkoutUrl = null,
    ) {}
}
