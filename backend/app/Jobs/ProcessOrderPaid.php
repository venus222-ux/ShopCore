<?php

namespace App\Jobs;

use App\Models\Order;
use App\Events\OrderPaid;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessOrderPaid implements ShouldQueue //Principala responsabilitate este să declanșeze evenimentul OrderPaid.
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $order;

    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    public function handle()
    {
        // Move the logic that was in your controller here
        $this->order->update(['status' => 'paid']);
        event(new OrderPaid($this->order));
    }
}
