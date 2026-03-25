<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BlogPostController extends Controller
{
    public function index(Request $request)
    {
        $query = BlogPost::with('author:id,name,email')
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->category, fn ($q) => $q->where('category', $request->category))
            ->when($request->q, function ($q) use ($request) {
                $term = trim((string) $request->q);
                $q->where(function ($sub) use ($term) {
                    $sub->where('title', 'like', "%{$term}%")
                        ->orWhere('excerpt', 'like', "%{$term}%")
                        ->orWhere('content', 'like', "%{$term}%");
                });
            })
            ->orderByDesc('is_featured')
            ->orderByDesc('published_at')
            ->orderByDesc('created_at');

        return response()->json([
            'data' => $query->paginate((int) $request->get('per_page', 20)),
        ]);
    }

    public function show(int $id)
    {
        $post = BlogPost::with('author:id,name,email')->findOrFail($id);

        return response()->json(['data' => $post]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_posts,slug',
            'category' => 'nullable|string|max:100',
            'cover_image_url' => 'nullable|string|max:2048',
            'excerpt' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
            'is_featured' => 'sometimes|boolean',
            'published_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['title']);

        if (($data['status'] ?? 'draft') === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $post = BlogPost::create([
            ...$data,
            'author_id' => Auth::id(),
        ]);

        return response()->json([
            'message' => 'Blog post created successfully.',
            'data' => $post->load('author:id,name,email'),
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $post = BlogPost::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('blog_posts', 'slug')->ignore($post->id)],
            'category' => 'nullable|string|max:100',
            'cover_image_url' => 'nullable|string|max:2048',
            'excerpt' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
            'is_featured' => 'sometimes|boolean',
            'published_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if (!empty($data['slug'])) {
            $data['slug'] = $this->uniqueSlug($data['slug'], $post->id);
        } elseif (($data['title'] ?? '') !== $post->title) {
            $data['slug'] = $this->uniqueSlug($data['title'], $post->id);
        }

        if (($data['status'] ?? $post->status) === 'published' && empty($data['published_at']) && !$post->published_at) {
            $data['published_at'] = now();
        }

        if (($data['status'] ?? $post->status) !== 'published') {
            $data['published_at'] = null;
        }

        $post->update($data);

        return response()->json([
            'message' => 'Blog post updated successfully.',
            'data' => $post->fresh()->load('author:id,name,email'),
        ]);
    }

    public function destroy(int $id)
    {
        $post = BlogPost::findOrFail($id);
        $post->delete();

        return response()->json(['message' => 'Blog post deleted successfully.']);
    }

    private function uniqueSlug(string $base, ?int $ignoreId = null): string
    {
        $slug = Str::slug($base);
        if ($slug === '') {
            $slug = 'post';
        }

        $candidate = $slug;
        $counter = 2;

        while (
            BlogPost::where('slug', $candidate)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $candidate = $slug . '-' . $counter;
            $counter++;
        }

        return $candidate;
    }
}
