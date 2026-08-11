<?php

// app/Services/Checkout/DTO/CartResolution.php

namespace App\Services\Checkout\DTO;

class CartResolution
{
    public function __construct(
        public readonly float $subtotal,
        public readonly array $orderItemsData,
        public readonly array $reservationLines,
    ) {}
}
