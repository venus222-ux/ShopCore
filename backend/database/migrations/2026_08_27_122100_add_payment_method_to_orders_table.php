<?php
// database/migrations/xxxx_add_payment_method_to_orders_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_method')->default('card')->after('status');
            $table->decimal('cod_fee', 10, 2)->default(0)->after('shipping_total');
            $table->timestamp('cod_confirmed_at')->nullable()->after('inventory_released_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'cod_fee', 'cod_confirmed_at']);
        });
    }
};
