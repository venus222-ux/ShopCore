<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductSearchResource;
use App\Models\Category;
use App\Services\ProductSearchService;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request, ProductSearchService $searchService)
    {
        $query = $request->input('q', '');
        $page = (int) $request->input('page', 1);
        $size = (int) $request->input('per_page', 12);
        $from = ($page - 1) * $size;
        $sort = $request->input('sort', 'newest');

        $filters = [
            'category' => $request->input('category'),
            'asset_type' => $request->input('asset_type'),
            'min_price' => $request->input('min_price'),
            'max_price' => $request->input('max_price'),
            'term' => ['is_published' => true],
            'attributes' => $request->input('attributes', []),
        ];

        $results = $searchService->search($query, $filters, $from, $size, $sort);

        $hits = $results['hits']['hits'] ?? [];
        $total = $results['hits']['total']['value'] ?? 0;
        $aggs = $results['aggregations'] ?? [];

        // Resolve category_id -> name from the DB rather than from ES -
        // avoids depending on category_name's exact ES mapping type
        // (text/keyword/sub-field), which previously caused every
        // category facet to show "Unknown" when that sub-aggregation
        // didn't match the actual mapping.
        $categoryBuckets = collect($aggs['categories']['buckets'] ?? []);

        $categoryNames = Category::whereIn('id', $categoryBuckets->pluck('key'))
            ->pluck('name', 'id');

        $facets = [
            'categories' => $categoryBuckets->map(function ($bucket) use ($categoryNames) {
                return [
                    'id' => $bucket['key'],
                    'name' => $categoryNames->get($bucket['key'], 'Unknown'),
                    'count' => $bucket['doc_count'],
                ];
            })->values(),

            'attributes' => collect($aggs['attributes']['by_attribute']['buckets'] ?? [])->map(function ($attr) {
                return [
                    'slug' => $attr['key'],
                    'name' => ucfirst(str_replace('-', ' ', $attr['key'])),
                    'values' => collect($attr['values']['buckets'] ?? [])->map(function ($val) {
                        return [
                            'value' => $val['key'],
                            'count' => $val['doc_count'],
                        ];
                    })->values(),
                ];
            })->values(),
        ];

        $products = collect($hits)->map(function ($item) {
            $source = $item['_source'] ?? [];
            $previewUrl = $source['preview_url'] ?? null;
            $previewUrls = $source['preview_urls'] ?? null;

            if (empty($previewUrls) && $previewUrl) {
                $previewUrls = [$previewUrl];
            }

            return (object) [
                'id' => $source['id'] ?? null,
                'slug' => $source['slug'] ?? null,
                'title' => $source['title'] ?? null,
                'price' => $source['price'] ?? null,
                'final_price' => $source['final_price'] ?? null,
                'short_description' => $source['short_description'] ?? null,
                'description' => $source['description'] ?? null,
                'asset_type' => $source['asset_type'] ?? 'Premium',
                'preview_url' => $previewUrl,
                'preview_urls' => $previewUrls ?? [],
                'category' => isset($source['category_name']) ? ['name' => $source['category_name']] : null,
                'score' => $item['_score'] ?? null,
                'variants' => $source['variants'] ?? [],
                'has_discount' => $source['on_sale'] ?? false,
            ];
        });

        return response()->json([
            'data' => ProductSearchResource::collection($products)->resolve(),
            'facets' => $facets,
            'total' => $total,
            'current_page' => $page,
            'per_page' => $size,
            'last_page' => ceil($total / $size),
        ]);
    }
}