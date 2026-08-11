<?php

// app/Listeners/Refund/SendRefundRejectedEmail.php

namespace App\Listeners\Refund;

use App\Events\Refund\RefundRejected;
use App\Mail\RefundRejectedMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class SendRefundRejectedEmail implements ShouldQueue
{
    public function handle(RefundRejected $event): void
    {
        $email = $event->refund->order->billing_email ?? $event->refund->user?->email;

        if (! $email) {
            return;
        }

        Mail::to($email)->send(new RefundRejectedMail($event->refund));
    }
}
