<?php

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Get vendors (or create some if none exist)
        $vendors = User::query()
            ->when(
                method_exists(User::class, 'roles') || class_exists(\Spatie\Permission\Models\Role::class),
                fn ($q) => $q->whereHas('roles', fn ($r) => $r->whereIn('name', ['vendor', 'seller', 'admin']))
            )
            ->take(30)
            ->get();

        if ($vendors->isEmpty()) {
            $vendors = User::factory(15)->create();
        }

        $leafCategories = Category::whereDoesntHave('children')->get();

        if ($leafCategories->isEmpty()) {
            $this->command->error('No leaf categories found. Run CategorySeeder first.');
            return;
        }

        $colorAttr     = Attribute::where('slug', 'color')->first();
        $sizeAttr      = Attribute::where('slug', 'size')->first();
        $materialAttr  = Attribute::where('slug', 'material')->first();

        $productTemplates = $this->getProductTemplates();

        $this->command->info('Creating 1000 products with matching images & variants...');

        for ($i = 1; $i <= 1000; $i++) {
            $template  = $productTemplates[array_rand($productTemplates)];
            $category  = $leafCategories->random();
            $vendor    = $vendors->random();

            // Build realistic title
            $color = $template['colors'][array_rand($template['colors'])];
            $extra = $template['extras'][array_rand($template['extras'])] ?? '';
            $title = trim("{$color} {$template['base']} {$extra}");

            $price = round(
                $template['price_range'][0] + (mt_rand() / mt_getrandmax()) * ($template['price_range'][1] - $template['price_range'][0]),
                2
            );

            $hasDiscount = rand(0, 100) < 30;

            $product = Product::create([
                'title'               => $title,
                'slug'                => Str::slug($title) . '-' . Str::random(6),
                'short_description'   => "High quality {$title}. Perfect for everyday use.",
                'description'         => $this->generateDescription($title),
                'price'               => $price,
                'asset_type'          => 'image',
                'user_id'             => $vendor->id,
                'category_id'         => $category->id,
                'is_published'        => true,
                'discount_percentage' => $hasDiscount ? rand(10, 35) : 0,   // never null
                'discount_starts_at'  => $hasDiscount ? now()->subDays(rand(0, 5)) : null,
                'discount_ends_at'    => $hasDiscount ? now()->addDays(rand(10, 45)) : null,
            ]);

            // ===== Matching Image (LoremFlickr uses the title keywords) =====
            $keywords = Str::slug($title, ','); // e.g. "red,lady,shoes,high,heels"
            $imageUrl = "https://loremflickr.com/800/800/{$keywords}/all";

            try {
                $product->addMediaFromUrl($imageUrl)
                    ->usingName($title)
                    ->usingFileName(Str::slug($title) . '.jpg')
                    ->toMediaCollection('previews');
            } catch (\Exception $e) {
                // Fallback
                try {
                    $product->addMediaFromUrl("https://picsum.photos/seed/" . md5($title) . "/800/800")
                        ->usingName($title)
                        ->toMediaCollection('previews');
                } catch (\Exception $e2) {
                    // ignore if both fail
                }
            }

            // Extra image on ~40% of products
            if (rand(0, 100) < 40) {
                try {
                    $product->addMediaFromUrl("https://loremflickr.com/800/800/{$keywords}/all?lock=" . rand(1, 9999))
                        ->toMediaCollection('previews');
                } catch (\Exception $e) {}
            }

            // ===== Variants =====
            $this->createVariants($product, $colorAttr, $sizeAttr, $color);

            if ($i % 100 === 0) {
                $this->command->info("Created {$i}/1000 products...");
            }
        }

        $this->command->info('✓ 1000 products created successfully with images & attributes!');
    }

    private function createVariants(Product $product, $colorAttr, $sizeAttr, string $mainColor): void
    {
        // Default variant
        $default = ProductVariant::create([
            'product_id'          => $product->id,
            'sku'                 => 'SKU-' . strtoupper(Str::random(8)),
            'price'               => $product->price,
            'is_default'          => true,
            'discount_percentage' => $product->discount_percentage ?? 0,
            'discount_starts_at'  => $product->discount_starts_at,
            'discount_ends_at'    => $product->discount_ends_at,
        ]);

        // Attach main color
        if ($colorAttr) {
            $colorValue = AttributeValue::where('attribute_id', $colorAttr->id)
                ->where('value', $mainColor)
                ->first()
                ?? AttributeValue::where('attribute_id', $colorAttr->id)->inRandomOrder()->first();

            if ($colorValue) {
                $default->attributeValues()->attach($colorValue->id);
            }
        }

        // ~35% chance of size variants
        if ($sizeAttr && rand(0, 100) < 35) {
            $sizes = AttributeValue::where('attribute_id', $sizeAttr->id)
                ->inRandomOrder()
                ->take(rand(3, 6))
                ->get();

            foreach ($sizes as $size) {
                $variant = ProductVariant::create([
                    'product_id'          => $product->id,
                    'sku'                 => 'SKU-' . strtoupper(Str::random(8)),
                    'price'               => round($product->price + rand(-8, 20), 2),
                    'is_default'          => false,
                    'discount_percentage' => 0,
                ]);

                $variant->attributeValues()->attach($size->id);

                // Also attach the same color
                if ($colorAttr) {
                    $colorValue = AttributeValue::where('attribute_id', $colorAttr->id)
                        ->where('value', $mainColor)
                        ->first();

                    if ($colorValue) {
                        $variant->attributeValues()->attach($colorValue->id);
                    }
                }
            }
        }
    }

    private function getProductTemplates(): array
    {
        return [
            // Shoes
            [
                'base' => 'Lady Shoes',
                'colors' => ['Red', 'Black', 'White', 'Pink', 'Nude', 'Blue', 'Gold', 'Beige'],
                'extras' => ['High Heels', 'Elegant', 'Stiletto', 'Party', 'Classic', ''],
                'price_range' => [39.99, 189.99],
            ],
            [
                'base' => 'Sneakers',
                'colors' => ['White', 'Black', 'Red', 'Blue', 'Gray', 'Green', 'Navy'],
                'extras' => ['Running', 'Casual', 'Sport', 'Lightweight', ''],
                'price_range' => [49.99, 159.99],
            ],
            [
                'base' => 'Leather Boots',
                'colors' => ['Black', 'Brown', 'Tan', 'Burgundy'],
                'extras' => ['Ankle', 'Chelsea', 'Winter', 'Classic'],
                'price_range' => [79.99, 249.99],
            ],
            [
                'base' => 'Sandals',
                'colors' => ['Black', 'Brown', 'White', 'Gold', 'Beige'],
                'extras' => ['Flat', 'Wedge', 'Summer', 'Elegant'],
                'price_range' => [24.99, 89.99],
            ],

            // Clothing
            [
                'base' => 'Cotton T-Shirt',
                'colors' => ['White', 'Black', 'Navy', 'Gray', 'Red', 'Olive', 'Beige'],
                'extras' => ['Oversized', 'Slim Fit', 'Premium', 'Basic'],
                'price_range' => [14.99, 49.99],
            ],
            [
                'base' => 'Summer Dress',
                'colors' => ['Floral', 'Red', 'Blue', 'Yellow', 'White', 'Pink'],
                'extras' => ['Midi', 'Maxi', 'Casual', 'Elegant', 'Boho'],
                'price_range' => [29.99, 129.99],
            ],
            [
                'base' => 'Denim Jacket',
                'colors' => ['Blue', 'Black', 'Light Blue', 'Washed'],
                'extras' => ['Classic', 'Oversized', 'Vintage'],
                'price_range' => [59.99, 149.99],
            ],
            [
                'base' => 'Hoodie',
                'colors' => ['Black', 'Gray', 'Navy', 'Green', 'Beige'],
                'extras' => ['Oversized', 'Zip-Up', 'Premium', ''],
                'price_range' => [34.99, 99.99],
            ],

            // Accessories
            [
                'base' => 'Leather Handbag',
                'colors' => ['Black', 'Brown', 'Beige', 'Red', 'Navy'],
                'extras' => ['Crossbody', 'Tote', 'Shoulder', 'Mini'],
                'price_range' => [45.99, 299.99],
            ],
            [
                'base' => 'Sunglasses',
                'colors' => ['Black', 'Tortoise', 'Gold', 'Silver', 'Blue'],
                'extras' => ['Aviator', 'Round', 'Cat Eye', 'Polarized'],
                'price_range' => [19.99, 129.99],
            ],
            [
                'base' => 'Leather Belt',
                'colors' => ['Black', 'Brown', 'Tan'],
                'extras' => ['Classic', 'Wide', 'Reversible'],
                'price_range' => [19.99, 79.99],
            ],

            // Electronics
            [
                'base' => 'Wireless Headphones',
                'colors' => ['Black', 'White', 'Blue', 'Rose Gold', 'Gray'],
                'extras' => ['Noise Cancelling', 'Over Ear', 'Sport', ''],
                'price_range' => [39.99, 249.99],
            ],
            [
                'base' => 'Smart Watch',
                'colors' => ['Black', 'Silver', 'Rose Gold', 'Blue'],
                'extras' => ['Sport', 'Classic', 'Pro'],
                'price_range' => [59.99, 349.99],
            ],

            // Print products (keeps your original shop style)
            [
                'base' => 'Premium Business Cards',
                'colors' => ['Matte Black', 'White', 'Gold Foil', 'Navy'],
                'extras' => ['500 pcs', 'Luxury', 'Spot UV'],
                'price_range' => [19.99, 89.99],
            ],
            [
                'base' => 'Roll-Up Banner',
                'colors' => ['Full Color', 'Custom'],
                'extras' => ['85x200cm', 'Premium Stand', 'Double Sided'],
                'price_range' => [49.99, 149.99],
            ],
            [
                'base' => 'Flyer Pack',
                'colors' => ['Full Color', 'Glossy'],
                'extras' => ['A5', 'A4', '1000 pcs'],
                'price_range' => [14.99, 69.99],
            ],
        ];
    }

    private function generateDescription(string $title): string
    {
        return "Discover the {$title}. Crafted with attention to detail and premium materials. " .
               "This product combines style, comfort and durability. Perfect for any occasion. " .
               "Available in multiple sizes and colors. Fast shipping from verified vendors.";
    }
}