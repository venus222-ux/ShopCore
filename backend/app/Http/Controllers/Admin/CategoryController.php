<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        return Category::all();
    }

    public function store(Request $request)
    {
        $data = $request->validate(['name' => 'required']);

        $data['slug'] = Str::slug($data['name']);

        return Category::create($data);
    }

    public function update(Request $request, Category $category)
    {
        $data = $request->validate(['name' => 'required']);

        $data['slug'] = Str::slug($data['name']);

        $category->update($data);

        return $category;
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
