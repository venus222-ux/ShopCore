<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('product.{productId}', function ($user, $productId) {
    try {
        if (!$user) {
            Log::info("Broadcast denied: No authenticated user for product {$productId}");
            return false;
        }

        // Admin check (safe)
        if ($user->hasRole('admin') || ($user->role === 'admin')) {
            Log::info("Broadcast allowed: Admin {$user->id} for product {$productId}");
            return true;
        }

        // Check purchase via order_items
        $hasPurchased = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.user_id', $user->id)
            ->where('order_items.product_id', $productId)
            ->exists();

        Log::info("Broadcast check - Product {$productId} for User {$user->id}: " . ($hasPurchased ? 'ALLOWED' : 'DENIED'));

        return $hasPurchased;

    } catch (\Throwable $e) {
        Log::error("Channel auth error for product {$productId}: " . $e->getMessage());
        return false;
    }
});
