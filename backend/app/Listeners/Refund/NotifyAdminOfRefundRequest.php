<?php
// app/Listeners/Refund/NotifyAdminOfRefundRequest.php

namespace App\Listeners\Refund;

use App\Events\Refund\RefundRequested;
use App\Mail\RefundRequestedAdminMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class NotifyAdminOfRefundRequest implements ShouldQueue
{
    public function handle(RefundRequested $event): void
    {
        $adminEmail = config('mail.from.admin_address', config('mail.from.address'));

        Mail::to($adminEmail)->send(new RefundRequestedAdminMail($event->refund));
    }
}
