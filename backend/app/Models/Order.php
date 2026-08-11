<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Order extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = [
        'user_id',

        // Pricing
        'subtotal',
        'vat_percent',
        'vat',
        'discount_total',
        'shipping_total',
        'total',

        // Status & Payment
        'status',
        'payment_method',
        'stripe_session_id',
        'payment_intent_id',
        'refunded_total',

        // Billing
        'billing_name',
        'billing_email',
        'billing_phone',
        'billing_company',
        'billing_vat_number',
        'billing_address_1',
        'billing_address_2',
        'billing_city',
        'billing_state',
        'billing_postal_code',
        'billing_country',

        // Shipping Address Snapshot
        'shipping_name',
        'shipping_phone',
        'shipping_company',
        'shipping_address_1',
        'shipping_address_2',
        'shipping_city',
        'shipping_state',
        'shipping_postal_code',
        'shipping_country',
        'shipping_delivery_instructions',

        // Relations
        'shipping_address_id',
        'billing_address_id',
        'shipping_method_id',
        'coupon_id',

        // Inventory
        'inventory_finalized_at',
        'inventory_released_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'vat_percent' => 'decimal:2',
        'vat' => 'decimal:2',
        'discount_total' => 'decimal:2',
        'shipping_total' => 'decimal:2',
        'total' => 'decimal:2',
        'refunded_total' => 'decimal:2',
        'inventory_finalized_at' => 'datetime',
        'inventory_released_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        // Assign invoice_number AFTER insert, once the auto-increment id
        // exists. Deliberately NOT in $fillable - this is system-generated
        // and should never be settable via mass assignment from a request.
        // forceFill()+saveQuietly() bypasses the fillable check for this
        // one internal write without weakening mass-assignment protection
        // for anything else on the model.
        static::created(function (Order $order) {
            $order->forceFill([
                'invoice_number' => 'INV-'.$order->created_at->format('Y').'-'.str_pad($order->id, 6, '0', STR_PAD_LEFT),
            ])->saveQuietly();
        });
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shippingAddress()
    {
        return $this->belongsTo(Address::class, 'shipping_address_id');
    }

    public function billingAddress()
    {
        return $this->belongsTo(Address::class, 'billing_address_id');
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public function shippingMethod()
    {
        return $this->belongsTo(ShippingMethod::class);
    }

    public function invoice(): array
    {
        return [
            'order_id' => $this->id,
            'date' => $this->created_at,
            'total' => $this->total,
            'items' => $this->items->map(fn ($i) => [
                'title' => $i->product->title,
                'price' => $i->price,
                'qty' => $i->quantity,
            ]),
        ];
    }

    public function refunds()
    {
        return $this->hasMany(Refund::class);
    }

    public function isFullyRefunded(): bool
    {
        return $this->refunded_total >= $this->total;
    }

    public function remainingRefundable(): float
    {
        return max(0, (float) $this->total - (float) $this->refunded_total);
    }
}
