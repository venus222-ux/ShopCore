<?php

namespace App\Services;

use App\Events\Refund\RefundApproved;
use App\Events\Refund\RefundRejected;
use App\Events\Refund\RefundRequested;
use App\Models\Order;
use App\Models\Refund;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session as StripeSession;
use Stripe\PaymentIntent;
use Stripe\Refund as StripeRefund;
use Stripe\Stripe;

class RefundService
{
    public function __construct(private readonly InventoryService $inventoryService)
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function requestRefund(Order $order, int $userId, float $amount, ?string $reason = null): Refund
    {
        if ($order->status !== 'paid') {
            throw new \Exception('Only paid orders can be refunded.');
        }

        $available = $this->getAvailableToRefund($order);

        if ($amount <= 0 || $amount > $available) {
            throw new \Exception("Requested amount exceeds what is refundable (max \${$available}).");
        }

        $refund = Refund::create([
            'order_id' => $order->id,
            'user_id' => $userId,
            'amount' => $amount,
            'reason' => $reason,
            'requested_by_customer' => true,
            'status' => 'requested',
        ]);

        event(new RefundRequested($refund));

        return $refund;
    }

    public function approveRequest(Refund $request): Refund
    {
        if (! $request->isRequested()) {
            throw new \Exception('This refund request has already been processed.');
        }

        $order = $request->order;

        // Cash orders were never charged through Stripe, so there is no
        // PaymentIntent to refund via API - approving here is purely a
        // bookkeeping action (the admin has already handled returning the
        // cash by other means), so it's marked succeeded directly.
        if ($order->payment_method === 'cash') {
            return $this->finalizeCashRefund($request, $order);
        }

        if (empty($order->payment_intent_id) && ! empty($order->stripe_session_id)) {
            $this->recoverPaymentIntent($order);
        }

        if (! $order->payment_intent_id) {
            throw new \Exception('Missing payment intent - cannot refund.');
        }

        $refund = DB::transaction(function () use ($request, $order) {
            $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->first();

            $available = $this->getAvailableToRefund($lockedOrder);

            if ((float) $request->amount > $available) {
                throw new \Exception("Refund exceeds available amount (max \${$available} based on the actual Stripe charge).");
            }

            $stripeRefund = StripeRefund::create([
                'payment_intent' => $lockedOrder->payment_intent_id,
                'amount' => (int) round($request->amount * 100),
                'metadata' => [
                    'order_id' => (string) $lockedOrder->id,
                    'reason' => $request->reason ?? '',
                ],
            ]);

            $status = $stripeRefund->status;

            $request->update([
                'status' => $status,
                'stripe_refund_id' => $stripeRefund->id,
            ]);

            if ($status === 'succeeded') {
                $this->applySucceeded($lockedOrder, (float) $request->amount);
            }

            return $request->fresh();
        });

        if ($refund->status === 'succeeded') {
            event(new RefundApproved($refund));
        }

        return $refund;
    }

    public function rejectRequest(Refund $request, ?string $adminNote = null): Refund
    {
        if (! $request->isRequested()) {
            throw new \Exception('This refund request has already been processed.');
        }

        $request->update([
            'status' => 'rejected',
            'reason' => trim(($request->reason ?? '').($adminNote ? " | Admin: {$adminNote}" : '')),
        ]);

        $refund = $request->fresh();

        event(new RefundRejected($refund));

        return $refund;
    }

    public function refund(Order $order, float $amount, ?string $reason = null): Refund
    {
        if ($order->status !== 'paid') {
            throw new \Exception('Only paid orders can be refunded.');
        }

        // Cash orders: no Stripe transaction exists to reverse. This
        // refund is a manual bookkeeping entry only - the admin is
        // expected to have already returned the money through some other
        // channel (bank transfer, in person, etc.) before recording it here.
        if ($order->payment_method === 'cash') {
            return DB::transaction(function () use ($order, $amount, $reason) {
                $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->first();

                $available = $this->getAvailableToRefund($lockedOrder);

                if ($amount <= 0 || $amount > $available) {
                    throw new \Exception("Refund exceeds available amount (max \${$available}).");
                }

                $refundModel = Refund::create([
                    'order_id' => $lockedOrder->id,
                    'user_id' => $lockedOrder->user_id,
                    'amount' => $amount,
                    'reason' => $reason,
                    'status' => 'succeeded',
                    'stripe_refund_id' => null,
                ]);

                $this->applySucceeded($lockedOrder, $amount);

                return $refundModel;
            });
        }

        if (empty($order->payment_intent_id) && ! empty($order->stripe_session_id)) {
            $this->recoverPaymentIntent($order);
        }

        if (! $order->payment_intent_id) {
            throw new \Exception('Missing payment intent - cannot refund.');
        }

        $refundModel = DB::transaction(function () use ($order, $amount, $reason) {
            $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->first();

            $available = $this->getAvailableToRefund($lockedOrder);

            if ($amount <= 0 || $amount > $available) {
                throw new \Exception("Refund exceeds available amount (max \${$available} based on the actual Stripe charge).");
            }

            $stripeRefund = StripeRefund::create([
                'payment_intent' => $lockedOrder->payment_intent_id,
                'amount' => (int) round($amount * 100),
                'metadata' => [
                    'order_id' => (string) $lockedOrder->id,
                    'reason' => $reason ?? '',
                ],
            ]);

            $status = $stripeRefund->status;

            $refundModel = Refund::create([
                'order_id' => $lockedOrder->id,
                'user_id' => $lockedOrder->user_id,
                'amount' => $amount,
                'reason' => $reason,
                'status' => $status,
                'stripe_refund_id' => $stripeRefund->id,
            ]);

            if ($status === 'succeeded') {
                $this->applySucceeded($lockedOrder, $amount);
            }

            return $refundModel;
        });

        if ($refundModel->status === 'succeeded') {
            event(new RefundApproved($refundModel));
        }

        return $refundModel;
    }

