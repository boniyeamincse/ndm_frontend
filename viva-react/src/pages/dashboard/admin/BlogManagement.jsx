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
    <div className="max-w-7xl mx-auto p-6 space-y-8 pb-20">
      {/* ── Page Header ── */}
      <div className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl px-10 py-10 border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-50 group-hover:bg-primary/10 transition-all pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Content Infrastructure</p>
            <h1 className="mt-3 text-4xl font-black text-white tracking-tight uppercase">Public Pulse</h1>
            <p className="text-sm font-medium text-slate-400 mt-2 max-w-2xl">Broadcast organizational ideology, policy updates, and grassroots narratives through the NDM global news mesh.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'FLUX', value: stats.total, color: 'text-slate-400' },
              { label: 'ACTIVE', value: stats.published, color: 'text-emerald-400' },
              { label: 'STAGED', value: stats.draft, color: 'text-primary' },
              { label: 'ARCHIVED', value: stats.archived, color: 'text-slate-600' }
            ].map(s => (
              <div key={s.label} className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-inner min-w-[100px]">
                <p className={`text-[9px] font-black uppercase tracking-widest ${s.color}`}>{s.label}</p>
                <p className="text-xl font-black text-white mt-1 tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl p-10 space-y-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-30 group-hover:opacity-50 transition-all pointer-events-none" />
        <div className="flex items-center justify-between gap-3 relative">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">{editingId ? 'Refine Logic' : 'Spawn Content'}</h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
              <span className="text-lg">✕</span> DISCARD REFINEMENT
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Article Title</label>
            <input
                value={form.title}
                onChange={(e) => onChange('title', e.target.value)}
                className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                placeholder="MANIFESTO ALPHA..."
                required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Atomic Slug</label>
            <input
                value={form.slug}
                onChange={(e) => onChange('slug', e.target.value)}
                className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-400 font-mono placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                placeholder="manifesto-alpha"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Registry Category</label>
            <input
                value={form.category}
                onChange={(e) => onChange('category', e.target.value)}
                className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                placeholder="POLICY / ANNOUNCEMENT"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Visual Asset URL</label>
            <input
                value={form.cover_image_url}
                onChange={(e) => onChange('cover_image_url', e.target.value)}
                className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-400 font-mono placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                placeholder="https://assets.ndm.org/..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Publication State</label>
            <select
                value={form.status}
                onChange={(e) => onChange('status', e.target.value)}
                className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
            >
                <option value="draft" className="bg-slate-900">STAGED / DRAFT</option>
                <option value="published" className="bg-slate-900">ACTIVE / PUBLISHED</option>
                <option value="archived" className="bg-slate-900">LEGACY / ARCHIVED</option>
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-4 px-5 py-3 border border-white/10 bg-white/5 rounded-xl text-xs text-white font-black uppercase tracking-widest cursor-pointer hover:bg-white/10 transition-all w-full">
                <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => onChange('is_featured', e.target.checked)}
                className="w-5 h-5 rounded bg-white/10 border-white/20 text-primary focus:ring-primary/40"
                />
                Featured Transmission
            </label>
          </div>
        </div>

        <div className="space-y-2 relative">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Intel Summary (Excerpt)</label>
            <textarea
            value={form.excerpt}
            onChange={(e) => onChange('excerpt', e.target.value)}
            className="w-full px-5 py-3 border border-white/10 bg-white/5 rounded-xl text-sm text-slate-300 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed min-h-[80px]"
            rows={2}
            placeholder="Brief transmission summary..."
            />
        </div>

        <div className="space-y-2 relative">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Primary Narrative (Content)</label>
            <textarea
            value={form.content}
            onChange={(e) => onChange('content', e.target.value)}
            className="w-full px-5 py-4 border border-white/10 bg-white/5 rounded-xl text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed min-h-[300px]"
            rows={8}
            placeholder="Construct the full narrative..."
            required
            />
        </div>

        <div className="flex items-center justify-between gap-6 relative pt-4">
          <div className="flex-1">
            {error && <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 animate-pulse">{error}</span>}
            {!error && success && <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{success}</span>}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-10 py-3 bg-primary text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {saving ? 'SYNCING...' : editingId ? 'UPDATE TRANSMISSION' : 'DEPLOY CONTENT'}
          </button>
        </div>
      </form>

      <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Transmission Ledger</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="FILTER LEDGER..."
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-[200px]"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">ALL STATES</option>
              <option value="published" className="bg-slate-900">PUBLISHED</option>
              <option value="draft" className="bg-slate-900">STAGED</option>
              <option value="archived" className="bg-slate-900">ARCHIVED</option>
            </select>
            <button onClick={fetchPosts} className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-900 hover:bg-white transition-all shadow-lg active:scale-95">
              SYNC
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-pulse">
              <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Retrieving Content Stream...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest border border-dashed border-white/10 rounded-[2rem] py-20 text-center">
            Zero transmissions identified in the current window.
          </div>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] rounded-[1.5rem] p-6 flex flex-col lg:flex-row lg:items-center gap-6 transition-all group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-3">
                    <span className={`text-[9px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest ring-1 ${
                      post.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : post.status === 'archived' ? 'bg-white/5 text-slate-500 ring-white/10' : 'bg-primary/10 text-primary ring-primary/20'
                    }`}>
                      {post.status}
                    </span>
                    {post.is_featured && <span className="text-[9px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20 shadow-inner">Featured</span>}
                    {post.category && <span className="text-[9px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest bg-white/5 text-slate-400 ring-1 ring-white/10">{post.category}</span>}
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors truncate">{post.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed uppercase tracking-tight font-bold">{post.excerpt || 'No excerpt available for this transmission.'}</p>
                  <div className="flex items-center gap-3 mt-4">
                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">
                        {post.published_at ? `Synchronized: ${new Date(post.published_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Draft Protocol'}
                        {post.author?.name ? ` · Source: ${post.author.name}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6">
                  <button onClick={() => handleEdit(post)} className="px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                    Refine
                  </button>
                  {post.status !== 'published' ? (
                    <button onClick={() => quickStatusUpdate(post, 'published')} className="px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all">
                      Deploy
                    </button>
                  ) : (
                    <button onClick={() => quickStatusUpdate(post, 'draft')} className="px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 hover:text-primary-light transition-all">
                      Stage
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    className="px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 hover:text-rose-400 disabled:opacity-30 transition-all"
                  >
                    {deletingId === post.id ? 'WIPING...' : 'Wipe'}
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
