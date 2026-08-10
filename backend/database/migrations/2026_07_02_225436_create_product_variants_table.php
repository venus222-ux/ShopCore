<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $t) {
            $t->id();
            $t->foreignId('product_id')->constrained()->cascadeOnDelete();
            $t->string('sku')->unique();
            $t->decimal('price', 10, 2)->nullable(); // null = inherit product.price
            $t->decimal('discount_percentage', 5, 2)->nullable();
            $t->decimal('discount_fixed', 10, 2)->nullable();
            $t->timestamp('discount_starts_at')->nullable();
            $t->timestamp('discount_ends_at')->nullable();
            $t->boolean('is_default')->default(false); // the "one variant" for legacy/digital products
            $t->timestamps();

            // NOTE: MySQL has no partial/filtered unique index, so "only one
            // default variant per product" can't be a DB constraint here.
            // It's enforced in ProductVariant::booted() instead - see model.
            $t->index(['product_id', 'is_default']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
