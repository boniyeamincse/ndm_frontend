import React, { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';

const MENU_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'courses', label: 'Courses' },
  { id: 'enrollments', label: 'Enrollments' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'analytics', label: 'Analytics' },
];

const listFrom = (res) => {
  const data = res?.data?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const StatCard = ({ label, value, sub }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-bold">{label}</p>
    <p className="mt-2 text-3xl font-black text-white">{value}</p>
    {sub ? <p className="mt-1 text-xs text-slate-400">{sub}</p> : null}
  </div>
);

const TrainingCadreOperationsDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [pipeline, setPipeline] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [courseForm, setCourseForm] = useState({
    title: '',
    slug: '',
    description: '',
    curriculum_outline: '',
    status: 'draft',
  });
  const [pipelineForm, setPipelineForm] = useState({
    member_id: '',
    competency_level: 'foundation',
    readiness_score: 0,
    mentorship_track: '',
    recommended_role: '',
    eligible_for_promotion: false,
    notes: '',
  });

  const [courseMessage, setCourseMessage] = useState('');
  const [pipelineMessage, setPipelineMessage] = useState('');

  const stats = useMemo(() => ({
    courses: courses.length,
    publishedCourses: courses.filter((item) => ['published', 'ongoing', 'completed'].includes(item.status)).length,
    enrollments: enrollments.length,
    completedEnrollments: enrollments.filter((item) => item.status === 'completed').length,
    pipelineProfiles: pipeline.length,
  }), [courses, enrollments, pipeline]);

  useEffect(() => {
    const sections = MENU_ITEMS.map((item) => document.getElementById(item.id)).filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) setActiveSection(visible.target.id);
    }, { rootMargin: '-25% 0px -55% 0px', threshold: [0.2, 0.45, 0.7] });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [courses.length, enrollments.length, pipeline.length]);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const loadData = async () => {
    const [coursesRes, enrollmentsRes, pipelineRes, analyticsRes] = await Promise.all([
      api.get('/admin/training/courses'),
      api.get('/admin/training/enrollments'),
      api.get('/admin/training/leadership-pipeline'),
      api.get('/admin/training/analytics/summary').catch(() => null),
    ]);

    setCourses(listFrom(coursesRes));
    setEnrollments(listFrom(enrollmentsRes));
    setPipeline(listFrom(pipelineRes));
    setAnalytics(analyticsRes?.data?.data || null);
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        await loadData();
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const submitCourse = async (event) => {
    event.preventDefault();
    setCourseMessage('');
    try {
      await api.post('/admin/training/courses', courseForm);
      setCourseForm({ title: '', slug: '', description: '', curriculum_outline: '', status: 'draft' });
      setCourseMessage('Training course created successfully.');
      await loadData();
    } catch (error) {
      setCourseMessage(error?.response?.data?.message || 'Failed to create course.');
    }
  };

  const submitPipeline = async (event) => {
    event.preventDefault();
    setPipelineMessage('');
    try {
      await api.post('/admin/training/leadership-pipeline', {
        ...pipelineForm,
        member_id: Number(pipelineForm.member_id),
        readiness_score: Number(pipelineForm.readiness_score),
      });
      setPipelineForm({
        member_id: '', competency_level: 'foundation', readiness_score: 0,
        mentorship_track: '', recommended_role: '', eligible_for_promotion: false, notes: '',
      });
      setPipelineMessage('Leadership pipeline profile saved successfully.');
      await loadData();
    } catch (error) {
      setPipelineMessage(error?.response?.data?.message || 'Failed to save leadership profile.');
    }
  };

  if (loading) {
    return <div className="text-slate-300 text-sm">Loading training & cadre operations...</div>;
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Training & Cadre Operations</h1>
          <p className="text-sm text-slate-300 mt-1">Course planning, enrollment tracking, certification, and leadership pipeline.</p>
        </div>
        <button
          onClick={refresh}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold"
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      <div className="sticky top-20 z-30 rounded-2xl border border-white/15 bg-slate-950/70 backdrop-blur px-3 py-2">
        <div className="flex gap-2 overflow-x-auto">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap border transition ${
                activeSection === item.id
                  ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <section id="overview" className="space-y-4">
        <h2 className="text-lg font-bold text-white">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Total Courses" value={stats.courses} />
          <StatCard label="Published/Ongoing" value={stats.publishedCourses} />
          <StatCard label="Enrollments" value={stats.enrollments} />
          <StatCard label="Completed" value={stats.completedEnrollments} />
          <StatCard label="Cadre Profiles" value={stats.pipelineProfiles} />
        </div>
      </section>

      <section id="courses" className="space-y-4">
        <h2 className="text-lg font-bold text-white">Course Module</h2>
        <form onSubmit={submitCourse} className="grid gap-3 md:grid-cols-2 bg-white/5 border border-white/10 rounded-2xl p-4">
          <input className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" placeholder="Course title" value={courseForm.title} onChange={(e) => setCourseForm((prev) => ({ ...prev, title: e.target.value }))} required />
          <input className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" placeholder="slug" value={courseForm.slug} onChange={(e) => setCourseForm((prev) => ({ ...prev, slug: e.target.value }))} required />
          <input className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" placeholder="Curriculum outline" value={courseForm.curriculum_outline} onChange={(e) => setCourseForm((prev) => ({ ...prev, curriculum_outline: e.target.value }))} />
          <select className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" value={courseForm.status} onChange={(e) => setCourseForm((prev) => ({ ...prev, status: e.target.value }))}>
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="ongoing">ongoing</option>
          </select>
          <textarea className="md:col-span-2 px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" rows={3} placeholder="Description" value={courseForm.description} onChange={(e) => setCourseForm((prev) => ({ ...prev, description: e.target.value }))} />
          <div className="md:col-span-2 flex items-center justify-between">
            <p className="text-xs text-slate-300">{courseMessage}</p>
            <button className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold" type="submit">Save Course</button>
          </div>
        </form>
      </section>

      <section id="enrollments" className="space-y-4">
        <h2 className="text-lg font-bold text-white">Enrollment & Completion</h2>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 overflow-x-auto">
          <table className="min-w-full text-sm text-slate-200">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                <th className="py-2 pr-4">Member</th>
                <th className="py-2 pr-4">Course</th>
                <th className="py-2 pr-4">Progress</th>
                <th className="py-2 pr-4">Score</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.slice(0, 12).map((row) => (
                <tr key={row.id} className="border-t border-white/10">
                  <td className="py-2 pr-4">{row.member?.full_name || '—'}</td>
                  <td className="py-2 pr-4">{row.course?.title || '—'}</td>
                  <td className="py-2 pr-4">{row.progress_percent}%</td>
                  <td className="py-2 pr-4">{row.assessment_score}</td>
                  <td className="py-2 pr-4">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="pipeline" className="space-y-4">
        <h2 className="text-lg font-bold text-white">Leadership Pipeline</h2>
        <form onSubmit={submitPipeline} className="grid gap-3 md:grid-cols-3 bg-white/5 border border-white/10 rounded-2xl p-4">
          <input className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" placeholder="Member ID (numeric)" value={pipelineForm.member_id} onChange={(e) => setPipelineForm((prev) => ({ ...prev, member_id: e.target.value }))} required />
          <select className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" value={pipelineForm.competency_level} onChange={(e) => setPipelineForm((prev) => ({ ...prev, competency_level: e.target.value }))}>
            <option value="foundation">foundation</option>
            <option value="intermediate">intermediate</option>
            <option value="advanced">advanced</option>
            <option value="strategic">strategic</option>
          </select>
          <input type="number" min="0" max="100" className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" placeholder="Readiness score" value={pipelineForm.readiness_score} onChange={(e) => setPipelineForm((prev) => ({ ...prev, readiness_score: e.target.value }))} />
          <input className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" placeholder="Mentorship track" value={pipelineForm.mentorship_track} onChange={(e) => setPipelineForm((prev) => ({ ...prev, mentorship_track: e.target.value }))} />
          <input className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" placeholder="Recommended role" value={pipelineForm.recommended_role} onChange={(e) => setPipelineForm((prev) => ({ ...prev, recommended_role: e.target.value }))} />
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input type="checkbox" checked={pipelineForm.eligible_for_promotion} onChange={(e) => setPipelineForm((prev) => ({ ...prev, eligible_for_promotion: e.target.checked }))} />
            Eligible for promotion
          </label>
          <textarea className="md:col-span-3 px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-sm text-white" rows={3} placeholder="Notes" value={pipelineForm.notes} onChange={(e) => setPipelineForm((prev) => ({ ...prev, notes: e.target.value }))} />
          <div className="md:col-span-3 flex items-center justify-between">
            <p className="text-xs text-slate-300">{pipelineMessage}</p>
            <button className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold" type="submit">Save Cadre Profile</button>
          </div>
        </form>
      </section>

      <section id="analytics" className="space-y-4">
        <h2 className="text-lg font-bold text-white">Training Outcomes</h2>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-slate-200">
          <p>Total completion rate: <span className="font-semibold text-white">{analytics?.overview?.completion_rate ?? 0}%</span></p>
          <p className="mt-2">Average assessment score: <span className="font-semibold text-white">{analytics?.overview?.average_assessment_score ?? 0}</span></p>
          <p className="mt-2">Promotion-eligible cadre: <span className="font-semibold text-white">{analytics?.leadership_pipeline?.promotion_eligible ?? 0}</span></p>
        </div>
      </section>
    </div>
  );
};

export default TrainingCadreOperationsDashboard;