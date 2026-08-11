<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_methods', function (Blueprint $t) {
            $t->id();
            $t->string('name');            // "Standard Shipping", "Express"
            $t->text('description')->nullable();
            $t->decimal('price', 10, 2);   // flat rate for now - no zones/weight tiers yet
            $t->boolean('is_active')->default(true);
            $t->unsignedInteger('sort_order')->default(0);
            $t->timestamps();
        });

    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $t) {
            $t->dropConstrainedForeignId('shipping_method_id');
            $t->dropColumn('shipping_total');
        });

        Schema::dropIfExists('shipping_methods');
    }
};
