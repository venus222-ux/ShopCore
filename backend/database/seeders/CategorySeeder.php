<?php

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $tree = [
            'Fashion' => [
                'Women Clothing' => ['Dresses', 'Tops', 'Pants', 'Skirts', 'Jackets'],
                'Men Clothing' => ['Shirts', 'T-Shirts', 'Pants', 'Jackets', 'Hoodies'],
                'Shoes' => ['Sneakers', 'Boots', 'Heels', 'Sandals', 'Loafers'],
                'Accessories' => ['Bags', 'Belts', 'Hats', 'Scarves', 'Jewelry'],
            ],
            'Electronics' => [
                'Phones & Tablets' => ['Smartphones', 'Tablets', 'Accessories'],
                'Computers' => ['Laptops', 'Desktops', 'Monitors'],
                'Audio' => ['Headphones', 'Speakers', 'Earbuds'],
            ],
            'Home & Living' => [
                'Furniture' => ['Sofas', 'Tables', 'Chairs', 'Beds'],
                'Decor' => ['Wall Art', 'Lamps', 'Cushions', 'Rugs'],
                'Kitchen' => ['Cookware', 'Tableware', 'Appliances'],
            ],
            'Sports & Outdoors' => [
                'Fitness' => ['Yoga', 'Weights', 'Cardio'],
                'Outdoor' => ['Camping', 'Hiking', 'Cycling'],
            ],
            'Print & Stationery' => [ // keeps your original print focus
                'Business' => ['Business Cards', 'Flyers', 'Brochures', 'Letterheads'],
                'Marketing' => ['Posters', 'Banners', 'Roll-Up Banners', 'Stickers'],
                'Personal' => ['Invitations', 'Greeting Cards', 'Calendars'],
            ],
        ];

        $allAttributes = Attribute::all()->keyBy('slug');

        foreach ($tree as $parentName => $children) {
            $parent = Category::updateOrCreate(
                ['slug' => Str::slug($parentName)],
                ['name' => $parentName, 'parent_id' => null]
            );

            foreach ($children as $childName => $grandchildren) {
                $child = Category::updateOrCreate(
                    ['slug' => Str::slug($childName)],
                    ['name' => $childName, 'parent_id' => $parent->id]
                );

                // Link relevant attributes
                $this->attachAttributes($child, $allAttributes, $childName);

                foreach ($grandchildren as $gcName) {
                    $gc = Category::updateOrCreate(
                        ['slug' => Str::slug($gcName)],
                        ['name' => $gcName, 'parent_id' => $child->id]
                    );
                    $this->attachAttributes($gc, $allAttributes, $gcName);
                }
            }
        }
    }

    private function attachAttributes(Category $category, $attributes, string $name): void
    {
        $map = [
            'Shoes' => ['color', 'size', 'material', 'gender', 'brand', 'style'],
            'Sneakers' => ['color', 'size', 'material', 'gender', 'brand', 'style'],
            'Boots' => ['color', 'size', 'material', 'gender', 'brand', 'style'],
            'Heels' => ['color', 'size', 'material', 'gender', 'brand', 'style'],
            'Clothing' => ['color', 'size', 'material', 'gender', 'brand', 'style'],
            'Dresses' => ['color', 'size', 'material', 'gender', 'brand', 'style'],
            'T-Shirts' => ['color', 'size', 'material', 'gender', 'brand', 'style'],
            'default' => ['color', 'brand', 'style'],
        ];

        $keys = $map[$name] ?? $map['default'];

        foreach ($keys as $slug) {
            if (isset($attributes[$slug])) {
                $category->attributes()->syncWithoutDetaching([$attributes[$slug]->id]);
            }
        }
    }
}