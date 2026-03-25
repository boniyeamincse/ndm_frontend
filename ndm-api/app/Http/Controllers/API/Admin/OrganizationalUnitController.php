<?php

namespace App\Http\Controllers\API\Admin;

use App\Enums\UnitType;
use App\Http\Controllers\Controller;
use App\Models\OrganizationalUnit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrganizationalUnitController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $allowedTypes = array_map(static fn (UnitType $type) => $type->value, UnitType::cases());

        $validated = $request->validate([
            'type' => ['nullable', Rule::in($allowedTypes)],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $query = OrganizationalUnit::query()
            ->with(['parent:id,name,type'])
            ->withCount(['children', 'members'])
            ->orderByRaw("CASE type
                WHEN 'central' THEN 1
                WHEN 'division' THEN 2
                WHEN 'district' THEN 3
                WHEN 'upazila' THEN 4
                WHEN 'union' THEN 5
                WHEN 'ward' THEN 6
                WHEN 'campus' THEN 7
                ELSE 99
            END")
            ->orderBy('name');

        if (!empty($validated['type'])) {
            $query->where('type', $validated['type']);
        }

        if (!empty($validated['search'])) {
            $search = trim($validated['search']);
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $summary = OrganizationalUnit::query()
            ->selectRaw('type, COUNT(*) as total')
            ->groupBy('type')
            ->pluck('total', 'type');

        return response()->json([
            'success' => true,
            'data' => $query->get()->map(function (OrganizationalUnit $unit) {
                return [
                    'id' => $unit->id,
                    'name' => $unit->name,
                    'type' => $unit->type->value,
                    'type_label' => $unit->type->label(),
                    'code' => $unit->code,
                    'description' => $unit->description,
                    'is_active' => $unit->is_active,
                    'parent' => $unit->parent ? [
                        'id' => $unit->parent->id,
                        'name' => $unit->parent->name,
                        'type' => $unit->parent->type instanceof UnitType ? $unit->parent->type->value : $unit->parent->type,
                    ] : null,
                    'children_count' => $unit->children_count,
                    'members_count' => $unit->members_count,
                ];
            }),
            'summary' => collect(UnitType::cases())->map(fn (UnitType $type) => [
                'type' => $type->value,
                'label' => $type->label(),
                'total' => (int) ($summary[$type->value] ?? 0),
            ])->values(),
            'filters' => [
                'type' => $validated['type'] ?? '',
                'search' => $validated['search'] ?? '',
            ],
        ]);
    }
}