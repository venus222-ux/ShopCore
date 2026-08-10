<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use ZipArchive;

class DownloadController extends Controller
{

public function download(Product $product)
{
    $user = auth()->user();

    $ownsProduct = $user->orders()
        ->whereHas('items', function ($q) use ($product) {
            $q->where('product_id', $product->id);
        })
        ->exists();

    if (!$ownsProduct) {
        abort(403);
    }

    $media = $product->getFirstMedia('asset');

    if (!$media) {
        abort(404);
    }

    $zipName = 'product-' . $product->id . '.zip';
    $zipPath = storage_path("app/temp/$zipName");

    if (!file_exists(dirname($zipPath))) {
        mkdir(dirname($zipPath), 0777, true);
    }

    $zip = new ZipArchive;

    if ($zip->open($zipPath, ZipArchive::CREATE) === TRUE) {
        $zip->addFile($media->getPath(), $media->file_name);
        $zip->close();
    }

    return response()->download(
      $zipPath,
      $zipName, // 👈 forces correct filename
      [
         'Content-Type' => 'application/zip',
      ]
    )->deleteFileAfterSend(true);
}
}
