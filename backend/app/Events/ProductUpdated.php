<?php

namespace App\Events;

use App\Models\Product;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProductUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $productId;
    public string $message;

    public function __construct(Product $product, string $message)
    {
        $this->productId = $product->id;
        $this->message = $message;
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('product.' . $this->productId)];
    }

    public function broadcastAs(): string
    {
        return 'product.updated';        // Must match frontend
    }

    public function broadcastWith(): array
    {
        return [
            'product_id' => $this->productId,
            'title'      => Product::find($this->productId)?->title ?? 'Product',
            'message'    => $this->message,
            'updated_at' => now()->toISOString(),
        ];
    }
}
