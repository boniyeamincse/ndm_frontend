<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // guarded by AdminMiddleware at route level
    }

    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'title'       => ['sometimes', 'string', 'max:100', "unique:roles,title,{$id}"],
            'unit_type'   => ['sometimes', 'string', 'in:central,division,district,upazila,union,ward,campus'],
            'rank_order'  => ['sometimes', 'integer', 'min:1', 'max:9999'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active'   => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.unique' => 'A role with this title already exists.',
            'unit_type.in' => 'unit_type must be one of: central, division, district, upazila, union, ward, campus.',
        ];
    }
}
