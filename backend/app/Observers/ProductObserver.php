<?php

namespace App\Observers;

use App\Models\Product;
use App\Jobs\IndexProductJob;
use App\Jobs\DeleteProductJob;

class ProductObserver
{
    public function created(Product $product)
    {
        IndexProductJob::dispatch($product)->onQueue('search');
    }

    public function updated(Product $product)
    {
        IndexProductJob::dispatch($product)->onQueue('search');
    }

    public function deleted(Product $product)
    {
        DeleteProductJob::dispatch($product->id)->onQueue('search');
    }
}
