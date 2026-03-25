<?php

namespace App\Notifications;

use App\Models\Member;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent when an admin suspends an active member.
 */
class MemberSuspendedNotification extends Notification implements ShouldQueue
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
            ->subject('Account Suspended — ' . config('app.name'))
            ->greeting('Dear ' . $this->member->full_name . ',')
            ->line('Your NDM membership account (**' . $this->member->member_id . '**) has been **suspended**.')
            ->line('You will not be able to log in or hold positions during the suspension period.');

        if ($this->reason) {
            $mail->line('**Reason:** ' . $this->reason);
        }

        return $mail
            ->line('If you have questions or wish to appeal, please contact the NDM membership office.')
            ->salutation('NDM Membership Team');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'      => 'member_suspended',
            'member_id' => $this->member->member_id,
            'message'   => 'Your account has been suspended.',
            'reason'    => $this->reason,
        ];
    }
}
