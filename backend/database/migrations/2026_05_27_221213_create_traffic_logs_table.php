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
Schema::create('traffic_logs', function (Blueprint $table) {
    $table->id();
    $table->string('ip')->nullable();
    $table->string('path')->nullable();
    $table->string('source')->nullable(); // google, facebook, direct, etc
    $table->string('user_agent')->nullable();
    $table->foreignId('user_id')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('traffic_logs');
    }
};
