<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShippingMethod;
use Illuminate\Http\Request;

class ShippingMethodController extends Controller
{
    public function index()
    {
        return ShippingMethod::orderBy('sort_order')->orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'price'       => 'required|numeric|min:0',
            'is_active'   => 'boolean|nullable',
            'sort_order'  => 'integer|nullable',
        ]);

        $method = ShippingMethod::create([
            'name'        => $data['name'],
            'description' => $data['description'] ?? null,
            'price'       => $data['price'],
            'is_active'   => $data['is_active'] ?? true,
            'sort_order'  => $data['sort_order'] ?? 0,
        ]);

        return response()->json($method, 201);
    }

    public function update(Request $request, ShippingMethod $shippingMethod)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'price'       => 'required|numeric|min:0',
            'is_active'   => 'boolean|nullable',
            'sort_order'  => 'integer|nullable',
        ]);

        $shippingMethod->update([
            'name'        => $data['name'],
            'description' => $data['description'] ?? null,
            'price'       => $data['price'],
            'is_active'   => $data['is_active'] ?? $shippingMethod->is_active,
            'sort_order'  => $data['sort_order'] ?? $shippingMethod->sort_order,
        ]);

        return response()->json($shippingMethod);
    }

    public function destroy(ShippingMethod $shippingMethod)
    {
        // Orders referencing this method keep their historical
        // shipping_method_id -> null on delete (see migration's
        // nullOnDelete()), so past orders/invoices aren't affected.
        $shippingMethod->delete();

        return response()->json(['message' => 'Shipping method deleted']);
    }
}
