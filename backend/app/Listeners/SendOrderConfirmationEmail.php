<?php

namespace App\Listeners;

use App\Events\OrderPaid;
use App\Mail\OrderConfirmationMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendOrderConfirmationEmail implements ShouldQueue
{
    public $tries = 3;
    public $timeout = 90;

public function handle(OrderPaid $event): void
{
    try {
        // Safe reload
        $order = $event->order->fresh()->load(['items.product', 'user']);

        if (!$order->user?->email) {
            Log::warning('Cannot send email - no user email found', [
                'order_id' => $order->id
            ]);
            return;
        }

        Mail::to($order->user->email)
            ->send(new \App\Mail\OrderConfirmationMail($order));

        $order->update(['emailed_at' => now()]);

        Log::info('✅ Order confirmation email sent successfully', [
            'order_id' => $order->id,
            'to' => $order->user->email
        ]);

    } catch (\Throwable $e) {
        Log::error('❌ SendOrderConfirmationEmail failed', [
            'order_id' => $event->order->id ?? null,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        throw $e;
    }
}
}
