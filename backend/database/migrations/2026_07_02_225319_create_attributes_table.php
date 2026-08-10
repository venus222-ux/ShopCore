<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attributes', function (Blueprint $t) {
            $t->id();
            $t->string('name');            // "Color"
            $t->string('slug')->unique();  // "color"
            $t->enum('type', ['text', 'number', 'select', 'boolean']);
            $t->boolean('is_filterable')->default(true); // drives ES facets
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attributes');
    }
};
