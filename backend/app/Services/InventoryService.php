<?php

namespace App\Services;

use App\Exceptions\OutOfStockException;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

class InventoryService // gestionează toată logica de stoc
{
    /**
     * Reserve stock for a set of checkout lines. MUST be called inside an
     * already-open DB transaction (CheckoutController wraps the whole
     * checkout in one) so the row locks taken here are held until that
     * transaction commits/rolls back.
     *
     * @param  array<int, array{variant: ProductVariant, quantity: int}>  $lines
     *
     * @throws OutOfStockException
     */
    public function reserve(array $lines): void // Rezervarea stocului la checkout
    {
        foreach ($lines as $line) { // Pentru fiecare linie
            /** @var ProductVariant $variant */
            $variant = $line['variant'];
            $quantity = $line['quantity'];

            $inventory = Inventory::where('product_variant_id', $variant->id)
                ->lockForUpdate() // Blochează rândul din tabela inventory (lockForUpdate())
                ->first();

            // No inventory row at all = untracked (shouldn't happen after the
            // backfill command, but don't block checkout over a data gap).
            if (! $inventory || ! $inventory->track_stock) {
                continue;
            }

            $available = $inventory->quantity - $inventory->reserved;

            if ($available < $quantity) {
                throw new OutOfStockException(
                    "Insufficient stock for {$variant->sku} (requested {$quantity}, available {$available})",
                    $variant->id,
                );
            }

            $inventory->increment('reserved', $quantity);
        }
    }

    /**
     * Called when payment succeeds: converts a reservation into an actual
     * stock deduction. Idempotent - safe to call multiple times for the
     * same order (Stripe webhook retries), because the lock on the order
     * row serializes concurrent calls and inventory_finalized_at short-
     * circuits repeats.
     */
    public function finalize(Order $order): void // Finalizarea stocului (după plată reușită)
    {
        DB::transaction(function () use ($order) {
            $locked = Order::whereKey($order->id)->lockForUpdate()->firstOrFail(); // Blochează comanda (lockForUpdate()).

            if ($locked->inventory_finalized_at) {
                return;
            }

            foreach ($locked->items as $item) {
                if (! $item->product_variant_id) {
                    continue;
                }

                $inventory = Inventory::where('product_variant_id', $item->product_variant_id)
                    ->lockForUpdate()
                    ->first();

                if (! $inventory || ! $inventory->track_stock) {
                    continue;
                }

                $inventory->decrement('quantity', $item->quantity);
                // Never let reserved go negative if it was already adjusted manually.
                $inventory->decrement('reserved', min($item->quantity, $inventory->reserved));
            }

            $locked->update(['inventory_finalized_at' => now()]);
        });
    }

    /**
     * Called when a checkout session expires or is abandoned: releases the
     * reservation without touching real stock. Idempotent for the same
     * reasons as finalize(). A no-op if the order already finalized
     * (paid orders must never have their stock released back).
     */
    public function release(Order $order): void // liberarea rezervării (când comanda expiră)
    {
        DB::transaction(function () use ($order) {
            $locked = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();

            if ($locked->inventory_finalized_at || $locked->inventory_released_at) {
                return;
            }

            foreach ($locked->items as $item) {
                if (! $item->product_variant_id) {
                    continue;
                }

                $inventory = Inventory::where('product_variant_id', $item->product_variant_id)
                    ->lockForUpdate()
                    ->first();

                if (! $inventory || ! $inventory->track_stock) {
                    continue;
                }

                $inventory->decrement('reserved', min($item->quantity, $inventory->reserved));
            }

            $locked->update([
                'inventory_released_at' => now(),
                'status' => 'cancelled',
            ]);
        });
    }

    /**
     * Restock inventory when an order is cancelled/refunded after it was finalized.
     * Only increases real quantity (not reserved), because the order was already paid.
     * Idempotent and safe to call multiple times.
     */
    public function restock(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $locked = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();

            // Only restock if inventory was actually finalized (deducted) for
            // this order in the first place - a cancelled/never-finalized
            // order has nothing to give back here (release() already handled
            // its reservation separately).
            if (! $locked->inventory_finalized_at) {
                return;
            }

            foreach ($locked->items as $item) {
                if (! $item->product_variant_id) {
                    continue;
                }

                $inventory = Inventory::where('product_variant_id', $item->product_variant_id)
                    ->lockForUpdate()
                    ->first();

                if (! $inventory || ! $inventory->track_stock) {
                    continue;
                }

                $inventory->increment('quantity', $item->quantity);
            }
        });
    }
}
