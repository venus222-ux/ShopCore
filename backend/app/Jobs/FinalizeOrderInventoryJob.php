<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\InventoryService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class FinalizeOrderInventoryJob implements ShouldQueue //Finalizează (deduce) stocul după ce plata a fost confirmată.
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Order $order) {}  //primeste un Order in constructor

    public function handle(InventoryService $inventory): void
    {
        // InventoryService::finalize() re-locks and re-checks
        // inventory_finalized_at itself, so this is safe even if the
        // webhook that dispatched us gets retried by Stripe.
        $inventory->finalize($this->order);
    }
}
