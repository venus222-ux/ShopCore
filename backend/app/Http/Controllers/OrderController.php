<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\InventoryService;
use App\Services\OrderPaymentService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class OrderController extends Controller
{
    public function index()
    {
        return Order::with('items.product')
            ->where('user_id', auth()->id())
            ->latest()
            ->get();
    }

    public function show($id)
    {
        return Order::with('items.product')
            ->where('user_id', auth()->id())
            ->findOrFail($id);
    }

    // ================== ADMIN METHODS ==================

    public function adminShow($id)
    {
        $order = Order::with(['items.product', 'user', 'refunds', 'shippingMethod'])
            ->findOrFail($id);

        return response()->json($order);
    }

    public function adminInvoice($id)
{
    $order = Order::with([
        'items.product',
        'items.variant.attributeValues.attribute',
        'user',
        'shippingMethod',
    ])->findOrFail($id);

    $fileName = "invoice-{$order->invoice_number}.pdf";

    $existing = $order->getFirstMedia('invoices');

    // Cached PDF is only valid if it was generated AFTER the order's last
    // update - if the order changed since (e.g. total was corrected,
    // status changed, a refund adjusted figures shown on the invoice),
    // the stale cached file must be regenerated rather than served as-is.
    if ($existing && $existing->created_at->gte($order->updated_at)) {
        return response()->download($existing->getPath(), $fileName);
    }

    if ($existing) {
        $order->clearMediaCollection('invoices');
    }

    $pdf = Pdf::loadView('invoices.eu-invoice', compact('order'))
              ->setPaper('a4', 'portrait');

    $order
        ->addMediaFromString($pdf->output())
        ->usingFileName($fileName)
        ->toMediaCollection('invoices');

    return response()->download(
        $order->getFirstMedia('invoices')->getPath(),
        $fileName
    );
}

    /**
     * Manually mark a pending order as paid - e.g. bank transfer confirmed
     * outside Stripe, or correcting an order stuck in "pending" after a
     * webhook was missed. Triggers the exact same side effects as a Stripe
     * webhook confirmation (confirmation email + inventory finalization),
     * via OrderPaymentService - the same service StripeWebhookController
     * uses, so both paths can never diverge in behavior.
     */
    public function adminComplete($id, OrderPaymentService $orderPaymentService)
    {
        $order = Order::findOrFail($id);

        if ($order->status === 'paid') {
            return response()->json(['message' => 'Order is already paid.'], 422);
        }

        if (in_array($order->status, ['refunded', 'cancelled'], true)) {
            return response()->json([
                'message' => "Cannot complete an order with status '{$order->status}'.",
            ], 422);
        }

        $order = $orderPaymentService->markPaid($order);

        return response()->json([
            'message' => 'Order marked as completed. Stock is being updated.',
            'order'   => $order->fresh(['items.product', 'user']),
        ]);
    }
public function invoice($id)
{
    $order = Order::with([
            'items.product',
            'items.variant.attributeValues.attribute',
            'user',
            'shippingMethod',
        ])
        ->where('user_id', auth()->id())
        ->findOrFail($id);

    $fileName = "invoice-{$order->invoice_number}.pdf";

    $existing = $order->getFirstMedia('invoices');

    // Cached PDF is only valid if it was generated AFTER the order's last
    // update - if the order changed since (e.g. total corrected, a refund
    // adjusted figures shown on the invoice), the stale cached file must
    // be regenerated rather than served as-is.
    if ($existing && $existing->created_at->gte($order->updated_at)) {
        return response()->download($existing->getPath(), $fileName);
    }

    if ($existing) {
        $order->clearMediaCollection('invoices');
    }

    $pdf = Pdf::loadView('invoices.eu-invoice', compact('order'))
        ->setPaper('a4', 'portrait');

    $order
        ->addMediaFromString($pdf->output())
        ->usingFileName($fileName)
        ->toMediaCollection('invoices');

    return response()->download(
        $order->getFirstMedia('invoices')->getPath(),
        $fileName
    );
}

public function adminRelease($id)
{
    $order = Order::findOrFail($id);

    if ($order->status !== 'pending') {
        return response()->json([
            'message' => "Only pending orders can be released. This order is '{$order->status}'.",
        ], 422);
    }

    \App\Jobs\ReleaseOrderInventoryJob::dispatch($order)->onQueue('inventory');

    return response()->json([
        'message' => 'Order release queued. Stock will be freed shortly.',
    ]);
}


public function manualRestock($orderId, InventoryService $inventoryService)
{
    $order = Order::findOrFail($orderId);

    if (!in_array($order->status, ['refunded'], true) && (float) $order->refunded_total <= 0) {
        return response()->json(['message' => 'This order has no refund to restock for.'], 422);
    }

    $inventoryService->restock($order);

    return response()->json(['message' => 'Stock manually restored for this order.']);
}

public function adminConfirmCash($id, OrderPaymentService $orderPaymentService)
{
    $order = Order::findOrFail($id);

    if ($order->payment_method !== 'cash') {
        return response()->json(['message' => 'This order was not placed as Cash on Delivery.'], 422);
    }

    if ($order->status === 'paid') {
        return response()->json(['message' => 'Order is already paid.'], 422);
    }

    if (in_array($order->status, ['refunded', 'cancelled'], true)) {
        return response()->json(['message' => "Cannot confirm payment for an order with status '{$order->status}'."], 422);
    }

    $order->update(['cod_confirmed_at' => now()]);

    $order = $orderPaymentService->markPaid($order);

    return response()->json([
        'message' => 'Cash payment confirmed. Stock is being updated.',
        'order'   => $order->fresh(['items.product', 'user']),
    ]);
}
}
