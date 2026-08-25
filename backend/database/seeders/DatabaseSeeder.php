<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            AdminSeeder::class,
            UserSeeder::class,

            AttributeSeeder::class,      // ← important
            CategorySeeder::class,       // ← important
            ProductSeeder::class,        // 1000 products

            SettingSeeder::class,
        ]);
    }
}