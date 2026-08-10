<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Refund;
use App\Services\RefundService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class RefundController extends Controller
{
    public function refund(Request $request, $id, RefundService $refundService)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'nullable|string',
        ]);

        $order = Order::findOrFail($id);

        try {
            $refund = $refundService->refund($order, $request->amount, $request->reason);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Refund successful',
            'refund'  => $refund,
        ]);
    }

    public function index()
    {
        $refunds = Refund::with(['order.user', 'order.items.product'])
            ->where('status', '!=', 'requested')
            ->latest()
            ->paginate(20);

        return response()->json($refunds);
    }

    /**
     * Customer-submitted refund requests awaiting admin decision.
     */
    public function requests()
    {
        $requests = Refund::with(['order.user', 'order.items.product'])
            ->where('status', 'requested')
            ->latest()
            ->paginate(20);

        return response()->json($requests);
    }

    public function approve($id, RefundService $refundService)
    {
        $refund = Refund::findOrFail($id);

        try {
            $refund = $refundService->approveRequest($refund);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Refund approved and processed.',
            'refund'  => $refund,
        ]);
    }

    public function reject(Request $request, $id, RefundService $refundService)
    {
        $request->validate(['admin_note' => 'nullable|string']);

        $refund = Refund::findOrFail($id);

        try {
            $refund = $refundService->rejectRequest($refund, $request->admin_note);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Refund request rejected.',
            'refund'  => $refund,
        ]);
    }

    public function creditNote($id)
    {
        $refund = Refund::with('order.items.product', 'order.user')
            ->findOrFail($id);

        $fileName = "credit-note-{$refund->credit_note_number}.pdf";

        $existing = $refund->getFirstMedia('credit_notes');

        if ($existing) {
            return response()->download($existing->getPath(), $fileName);
        }

        $pdf = Pdf::loadView('emails.credit-note', compact('refund'));

        $refund
            ->addMediaFromString($pdf->output())
            ->usingFileName($fileName)
            ->toMediaCollection('credit_notes');

        $media = $refund->getFirstMedia('credit_notes');

        if (!$media) {
            abort(500, 'Credit note generation failed');
        }

        return response()->download($media->getPath(), $fileName);
    }
}
