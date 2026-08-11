<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ImageProxyController extends Controller
{
    public function show($path)
    {
        Log::info('Image proxy reached', [
            'path' => $path,
            'time' => now()->toDateTimeString(),
        ]);

        $disk = Storage::disk('public');

        if (! $disk->exists($path)) {
            abort(404);
        }

        return response(
            $disk->get($path),
            200,
            [
                'Content-Type' => $disk->mimeType($path),
            ]
        );
    }
}
