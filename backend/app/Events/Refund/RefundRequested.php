<?php

// app/Events/Refund/RefundRequested.php

namespace App\Events\Refund;

use App\Models\Refund;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RefundRequested
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Refund $refund) {}
}
