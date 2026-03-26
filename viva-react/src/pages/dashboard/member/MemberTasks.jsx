import React, { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';
import MemberCard from '../../../components/member/MemberCard';
import MemberEmptyState from '../../../components/member/MemberEmptyState';
import MemberStatusBadge from '../../../components/member/MemberStatusBadge';

const dueCue = (dateString) => {
  if (!dateString) return { label: 'No due date', cls: 'bg-slate-100 text-slate-600' };

  const now = new Date();
  const dueDate = new Date(dateString);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const diffDays = Math.floor((dueDay - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Overdue', cls: 'bg-red-100 text-red-700 ring-1 ring-red-700/10' };
  if (diffDays === 0) return { label: 'Due today', cls: 'bg-orange-100 text-orange-700 ring-1 ring-orange-700/10' };
  if (diffDays <= 2) return { label: 'Due soon', cls: 'bg-amber-100 text-amber-700 ring-1 ring-amber-700/10' };

  return { label: 'On track', cls: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-700/10' };
};

const MemberTasks = () => {
  const [loading, setLoading] = useState(true);
  const [savingTaskId, setSavingTaskId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [formState, setFormState] = useState({});
  const [error, setError] = useState('');

  const loadTasks = async () => {
    setLoading(true);
    setError('');

    try {
      const params = statusFilter === 'all' ? {} : { status: statusFilter };
      const res = await api.get('/tasks/my', { params });
      const rows = res?.data?.data?.data || [];
      setAssignments(rows);

      const initialState = {};
      rows.forEach((row) => {
        initialState[row.id] = {
          status: row.status || 'pending',
          progress_note: row.progress_note || '',
        };
      });
      setFormState(initialState);
    } catch {
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [statusFilter]);

  const filteredAssignments = useMemo(() => {
    if (!search.trim()) return assignments;
    const term = search.trim().toLowerCase();
    return assignments.filter((row) => (row.task?.title || '').toLowerCase().includes(term));
  }, [assignments, search]);

  const updateLocal = (assignmentId, key, value) => {
    setFormState((prev) => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        [key]: value,
      },
    }));
  };

  const saveProgress = async (assignment) => {
    const current = formState[assignment.id] || { status: assignment.status, progress_note: assignment.progress_note || '' };

    if (current.status === 'done') {
      const ok = window.confirm('Mark this task as completed? This will set completion timestamp.');
      if (!ok) return;
    }

    setSavingTaskId(assignment.id);
    setError('');

    try {
      await api.put(`/tasks/${assignment.task_id}/progress`, {
        status: current.status,
        progress_note: current.progress_note,
      });
      await loadTasks();
    } catch {
      setError('Failed to update task progress.');
    } finally {
      setSavingTaskId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900">My Tasks</h1>
        <p className="text-sm text-slate-500 mt-1">Track assigned tasks, update progress, and complete work with confirmation.</p>
      </div>

      <MemberCard className="p-4 grid gap-3 md:grid-cols-3">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-1">Filter by status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-1">Search title</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search task title..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
          />
        </div>
      </MemberCard>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-slate-500">Loading tasks...</div>
      ) : filteredAssignments.length === 0 ? (
        <MemberEmptyState text="No tasks found for the selected filters." />
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const local = formState[assignment.id] || { status: assignment.status, progress_note: assignment.progress_note || '' };
            const cue = dueCue(assignment.task?.due_date);

            return (
              <MemberCard key={assignment.id} className="p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-slate-900 truncate">{assignment.task?.title || 'Task'}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {assignment.task?.description || 'No description provided.'}
                    </p>
                    {assignment.task?.due_date && (
                      <p className="mt-2 text-xs text-slate-500">
                        Due: {new Date(assignment.task.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <MemberStatusBadge status={assignment.status} variant="task" className="tracking-wide" />
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${cue.cls}`}>
                      {cue.label}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3 mt-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-1">Progress status</label>
                    <select
                      value={local.status}
                      onChange={(e) => updateLocal(assignment.id, 'status', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-1">Progress note</label>
                    <textarea
                      value={local.progress_note}
                      onChange={(e) => updateLocal(assignment.id, 'progress_note', e.target.value)}
                      rows={2}
                      placeholder="Add update note..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => saveProgress(assignment)}
                    disabled={savingTaskId === assignment.id}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-primary transition disabled:opacity-60"
                  >
                    {savingTaskId === assignment.id ? 'Saving...' : 'Save Progress'}
                  </button>
                </div>
              </MemberCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MemberTasks;