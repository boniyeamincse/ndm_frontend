<?php

namespace App\Notifications;

use App\Models\Member;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent when an admin expels a member from the organisation.
 */
class MemberExpelledNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Member  $member,
        public readonly ?string $reason = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('Membership Terminated — ' . config('app.name'))
            ->greeting('Dear ' . $this->member->full_name . ',')
            ->line('This is to inform you that your NDM membership (**' . $this->member->member_id . '**) has been **permanently terminated**.');

        if ($this->reason) {
            $mail->line('**Reason:** ' . $this->reason);
        }

        return $mail
            ->line('Your account access has been revoked. If you believe this is an error, please contact the NDM membership office.')
            ->salutation('NDM Membership Team');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'      => 'member_expelled',
            'member_id' => $this->member->member_id,
            'message'   => 'Your membership has been permanently terminated.',
            'reason'    => $this->reason,
        ];
    }
}
