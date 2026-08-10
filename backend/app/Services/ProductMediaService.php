<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class ProductMediaService
{
    public function syncPreviewImages(Product $product, bool $replace = false): void
    {
        if ($replace) {
            $product->clearMediaCollection('previews');
        }

        $files = request()->file('preview_images');

        if (!$files) {
            return;
        }

        $files = is_array($files) ? $files : [$files];

        Log::info('Adding images to product', ['count' => count($files), 'product_id' => $product->id]);

        foreach ($files as $index => $file) {
            if ($file instanceof UploadedFile && $file->isValid()) {
                $media = $product->addMedia($file)->toMediaCollection('previews');
                Log::info("Image {$index} added", [
                    'filename' => $file->getClientOriginalName(),
                    'media_id' => $media->id
                ]);
            }
        }
    }
}
