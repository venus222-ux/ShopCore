<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Prometheus\CollectorRegistry;
use Prometheus\RenderTextFormat;
use Prometheus\Storage\Redis as RedisAdapter;

class MetricsController extends Controller
{
    public function index(): Response
    {
        RedisAdapter::setDefaultOptions(config('prometheus.redis'));
        $registry = new CollectorRegistry(new RedisAdapter);

        $renderer = new RenderTextFormat;
        $result = $renderer->render($registry->getMetricFamilySamples());

        return response($result, 200)
            ->header('Content-Type', RenderTextFormat::MIME_TYPE);
    }
}
