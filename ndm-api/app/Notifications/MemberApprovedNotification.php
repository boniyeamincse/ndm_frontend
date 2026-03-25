<?php

namespace App\Notifications;

use App\Models\Member;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent when an admin approves a pending member registration.
 */
class MemberApprovedNotification extends Notification implements ShouldQueue
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
            ->subject('Membership Approved — ' . config('app.name'))
            ->greeting('Congratulations, ' . $this->member->full_name . '!')
            ->line('Your membership application has been **approved**.')
            ->line('**Member ID:** ' . $this->member->member_id)
            ->line('You can now log in to access your member dashboard and participate in NDM activities.')
            ->action('Log In Now', url('/login'))
            ->salutation('NDM Membership Team');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'      => 'member_approved',
            'member_id' => $this->member->member_id,
            'message'   => 'Your membership has been approved. Welcome to NDM!',
        ];
    }
}
