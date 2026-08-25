<?php

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AttributeSeeder extends Seeder
{
    public function run(): void
    {
        $attributes = [
            'Color' => [
                'type' => 'select',          // ← changed from 'color'
                'is_filterable' => true,
                'values' => ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Gray', 'Brown', 'Beige', 'Navy', 'Orange', 'Gold', 'Silver', 'Nude', 'Floral', 'Tortoise'],
            ],
            'Size' => [
                'type' => 'select',
                'is_filterable' => true,
                'values' => ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
            ],
            'Material' => [
                'type' => 'select',
                'is_filterable' => true,
                'values' => ['Cotton', 'Polyester', 'Leather', 'Suede', 'Wool', 'Silk', 'Denim', 'Linen', 'Nylon', 'Canvas'],
            ],
            'Gender' => [
                'type' => 'select',
                'is_filterable' => true,
                'values' => ['Men', 'Women', 'Unisex', 'Kids'],
            ],
            'Brand' => [
                'type' => 'select',
                'is_filterable' => true,
                'values' => ['Nike', 'Adidas', 'Puma', 'Zara', 'H&M', 'Levi\'s', 'Gucci', 'Local Brand', 'Generic'],
            ],
            'Style' => [
                'type' => 'select',
                'is_filterable' => true,
                'values' => ['Casual', 'Formal', 'Sport', 'Elegant', 'Streetwear', 'Vintage', 'Minimalist'],
            ],
        ];

        foreach ($attributes as $name => $data) {
            $attribute = Attribute::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'type' => $data['type'],
                    'is_filterable' => $data['is_filterable'],
                ]
            );

            foreach ($data['values'] as $index => $value) {
                AttributeValue::updateOrCreate(
                    [
                        'attribute_id' => $attribute->id,
                        'slug' => Str::slug($value),
                    ],
                    [
                        'value' => $value,
                        'sort_order' => $index,
                    ]
                );
            }
        }
    }
}