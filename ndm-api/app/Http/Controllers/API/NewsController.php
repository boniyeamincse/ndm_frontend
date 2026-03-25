<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        $query = BlogPost::query()
            ->with('author:id,name,email')
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->when($request->category, fn ($q) => $q->where('category', $request->category))
            ->orderByDesc('is_featured')
            ->orderByDesc('published_at');

        return response()->json([
            'data' => $query->paginate((int) $request->get('per_page', 12)),
        ]);
    }

    public function show(string $slug)
    {
        $post = BlogPost::with('author:id,name,email')
            ->where('slug', $slug)
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->firstOrFail();

        return response()->json(['data' => $post]);
    }
}
