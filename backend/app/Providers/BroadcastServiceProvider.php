<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Broadcast;

class BroadcastServiceProvider extends ServiceProvider
{
  public function boot(): void
{
    // Try this first
   Broadcast::routes([
    'middleware' => ['auth:api']
]);

    // Alternative if above fails:
    // Broadcast::routes(['middleware' => ['auth:api']]);

    require base_path('routes/channels.php');
}
}
