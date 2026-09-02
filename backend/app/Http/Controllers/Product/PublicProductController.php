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
            'media',
            'variants.attributeValues.attribute',
            'variants.attributeValues.media',
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
            'variants.attributeValues.media',
            'variants.inventory',
            'variants.media',
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