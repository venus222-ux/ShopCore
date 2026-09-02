<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // GET /api/categories
    // Only returns categories that currently have at least one published
    // product - keeps the navbar/rail from showing empty categories that
    // lead to a dead-end "no products" page.
    public function index()
    {
        $categories = Category::withCount([
            'products' => fn ($q) => $q->where('is_published', true),
        ])
            ->having('products_count', '>', 0)
            ->get();

        return response()->json([
            'data' => $categories,
        ]);
    }

    // GET /api/categories/{slug}/products?page=1
    public function products(Category $category, Request $request)
    {
        $perPage = (int) $request->input('per_page', 12);

        $products = Product::with('category')
            ->where('category_id', $category->id)
            ->where('is_published', true)
            ->latest()
            ->paginate($perPage);

        return ProductResource::collection($products)->additional([
            'category' => $category->name,
        ]);
    }
}