    private function finalizeCashRefund(Refund $request, Order $order): Refund
    {
        $refund = DB::transaction(function () use ($request, $order) {
            $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->first();

            $available = $this->getAvailableToRefund($lockedOrder);

            if ((float) $request->amount > $available) {
                throw new \Exception("Refund exceeds available amount (max \${$available}).");
            }

            $request->update([
                'status' => 'succeeded',
                'stripe_refund_id' => null,
            ]);

            $this->applySucceeded($lockedOrder, (float) $request->amount);

            return $request->fresh();
        });

        event(new RefundApproved($refund));

        return $refund;
    }

    public function markSucceeded(Refund $refund): void
    {
        if ($refund->status === 'succeeded') {
            return;
        }

        DB::transaction(function () use ($refund) {
            $refund->update(['status' => 'succeeded']);

            $order = Order::where('id', $refund->order_id)->lockForUpdate()->first();
            $this->applySucceeded($order, (float) $refund->amount);
        });

        event(new RefundApproved($refund->fresh()));
    }

    public function markFailed(Refund $refund): void
    {
        $refund->update(['status' => 'failed']);

        Log::warning('Refund failed at Stripe', [
            'refund_id' => $refund->id,
            'order_id' => $refund->order_id,
        ]);
    }

    /**
     * For card orders: the real ceiling is what Stripe actually charged on
     * the PaymentIntent (see earlier VAT-mismatch bug for why this can't
     * be trusted from order.total alone). For cash orders, there is no
     * external gateway to check against - order.total IS the authoritative
     * record, since the "payment" itself was a manual, offline event we
     * have no other system of record for.
     */
    private function getAvailableToRefund(Order $order): float
    {
        if ($order->payment_method === 'cash') {
            return max(0, (float) $order->total - (float) $order->refunded_total);
        }

        if (! $order->payment_intent_id) {
            return 0.0;
        }

        $paymentIntent = PaymentIntent::retrieve($order->payment_intent_id);
        $actualCharged = $paymentIntent->amount_received / 100;

        return max(0, $actualCharged - (float) $order->refunded_total);
    }

    private function applySucceeded(Order $order, float $amount): void
    {
        $order->increment('refunded_total', $amount);

        $fresh = $order->fresh();
        $isFullyRefunded = (float) $fresh->refunded_total >= (float) $fresh->total;

        if ($isFullyRefunded) {
            $fresh->update(['status' => 'refunded']);
            $this->inventoryService->restock($fresh);
        } else {
            Log::info('Partial refund processed - stock NOT automatically restored.', [
                'order_id' => $order->id,
                'refunded_total' => $fresh->refunded_total,
                'order_total' => $fresh->total,
            ]);
        }
    }

    private function recoverPaymentIntent(Order $order): void
    {
        Log::warning('Missing payment_intent_id, attempting recovery', ['order_id' => $order->id]);

        try {
            $session = StripeSession::retrieve([
                'id' => $order->stripe_session_id,
                'expand' => ['payment_intent'],
            ]);

            $pi = $session->payment_intent;
            $paymentIntentId = is_object($pi) ? $pi->id : $pi;

            if ($paymentIntentId) {
                $order->update(['payment_intent_id' => $paymentIntentId]);
                Log::info('Recovered payment_intent_id', ['order_id' => $order->id, 'payment_intent' => $paymentIntentId]);
            }
        } catch (\Throwable $e) {
            Log::error('Failed to recover payment intent', ['order_id' => $order->id, 'error' => $e->getMessage()]);
        }
    }
}
