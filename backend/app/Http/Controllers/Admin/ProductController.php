<?php

namespace App\Http\Controllers\Admin;

use App\Events\FileUploaded;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductMediaService;
use App\Services\ProductSearchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class ProductController extends Controller
{
    /* ================= INDEX ================= */

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search  = $request->input('search');

        $query = Product::with(['category', 'media'])->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        $products = $query->paginate($perPage);

        return ProductResource::collection($products)->response();
    }

    /* ================= SHOW ================= */

    public function show(Product $product)
    {
        $product->load(['category', 'media']);

        $product->is_wishlisted = auth()->check()
            ? auth()->user()->wishlistProducts()->where('product_id', $product->id)->exists()
            : false;

        return new ProductResource($product);
    }

    /* ================= STORE ================= */

    public function store(StoreProductRequest $request, ProductMediaService $mediaService)
    {
        $data = $request->validated();

        $data['slug'] = Str::slug($data['title']) . '-' . uniqid();
        $data['user_id'] = auth()->id();

        $data['discount_percentage'] = $data['discount_percentage'] ?? 0;
        $data['discount_fixed'] = $data['discount_fixed'] ?? null;

        $product = Product::create($data);

        $mediaService->syncPreviewImages($product);

        if ($request->hasFile('asset_file')) {
            $product->addMedia($request->file('asset_file'))->toMediaCollection('asset');
        }

        $product->load(['category', 'media']);

        return response()->json([
            'message' => 'Product created',
            'data' => new ProductResource($product),
        ], 201);
    }

    /* ================= DELETE MEDIA ================= */

    public function deleteMedia(Product $product, $mediaId)
    {
        try {
            $media = $product->media()->where('id', $mediaId)->first();

            if (!$media) {
                return response()->json(['message' => 'Media not found'], 404);
            }

            if (!in_array($media->collection_name, ['previews', 'asset'])) {
                return response()->json(['message' => 'Cannot delete this file'], 403);
            }

            $media->delete();

            $product->load(['category', 'media']);

            return response()->json([
                'message' => 'File deleted successfully',
                'data' => new ProductResource($product),
            ]);

        } catch (Throwable $e) {
            Log::error('Failed to delete media', [
                'product_id' => $product->id,
                'media_id' => $mediaId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to delete file',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /* ================= UPDATE ================= */

public function update(
    UpdateProductRequest $request,
    Product $product,
    ProductMediaService $mediaService
) {
    try {
        $data = $request->validated();

        // ================= SLUG UPDATE =================
        if (!empty($data['title']) && $data['title'] !== $product->title) {
            $data['slug'] = Str::slug($data['title']) . '-' . uniqid();
        }

        // ================= DISCOUNT FALLBACKS =================
        $data['discount_percentage'] = $data['discount_percentage'] ?? $product->discount_percentage;
        $data['discount_fixed']      = $data['discount_fixed'] ?? $product->discount_fixed;

        // ================= UPDATE PRODUCT =================
        $product->update($data);

        // ================= MEDIA SYNC =================
        $mediaService->syncPreviewImages($product, true);

        if ($request->hasFile('asset_file')) {
            $product->clearMediaCollection('asset');
            $product->addMedia($request->file('asset_file'))
                ->toMediaCollection('asset');
        }

        // ================= RELOAD RELATIONS =================
        $product->load(['category', 'media']);

        // ================= WISHLIST FLAG =================
        $product->is_wishlisted = auth()->check()
            ? auth()->user()
                ->wishlistProducts()
                ->where('product_id', $product->id)
                ->exists()
            : false;

        // ======================================================
        // 🔥 GET BUYERS + WISHERS (OPTIMIZED)
        // ======================================================

        $buyerIds = \App\Models\User::whereHas('orders.items', function ($q) use ($product) {
            $q->where('product_id', $product->id);
        })->pluck('id');

        $wisherIds = $product->wishedByUsers()->pluck('users.id');

        $userIds = $buyerIds
            ->merge($wisherIds)
            ->unique()
            ->values();

        // (optional) if you need full user models later
        // $users = \App\Models\User::whereIn('id', $userIds)->get();

        $message = "Product '{$product->title}' has been updated by admin";

        // ======================================================
        // 🔥 REAL-TIME EVENT (ONLY SOURCE OF TRUTH)
        // ======================================================

        event(new \App\Events\ProductUpdated(
            $product,
            $message
        ));

        // ================= RESPONSE =================
        return response()->json([
            'message' => 'Product updated successfully',
            'data' => new \App\Http\Resources\ProductResource($product),
        ]);

    } catch (\Throwable $e) {
        Log::error('Product update failed', [
            'product_id' => $product->id,
            'error' => $e->getMessage(),
        ]);

        return response()->json([
            'message' => 'Failed to update product',
            'error' => config('app.debug') ? $e->getMessage() : null,
        ], 500);
    }
}

    /* ================= DESTROY ================= */

    public function destroy(Product $product, ProductSearchService $searchService)
    {
        $id = $product->id;

        try {
            $product->delete();
        } catch (Throwable $e) {
            Log::error('Failed to delete product from database', [
                'product_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to delete product from database',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }

        try {
            $searchService->delete($id);
        } catch (Throwable $e) {
            Log::warning('Failed to delete product from Elasticsearch', [
                'product_id' => $id,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }
}
