<?php

namespace App\Notifications;

use App\Models\Member;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent immediately after a new member submits their registration form.
 * Confirms receipt and explains the approval process.
 */
class MemberRegistrationReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Member $member) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Registration Received — ' . config('app.name'))
            ->greeting('Hello, ' . $this->member->full_name . '!')
            ->line('Thank you for registering with the Nationalist Democratic Student Movement.')
            ->line('Your application has been received and is currently under review.')
            ->line('**Member ID:** ' . $this->member->member_id)
            ->line('You will be notified once an admin reviews your application. This typically takes 2–5 business days.')
            ->salutation('NDM Membership Team');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'      => 'registration_received',
            'member_id' => $this->member->member_id,
            'message'   => 'Your registration has been received and is pending admin approval.',
        ];
    }
}
