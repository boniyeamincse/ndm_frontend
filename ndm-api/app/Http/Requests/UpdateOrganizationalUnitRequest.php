<?php

namespace App\Http\Requests;

use App\Enums\UnitType;
use App\Models\OrganizationalUnit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateOrganizationalUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $unitId = (int) $this->route('id');
        $currentUnit = OrganizationalUnit::find($unitId);
        $type = $this->input('type', $currentUnit?->type?->value);
        $parentId = $this->input('parent_id', $currentUnit?->parent_id);

        return [
            'name' => [
                'sometimes',
                'string',
                'max:191',
                Rule::unique('organizational_units')->ignore($unitId)->where(fn ($query) => $query
                    ->where('type', $type)
                    ->where('parent_id', $parentId)),
            ],
            'type' => ['sometimes', Rule::in(UnitType::allowedValues())],
            'parent_id' => ['sometimes', 'nullable', 'integer', 'exists:organizational_units,id'],
            'code' => ['sometimes', 'nullable', 'string', 'max:20', 'regex:/^[A-Z0-9-]+$/', Rule::unique('organizational_units', 'code')->ignore($unitId)],
            'description' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $unit = OrganizationalUnit::find((int) $this->route('id'));

            if (! $unit) {
                return;
            }

            $type = UnitType::tryFrom($this->input('type', $unit->type->value));
            $parentId = $this->has('parent_id') ? $this->input('parent_id') : $unit->parent_id;

            if (! $type || ! $parentId) {
                return;
            }

            if ((int) $parentId === $unit->id) {
                $validator->errors()->add('parent_id', 'A unit cannot be its own parent.');
                return;
            }

            $parent = OrganizationalUnit::find($parentId);

            if (! $parent) {
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

            $ancestor = $parent;

            while ($ancestor) {
                if ($ancestor->id === $unit->id) {
                    $validator->errors()->add('parent_id', 'Cannot move a unit under one of its own descendants.');
                    break;
                }

                $ancestor = $ancestor->parent;
            }
        });
    }
}