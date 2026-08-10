<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CategoryFactory extends Factory
{
    public function definition(): array
    {
        $categories = [
            'Flyers',
            'Brochures',
            'Business Cards',
            'Posters',
            'Banners',
            'Stickers',
            'Menus',
            'Invitations',
            'Roll-Up Banners',
            'Packaging',
            'Labels',
            'Booklets',
            'Catalogs',
            'Letterheads',
            'Envelopes',
            'Folders',
            'Calendars',
            'Magazines',
            'Greeting Cards',
            'T-Shirts',
        ];

        $name = $this->faker->unique()->randomElement($categories);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
        ];
    }
}
