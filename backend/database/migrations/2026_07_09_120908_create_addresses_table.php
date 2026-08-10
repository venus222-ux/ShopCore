<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $t) {
            $t->id();

            $t->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $t->string('first_name')->nullable();
            $t->string('last_name')->nullable();

            $t->enum('type', ['billing', 'shipping'])
                ->default('billing');

            $t->string('label')->nullable(); // Home, Office
            $t->string('company_name')->nullable();
            $t->string('vat_number')->nullable();

            $t->string('address_line_1');
            $t->string('address_line_2')->nullable();

            $t->string('city');
            $t->string('state')->nullable();
            $t->string('postal_code');
            $t->string('country', 2);

            $t->string('phone')->nullable();
            $t->string('delivery_instructions')->nullable();

            $t->boolean('is_default')->default(false);

            $t->timestamps();

            $t->index(['user_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
