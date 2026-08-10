<?php

namespace App\Http\Requests;

use App\Services\Checkout\ShippingRequirementResolver;
use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    protected bool $requiresShipping = false;
    protected bool $sameAsBilling = false;

    public function authorize(): bool
    {
        return auth()->check();
    }

    protected function prepareForValidation(): void
    {
        $this->requiresShipping = app(ShippingRequirementResolver::class)
            ->requiresShipping($this->input('items', []));

        $this->sameAsBilling = $this->boolean('same_as_billing', false);
    }

    public function rules(): array
{
    $needsShippingAddressFields = $this->requiresShipping && !$this->sameAsBilling;
    $requiresShipping = $this->requiresShipping;

    return [
        'items'               => 'required|array|min:1',
        'items.*.id'          => 'required|integer|exists:products,id',
        'items.*.variant_id'  => 'nullable|integer|exists:product_variants,id',
        'items.*.quantity'    => 'required|integer|min:1|max:10',
        'coupon_code'         => 'nullable|string|max:50',
        'same_as_billing'     => 'boolean|nullable',


        // Cash on delivery only makes sense when there's something to
        // deliver - a fully digital cart has no "delivery" moment to
        // collect cash at, so it's restricted to card only.
        'payment_method' => [
            'required',
            'in:card,cash',
            function ($attribute, $value, $fail) use ($requiresShipping) {
                if ($value === 'cash' && !$requiresShipping) {
                    $fail('Cash on delivery is only available for orders that include physical items.');
                }
            },
        ],

        'billing.address_id'     => 'nullable|integer|exists:addresses,id',
        'billing.first_name'     => 'required_without:billing.address_id|string|max:100',
        'billing.last_name'      => 'required_without:billing.address_id|string|max:100',
        'billing.company_name'   => 'nullable|string|max:255',
        'billing.vat_number'     => 'nullable|string|max:50',
        'billing.address_line_1' => 'required_without:billing.address_id|string|max:255',
        'billing.address_line_2' => 'nullable|string|max:255',
        'billing.city'           => 'required_without:billing.address_id|string|max:100',
        'billing.state'          => 'nullable|string|max:100',
        'billing.postal_code'    => 'required_without:billing.address_id|string|max:20',
        'billing.country'        => 'required_without:billing.address_id|string|size:2',
        'billing.phone'          => 'nullable|string|max:30',
        'save_to_profile'        => 'boolean|nullable',

        'shipping.address_id'            => 'nullable|integer|exists:addresses,id',
        'shipping.first_name'            => $needsShippingAddressFields ? 'required_without:shipping.address_id|string|max:100' : 'nullable|string|max:100',
        'shipping.last_name'             => $needsShippingAddressFields ? 'required_without:shipping.address_id|string|max:100' : 'nullable|string|max:100',
        'shipping.company_name'          => 'nullable|string|max:255',
        'shipping.address_line_1'        => $needsShippingAddressFields ? 'required_without:shipping.address_id|string|max:255' : 'nullable|string|max:255',
        'shipping.address_line_2'        => 'nullable|string|max:255',
        'shipping.city'                  => $needsShippingAddressFields ? 'required_without:shipping.address_id|string|max:100' : 'nullable|string|max:100',
        'shipping.state'                 => 'nullable|string|max:100',
        'shipping.postal_code'           => $needsShippingAddressFields ? 'required_without:shipping.address_id|string|max:20' : 'nullable|string|max:20',
        'shipping.country'               => $needsShippingAddressFields ? 'required_without:shipping.address_id|string|size:2' : 'nullable|string|size:2',
        'shipping.phone'                 => $needsShippingAddressFields ? 'required_without:shipping.address_id|string|max:30' : 'nullable|string|max:30',
        'shipping.delivery_instructions' => 'nullable|string|max:500',
        'shipping_method_id'             => $requiresShipping
            ? 'required|integer|exists:shipping_methods,id'
            : 'nullable|integer|exists:shipping_methods,id',
    ];
}

    public function requiresShipping(): bool
    {
        return $this->requiresShipping;
    }

    public function sameAsBilling(): bool
    {
        return $this->sameAsBilling;
    }
}
