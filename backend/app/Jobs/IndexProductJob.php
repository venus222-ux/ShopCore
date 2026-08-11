<?php

namespace App\Jobs;

use App\Models\Product;
use App\Services\ProductSearchService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class IndexProductJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // For PHP 8+ constructor property promotion
    public function __construct(public Product $product)
    {
        // No need for extra code here
    }

    public function handle(ProductSearchService $searchService)
    {
        $searchService->index($this->product);
    }
}
