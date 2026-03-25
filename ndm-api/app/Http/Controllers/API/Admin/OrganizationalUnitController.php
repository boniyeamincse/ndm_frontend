<?php

namespace App\Http\Controllers\API\Admin;

use App\Enums\UnitType;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrganizationalUnitRequest;
use App\Http\Requests\UpdateOrganizationalUnitRequest;
use App\Models\OrganizationalUnit;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class OrganizationalUnitController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLog)
    {
    }

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

        $units = $query->get();

        return response()->json([
            'success' => true,
            'data' => $units->map(function (OrganizationalUnit $unit) {
                return [
                    'id' => $unit->id,
                    'name' => $unit->name,
                    'type' => $unit->type->value,
                    'type_label' => $unit->type->label(),
                    'code' => $unit->code,
                    'display_label' => $this->displayLabel($unit),
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
            'tree' => $this->buildTree($units),
            'allowed_child_types' => collect(UnitType::cases())->map(fn (UnitType $type) => [
                'type' => $type->value,
                'allowed_child_types' => array_map(static fn (UnitType $childType) => $childType->value, $type->allowedChildTypes()),
            ])->values(),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $unit = OrganizationalUnit::with(['parent', 'children', 'members', 'positions.role'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $unit->id,
                'name' => $unit->name,
                'type' => $unit->type->value,
                'type_label' => $unit->type->label(),
                'code' => $unit->code,
                'display_label' => $this->displayLabel($unit),
                'description' => $unit->description,
                'is_active' => $unit->is_active,
                'parent' => $unit->parent,
                'children_count' => $unit->children->count(),
                'members_count' => $unit->members->count(),
                'active_positions_count' => $unit->positions->where('is_active', true)->count(),
            ],
        ]);
    }

    public function store(StoreOrganizationalUnitRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['code'] = $this->normalizeCode($validated['code'] ?? null, $validated['name'], $validated['type']);
        $validated['is_active'] = $validated['is_active'] ?? true;

        $unit = OrganizationalUnit::create($validated);

        $this->auditLog->log('unit.created', $unit, [], $unit->toArray());

        return response()->json([
            'success' => true,
            'message' => 'Organizational unit created successfully.',
            'data' => $unit->fresh(['parent']),
        ], 201);
    }

    public function update(int $id, UpdateOrganizationalUnitRequest $request): JsonResponse
    {
        $unit = OrganizationalUnit::findOrFail($id);
        $validated = $request->validated();

        if (array_key_exists('code', $validated) || array_key_exists('name', $validated) || array_key_exists('type', $validated)) {
            $validated['code'] = $this->normalizeCode(
                $validated['code'] ?? $unit->code,
                $validated['name'] ?? $unit->name,
                $validated['type'] ?? $unit->type->value,
                $unit->id,
            );
        }

        $old = $unit->only(array_keys($validated));
        $unit->update($validated);

        $this->auditLog->log('unit.updated', $unit, $old, $unit->only(array_keys($validated)));

        return response()->json([
            'success' => true,
            'message' => 'Organizational unit updated successfully.',
            'data' => $unit->fresh(['parent']),
        ]);
    }

    public function toggle(int $id): JsonResponse
    {
        $unit = OrganizationalUnit::with(['children', 'members', 'positions'])->findOrFail($id);

        if ($unit->is_active) {
            if ($unit->children()->where('is_active', true)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot archive a unit while it has active child units.',
                ], 422);
            }

            if ($unit->members()->where('status', 'active')->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot archive a unit while it still has active members assigned.',
                ], 422);
            }

            if ($unit->positions()->where('is_active', true)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot archive a unit while it still has active positions.',
                ], 422);
            }
        }

        $old = ['is_active' => $unit->is_active];
        $unit->update(['is_active' => ! $unit->is_active]);

        $this->auditLog->log('unit.toggled', $unit, $old, ['is_active' => $unit->is_active]);

        return response()->json([
            'success' => true,
            'message' => $unit->is_active ? 'Organizational unit activated successfully.' : 'Organizational unit archived successfully.',
            'data' => $unit->fresh(['parent']),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $unit = OrganizationalUnit::withCount(['children', 'members', 'positions'])->findOrFail($id);

        if ($unit->children_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete a unit that still has child units.',
            ], 422);
        }

        if ($unit->members_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete a unit that still has assigned members.',
            ], 422);
        }

        if ($unit->positions_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete a unit that still has position history or assignments.',
            ], 422);
        }

        $this->auditLog->log('unit.deleted', $unit, $unit->toArray(), []);
        $unit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Organizational unit deleted successfully.',
        ]);
    }

    private function buildTree($units)
    {
        $grouped = $units->groupBy('parent_id');

        $build = function ($parentId) use (&$build, $grouped) {
            return $grouped->get($parentId, collect())->map(function (OrganizationalUnit $unit) use (&$build) {
                return [
                    'id' => $unit->id,
                    'name' => $unit->name,
                    'type' => $unit->type->value,
                    'type_label' => $unit->type->label(),
                    'code' => $unit->code,
                    'display_label' => $this->displayLabel($unit),
                    'is_active' => $unit->is_active,
                    'children' => $build($unit->id)->values(),
                ];
            })->values();
        };

        return $build(null);
    }

    private function displayLabel(OrganizationalUnit $unit): string
    {
        return sprintf('%s (%s)', $unit->name, $unit->code ?: strtoupper($unit->type->value));
    }

    private function normalizeCode(?string $code, string $name, string $type, ?int $ignoreId = null): string
    {
        $normalized = $code ? strtoupper(trim($code)) : $this->generateCode($name, $type);

        if (! $this->codeExists($normalized, $ignoreId)) {
            return $normalized;
        }

        $counter = 2;

        do {
            $suffix = '-' . $counter;
            $candidate = Str::limit($normalized, 20 - strlen($suffix), '');
            $candidate .= $suffix;
            $counter++;
        } while ($this->codeExists($candidate, $ignoreId));

        return $candidate;
    }

    private function generateCode(string $name, string $type): string
    {
        $prefix = match ($type) {
            'central' => 'CEN',
            'division' => 'DIV',
            'district' => 'DIS',
            'upazila' => 'UPA',
            'union' => 'UNI',
            'ward' => 'WRD',
            'campus' => 'CAM',
            default => strtoupper(Str::substr($type, 0, 3)),
        };

        $slug = strtoupper(Str::of($name)->ascii()->replaceMatches('/[^A-Za-z0-9]+/', '-')->trim('-')->value());
        $base = $prefix . '-' . $slug;

        return Str::limit($base, 20, '');
    }

    private function codeExists(string $code, ?int $ignoreId = null): bool
    {
        return OrganizationalUnit::query()
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->where('code', $code)
            ->exists();
    }
}