<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function update(Request $request)
    {
        $data = $request->validate([
            'coupons_enabled'     => 'sometimes|boolean',
            'cod_enabled'         => 'sometimes|boolean',
            'cod_max_order_value' => 'sometimes|numeric|min:0',
            'cod_fee'             => 'sometimes|numeric|min:0',
        ]);

        foreach ($data as $key => $value) {
            $stored = is_bool($value) ? ($value ? '1' : '0') : (string) $value;
            Setting::set($key, $stored);
        }

        return response()->json([
            'message' => 'Settings updated',
            'settings' => $data,
        ]);
    }
}
