<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Delete normal users but keep admin
        DB::table('users')
            ->where('email', '!=', 'admin@example.com')
            ->delete();

        // Create specific normal users
        $users = [
            ['name' => 'Alice Smith', 'email' => 'alice@example.com'],
            ['name' => 'Bob Johnson', 'email' => 'bob@example.com'],
            ['name' => 'Charlie Davis', 'email' => 'charlie@example.com'],
        ];

        foreach ($users as $data) {
            $user = User::factory()->create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'password' => bcrypt('password123'),
            ]);

            $user->assignRole('user'); // ← assign normal role
        }

        // Create 7 extra random users
        $extraUsers = User::factory(7)->create();
        foreach ($extraUsers as $user) {
            $user->assignRole('user');
        }
    }
}
