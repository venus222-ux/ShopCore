<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductVariantController extends Controller
{
    public function index(Product $product)
    {
        return $product->variants()
            ->with(['attributeValues.attribute', 'attributeValues.media', 'inventory'])
            ->get()
            ->map(fn ($v) => $this->shape($v, $product->id));
    }

    public function store(StoreProductRequest $request, ProductMediaService $mediaService)
{
    $data = $request->validated();

    $data['slug'] = Str::slug($data['title']).'-'.uniqid();
    $data['user_id'] = auth()->id();

    $data['discount_percentage'] = $data['discount_percentage'] ?? 0;
    $data['discount_fixed'] = $data['discount_fixed'] ?? null;

    $product = Product::create($data);

    // Orice produs trebuie să aibă cel puțin o variantă cumpărabilă
    // (vezi CartResolver). Produsele "simple", fără atribute, primesc
    // automat o variantă default care preia prețul de la produsul părinte.
    $variant = $product->variants()->create([
        'sku' => $this->generateSku($product),
        'price' => null, // fallback pe Product::price
        'is_default' => true,
    ]);

    $variant->inventory()->create([
        'track_stock' => true,
        'quantity' => 0,
        'reserved' => 0,
    ]);

    $mediaService->syncPreviewImages($product);

    if ($data['asset_type'] === 'digital' && $request->hasFile('asset_file')) {
        $product->addMedia($request->file('asset_file'))->toMediaCollection('asset');
    }

    $product->load(['category', 'media']);

    return response()->json([
        'message' => 'Product created',
        'data' => new ProductResource($product),
    ], 201);
}

private function generateSku(Product $product): string
{
    $base = $product->slug ?: (string) $product->id;

    return 'SKU-'.strtoupper(preg_replace('/[^a-zA-Z0-9]+/', '-', $base)).'-'.Str::upper(Str::random(4));
}

    public function update(Request $request, ProductVariant $variant)
    {
        $data = $request->validate([
            'sku' => 'nullable|string|max:100|unique:product_variants,sku,'.$variant->id,
            'price' => 'nullable|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'is_default' => 'boolean|nullable',
            'attribute_value_ids' => 'array|nullable',
            'attribute_value_ids.*' => 'integer|exists:attribute_values,id',
        ]);

        $variant->update([
            'sku' => $data['sku'] ?? $variant->sku,
            'price' => array_key_exists('price', $data) ? $data['price'] : $variant->price,
            'discount_percentage' => array_key_exists('discount_percentage', $data) ? $data['discount_percentage'] : $variant->discount_percentage,
            'is_default' => $data['is_default'] ?? $variant->is_default,
        ]);

        if (array_key_exists('attribute_value_ids', $data)) {
            $variant->attributeValues()->sync($data['attribute_value_ids'] ?? []);
        }

        $variant->load(['attributeValues.attribute', 'attributeValues.media', 'inventory']);

        return response()->json($this->shape($variant, $variant->product_id));
    }

    public function destroy(ProductVariant $variant)
{
    $siblingsCount = $variant->product->variants()->count();

    if ($siblingsCount === 1) {
        return response()->json([
            'message' => 'Cannot delete the only variant of a product - every product needs at least one purchasable variant.',
        ], 422);
    }

    $wasDefault = $variant->is_default;

    $variant->delete();

    if ($wasDefault) {
        // Promovează o altă variantă rămasă la default, ca produsul
        // să rămână cumpărabil.
        $variant->product->variants()->first()?->update(['is_default' => true]);
    }

    return response()->json(['message' => 'Variant deleted']);
}

    public function updateInventory(Request $request, ProductVariant $variant)
    {
        $data = $request->validate([
            'track_stock' => 'boolean',
            'quantity' => 'integer|min:0',
        ]);

        $variant->inventory()->updateOrCreate([], [
            'track_stock' => $data['track_stock'],
            'quantity' => $data['quantity'],
        ]);

        $variant->load(['attributeValues.attribute', 'attributeValues.media', 'inventory']);

        return response()->json($this->shape($variant->fresh(['attributeValues.attribute', 'attributeValues.media', 'inventory']), $variant->product_id));
    }

    private function generateSku(Product $product): string
    {
        $base = $product->slug ?: (string) $product->id;

        return 'SKU-'.strtoupper(preg_replace('/[^a-zA-Z0-9]+/', '-', $base)).'-'.Str::upper(Str::random(4));
    }

    /**
     * Images resolved from this variant's attribute values, but scoped to
     * THIS product - the same "Brown" AttributeValue row used by an
     * unrelated product never leaks its photos here. This mirrors exactly
     * what ProductVariantResource (storefront) and ProductSearchService
     * (Elasticsearch) resolve, so the admin preview always matches what
     * shoppers actually see.
     */
    private function shape(ProductVariant $variant, int $productId): array
    {
        $collection = 'images-product-'.$productId;

        $withImages = $variant->attributeValues->first(
            fn ($av) => $av->getMedia($collection)->isNotEmpty()
        );

        $images = $withImages
            ? $withImages->getMedia($collection)->map(fn ($m) => [
                'id' => $m->id,
                'url' => $m->getFullUrl(),
            ])->values()
            : collect();

        return [
            'id' => $variant->id,
            'sku' => $variant->sku,
            'price' => $variant->price !== null ? (float) $variant->price : null,
            'discount_percentage' => $variant->discount_percentage !== null ? (float) $variant->discount_percentage : null,
            'is_default' => (bool) $variant->is_default,
            'attribute_values' => $variant->attributeValues->map(fn ($av) => [
                'value_id' => $av->id,
                'attribute_id' => $av->attribute_id,
                'attribute_name' => $av->attribute->name,
                'value' => $av->value,
                'images' => $av->getMedia($collection)->map(fn ($m) => [
                    'id' => $m->id,
                    'url' => $m->getFullUrl(),
                ])->values(),
            ]),
            'inventory' => $variant->inventory ? [
                'track_stock' => (bool) $variant->inventory->track_stock,
                'quantity' => $variant->inventory->quantity,
                'reserved' => $variant->inventory->reserved,
            ] : null,
            'images' => $images, // resolved chain result, for admin preview
        ];
    }
}