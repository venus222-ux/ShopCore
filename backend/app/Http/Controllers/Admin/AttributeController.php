<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AttributeController extends Controller
{
    public function index()
    {
        return Attribute::with('values')
            ->orderBy('name')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|in:text,number,select,boolean',
            'is_filterable' => 'boolean|nullable',
        ]);

        $attribute = Attribute::create([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']),
            'type' => $data['type'],
            'is_filterable' => $data['is_filterable'] ?? true,
        ]);

        return response()->json($attribute->load('values'), 201);
    }

    public function update(Request $request, Attribute $attribute)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|in:text,number,select,boolean',
            'is_filterable' => 'boolean|nullable',
        ]);

        $attribute->update([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']),
            'type' => $data['type'],
            'is_filterable' => $data['is_filterable'] ?? $attribute->is_filterable,
        ]);

        return response()->json($attribute->load('values'));
    }

    public function destroy(Attribute $attribute)
    {
        // Cascades to attribute_values and variant_attribute_value and
        // category_attribute rows (all FKs are cascadeOnDelete - see the
        // Step 2 migrations). Any variant using a value from this attribute
        // simply loses that attribute tag; the variant itself is untouched.
        $attribute->delete();

        return response()->json(['message' => 'Attribute deleted']);
    }
}
