<?php

namespace App\Http\Requests;

use App\Enums\UnitType;
use App\Models\OrganizationalUnit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreOrganizationalUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:191',
                Rule::unique('organizational_units')->where(fn ($query) => $query
                    ->where('type', $this->input('type'))
                    ->where('parent_id', $this->input('parent_id'))),
            ],
            'type' => ['required', Rule::in(UnitType::allowedValues())],
            'parent_id' => ['nullable', 'integer', 'exists:organizational_units,id'],
            'code' => ['nullable', 'string', 'max:20', 'regex:/^[A-Z0-9-]+$/', 'unique:organizational_units,code'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $typeValue = $this->input('type');
            $parentId = $this->input('parent_id');

            if (! $typeValue || ! $parentId) {
                return;
            }

            $type = UnitType::tryFrom($typeValue);
            $parent = OrganizationalUnit::find($parentId);

            if (! $type || ! $parent) {
                return;
            }

            $allowedChildTypes = array_map(
                static fn (UnitType $childType) => $childType->value,
                $parent->type->allowedChildTypes()
            );

            if (! in_array($type->value, $allowedChildTypes, true)) {
                $validator->errors()->add('parent_id', 'This parent unit type cannot contain the selected child unit type.');
            }

            if (! $parent->is_active) {
                $validator->errors()->add('parent_id', 'Cannot assign a child to an inactive parent unit.');
            }
        });
    }
}