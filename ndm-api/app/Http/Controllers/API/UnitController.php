<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\OrganizationalUnit;
use App\Enums\UnitType;
use Illuminate\Http\JsonResponse;

class UnitController extends Controller
{
    /**
     * Get all campus units for registration.
     */
    public function index(): JsonResponse
    {
        $campuses = OrganizationalUnit::where('type', UnitType::CAMPUS)
            ->select('id', 'name', 'code')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $campuses
        ]);
    }
}
