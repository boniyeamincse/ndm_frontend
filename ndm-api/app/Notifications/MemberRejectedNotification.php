<?php

namespace App\Notifications;

use App\Models\Member;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent when an admin rejects a pending member registration.
 * The member record is deleted after rejection, so all details are captured here.
 */
class MemberRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Member  $member,
        public readonly ?string $reason = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('Membership Application — Decision Notification')
            ->greeting('Dear ' . $this->member->full_name . ',')
            ->line('After careful review, we regret to inform you that your membership application could not be approved at this time.');

        if ($this->reason) {
            $mail->line('**Reason:** ' . $this->reason);
        }

        return $mail
            ->line('If you believe this decision was made in error, please contact the NDM membership office.')
            ->salutation('NDM Membership Team');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'      => 'member_rejected',
            'member_id' => $this->member->member_id,
            'message'   => 'Your membership application was not approved.',
            'reason'    => $this->reason,
        ];
    }
}
