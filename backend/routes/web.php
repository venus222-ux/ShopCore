<?php

use App\Http\Controllers\MetricsController;
use Illuminate\Support\Facades\Route;


Route::get('/test-worker', function () {
    if (!isset($GLOBALS['worker_start_time'])) {
        $GLOBALS['worker_start_time'] = microtime(true);
        $GLOBALS['worker_counter'] = 0;
    }

    $GLOBALS['worker_counter']++;

    return response()->json([
        'numar_vizite_worker' => $GLOBALS['worker_counter'],
        'process_id' => getmypid(),
        'worker_boot_time' => $GLOBALS['worker_start_time'],
    ]);
});

Route::get('/metrics', [MetricsController::class, 'index']);


Route::get('/', function () {
    return view('welcome');
});


