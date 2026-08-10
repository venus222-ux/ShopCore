{{-- resources/views/emails/order-confirmation.blade.php --}}
@component('mail::message')

# 🎉 Order Confirmed

Hi **{{ $order->user->name ?? 'Valued Customer' }}**,

Thank you for your purchase. Your payment has been successfully processed and your order is now confirmed.

---

## 📦 Order Details

- **Order Number:** #{{ $order->invoice_number ?? $order->id }}
- **Date:** {{ $order->created_at->format('F d, Y \a\t H:i') }}
- **Status:** Paid

---

## 🧾 Billing Information

@if($order->billing_company)
**Company:** {{ $order->billing_company }}
@endif

**Name:** {{ $order->billing_name }}
**Email:** {{ $order->billing_email }}
@if($order->billing_phone)
**Phone:** {{ $order->billing_phone }}
@endif

**Address:**
{{ $order->billing_address_1 }}
@if($order->billing_address_2)
{{ $order->billing_address_2 }}
@endif
{{ $order->billing_city }}, {{ $order->billing_postal_code }}
{{ $order->billing_country }}

@if($order->billing_vat_number)
**VAT:** {{ $order->billing_vat_number }}
@endif

@if($order->shipping_address_1)
---

## 🚚 Shipping Information

@if($order->shipping_company)
**Company:** {{ $order->shipping_company }}
@endif

**Name:** {{ $order->shipping_name }}
@if($order->shipping_phone)
**Phone:** {{ $order->shipping_phone }}
@endif

**Address:**
{{ $order->shipping_address_1 }}
@if($order->shipping_address_2)
{{ $order->shipping_address_2 }}
@endif
{{ $order->shipping_city }}, {{ $order->shipping_postal_code }}
{{ $order->shipping_country }}

@if($order->shippingMethod)
**Method:** {{ $order->shippingMethod->name }} (${{ number_format($order->shipping_total, 2) }})
@endif

@if($order->shipping_delivery_instructions)
**Delivery Instructions:** {{ $order->shipping_delivery_instructions }}
@endif
@endif

---

## 🛒 Purchased Items

@foreach($order->items as $item)
- **{{ $item->product->title ?? 'Digital Product' }}**
  Qty: {{ $item->quantity }} × ${{ number_format($item->price, 2) }}
  **Total: ${{ number_format($item->price * $item->quantity, 2) }}**
@endforeach

---

## 💰 Summary

- Subtotal: ${{ number_format($order->subtotal, 2) }}
@if($order->discount_total > 0)
- Discount: -${{ number_format($order->discount_total, 2) }}
@endif
- VAT ({{ rtrim(rtrim(number_format($order->vat_percent, 2), '0'), '.') }}%): ${{ number_format($order->vat, 2) }}
@if($order->shipping_total > 0)
- Shipping: ${{ number_format($order->shipping_total, 2) }}
@endif
- **Total Paid: ${{ number_format($order->total, 2) }}**

---

## 📥 Access Your Files

You can download your digital products anytime from your account dashboard.

---

## ℹ️ Need Help?

If you have any questions, just reply to this email — we're happy to help.

Thanks again for your trust!

**Best regards,**
**Your Marketplace Team**

@endcomponent
