<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventories', function (Blueprint $t) {
            $t->id();
            $t->foreignId('product_variant_id')->constrained()->cascadeOnDelete();
            $t->boolean('track_stock')->default(true); // false for digital = unlimited
            $t->integer('quantity')->default(0);
            $t->integer('reserved')->default(0); // held during checkout
            $t->timestamps();

            $t->unique('product_variant_id'); // one inventory row per variant
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventories');
    }
};
