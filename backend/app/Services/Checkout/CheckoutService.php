<?php

namespace App\Services\Checkout;

use App\Http\Requests\CheckoutRequest;
use App\Models\User;
use App\Services\Checkout\DTO\CheckoutResult;
use App\Services\InventoryService;
use App\Services\Payment\PaymentHandlerResolver;
use Illuminate\Support\Facades\DB;

class CheckoutService
{
    public function __construct(
        private readonly AddressResolver $addressResolver,
        private readonly CartResolver $cartResolver,
        private readonly CouponApplier $couponApplier,
        private readonly ShippingCostResolver $shippingCostResolver,
        private readonly OrderFactory $orderFactory,
        private readonly InventoryService $inventoryService,
        private readonly PaymentHandlerResolver $paymentHandlerResolver,
    ) {}

    public function handle(User $user, CheckoutRequest $request): CheckoutResult
    {
        $validated = $request->validated();

        $billing          = $validated['billing'];
        $shipping         = $validated['shipping'] ?? [];
        $saveToProfile    = $validated['save_to_profile'] ?? false;
        $couponCode       = $validated['coupon_code'] ?? null;
        $shippingMethodId = $validated['shipping_method_id'] ?? null;
        $paymentMethod    = $validated['payment_method'];
        $requiresShipping = $request->requiresShipping();
        $sameAsBilling    = $request->sameAsBilling();

        $paymentHandler = $this->paymentHandlerResolver->resolve($paymentMethod);

        return DB::transaction(function () use (
            $user, $billing, $shipping, $saveToProfile, $couponCode,
            $shippingMethodId, $requiresShipping, $sameAsBilling, $validated,
            $paymentMethod, $paymentHandler
        ) {
            $billingAddress = $this->addressResolver->resolveBilling($user, $billing, $saveToProfile);

            $shippingAddress = $requiresShipping
                ? $this->addressResolver->resolveShipping($user, $shipping, $sameAsBilling, $billingAddress, $saveToProfile)
                : null;

            $cart = $this->cartResolver->resolve($validated['items']);

            $this->inventoryService->reserve($cart->reservationLines);

            $couponResult = $this->couponApplier->apply($couponCode, $cart->subtotal);

            $shippingResult = $requiresShipping
                ? $this->shippingCostResolver->resolve($shippingMethodId)
                : \App\Services\Checkout\DTO\ShippingResult::none();

            $taxableSubtotal = round($cart->subtotal - $couponResult->discountTotal, 2);
            $vat             = \App\Services\TaxService::calculateVat($taxableSubtotal);
            $vatPercent      = \App\Services\TaxService::vatPercent();

            $codFee = $paymentMethod === 'cash' && $paymentHandler instanceof \App\Services\Payment\CashPaymentHandler
                ? $paymentHandler->fee()
                : 0.0;

            $total = round(
                \App\Services\TaxService::calculateTotal($taxableSubtotal) + $shippingResult->cost + $codFee,
                2
            );

            // Availability check happens AFTER total is known - COD's max
            // order value rule needs the final total, not just the raw
            // cart subtotal, so this can't be validated earlier in
            // CheckoutRequest without duplicating the whole pricing
            // pipeline there.
            $this->paymentHandlerResolver->assertAvailable($paymentMethod, $requiresShipping, $total);

            $order = $this->orderFactory->make(
                $user,
                $billingAddress,
                $shippingAddress,
                $cart->subtotal,
                $couponResult->discountTotal,
                $couponResult->coupon,
                $vat,
                $vatPercent,
                $shippingResult->method,
                $shippingResult->cost,
                $total,
                $paymentMethod,
                $codFee,
            );

            foreach ($cart->orderItemsData as $data) {
                $order->items()->create($data);
            }

            $order->load(['items.product', 'user']);

            return $paymentHandler->process($order);
        });
    }
}
