<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
// app/Models/Address.php
    protected $fillable = [
       'user_id', 'type', 'label',
       'first_name', 'last_name', 'company_name', 'vat_number',
       'address_line_1', 'address_line_2', 'city', 'state', 'postal_code', 'country',
       'phone', 'delivery_instructions',
       'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    protected static function booted(): void
    {
        // Same "only one default" pattern as ProductVariant, scoped per user + type
        // (a user can have one default billing address and one default shipping address).
        static::saving(function (Address $address) {
            if ($address->is_default) {
                static::where('user_id', $address->user_id)
                    ->where('type', $address->type)
                    ->when($address->exists, fn ($q) => $q->whereKeyNot($address->getKey()))
                    ->update(['is_default' => false]);
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
