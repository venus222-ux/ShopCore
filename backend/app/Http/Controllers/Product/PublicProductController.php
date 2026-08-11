<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class PublicProductController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 12);

        $products = Product::with([
            'category',
            // Same relations as show() - the ProductCard now needs the
            // variant selector inline, so listing endpoints can no
            // longer skip this (previously the empty-array fallback in
            // ProductResource was relied on here to avoid N+1, but that
            // just meant the card silently had no variants at all).
            'variants.attributeValues.attribute',
            'variants.inventory',
        ])
            ->where('is_published', true)
            ->latest()
            ->paginate($perPage);

        return ProductResource::collection($products)
            ->additional([
                'total' => $products->total(),
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'last_page' => $products->lastPage(),
            ]);
    }

    public function show($slug)
    {
        $product = Product::with([
            'category',
            'media',
            'variants.attributeValues.attribute',
            'variants.inventory',
        ])
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        $relatedProducts = Product::with('category')
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_published', true)
            ->latest()
            ->take(4)
            ->get();

        $product->setRelation('relatedProducts', $relatedProducts);

        return new ProductResource($product);
    }
}
