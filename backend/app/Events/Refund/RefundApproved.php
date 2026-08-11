<?php

// app/Events/Refund/RefundApproved.php

namespace App\Events\Refund;

use App\Models\Refund;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RefundApproved
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Refund $refund) {}
}
