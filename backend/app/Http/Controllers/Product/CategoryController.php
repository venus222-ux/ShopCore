<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Resources\ProductResource;

class CategoryController extends Controller
{
    // GET /api/categories
    public function index()
    {
        $categories = Category::all();

        return response()->json([
            'data' => $categories
        ]);
    }

    // GET /api/categories/{slug}/products?page=1
      public function products(Category $category, Request $request)
    {
        $perPage = (int) $request->input('per_page', 12);

        // 2️⃣ Fetch published products for this category with pagination
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
