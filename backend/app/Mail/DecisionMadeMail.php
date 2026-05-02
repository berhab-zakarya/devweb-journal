<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DecisionMadeMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $articleTitle,
        public readonly string $decision,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Editorial Decision Available');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.decision-made');
    }

    public function attachments(): array
    {
        return [];
    }
}
