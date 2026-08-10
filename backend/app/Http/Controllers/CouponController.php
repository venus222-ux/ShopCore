<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    /**
     * Preview a coupon's discount for a given subtotal. Read-only - does
     * NOT increment used_count or lock the row. The authoritative check
     * happens again in CheckoutController::checkout() at submit time, so
     * a stale preview here can't let anyone under-pay.
     */
    public function validateCode(Request $request)
    {
        $data = $request->validate([
            'code'     => 'required|string|max:50',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', $data['code'])->first();

        if (!$coupon || !$coupon->isValidFor($data['subtotal'])) {
            return response()->json([
                'valid'   => false,
                'message' => 'This coupon is invalid or cannot be applied to this order.',
            ]);
        }

        return response()->json([
            'valid'    => true,
            'discount' => $coupon->discountFor($data['subtotal']),
        ]);
    }
}
