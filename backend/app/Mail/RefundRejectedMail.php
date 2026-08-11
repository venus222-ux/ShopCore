<?php

// app/Mail/RefundRejectedMail.php

namespace App\Mail;

use App\Models\Refund;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RefundRejectedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Refund $refund) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Update on your refund request - Order #{$this->refund->order_id}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.refund-rejected',
            with: ['refund' => $this->refund],
        );
    }
}
