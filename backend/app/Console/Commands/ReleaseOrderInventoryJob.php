<?php

namespace App\Console\Commands;

use App\Jobs\ReleaseOrderInventoryJob;
use App\Models\Order;
use Illuminate\Console\Command;

class ReleaseStaleCashOrders extends Command
{
    // Default is measured in DAYS, not hours - a COD order legitimately
    // waits through shipping + delivery before cash is confirmed. This is
    // a separate safety net from the card-abandonment command, tuned for
    // COD's much longer natural pending window, and only kicks in for
    // orders an admin genuinely forgot to confirm or that were truly
    // abandoned mid-delivery.
    protected $signature = 'orders:release-stale-cash {--days=14}';

    public function handle(): int
    {
        $cutoff = now()->subDays((int) $this->option('days'));

        $orders = Order::where('status', 'pending')
            ->where('payment_method', 'cash')
            ->whereNull('inventory_finalized_at')
            ->whereNull('inventory_released_at')
            ->where('created_at', '<', $cutoff)
            ->get();

        if ($orders->isEmpty()) {
            $this->info('No stale cash orders found.');

            return self::SUCCESS;
        }

        foreach ($orders as $order) {
            ReleaseOrderInventoryJob::dispatch($order)->onQueue('inventory');
        }

        $this->info("Queued release for {$orders->count()} stale cash order(s).");

        return self::SUCCESS;
    }
}
