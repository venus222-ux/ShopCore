<?php

namespace App\Services\Checkout;

use App\Models\Address;
use App\Models\User;

class AddressResolver
{
    public function resolveBilling(User $user, array $billing, bool $saveToProfile): Address
    {
        if (!empty($billing['address_id'])) {
            return Address::where('user_id', $user->id)
                ->where('type', 'billing')
                ->findOrFail($billing['address_id']);
        }

        return Address::create([
            'user_id'        => $user->id,
            'type'           => 'billing',
            'first_name'     => $billing['first_name'],
            'last_name'      => $billing['last_name'],
            'company_name'   => $billing['company_name'] ?? null,
            'vat_number'     => $billing['vat_number'] ?? null,
            'address_line_1' => $billing['address_line_1'],
            'address_line_2' => $billing['address_line_2'] ?? null,
            'city'           => $billing['city'],
            'state'          => $billing['state'] ?? null,
            'postal_code'    => $billing['postal_code'],
            'country'        => $billing['country'],
            'phone'          => $billing['phone'] ?? null,
            'is_default'     => $saveToProfile,
        ]);
    }

    // Only ever called when $requiresShipping is true - the caller
    // (CheckoutService) never invokes this for digital-only carts, so
    // there's no unconditional creation of a shipping row anymore.
    public function resolveShipping(
        User $user,
        array $shipping,
        bool $sameAsBilling,
        Address $billingAddress,
        bool $saveToProfile
    ): Address {
        if ($sameAsBilling) {
            // Reuse the exact same Address row used for billing. No
            // duplicate 'shipping'-typed row is created - `type` is just
            // for filtering the address book, not a hard constraint on
            // which row an order can point at.
            return $billingAddress;
        }

        if (!empty($shipping['address_id'])) {
            return Address::where('user_id', $user->id)
                ->where('type', 'shipping')
                ->findOrFail($shipping['address_id']);
        }

        return Address::create([
            'user_id'               => $user->id,
            'type'                  => 'shipping',
            'first_name'            => $shipping['first_name'],
            'last_name'             => $shipping['last_name'],
            'company_name'          => $shipping['company_name'] ?? null,
            'address_line_1'        => $shipping['address_line_1'],
            'address_line_2'        => $shipping['address_line_2'] ?? null,
            'city'                  => $shipping['city'],
            'state'                 => $shipping['state'] ?? null,
            'postal_code'           => $shipping['postal_code'],
            'country'               => $shipping['country'],
            'phone'                 => $shipping['phone'] ?? null,
            'delivery_instructions' => $shipping['delivery_instructions'] ?? null,
            'is_default'            => $saveToProfile,
        ]);
    }
}
