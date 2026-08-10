<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // Products
        if (!Schema::hasColumn('products', 'discount_percentage')) {
            Schema::table('products', function (Blueprint $table) {
                $table->decimal('discount_percentage', 5, 2)->default(0)->after('price');
                $table->decimal('discount_fixed', 10, 2)->nullable()->after('discount_percentage');
                $table->timestamp('discount_starts_at')->nullable()->after('discount_fixed');
                $table->timestamp('discount_ends_at')->nullable()->after('discount_starts_at');
            });
        }

        // Categories
        if (!Schema::hasColumn('categories', 'discount_percentage')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->decimal('discount_percentage', 5, 2)->default(0)->after('name');
                $table->timestamp('discount_starts_at')->nullable()->after('discount_percentage');
                $table->timestamp('discount_ends_at')->nullable()->after('discount_starts_at');
            });
        }
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['discount_percentage', 'discount_fixed', 'discount_starts_at', 'discount_ends_at']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['discount_percentage', 'discount_starts_at', 'discount_ends_at']);
        });
    }
};
