<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
           $table->id();

           $table->foreignId('user_id')->constrained()->cascadeOnDelete();
           $table->foreignId('category_id')->constrained()->cascadeOnDelete();

           $table->string('title');
           $table->string('slug')->unique();
           $table->string('short_description');
           $table->text('description');

           $table->decimal('price', 10, 2);
           $table->string('preview_image')->nullable();

           $table->string('asset_type'); // ebook, template, course
           $table->boolean('is_published')->default(false);

           $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
