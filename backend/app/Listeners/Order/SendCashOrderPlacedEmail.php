<?php

namespace App\Listeners\Order;

use App\Events\Order\CashOrderPlaced;
use App\Mail\CashOrderPlacedMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class SendCashOrderPlacedEmail implements ShouldQueue
{
    public function handle(CashOrderPlaced $event): void
    {
        $order = $event->order->fresh(['items.product', 'user', 'shippingMethod']);

        Mail::to($order->billing_email)->send(new CashOrderPlacedMail($order));
    }
}
