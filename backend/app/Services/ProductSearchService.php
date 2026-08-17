<?php

namespace App\Services;

use App\Models\Product;
use Elastic\Elasticsearch\ClientBuilder;
use Illuminate\Support\Facades\Log;

class ProductSearchService
{
    protected $client;

    public function __construct()
    {
      $this->client = ClientBuilder::create()
    ->setHosts([
        config('services.elasticsearch.host') . ':' . config('services.elasticsearch.port')
    ])
    ->build();
    }

    public function index(Product $product)
    {
        try {
            $product->loadMissing(['variants.attributeValues.attribute', 'variants.inventory']);

            return $this->client->index([
                'index' => config('services.elasticsearch.index'),
                'id' => $product->id,
                'body' => [
                    'title' => $product->title,
                    'id' => $product->id,
                    'slug' => $product->slug,
                    'description' => $product->description,
                    'short_description' => $product->short_description ?? null,
                    'price' => (float) $product->price,
                    'final_price' => (float) $product->final_price,
                    'on_sale' => (bool) $product->hasActiveDiscount(),
                    'category_id' => $product->category_id,
                    'category_name' => $product->category?->name,
                    'asset_type' => $product->asset_type,
                    'created_at' => $product->created_at,
                    'is_published' => (bool) $product->is_published,

                    'preview_url' => $product->preview_url,
                    'preview_urls' => $product->preview_urls,

                    // Facetable attributes gathered from every variant of this
                    // product, deduped. Requires an explicit 'nested' mapping on
                    // this field - see App\Console\Commands\EnsureSearchIndexMapping.
                    // Used ONLY for filtering/aggregations - kept separate from
                    // 'variants' below, which the frontend needs in full to let
                    // a shopper pick a specific combination directly from a
                    // search result card.
                    'attributes' => $this->attributesPayload($product),

                    // Full variant objects, shaped identically to
                    // ProductVariantResource's output, so ProductCard/
                    // VariantSelector behave the same whether the product
                    // came from the DB listing endpoint or an ES search hit.
                    'variants' => $this->variantsPayload($product),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Elasticsearch index failed', [
                'product_id' => $product->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function search($query, $filters = [], $from = 0, $size = 12, $sort = 'newest')
    {
        $must = [];
        $filter = [];

        // 🔍 FUZZY SEARCH
        if ($query) {
            $must[] = [
                'multi_match' => [
                    'query' => $query,
                    'fields' => ['title^3', 'description'],
                    'fuzziness' => 'AUTO',
                    'operator' => 'and',
                ],
            ];
        }

        // 🎯 UNIVERSAL FILTERS
        if (! empty($filters['category'])) {
            $filter[] = [
                'term' => ['category_id' => $filters['category']],
            ];
        }

        if (! empty($filters['asset_type'])) {
            $filter[] = [
                'term' => ['asset_type' => $filters['asset_type']],
            ];
        }

        if (! empty($filters['min_price']) || ! empty($filters['max_price'])) {
            $range = [];

            if (! empty($filters['min_price'])) {
                $range['gte'] = $filters['min_price'];
            }

            if (! empty($filters['max_price'])) {
                $range['lte'] = $filters['max_price'];
            }

            $filter[] = [
                'range' => [
                    'price' => $range,
                ],
            ];
        }

        // ⭐ DYNAMIC ATTRIBUTE FILTERS
        if (! empty($filters['attributes']) && is_array($filters['attributes'])) {
            foreach ($filters['attributes'] as $slug => $value) {
                if ($value === null || $value === '') {
                    continue;
                }

                $filter[] = [
                    'nested' => [
                        'path' => 'attributes',
                        'query' => [
                            'bool' => [
                                'must' => [
                                    ['term' => ['attributes.attribute_slug' => $slug]],
                                    ['term' => ['attributes.value.keyword' => $value]],
                                ],
                            ],
                        ],
                    ],
                ];
            }
        }

        // ⭐ SORT OPTIONS
        $sortOptions = [
            'newest' => ['created_at' => ['order' => 'desc']],
            'price_asc' => ['price' => ['order' => 'asc']],
            'price_desc' => ['price' => ['order' => 'desc']],
            '_score' => '_score',
        ];

        $sortClause = $query
            ? [
                $sortOptions['_score'],
                $sortOptions[$sort] ?? $sortOptions['newest'],
            ]
            : [
                $sortOptions[$sort] ?? $sortOptions['newest'],
            ];

        return $this->client->search([
            'index' => config('services.elasticsearch.index'),
            'body' => [
                'from' => $from,
                'size' => $size,

                'query' => [
                    'bool' => [
                        'must' => $must,
                        'filter' => $filter,
                    ],
                ],

                'sort' => $sortClause,

                'aggs' => [
                    'categories' => [
                        'terms' => [
                            'field' => 'category_id',
                            'size' => 10,
                        ],
                    ],
                    'attributes' => [
                        'nested' => ['path' => 'attributes'],
                        'aggs' => [
                            'by_attribute' => [
                                'terms' => ['field' => 'attributes.attribute_slug', 'size' => 20],
                                'aggs' => [
                                    'values' => [
                                        'terms' => ['field' => 'attributes.value.keyword', 'size' => 50],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ]);
    }

    public function delete(int $id): void
    {
        try {
            $this->client->delete([
                'index' => config('services.elasticsearch.index'),
                'id' => $id,
            ]);
        } catch (\Throwable $e) {
            Log::warning('ES delete failed', [
                'id' => $id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function bulkIndex($products)
    {
        $params = ['body' => []];

        foreach ($products as $product) {
            $product->loadMissing(['variants.attributeValues.attribute', 'variants.inventory']);

            $params['body'][] = [
                'index' => [
                    '_index' => config('services.elasticsearch.index'),
                    '_id' => $product->id,
                ],
            ];

            $params['body'][] = [
                'title' => $product->title,
                'id' => $product->id,
                'slug' => $product->slug,
                'description' => $product->description,
                'short_description' => $product->short_description ?? null,
                'price' => (float) $product->price,
                'final_price' => (float) $product->final_price,
                'on_sale' => (bool) $product->hasActiveDiscount(),
                'category_id' => $product->category_id,
                'category_name' => $product->category?->name,
                'asset_type' => $product->asset_type,
                'created_at' => $product->created_at?->toIso8601String(),
                'preview_url' => $product->preview_url,
                'preview_urls' => $product->preview_urls,
                'is_published' => (bool) $product->is_published,
                'attributes' => $this->attributesPayload($product),
                'variants' => $this->variantsPayload($product),
            ];
        }

        return $this->client->bulk($params);
    }

    /**
     * Flattened, deduped [{attribute_slug, value}, ...] across every
     * variant of the product. Aggregated at product level (not per-variant)
     * because search/filtering happens on products, not individual variants.
     */
    private function attributesPayload(Product $product): array
    {
        $seen = [];
        $payload = [];

        foreach ($product->variants as $variant) {
            foreach ($variant->attributeValues as $attributeValue) {
                $slug = $attributeValue->attribute->slug;
                $value = $attributeValue->value;
                $key = $slug.':'.$value;

                if (isset($seen[$key])) {
                    continue;
                }
                $seen[$key] = true;

                $payload[] = [
                    'attribute_slug' => $slug,
                    'value' => $value,
                ];
            }
        }

        return $payload;
    }

    /**
     * Per-variant payload shaped identically to ProductVariantResource's
     * output (id, sku, price=final_price, has_discount, is_default,
     * attribute_values, in_stock), so the frontend's ProductCard/
     * VariantSelector work the same regardless of whether variants came
     * from the DB (Eloquent + Resource) or from this ES document.
     */
    private function variantsPayload(Product $product): array
    {
        return $product->variants->map(function ($variant) {
            return [
                'id' => $variant->id,
                'sku' => $variant->sku,
                'price' => (float) $variant->final_price,
                'has_discount' => $variant->hasActiveDiscount(),
                'is_default' => (bool) $variant->is_default,

                'attribute_values' => $variant->attributeValues->map(fn ($av) => [
                    'attribute_slug' => $av->attribute->slug,
                    'attribute_name' => $av->attribute->name,
                    'value' => $av->value,
                    'value_id' => $av->id,
                ])->values()->toArray(),

                'in_stock' => $variant->inventory
                    ? ($variant->inventory->track_stock ? $variant->inventory->available > 0 : true)
                    : true,
            ];
        })->values()->toArray();
    }
}
