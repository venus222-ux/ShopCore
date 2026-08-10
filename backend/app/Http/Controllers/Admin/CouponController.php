<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function index(Request $request)
    {
        return Coupon::query()
            ->when($request->filled('search'), fn ($q) => $q->where('code', 'like', '%'.$request->input('search').'%'))
            ->latest()
            ->paginate($request->input('per_page', 20));
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        $coupon = Coupon::create($data);

        return response()->json($coupon, 201);
    }

    public function update(Request $request, Coupon $coupon)
    {
        $data = $this->validated($request, $coupon);

        $coupon->update($data);

        return response()->json($coupon->fresh());
    }

    public function destroy(Coupon $coupon)
    {
        $coupon->delete();

        return response()->json(['message' => 'Coupon deleted']);
    }

    public function toggleActive(Coupon $coupon)
    {
        $coupon->update(['is_active' => !$coupon->is_active]);

        return response()->json($coupon->fresh());
    }

    private function validated(Request $request, ?Coupon $existing = null): array
    {
        return $request->validate([
            'code'         => [
                'required', 'string', 'max:50',
                'unique:coupons,code' . ($existing ? ",{$existing->id}" : ''),
            ],
            'type'         => 'required|in:percent,fixed',
            'value'        => 'required|numeric|min:0',
            'min_subtotal' => 'nullable|numeric|min:0',
            'usage_limit'  => 'nullable|integer|min:1',
            'is_active'    => 'boolean|nullable',
            'starts_at'    => 'nullable|date',
            'ends_at'      => 'nullable|date|after_or_equal:starts_at',
        ]);
    }
}
