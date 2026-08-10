{{-- resources/views/emails/refund-requested-admin.blade.php --}}
@component('mail::message')

# 🔔 New Refund Request

A customer has submitted a refund request that needs your review.

---

**Order:** #{{ $refund->order->invoice_number ?? $refund->order_id }}
**Customer:** {{ $refund->order->billing_name ?? $refund->user?->name ?? 'Unknown' }}
**Amount Requested:** ${{ number_format($refund->amount, 2) }}
**Reason:** {{ $refund->reason ?? 'No reason provided' }}

---

@component('mail::button', ['url' => config('app.frontend_url').'/admin?tab=refund-requests'])
Review Request
@endcomponent

Thanks,
{{ config('app.name') }}

@endcomponent
