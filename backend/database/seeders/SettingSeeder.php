<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::set('cod_enabled', '1');
        Setting::set('cod_max_order_value', '500');
        Setting::set('cod_fee', '5.00');
    }
}
