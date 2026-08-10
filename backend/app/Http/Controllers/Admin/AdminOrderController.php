<?php

namespace App\Http\Controllers\Admin;


use App\Http\Controllers\Controller;
use App\Models\Refund;
use Barryvdh\DomPDF\Facade\Pdf;

class RefundController extends Controller
{
    public function creditNote($id)
    {
        $refund = Refund::with('order.items.product', 'order.user')
            ->findOrFail($id);

        $fileName = "credit-note-{$refund->credit_note_number}.pdf";

        // ✅ Already generated?
        $existing = $refund->getFirstMedia('credit_notes');

        if ($existing) {
            return response()->download($existing->getPath(), $fileName);
        }

        // 🔥 Generate PDF
        $pdf = Pdf::loadView('emails.credit-note', compact('refund'));

        // 💾 Save with Spatie
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


