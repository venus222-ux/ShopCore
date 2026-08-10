<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    public function definition(): array
    {
     $title = $this->faker->sentence(3);

       return [
       'title' => $title,
       'slug' => Str::slug($title) . '-' . uniqid(),
       'short_description' => $this->faker->sentence(),
       'description' => $this->faker->paragraph(),
       'price' => $this->faker->randomFloat(2, 5, 200),
       'asset_type' => $this->faker->randomElement(['image', 'video', 'pdf']),
       'user_id' => User::factory(),
       'is_published' => $this->faker->boolean(80),
     ];
    }
}
