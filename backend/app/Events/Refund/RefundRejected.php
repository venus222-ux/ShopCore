<?php

// app/Events/Refund/RefundRejected.php

namespace App\Events\Refund;

use App\Models\Refund;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RefundRejected
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Refund $refund) {}
}
