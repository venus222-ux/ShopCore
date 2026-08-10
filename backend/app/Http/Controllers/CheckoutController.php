<?php

namespace App\Http\Controllers;

use App\Exceptions\InvalidCouponException;
use App\Exceptions\OutOfStockException;
use App\Http\Requests\CheckoutRequest;
use App\Models\Order;
use App\Services\Checkout\CheckoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CheckoutController extends Controller
{
    public function checkout(CheckoutRequest $request, CheckoutService $checkoutService)
{
    try {
        $result = $checkoutService->handle(auth()->user(), $request);

        // Cash orders have no Stripe redirect - the frontend goes straight
        // to a confirmation page using the order id instead of a session_id.
        if ($result->checkoutUrl === null) {
            return response()->json([
                'payment_method' => 'cash',
                'order_id'       => $result->order->id,
            ]);
        }

        return response()->json([
            'url' => $result->checkoutUrl,
        ]);

    } catch (OutOfStockException $e) {
        Log::warning('Checkout blocked - out of stock', [
            'error' => $e->getMessage(),
            'product_variant_id' => $e->productVariantId,
        ]);

        return response()->json([
            'message' => $e->getMessage(),
            'code'    => 'out_of_stock',
        ], 409);

    } catch (InvalidCouponException $e) {
        Log::info('Checkout blocked - invalid coupon', [
            'error' => $e->getMessage(),
        ]);

        return response()->json([
            'message' => $e->getMessage(),
            'code'    => 'invalid_coupon',
        ], 422);

    } catch (\Throwable $e) {
        Log::error('Checkout failed', [
            'error' => $e->getMessage(),
        ]);

        return response()->json([
            'message' => 'Checkout failed',
            'error'   => $e->getMessage(),
        ], 500);
    }

     catch (\App\Exceptions\PaymentMethodUnavailableException $e) {
    return response()->json([
        'message' => $e->getMessage(),
        'code'    => 'payment_method_unavailable',
    ], 422);
}
}

    public function verify(Request $request)
    {
        $sessionId = $request->query('session_id');

        $order = Order::with('items.product')
            ->where('stripe_session_id', $sessionId)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        if ($order->status !== 'paid') {
            return response()->json([
                'message' => 'Payment processing',
                'order'   => $order,
            ], 202);
        }

        return response()->json([
            'message' => 'Payment successful',
            'order'   => $order,
        ]);
    }
}
