<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Pricing
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('discount_total', 10, 2)->default(0);
            $table->decimal('vat_percent', 5, 2)->default(0);
            $table->decimal('vat', 10, 2)->default(0);
            $table->decimal('shipping_total', 10, 2)->default(0);
            $table->decimal('total', 10, 2);

            // Coupon
            $table->foreignId('coupon_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Shipping method used
            $table->foreignId('shipping_method_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Address references (the live rows in `addresses`)
            $table->foreignId('billing_address_id')
                ->nullable()
                ->constrained('addresses')
                ->nullOnDelete();

            $table->foreignId('shipping_address_id')
                ->nullable()
                ->constrained('addresses')
                ->nullOnDelete();

            // Order status
            $table->string('status')->default('pending'); // pending | paid | failed

            // Stripe
            $table->string('stripe_session_id')->nullable();
            $table->string('payment_intent_id')->nullable();

            // Invoicing
            $table->string('invoice_number')->nullable()->unique();

            // Inventory guards (idempotency)
            $table->timestamp('inventory_finalized_at')->nullable();
            $table->timestamp('inventory_released_at')->nullable();

            // Billing snapshot - kept in sync with the Address record used at
            // checkout time, so invoice/email generation never has to touch
            // the addresses table (and stays correct even if the customer
            // edits/deletes that address later).
            $table->string('billing_name')->nullable();
            $table->string('billing_email')->nullable();
            $table->string('billing_phone')->nullable();
            $table->string('billing_company')->nullable();
            $table->string('billing_vat_number')->nullable();
            $table->string('billing_address_1')->nullable();
            $table->string('billing_address_2')->nullable();
            $table->string('billing_city')->nullable();
            $table->string('billing_state')->nullable();
            $table->string('billing_postal_code')->nullable();
            $table->string('billing_country')->nullable();

            // Shipping snapshot - same rationale, only populated when the
            // order actually requires shipping.
            $table->string('shipping_name')->nullable();
            $table->string('shipping_phone')->nullable();
            $table->string('shipping_company')->nullable();
            $table->string('shipping_address_1')->nullable();
            $table->string('shipping_address_2')->nullable();
            $table->string('shipping_city')->nullable();
            $table->string('shipping_state')->nullable();
            $table->string('shipping_postal_code')->nullable();
            $table->string('shipping_country')->nullable();
            $table->string('shipping_delivery_instructions')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
