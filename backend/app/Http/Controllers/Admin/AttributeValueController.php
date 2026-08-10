<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AttributeValueController extends Controller
{
    public function store(Request $request, Attribute $attribute)
    {
        $data = $request->validate([
            'value'      => 'required|string|max:100',
            'sort_order' => 'integer|nullable',
        ]); 

        $value = $attribute->values()->create([
            'value'      => $data['value'],
            'slug'       => Str::slug($data['value']),
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        return response()->json($value, 201);
    }

    public function update(Request $request, AttributeValue $attributeValue)
    {
        $data = $request->validate([
            'value'      => 'required|string|max:100',
            'sort_order' => 'integer|nullable',
        ]);

        $attributeValue->update([
            'value'      => $data['value'],
            'slug'       => Str::slug($data['value']),
            'sort_order' => $data['sort_order'] ?? $attributeValue->sort_order,
        ]);

        return response()->json($attributeValue);
    }

    public function destroy(AttributeValue $attributeValue)
    {
        // Cascades to variant_attribute_value - any variant tagged with this
        // value loses that tag, the variant row itself is untouched.
        $attributeValue->delete();

        return response()->json(['message' => 'Attribute value deleted']);
    }
}
