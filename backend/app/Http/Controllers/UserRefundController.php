<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Refund;
use App\Services\RefundService;
use Illuminate\Http\Request;

class UserRefundController extends Controller
{
    public function index()
    {
        $refunds = Refund::with(['order'])
            ->where('user_id', auth()->id())
            ->latest()
            ->get();

        return response()->json($refunds);
    }

    public function store(Request $request, $orderId, RefundService $refundService)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|min:3',
        ]);

        $order = Order::where('user_id', auth()->id())->findOrFail($orderId);

        try {
            $refund = $refundService->requestRefund($order, auth()->id(), $request->amount, $request->reason);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Refund request submitted. Our team will review it shortly.',
            'refund'  => $refund,
        ]);
    }

    public function creditNote($id)
    {
        $refund = Refund::with('order.items.product', 'order.user')
            ->where('user_id', auth()->id())
            ->where('status', 'succeeded')
            ->findOrFail($id);

        $fileName = "credit-note-{$refund->credit_note_number}.pdf";

        $existing = $refund->getFirstMedia('credit_notes');

        if ($existing) {
            return response()->download($existing->getPath(), $fileName);
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('emails.credit-note', compact('refund'));

        $refund
            ->addMediaFromString($pdf->output())
            ->usingFileName($fileName)
            ->toMediaCollection('credit_notes');

        return response()->download($refund->getFirstMedia('credit_notes')->getPath(), $fileName);
    }
}
