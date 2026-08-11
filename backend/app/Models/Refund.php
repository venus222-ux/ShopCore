<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Refund extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = [
        'order_id',
        'user_id',
        'amount',
        'reason',
        'requested_by_customer',
        'status',
        'stripe_refund_id',
        'credit_note_number',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'requested_by_customer' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::created(function (Refund $refund) {
            if (! $refund->credit_note_number) {
                $refund->updateQuietly([
                    'credit_note_number' => 'CN-'.$refund->created_at->format('Y').'-'.str_pad($refund->id, 6, '0', STR_PAD_LEFT),
                ]);
            }
        });
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isSucceeded(): bool
    {
        return $this->status === 'succeeded';
    }

    public function isRequested(): bool
    {
        return $this->status === 'requested';
    }
}
