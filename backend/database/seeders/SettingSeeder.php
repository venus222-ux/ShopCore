<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::set('cod_enabled', '1');
        Setting::set('cod_max_order_value', '500');
        Setting::set('cod_fee', '5.00');
    }
}
