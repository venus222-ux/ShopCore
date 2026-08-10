{{-- resources/views/emails/cash-order-placed.blade.php --}}
@component('mail::message')

# 📦 Order Received

Hi **{{ $order->user->name ?? $order->billing_name }}**,

Thank you for your order! You've selected **Cash on Delivery**, so please have the exact amount ready when your order arrives.

---

## Order Details

- **Order Number:** #{{ $order->invoice_number ?? $order->id }}
- **Date:** {{ $order->created_at->format('F d, Y') }}
- **Payment Method:** Cash on Delivery
- **Amount Due on Delivery:** ${{ number_format($order->total, 2) }}

---

## Items

@foreach($order->items as $item)
- **{{ $item->product->title ?? 'Product' }}**
  Qty: {{ $item->quantity }} × ${{ number_format($item->price, 2) }}
@endforeach

---

## Delivery Address

{{ $order->shipping_name ?? $order->billing_name }}
{{ $order->shipping_address_1 ?? $order->billing_address_1 }}
{{ $order->shipping_city ?? $order->billing_city }}, {{ $order->shipping_postal_code ?? $order->billing_postal_code }}

@if($order->shippingMethod)
**Shipping Method:** {{ $order->shippingMethod->name }}
@endif

---

We'll notify you once your order ships. If you have any questions, just reply to this email.

Thanks for shopping with us!

@endcomponent
