{{-- resources/views/emails/credit-note.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Credit Note {{ $refund->credit_note_number }}</title>
    <style>
        body { font-family: 'Inter', system-ui, sans-serif; font-size: 10pt; color: #0f172a; margin: 0; padding: 0; }
        .box { max-width: 850px; margin: auto; padding: 50px; }
        .title { font-size: 24pt; font-weight: 900; color: #0f172a; }
        .meta { color: #475569; font-size: 9.5pt; margin-top: 8px; }
        .amount { font-size: 28pt; font-weight: 700; color: #dc2626; margin: 30px 0; }
        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 9.5pt; color: #475569; }
        .footer { margin-top: 60px; font-size: 8.5pt; color: #94a3b8; text-align: center; }
    </style>
</head>
<body>
<div class="box">
    <h1 class="title">CREDIT NOTE</h1>
    <div class="meta">
        #{{ $refund->credit_note_number }}<br>
        {{ $refund->created_at->format('d M Y') }}
    </div>

    <div class="amount">-${{ number_format($refund->amount, 2) }}</div>

    <div class="row">
        <span>Original Order</span>
        <strong>#{{ $refund->order->invoice_number ?? $refund->order_id }}</strong>
    </div>
    <div class="row">
        <span>Customer</span>
        <strong>{{ $refund->order->billing_name ?? $refund->order->user->name ?? 'N/A' }}</strong>
    </div>
    @if($refund->reason)
    <div class="row">
        <span>Reason</span>
        <strong>{{ $refund->reason }}</strong>
    </div>
    @endif

    <div class="footer">
        This credit note confirms a refund processed via Stripe.<br>
        Thank you for your understanding.
    </div>
</div>
</body>
</html>
