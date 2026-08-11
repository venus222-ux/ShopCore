<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryAttributeController extends Controller
{
    // Returns every attribute, each flagged with whether it's assigned to
    // this category - lets the frontend render one checkbox list.
    public function index(Category $category)
    {
        $assignedIds = $category->attributes()->pluck('attributes.id')->all();

        return Attribute::orderBy('name')->get()->map(fn ($attribute) => [
            'id' => $attribute->id,
            'name' => $attribute->name,
            'slug' => $attribute->slug,
            'assigned' => in_array($attribute->id, $assignedIds, true),
        ]);
    }

    public function sync(Request $request, Category $category)
    {
        $data = $request->validate([
            'attribute_ids' => 'array',
            'attribute_ids.*' => 'integer|exists:attributes,id',
        ]);

        $category->attributes()->sync($data['attribute_ids'] ?? []);

        return response()->json(['message' => 'Category attributes updated']);
    }

    // Separate from the base category CRUD (which lives in an existing
    // controller not touched here) since parent_id support needs to land
    // somewhere - this keeps it additive instead of guessing at an unseen file.
    public function updateParent(Request $request, Category $category)
    {
        $data = $request->validate([
            'parent_id' => 'nullable|integer|exists:categories,id',
        ]);

        if (($data['parent_id'] ?? null) === $category->id) {
            return response()->json(['message' => 'A category cannot be its own parent'], 422);
        }

        $category->update(['parent_id' => $data['parent_id'] ?? null]);

        return response()->json($category);
    }
}
