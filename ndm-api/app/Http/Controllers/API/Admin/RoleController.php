<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Admin RBAC — Role and Permission management.
 *
 * Routes (admin middleware group):
 *  GET    /admin/roles                   → index()
 *  GET    /admin/roles/{id}              → show()       — with permissions
 *  POST   /admin/roles                   → store()
 *  PUT    /admin/roles/{id}              → update()
 *  DELETE /admin/roles/{id}              → destroy()    — guard: cannot delete seeded roles
 *  POST   /admin/roles/{id}/permissions  → syncPermissions()
 *
 *  GET    /admin/permissions             → permissions() — all available permissions
 */
class RoleController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLog) {}

    public function index(): JsonResponse
    {
        $roles = Role::with('permissions')->latest()->get();

        return response()->json(['success' => true, 'data' => $roles]);
    }

    public function show(int $id): JsonResponse
    {
        $role = Role::with('permissions')->findOrFail($id);

        return response()->json(['success' => true, 'data' => $role]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:100', 'unique:roles,name'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active'   => ['boolean'],
        ]);

        $role = Role::create($validated);
        $this->auditLog->log('role.created', $role, [], $role->toArray());

        return response()->json(['success' => true, 'data' => $role], 201);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => ['sometimes', 'string', 'max:100', 'unique:roles,name,' . $id],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active'   => ['boolean'],
        ]);

        $role = Role::findOrFail($id);
        $old  = $role->only(array_keys($validated));
        $role->update($validated);

        $this->auditLog->log('role.updated', $role, $old, $role->only(array_keys($validated)));

        return response()->json(['success' => true, 'data' => $role]);
    }

    public function destroy(int $id): JsonResponse
    {
        $role = Role::findOrFail($id);

        if ($role->members()->exists()) {
            return response()->json(['success' => false, 'message' => 'Cannot delete a role that has assigned members.'], 422);
        }

        $this->auditLog->log('role.deleted', $role, $role->toArray());
        $role->delete();

        return response()->json(['success' => true, 'message' => 'Role deleted.']);
    }

    /**
     * Replace the full permission set for a role (sync).
     */
    public function syncPermissions(int $id, Request $request): JsonResponse
    {
        $request->validate([
            'permission_ids'   => ['required', 'array'],
            'permission_ids.*' => ['integer', 'exists:permissions,id'],
        ]);

        $role = Role::findOrFail($id);
        $old  = $role->permissions()->pluck('permissions.id')->toArray();

        $role->permissions()->sync($request->input('permission_ids'));

        $this->auditLog->log('role.permissions_synced', $role, ['permission_ids' => $old], $request->only('permission_ids'));

        return response()->json([
            'success' => true,
            'data'    => $role->load('permissions'),
        ]);
    }

    public function permissions(): JsonResponse
    {
        $permissions = Permission::orderBy('group')->orderBy('name')->get();

        return response()->json(['success' => true, 'data' => $permissions]);
    }
}
