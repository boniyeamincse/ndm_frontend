<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PromoteMemberRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'member_id' => ['required', 'integer', 'exists:members,id'],
            // Admins can promote to organizer or admin, but NEVER demote to bypass rules
            'role'      => ['required', 'in:general_member,organizer,admin'],
        ];
    }

    /**
     * Extra check: prevent privilege escalation.
     * Only super-admins (user_type = admin) can assign 'admin' role.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            if ($this->input('role') === 'admin' && $this->user()->user_type !== 'admin') {
                $v->errors()->add('role', 'Only system admins can assign the admin role.');
            }
        });
    }
}
