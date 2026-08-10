<?php

namespace App\Services;

use App\Jobs\FinalizeOrderInventoryJob;
use App\Jobs\ProcessOrderPaid;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderPaymentService
{
    /**
     * Marks an order as paid and triggers the same side effects regardless
     * of who/what confirmed the payment (Stripe webhook or manual admin
     * action): send confirmation email, finalize inventory. Idempotent -
     * safe to call twice for the same order (webhook retries, or an admin
     * clicking twice).
     */
    public function markPaid(Order $order, ?string $paymentIntentId = null): Order
    {
        $order = DB::transaction(function () use ($order, $paymentIntentId) {
            $locked = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();

            if ($locked->status === 'paid') {
                Log::info('Order already paid, skipping', ['order_id' => $locked->id]);
                return $locked;
            }

            $locked->update([
                'status' => 'paid',
                'payment_intent_id' => $paymentIntentId ?? $locked->payment_intent_id,
            ]);

            dispatch((new ProcessOrderPaid($locked))->onConnection('redis')->onQueue('emails'));

            return $locked;
        });

        if ($order->status === 'paid') {
            dispatch((new FinalizeOrderInventoryJob($order))->onQueue('inventory'));
        }

        return $order;
    }
}
