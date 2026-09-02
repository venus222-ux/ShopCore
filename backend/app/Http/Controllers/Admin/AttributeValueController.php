<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AttributeValueController extends Controller
{
    public function store(Request $request, Attribute $attribute)
    {
        $data = $request->validate([
            'value' => 'required|string|max:100',
            'sort_order' => 'integer|nullable',
        ]);

        $value = $attribute->values()->create([
            'value' => $data['value'],
            'slug' => Str::slug($data['value']),
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        return response()->json($value, 201);
    }

    public function update(Request $request, AttributeValue $attributeValue)
    {
        $data = $request->validate([
            'value' => 'required|string|max:100',
            'sort_order' => 'integer|nullable',
        ]);

        $attributeValue->update([
            'value' => $data['value'],
            'slug' => Str::slug($data['value']),
            'sort_order' => $data['sort_order'] ?? $attributeValue->sort_order,
        ]);

        return response()->json($attributeValue);
    }

    public function destroy(AttributeValue $attributeValue)
    {
        $attributeValue->delete();

        return response()->json(['message' => 'Attribute value deleted']);
    }

    /**
     * Upload images for this attribute value SCOPED to one product.
     *
     * The same AttributeValue row (e.g. Color: Brown) is shared by every
     * product using that attribute - a brown belt and a brown dress both
     * reference the same "Brown" row. Without scoping, uploading a photo
     * here would make BOTH products show the belt photo. The product id
     * is folded into the media collection name so each product keeps an
     * independent image set for the same shared value, with zero schema
     * changes.
     */
    public function uploadImages(Request $request, Product $product, AttributeValue $attributeValue)
    {
        $request->validate([
            'images' => 'required|array|min:1',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp,gif|max:5120',
        ]);

        $collection = $this->collectionName($product->id);

        foreach ($request->file('images') as $file) {
            $attributeValue->addMedia($file)->toMediaCollection($collection);
        }

        return response()->json([
            'message' => 'Images uploaded',
            'images' => $attributeValue->getMedia($collection)
                ->map(fn ($m) => ['id' => $m->id, 'url' => $m->getFullUrl()])
                ->values(),
        ], 201);
    }

    public function deleteImage(Product $product, AttributeValue $attributeValue, $mediaId)
    {
        $collection = $this->collectionName($product->id);

        $media = $attributeValue->media()
            ->where('id', $mediaId)
            ->where('collection_name', $collection)
            ->first();

        if (! $media) {
            return response()->json(['message' => 'Image not found'], 404);
        }

        $media->delete();

        return response()->json(['message' => 'Image deleted']);
    }

    /**
     * List this attribute value's images for a specific product, so the
     * admin panel can show what's already uploaded when grouping variant
     * rows by color for a given product.
     */
    public function imagesForProduct(Product $product, AttributeValue $attributeValue)
    {
        $collection = $this->collectionName($product->id);

        return response()->json(
            $attributeValue->getMedia($collection)
                ->map(fn ($m) => ['id' => $m->id, 'url' => $m->getFullUrl()])
                ->values()
        );
    }

    private function collectionName(int $productId): string
    {
        return "images-product-{$productId}";
    }
}