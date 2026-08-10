<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index()
    {
        $products = auth()
            ->user()
            ->wishlistProducts()
            ->with(['category', 'media'])
            ->latest()
            ->get();

        return ProductResource::collection($products);
    }

    public function toggle(Request $request)
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id']
        ]);

        $user = auth()->user();

        $exists = $user->wishlistProducts()
            ->where('product_id', $request->product_id)
            ->exists();

        if ($exists) {
            $user->wishlistProducts()
                ->detach($request->product_id);

            return response()->json([
                'message' => 'Removed from wishlist',
                'wishlisted' => false
            ]);
        }

        $user->wishlistProducts()
            ->attach($request->product_id);

        return response()->json([
            'message' => 'Added to wishlist',
            'wishlisted' => true
        ]);
    }

    public function remove($productId)
    {
        auth()
            ->user()
            ->wishlistProducts()
            ->detach($productId);

        return response()->json([
            'message' => 'Removed from wishlist'
        ]);
    }
}
