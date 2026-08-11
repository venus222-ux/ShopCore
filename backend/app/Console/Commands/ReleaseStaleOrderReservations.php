<?php

namespace App\Console\Commands;

use App\Jobs\ReleaseOrderInventoryJob;
use App\Models\Order;
use Illuminate\Console\Command;

// blocarea stocului pe termen nedefinit pentru comenzile care au expirat fără notificare
class ReleaseStaleOrderReservations extends Command
{
    protected $signature = 'orders:release-stale-reservations
        {--hours=24 : Orders pending longer than this, with no webhook resolution, are released}';

    public function handle(): int
    {
        $cutoff = now()->subHours((int) $this->option('hours'));

        // Cash-on-delivery orders are deliberately excluded here: a COD
        // order is EXPECTED to stay 'pending' for days while it ships and
        // waits for delivery-time cash confirmation - that's normal, not
        // abandonment. Auto-releasing them on the same 24h clock used for
        // abandoned Stripe sessions would cancel legitimate in-transit
        // orders and free stock that's actually still committed.
        $orders = Order::where('status', 'pending')
            ->where('payment_method', 'card')
            ->whereNull('inventory_finalized_at')
            ->whereNull('inventory_released_at')
            ->where('created_at', '<', $cutoff)
            ->get();

        if ($orders->isEmpty()) {
            $this->info('No stale pending orders found.');

            return self::SUCCESS;
        }

        foreach ($orders as $order) {
            ReleaseOrderInventoryJob::dispatch($order)->onQueue('inventory');
        }

        $this->info("Queued release for {$orders->count()} stale order(s).");

        return self::SUCCESS;
    }
}

/*Acest cod definește un Artisan Command (comandă de consolă) în Laravel,
 * care are rolul de a elibera stocul rezervat pentru comenzile "uitate" (stale).
Scopul comenzii
Comanda orders:release-stale-reservations caută comenzile care au rămas în
starea pending mai mult timp (implicit 24 de ore), fără să fi fost finalizate
sau anulate, și declanșează eliberarea rezervării de stoc. Este un safety net
(mecanism de siguranță) pentru cazul în care webhook-ul de la Stripe
(checkout.session.expired) nu a ajuns sau a eșuat.
Se poate rula manual:
php artisan orders:release-stale-reservations
php artisan orders:release-stale-reservations --hours=12
*/
