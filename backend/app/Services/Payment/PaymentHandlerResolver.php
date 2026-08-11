<?php

namespace App\Services\Payment;

use App\Contracts\PaymentHandler;
use App\Exceptions\PaymentMethodUnavailableException;
use Illuminate\Contracts\Container\Container;

class PaymentHandlerResolver
{
    /** @var array<string, class-string<PaymentHandler>> */
    private array $handlers = [
        'card' => StripePaymentHandler::class,
        'cash' => CashPaymentHandler::class,
    ];

    public function __construct(private readonly Container $container) {}

    public function resolve(string $method): PaymentHandler
    {
        if (! isset($this->handlers[$method])) {
            throw new PaymentMethodUnavailableException("Unknown payment method: {$method}");
        }

        return $this->container->make($this->handlers[$method]);
    }

    public function assertAvailable(string $method, bool $requiresShipping, float $orderTotal): void
    {
        $handler = $this->resolve($method);

        if (! $handler->isAvailableFor($requiresShipping, $orderTotal)) {
            throw new PaymentMethodUnavailableException(
                "The '{$method}' payment method isn't available for this order."
            );
        }
    }
}

// Adăugarea unei a treia metode de plată în viitor (ex. bank transfer) devine: o clasă nouă + o linie în $handlers, fără să atingi CheckoutService.
