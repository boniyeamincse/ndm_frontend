<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Models\Permission;
use App\Models\Role;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


/**
 * Admin RBAC — Role and Permission management.
 *
 * Routes (admin middleware group):
 *  GET    /admin/roles                   → index()
 *  GET    /admin/roles/{id}              → show()            — with permissions
 *  POST   /admin/roles                   → store()
 *  PUT    /admin/roles/{id}              → update()
 *  DELETE /admin/roles/{id}              → destroy()         — guard: cannot delete seeded/in-use roles
 *  PATCH  /admin/roles/{id}/toggle       → toggle()          — activate / deactivate
 *  POST   /admin/roles/{id}/permissions  → syncPermissions()
 *
 *  GET    /admin/permissions             → permissions()     — all available permissions
 */
class RoleController extends Controller
{
    /** Titles of roles that must never be deleted. */
    private const SYSTEM_ROLES = ['admin', 'organizer', 'general_member'];

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

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $data = array_merge($request->validated(), [
            'created_by' => Auth::id(),
        ]);

        $role = Role::create($data);
        $this->auditLog->log('role.created', $role, [], $role->toArray());

        return response()->json(['success' => true, 'data' => $role], 201);
    }

    public function update(int $id, UpdateRoleRequest $request): JsonResponse
    {
        $role      = Role::findOrFail($id);
        $validated = $request->validated();
        $old       = $role->only(array_keys($validated));

        $role->update($validated);
        $this->auditLog->log('role.updated', $role, $old, $role->only(array_keys($validated)));

        return response()->json(['success' => true, 'data' => $role->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        $role = Role::findOrFail($id);

        // Guard: system-seeded roles cannot be deleted
        if (in_array($role->title, self::SYSTEM_ROLES, true)) {
            return response()->json([
                'success' => false,
                'message' => "The '{$role->title}' role is a system role and cannot be deleted.",
            ], 422);
        }

        // Guard: roles in active use (assigned via positions) cannot be deleted
        if ($role->positions()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete a role that is currently assigned to members.',
            ], 422);
        }

        $this->auditLog->log('role.deleted', $role, $role->toArray());
        $role->delete();

        return response()->json(['success' => true, 'message' => 'Role deleted successfully.']);
    }

    /**
     * Toggle the active / inactive state of a role.
     *  PATCH /admin/roles/{id}/toggle
     */
    public function toggle(int $id): JsonResponse
    {
        $role = Role::findOrFail($id);
        $old  = $role->is_active;

        $role->update(['is_active' => !$old]);
        $this->auditLog->log('role.toggled', $role, ['is_active' => $old], ['is_active' => $role->is_active]);

        $state = $role->is_active ? 'activated' : 'deactivated';

        return response()->json([
            'success'   => true,
            'message'   => "Role {$state} successfully.",
            'data'      => $role->fresh(),
        ]);
    }

    /**
     * Replace the full permission set for a role (sync).
     *  POST /admin/roles/{id}/permissions
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

    /**
     * List all available permissions, grouped.
     *  GET /admin/permissions
     */
    public function permissions(): JsonResponse
    {
        $permissions = Permission::orderBy('group')->orderBy('name')->get();

        return response()->json(['success' => true, 'data' => $permissions]);
    }
}
