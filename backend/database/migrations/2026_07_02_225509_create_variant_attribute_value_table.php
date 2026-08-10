<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('variant_attribute_value', function (Blueprint $t) {
            $t->foreignId('product_variant_id')->constrained()->cascadeOnDelete();
            $t->foreignId('attribute_value_id')->constrained()->cascadeOnDelete();

            $t->primary(['product_variant_id', 'attribute_value_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('variant_attribute_value');
    }
};
