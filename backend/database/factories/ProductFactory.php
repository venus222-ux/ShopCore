<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        // Titles will be overridden in the seeder for realism
        $title = $this->faker->sentence(3);

        return [
            'title' => $title,
            'slug' => Str::slug($title) . '-' . uniqid(),
            'short_description' => $this->faker->sentence(12),
            'description' => $this->faker->paragraphs(3, true),
            'price' => $this->faker->randomFloat(2, 9.99, 499.99),
            'asset_type' => $this->faker->randomElement(['image', 'image', 'image', 'pdf']), // mostly physical/digital image products
            'user_id' => User::factory(),
            'is_published' => $this->faker->boolean(85),
            'discount_percentage' => $this->faker->optional(0.25)->randomFloat(1, 5, 40),
            'discount_starts_at' => now()->subDays(rand(0, 10)),
            'discount_ends_at' => now()->addDays(rand(5, 60)),
        ];
    }
}