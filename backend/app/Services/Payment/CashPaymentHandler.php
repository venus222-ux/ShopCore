<?php

namespace App\Services\Payment;

use App\Contracts\PaymentHandler;
use App\Events\Order\CashOrderPlaced;
use App\Models\Order;
use App\Models\Setting;
use App\Services\Checkout\DTO\CheckoutResult;

class CashPaymentHandler implements PaymentHandler
{
    public function process(Order $order): CheckoutResult
    {
        event(new CashOrderPlaced($order));

        return new CheckoutResult($order, null);
    }

    public function isAvailableFor(bool $requiresShipping, float $orderTotal): bool
    {
        if (!(bool) (int) Setting::get('cod_enabled', '1')) {
            return false;
        }

        if (!$requiresShipping) {
            return false;
        }

        $maxValue = (float) Setting::get('cod_max_order_value', '500');

        return $orderTotal <= $maxValue;
    }

    public function key(): string
    {
        return 'cash';
    }

    public function fee(): float
    {
        return (float) Setting::get('cod_fee', '0');
    }
}
