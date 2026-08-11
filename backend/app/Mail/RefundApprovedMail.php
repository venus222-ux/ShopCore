<?php

// app/Mail/RefundApprovedMail.php

namespace App\Mail;

use App\Models\Refund;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RefundApprovedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Refund $refund) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Your refund has been approved - Order #{$this->refund->order_id}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.refund-approved',
            with: ['refund' => $this->refund],
        );
    }
}
