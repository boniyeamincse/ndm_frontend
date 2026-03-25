import React, { useEffect, useMemo, useState } from 'react';
import blogService from '../../../services/blogService';

const EMPTY_FORM = {
  title: '',
  slug: '',
  category: '',
  cover_image_url: '',
  excerpt: '',
  content: '',
  status: 'draft',
  is_featured: false,
};

const BlogManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const result = await blogService.getAdminPosts({
        per_page: 50,
        status: statusFilter === 'all' ? undefined : statusFilter,
        q: query || undefined,
      });
      setPosts(result?.data ?? []);
      setError('');
    } catch {
      setError('Failed to load blog posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [statusFilter]);

  const stats = useMemo(() => {
    return {
      total: posts.length,
      published: posts.filter((p) => p.status === 'published').length,
      draft: posts.filter((p) => p.status === 'draft').length,
      archived: posts.filter((p) => p.status === 'archived').length,
    };
  }, [posts]);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setForm({
      title: post.title ?? '',
      slug: post.slug ?? '',
      category: post.category ?? '',
      cover_image_url: post.cover_image_url ?? '',
      excerpt: post.excerpt ?? '',
      content: post.content ?? '',
      status: post.status ?? 'draft',
      is_featured: !!post.is_featured,
    });
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        slug: form.slug.trim() || undefined,
        category: form.category.trim() || null,
        cover_image_url: form.cover_image_url.trim() || null,
        excerpt: form.excerpt.trim() || null,
        content: form.content.trim(),
      };

      if (!payload.title || !payload.content) {
        setError('Title and content are required.');
        setSaving(false);
        return;
      }

      if (editingId) {
        await blogService.updatePost(editingId, payload);
        setSuccess('Blog post updated successfully.');
      } else {
        await blogService.createPost(payload);
        setSuccess('Blog post created successfully.');
      }

      resetForm();
      await fetchPosts();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save post. Please check your data.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this blog post permanently?');
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await blogService.deletePost(id);
      setSuccess('Blog post deleted successfully.');
      await fetchPosts();
    } catch {
      setError('Failed to delete post.');
    } finally {
      setDeletingId(null);
    }
  };

  const quickStatusUpdate = async (post, status) => {
    try {
      setSaving(true);
      await blogService.updatePost(post.id, {
        title: post.title,
        slug: post.slug,
        category: post.category,
        cover_image_url: post.cover_image_url,
        excerpt: post.excerpt,
        content: post.content,
        is_featured: !!post.is_featured,
        status,
      });
      setSuccess(`Post marked as ${status}.`);
      await fetchPosts();
    } catch {
      setError('Could not update post status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Blog Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create, edit, publish, archive, and track all public news posts.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">Total: {stats.total}</div>
          <div className="px-3 py-2 rounded-xl bg-emerald-100 text-emerald-700 font-semibold">Published: {stats.published}</div>
          <div className="px-3 py-2 rounded-xl bg-amber-100 text-amber-700 font-semibold">Draft: {stats.draft}</div>
          <div className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold">Archived: {stats.archived}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Blog Post' : 'Create New Blog Post'}</h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700">
              Cancel edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={form.title}
            onChange={(e) => onChange('title', e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
            placeholder="Post title"
            required
          />
          <input
            value={form.slug}
            onChange={(e) => onChange('slug', e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
            placeholder="Slug (optional)"
          />
          <input
            value={form.category}
            onChange={(e) => onChange('category', e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
            placeholder="Category (e.g. Announcement)"
          />
          <input
            value={form.cover_image_url}
            onChange={(e) => onChange('cover_image_url', e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
            placeholder="Cover image URL (optional)"
          />
          <select
            value={form.status}
            onChange={(e) => onChange('status', e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <label className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => onChange('is_featured', e.target.checked)}
            />
            Featured post
          </label>
        </div>

        <textarea
          value={form.excerpt}
          onChange={(e) => onChange('excerpt', e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
          rows={2}
          placeholder="Short excerpt"
        />

        <textarea
          value={form.content}
          onChange={(e) => onChange('content', e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm"
          rows={8}
          placeholder="Full article content"
          required
        />

        <div className="flex items-center justify-between gap-3">
          <div className="text-sm">
            {error && <span className="text-red-600">{error}</span>}
            {!error && success && <span className="text-emerald-600">{success}</span>}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold disabled:opacity-70"
          >
            {saving ? 'Saving...' : editingId ? 'Update Post' : 'Create Post'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">All Blog Posts</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts"
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
            >
              <option value="all">All status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <button onClick={fetchPosts} className="px-3 py-2 rounded-xl text-sm bg-slate-900 text-white">
              Apply
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-sm text-gray-500 border border-dashed border-gray-200 rounded-2xl p-8 text-center">
            No blog posts found.
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="border border-gray-100 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className={`text-[11px] px-2 py-1 rounded-full font-semibold ${
                      post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : post.status === 'archived' ? 'bg-gray-100 text-gray-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {post.status}
                    </span>
                    {post.is_featured && <span className="text-[11px] px-2 py-1 rounded-full font-semibold bg-violet-100 text-violet-700">featured</span>}
                    {post.category && <span className="text-[11px] px-2 py-1 rounded-full font-semibold bg-blue-100 text-blue-700">{post.category}</span>}
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.excerpt || post.content}</p>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    {post.published_at ? `Published ${new Date(post.published_at).toLocaleString()}` : 'Not published'}
                    {post.author?.name ? ` · By ${post.author.name}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => handleEdit(post)} className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 text-slate-700">
                    Edit
                  </button>
                  {post.status !== 'published' ? (
                    <button onClick={() => quickStatusUpdate(post, 'published')} className="px-3 py-1.5 text-xs rounded-lg bg-emerald-100 text-emerald-700">
                      Publish
                    </button>
                  ) : (
                    <button onClick={() => quickStatusUpdate(post, 'draft')} className="px-3 py-1.5 text-xs rounded-lg bg-amber-100 text-amber-700">
                      Unpublish
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    className="px-3 py-1.5 text-xs rounded-lg bg-red-100 text-red-700 disabled:opacity-60"
                  >
                    {deletingId === post.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManagement;
