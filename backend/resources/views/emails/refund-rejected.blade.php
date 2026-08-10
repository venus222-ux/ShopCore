{{-- resources/views/emails/refund-rejected.blade.php --}}
@component('mail::message')

# Update on Your Refund Request

Hi **{{ $refund->order->billing_name ?? 'there' }}**,

We've reviewed your refund request for order #{{ $refund->order->invoice_number ?? $refund->order_id }}, and unfortunately we're unable to process it at this time.

---

**Amount Requested:** ${{ number_format($refund->amount, 2) }}
@if($refund->reason)
**Note:** {{ $refund->reason }}
@endif

---

If you believe this is a mistake or would like to discuss further, please reply to this email and our team will be happy to help.

Thanks,
{{ config('app.name') }}

@endcomponent
