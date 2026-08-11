<?php

namespace App\Providers;

use App\Events\Auth\PasswordResetRequested;
use App\Events\Auth\UserLoggedIn;
use App\Events\Auth\UserRegistered;
use App\Events\FileUploaded;
use App\Events\Order\CashOrderPlaced;
use App\Events\OrderPaid;
use App\Events\Refund\RefundApproved;
use App\Events\Refund\RefundRejected;
// Refund Events
use App\Events\Refund\RefundRequested;
use App\Listeners\LogUploadToMongo;
use App\Listeners\LogUserLogin;
use App\Listeners\Order\SendCashOrderPlacedEmail;
use App\Listeners\Refund\NotifyAdminOfRefundRequest;
use App\Listeners\Refund\SendRefundApprovedEmail;
use App\Listeners\Refund\SendRefundRejectedEmail;
use App\Listeners\SendOrderConfirmationEmail;
use App\Listeners\SendResetPasswordNotification;
// Refund Listeners
use App\Listeners\SendWelcomeEmail;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [

        // Existing Events
        FileUploaded::class => [
            LogUploadToMongo::class,
        ],

        UserRegistered::class => [
            SendWelcomeEmail::class,
        ],

        UserLoggedIn::class => [
            LogUserLogin::class,
        ],

        // Order Paid
        OrderPaid::class => [
            SendOrderConfirmationEmail::class,
        ],

        // Refund Events
        RefundRequested::class => [
            NotifyAdminOfRefundRequest::class,
        ],

        RefundApproved::class => [
            SendRefundApprovedEmail::class,
        ],

        RefundRejected::class => [
            SendRefundRejectedEmail::class,
        ],

        CashOrderPlaced::class => [
            SendCashOrderPlacedEmail::class,
        ],

        // PasswordResetRequested is handled manually below
    ];

    public function boot(): void
    {
        parent::boot();

        // Remove any existing registrations for this event
        Event::forget(PasswordResetRequested::class);

        // Register exactly once
        Event::listen(
            PasswordResetRequested::class,
            SendResetPasswordNotification::class
        );
    }

    /**
     * Explicitly disable discovery
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
