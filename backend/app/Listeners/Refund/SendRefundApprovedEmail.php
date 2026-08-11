<?php

// app/Listeners/Refund/SendRefundApprovedEmail.php

namespace App\Listeners\Refund;

use App\Events\Refund\RefundApproved;
use App\Mail\RefundApprovedMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class SendRefundApprovedEmail implements ShouldQueue
{
    public function handle(RefundApproved $event): void
    {
        $email = $event->refund->order->billing_email ?? $event->refund->user?->email;

        if (! $email) {
            return;
        }

        Mail::to($email)->send(new RefundApprovedMail($event->refund));
    }
}
