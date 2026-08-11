<?php

namespace App\Http\Controllers;

use App\Jobs\ReleaseOrderInventoryJob;
use App\Models\Order;
use App\Models\Refund;
use App\Services\OrderPaymentService;
use App\Services\RefundService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Stripe;
use Stripe\Webhook;
use Throwable;

class StripeWebhookController extends Controller // Acesta este controller-ul care primește webhook-urile de la Stripe
{
    public function handle(
        Request $request,
        OrderPaymentService $orderPaymentService,
        RefundService $refundService
    ) {
        Stripe::setApiKey(config('services.stripe.secret'));

        Log::info('--- WEBHOOK HIT ---');

        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        try {
            $webhookSecret = config('services.stripe.webhook_secret');
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret); // Verifică dacă cererea vine într-adevăr de la Stripe.
        } catch (Throwable $e) {
            Log::error('❌ Webhook signature verification FAILED: '.$e->getMessage());

            return response('Invalid signature', 400);
        }

        if ($event->type === 'checkout.session.completed') { // plata reușită
            Log::info('✅ Processing checkout.session.completed');

            $sessionId = $event->data->object->id ?? null;

            try {
                $session = StripeSession::retrieve($sessionId, ['expand' => ['payment_intent']]);

                // verificare suplimentară: confirmă că sesiunea chiar e plătită
                if ($session->payment_status !== 'paid') {
                    Log::warning('Session completed event but payment_status not paid', [
                        'session_id' => $sessionId,
                        'payment_status' => $session->payment_status,
                    ]);

                    return response()->json(['status' => 'not_paid'], 200);
                }

                $order = Order::where('stripe_session_id', $sessionId)->first();

                if (! $order) {
                    Log::warning('Order not found for session', ['session_id' => $sessionId]);

                    return response()->json(['status' => 'order_not_found'], 200);
                }

                $paymentIntentId = is_object($session->payment_intent)
                    ? $session->payment_intent->id
                    : $session->payment_intent;

                // Delegates to the same locking + idempotency logic used by
                // the admin "mark as completed" action - a single source of
                // truth for what "an order got paid" means and does.
                $orderPaymentService->markPaid($order, $paymentIntentId);
            } catch (Throwable $e) {
                Log::error('❌ FATAL ERROR in StripeWebhookController: '.$e->getMessage(), [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString(),
                ]);

                return response()->json([
                    'status' => 'error',
                    'message' => 'Internal processing error',
                ], 500);
            }
        }

        if ($event->type === 'checkout.session.expired') { // utilizatorul nu finalizează plata la timp
            Log::info('Processing checkout.session.expired');

            $sessionId = $event->data->object->id ?? null;

            $order = Order::where('stripe_session_id', $sessionId)->first();

            if ($order) {
                // Release the reservation so the stock goes back on sale.
                dispatch((new ReleaseOrderInventoryJob($order))->onQueue('inventory'));
            } else {
                Log::warning('Order not found for expired session', ['session_id' => $sessionId]);
            }
        }

        if ($event->type === 'charge.refunded' || $event->type === 'refund.updated') {
            Log::info("Processing {$event->type}");

            $stripeRefundId = null;

            if ($event->type === 'refund.updated') {
                $stripeRefundId = $event->data->object->id ?? null;
            } elseif (! empty($event->data->object->refunds->data)) {
                $stripeRefundId = $event->data->object->refunds->data[0]->id;
            }

            $stripeStatus = $event->type === 'refund.updated'
                ? ($event->data->object->status ?? null)
                : 'succeeded'; // charge.refunded fires only after refund succeeds

            if ($stripeRefundId) {
                $refund = Refund::where('stripe_refund_id', $stripeRefundId)->first();

                if ($refund) {
                    if ($stripeStatus === 'succeeded') {
                        $refundService->markSucceeded($refund);
                    } elseif ($stripeStatus === 'failed') {
                        $refundService->markFailed($refund);
                    }
                } else {
                    Log::warning('Webhook refund event for unknown refund', [
                        'stripe_refund_id' => $stripeRefundId,
                    ]);
                }
            } else {
                Log::warning('Could not determine Stripe refund ID from webhook.', [
                    'event_type' => $event->type,
                ]);
            }
        }

        return response()->json(['status' => 'success']);
    }
}

/*
Flux general

1. CheckoutController -> rezervă stocul.
2. Utilizatorul plătește pe Stripe (SAU adminul marchează manual comanda ca finalizată).
3. checkout.session.completed / AdminOrder::adminComplete -> ambele trec prin
   OrderPaymentService::markPaid(), care marchează comanda paid și
   finalizează stocul (idempotent, cu lock pe rând).
4. checkout.session.expired -> eliberează stocul rezervat.
5. charge.refunded / refund.updated -> actualizează statusul refund-ului prin RefundService.
*/
