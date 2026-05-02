<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ArticlePublishedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $articleTitle,
        public readonly string $publishedAt,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your Article Has Been Published');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.article-published');
    }

    public function attachments(): array
    {
        return [];
    }
}
