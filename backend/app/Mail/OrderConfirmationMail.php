<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable; 
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;

 public function __construct(Order $order)
{
    $this->order = $order;   // Don't load here again
}

public function envelope(): Envelope
{
    return new Envelope(
        subject: "Thank you for your purchase - Order #{$this->order->id}",
    );
}

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.order-confirmation',
        );
    }
}
