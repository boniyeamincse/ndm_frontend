<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Services\TrainingAnalyticsService;
use Illuminate\Http\JsonResponse;

class TrainingAnalyticsController extends Controller
{
    public function __construct(private readonly TrainingAnalyticsService $analyticsService) {}

    public function summary(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->analyticsService->summary(),
        ]);
    }
}