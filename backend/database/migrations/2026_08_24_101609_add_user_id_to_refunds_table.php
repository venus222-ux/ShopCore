<?php
// database/migrations/2026_07_21_000001_add_user_id_to_refunds_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('refunds', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('order_id')->constrained()->nullOnDelete();
            $table->boolean('requested_by_customer')->default(false)->after('reason');
        });
    }

    public function down(): void
    {
        Schema::table('refunds', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn('requested_by_customer');
        });
    }
};
