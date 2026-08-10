<?php

namespace App\Services\Checkout;

use App\Models\Address;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\ShippingMethod;
use App\Models\User;

class OrderFactory
{
    public function make(
        User $user,
        Address $billingAddress,
        ?Address $shippingAddress,
        float $subtotal,
        float $discountTotal,
        ?Coupon $coupon,
        float $vat,
        float $vatPercent,
        ?ShippingMethod $shippingMethod,
        float $shippingTotal,
        float $total,
        string $paymentMethod = 'card',
        float $codFee = 0.0,
    ): Order {
        return Order::create([
            'user_id' => $user->id,
            'status' => 'pending',

            'payment_method' => $paymentMethod,
            'cod_fee' => $codFee,

            'subtotal'           => round($subtotal, 2),
            'discount_total'     => $discountTotal,
            'coupon_id'          => $coupon?->id,
            'vat_percent'        => $vatPercent,
            'vat'                => $vat,
            'shipping_method_id' => $shippingMethod?->id,
            'shipping_total'     => $shippingTotal,
            'total'              => $total,

            'billing_address_id'  => $billingAddress->id,
            'shipping_address_id' => $shippingAddress?->id,

            // Snapshot fields kept in sync with the Address record used, so
            // invoice/email generation (which reads these directly off
            // Order) doesn't need to touch the addresses table later.
            'billing_name'        => trim($billingAddress->first_name . ' ' . $billingAddress->last_name) ?: ($user->name ?? 'Customer'),
            'billing_email'       => $user->email,
            'billing_phone'       => $billingAddress->phone,
            'billing_company'     => $billingAddress->company_name,
            'billing_vat_number'  => $billingAddress->vat_number,
            'billing_address_1'   => $billingAddress->address_line_1,
            'billing_address_2'   => $billingAddress->address_line_2,
            'billing_city'        => $billingAddress->city,
            'billing_state'       => $billingAddress->state,
            'billing_postal_code' => $billingAddress->postal_code,
            'billing_country'     => $billingAddress->country,

            'shipping_name'                  => $shippingAddress
                ? trim($shippingAddress->first_name . ' ' . $shippingAddress->last_name)
                : null,
            'shipping_phone'                 => $shippingAddress?->phone,
            'shipping_company'               => $shippingAddress?->company_name,
            'shipping_address_1'             => $shippingAddress?->address_line_1,
            'shipping_address_2'             => $shippingAddress?->address_line_2,
            'shipping_city'                  => $shippingAddress?->city,
            'shipping_state'                 => $shippingAddress?->state,
            'shipping_postal_code'           => $shippingAddress?->postal_code,
            'shipping_country'               => $shippingAddress?->country,
            'shipping_delivery_instructions' => $shippingAddress?->delivery_instructions,
        ]);
    }
}
