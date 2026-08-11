<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BackfillDefaultVariants extends Command
{
    protected $signature = 'catalog:backfill-variants
        {--chunk=200 : How many products to process per batch}';

    protected $description = 'Create a default ProductVariant (+ Inventory row) for every product that does not have one yet. Safe to re-run.';

    public function handle(): int
    {
        $chunkSize = (int) $this->option('chunk');
        $total = Product::count();

        if ($total === 0) {
            $this->info('No products found - nothing to backfill.');

            return self::SUCCESS;
        }

        $this->info("Backfilling default variants for {$total} products...");
        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $created = 0;
        $skipped = 0;

        Product::query()->chunkById($chunkSize, function ($products) use ($bar, &$created, &$skipped) {
            foreach ($products as $product) {
                DB::transaction(function () use ($product, &$created, &$skipped) {
                    $variant = $product->variants()->where('is_default', true)->first();

                    if ($variant) {
                        $skipped++;
                    } else {
                        $variant = $product->variants()->create([
                            'sku' => $this->skuFor($product),
                            'price' => $product->price,
                            'discount_percentage' => $product->discount_percentage,
                            'discount_fixed' => $product->discount_fixed,
                            'discount_starts_at' => $product->discount_starts_at,
                            'discount_ends_at' => $product->discount_ends_at,
                            'is_default' => true,
                        ]);
                        $created++;
                    }

                    // Digital goods: unlimited by default. A future physical
                    // vertical flips track_stock on and sets a real quantity.
                    $variant->inventory()->firstOrCreate([], [
                        'track_stock' => false,
                        'quantity' => 0,
                        'reserved' => 0,
                    ]);
                });

                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine(2);
        $this->info("Done. Created: {$created}. Already had a default variant: {$skipped}.");

        return self::SUCCESS;
    }

    private function skuFor(Product $product): string
    {
        // Unique + stable, but still readable - fall back to id if slug is empty
        $base = $product->slug ?: (string) $product->id;

        return 'SKU-'.strtoupper(preg_replace('/[^a-zA-Z0-9]+/', '-', $base)).'-'.$product->id;
    }
}
