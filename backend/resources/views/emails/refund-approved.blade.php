{{-- resources/views/emails/refund-approved.blade.php --}}
@component('mail::message')

# ✅ Your Refund Has Been Approved

Hi **{{ $refund->order->billing_name ?? 'there' }}**,

Good news - your refund request has been approved and processed.

---

**Order:** #{{ $refund->order->invoice_number ?? $refund->order_id }}
**Amount Refunded:** ${{ number_format($refund->amount, 2) }}
**Credit Note:** {{ $refund->credit_note_number }}

The refunded amount will appear on your original payment method within 5-10 business days, depending on your bank.

---

@component('mail::button', ['url' => config('app.frontend_url').'/dashboard'])
View Order Details
@endcomponent

If you have any questions, just reply to this email.

Thanks,
{{ config('app.name') }}

@endcomponent
