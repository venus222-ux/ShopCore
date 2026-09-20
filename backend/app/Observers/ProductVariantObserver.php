<?php

namespace App\Observers;

use App\Models\ProductVariant;
use App\Services\ProductSearchService;

class ProductVariantObserver
{
    public function __construct(private readonly ProductSearchService $searchService) {}

    public function saved(ProductVariant $variant): void
    {
        $this->reindex($variant);
    }

    public function deleted(ProductVariant $variant): void
    {
        $this->reindex($variant);
    }

    /**
     * Any change to a variant (price, discount, stock, SKU, default flag,
     * or deletion) must be reflected in the parent product's search
     * document - the shop's variant panel and price display both read
     * exclusively from Elasticsearch, never from the DB directly.
     */
    private function reindex(ProductVariant $variant): void
    {
        $product = $variant->product()->with([
            'variants.attributeValues.attribute',
            'variants.attributeValues.media',
            'variants.inventory',
            'category',
        ])->first();

        if ($product) {
            $this->searchService->index($product);
        }
    }
}
