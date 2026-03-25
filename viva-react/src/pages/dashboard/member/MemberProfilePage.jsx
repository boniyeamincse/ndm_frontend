import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';

const TABS = [
  { key: 'overview', label: 'Profile Overview' },
  { key: 'edit', label: 'Edit Profile' },
  { key: 'password', label: 'Change Password' },
  { key: 'photo', label: 'Profile Photo' },
  { key: 'positions', label: 'My Positions' },
  { key: 'activity', label: 'Activity Log' },
];

const EDITABLE_FIELDS = [
  'father_name',
  'mother_name',
  'phone',
  'present_address',
  'permanent_address',
  'institution',
  'department',
  'session',
];

const statusClass = (status) => {
  if (status === 'active') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (status === 'suspended') return 'bg-orange-50 text-orange-700 border-orange-200';
  if (status === 'expelled') return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
};

const info = (value) => (value === null || value === undefined || value === '' ? '—' : value);

const MemberProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const initialTab = TABS.some((item) => item.key === requestedTab) ? requestedTab : 'overview';

  const [tab, setTab] = useState(initialTab);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasMemberProfile, setHasMemberProfile] = useState(true);

  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editMessage, setEditMessage] = useState('');

  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [photoSaving, setPhotoSaving] = useState(false);

  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityLoaded, setActivityLoaded] = useState(false);

  const API_BASE = (import.meta.env.VITE_API_URL || '').replace('/api', '');

  const normalizeProfile = (data) => ({
    ...data,
    date_of_birth: data?.date_of_birth ? String(data.date_of_birth).slice(0, 10) : '',
    positions: data?.positions ?? [],
  });

  useEffect(() => {
    const nextTab = TABS.some((item) => item.key === requestedTab) ? requestedTab : 'overview';
    setTab(nextTab);
  }, [requestedTab]);

  const goToTab = (nextTab) => {
    setTab(nextTab);
    setSearchParams(nextTab === 'overview' ? {} : { tab: nextTab });
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/profile');
      const next = normalizeProfile(res.data.data ?? {});
      setHasMemberProfile(true);
      setProfile(next);
      setEditForm(Object.fromEntries(EDITABLE_FIELDS.map((k) => [k, next[k] ?? ''])));
      return;
    } catch (error) {
      if (error.response?.status !== 404) throw error;
    }

    const me = await api.get('/auth/me');
    const fallbackUser = me.data?.data ?? {};
    const member = fallbackUser.member ?? null;
    const next = normalizeProfile(member ?? {
      full_name: fallbackUser.name ?? fallbackUser.email ?? 'User',
      email: fallbackUser.email ?? '',
      member_id: '',
      status: fallbackUser.user_type ?? 'user',
      photo_path: null,
      institution: '',
      department: '',
      session: '',
      present_address: '',
      permanent_address: '',
      phone: '',
      mobile: '',
      positions: [],
      organizational_unit: null,
    });

    setHasMemberProfile(Boolean(member));
    setProfile(next);
    setEditForm(Object.fromEntries(EDITABLE_FIELDS.map((k) => [k, next[k] ?? ''])));
  };

  useEffect(() => {
    const load = async () => {
      try {
        await refreshProfile();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (tab !== 'activity' || activityLoaded) return;
    const loadActivity = async () => {
      setActivityLoading(true);
      try {
        const res = await api.get('/profile/activity');
        setActivity(res.data?.data?.data ?? []);
        setActivityLoaded(true);
      } finally {
        setActivityLoading(false);
      }
    };
    loadActivity();
  }, [tab, activityLoaded]);

  const photoUrl = photoPreview || (profile?.photo_path ? `${API_BASE}/storage/${profile.photo_path}` : '');
  const positions = profile?.positions ?? [];
  const activePosition = positions.find((p) => p.is_active);
  const pastPositions = positions.filter((p) => !p.is_active);

  const completionPct = useMemo(() => {
    if (!profile) return 0;
    const keys = [
      'full_name', 'member_id', 'email', 'mobile', 'institution', 'department', 'session',
      'date_of_birth', 'gender', 'blood_group', 'present_address', 'permanent_address',
    ];
    const filled = keys.filter((k) => profile?.[k]).length;
    return Math.round((filled / keys.length) * 100);
  }, [profile]);

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!profile) return;
    setEditSaving(true);
    setEditMessage('');
    setEditErrors({});

    const payload = {
      full_name: profile.full_name ?? '',
      father_name: editForm.father_name ?? '',
      mother_name: editForm.mother_name ?? '',
      date_of_birth: profile.date_of_birth ?? '',
      gender: profile.gender ?? '',
      blood_group: profile.blood_group ?? '',
      mobile: profile.mobile ?? '',
      phone: editForm.phone ?? '',
      institution: editForm.institution ?? '',
      department: editForm.department ?? '',
      session: editForm.session ?? '',
      present_address: editForm.present_address ?? '',
      permanent_address: editForm.permanent_address ?? '',
      division: profile.division ?? '',
      district: profile.district ?? '',
      upazila: profile.upazila ?? '',
      union: profile.union ?? '',
      ward: profile.ward ?? '',
      emergency_contact_name: profile.emergency_contact_name ?? '',
      emergency_contact_phone: profile.emergency_contact_phone ?? '',
    };

    try {
      await api.put('/profile', payload);
      await refreshProfile();
      setEditMessage('Profile updated successfully.');
    } catch (error) {
      setEditErrors(error.response?.data?.errors ?? {});
    } finally {
      setEditSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordSaving(true);
    setPasswordErrors({});
    setPasswordMessage('');
    try {
      await api.put('/profile/password', passwordForm);
      setPasswordMessage('Password changed successfully.');
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (error) {
      setPasswordErrors(error.response?.data?.errors ?? {});
    } finally {
      setPasswordSaving(false);
    }
  };

  const handlePhotoPick = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('Only JPG, PNG, or WEBP files are allowed.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('Image must be under 2MB.');
      return;
    }

    setPhotoError('');
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    setPhotoSaving(true);
    setPhotoError('');
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      await api.post('/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPhotoFile(null);
      setPhotoPreview('');
      await refreshProfile();
    } catch (error) {
      setPhotoError(error.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setPhotoSaving(false);
    }
  };

  const handlePhotoRemove = async () => {
    setPhotoSaving(true);
    setPhotoError('');
    try {
      await api.delete('/profile/photo');
      setPhotoFile(null);
      setPhotoPreview('');
      await refreshProfile();
    } catch (error) {
      setPhotoError(error.response?.data?.message || 'Failed to remove photo.');
    } finally {
      setPhotoSaving(false);
    }
  };

  const handleIdCardDownload = async () => {
    if (!hasMemberProfile) return;
    const res = await api.get('/id-card', { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile?.member_id || 'member'}_id_card.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 grid lg:grid-cols-[320px_1fr] gap-6">

      <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit space-y-5">
        <div className="flex flex-col items-center text-center">
          {photoUrl ? (
            <img src={photoUrl} alt="Profile" className="w-28 h-28 rounded-full object-cover border border-gray-200" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-3xl font-bold">
              {profile?.full_name?.[0] ?? '?'}
            </div>
          )}
          <h1 className="mt-4 text-lg font-bold text-slate-900">{info(profile?.full_name)}</h1>
          <p className="text-sm text-slate-500">{info(profile?.member_id || profile?.email)}</p>
          <span className={`mt-3 inline-flex px-3 py-1 rounded-full text-xs border font-semibold capitalize ${statusClass(profile?.status)}`}>
            {info(profile?.status)}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Profile Completion</span>
            <span>{completionPct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${completionPct}%` }} />
          </div>
        </div>

        <div className="space-y-2">
          <Button className="w-full" onClick={handleIdCardDownload} disabled={!hasMemberProfile}>Download ID Card</Button>
          {hasMemberProfile && profile?.member_id && (
            <a
              href={`/members/${profile.member_id}`}
              target="_blank"
              rel="noreferrer"
              className="block text-center w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
            >
              Public Profile Link
            </a>
          )}
        </div>

        <div className="text-xs text-slate-500 border-t border-gray-100 pt-3">
          {hasMemberProfile
            ? <>Members can edit only allowed fields in <b>Edit Profile</b>. Sensitive fields are read-only.</>
            : <>This account is not linked to a full member profile, so only account-safe information is available here.</>
          }
        </div>
      </aside>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="flex flex-wrap gap-2">
          {TABS.map((item) => (
            <button
              key={item.key}
              onClick={() => goToTab(item.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === item.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Basic Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-slate-500 inline-block w-28">Full Name</span>{info(profile?.full_name)}</p>
                <p><span className="text-slate-500 inline-block w-28">Member ID</span>{info(profile?.member_id)}</p>
                <p><span className="text-slate-500 inline-block w-28">Email</span>{info(profile?.email)}</p>
                <p><span className="text-slate-500 inline-block w-28">Phone</span>{info(profile?.phone || profile?.mobile)}</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Academic Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-slate-500 inline-block w-28">Institution</span>{info(profile?.institution)}</p>
                <p><span className="text-slate-500 inline-block w-28">Department</span>{info(profile?.department)}</p>
                <p><span className="text-slate-500 inline-block w-28">Session</span>{info(profile?.session)}</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Personal Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-slate-500 inline-block w-28">Date of Birth</span>{info(profile?.date_of_birth)}</p>
                <p><span className="text-slate-500 inline-block w-28">Gender</span>{info(profile?.gender)}</p>
                <p><span className="text-slate-500 inline-block w-28">Blood Group</span>{info(profile?.blood_group)}</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Address</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-slate-500 inline-block w-32">Present</span>{info(profile?.present_address)}</p>
                <p><span className="text-slate-500 inline-block w-32">Permanent</span>{info(profile?.permanent_address)}</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 md:col-span-2">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Organizational Info</h3>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <p><span className="text-slate-500 inline-block w-32">Assigned Unit</span>{info(profile?.organizational_unit?.name)}</p>
                <p><span className="text-slate-500 inline-block w-32">Current Position</span>{info(activePosition?.role?.name)}</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'edit' && (
          !hasMemberProfile ? (
            <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-600 bg-slate-50">
              This account has no member profile record attached, so CV-style profile fields cannot be edited here.
            </div>
          ) : (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Father Name" name="father_name" value={editForm.father_name ?? ''} onChange={(e) => setEditForm((s) => ({ ...s, father_name: e.target.value }))} error={editErrors.father_name?.[0]} />
              <Input label="Mother Name" name="mother_name" value={editForm.mother_name ?? ''} onChange={(e) => setEditForm((s) => ({ ...s, mother_name: e.target.value }))} error={editErrors.mother_name?.[0]} />
              <Input label="Phone" name="phone" value={editForm.phone ?? ''} onChange={(e) => setEditForm((s) => ({ ...s, phone: e.target.value }))} error={editErrors.phone?.[0]} />
              <Input label="Institution" name="institution" value={editForm.institution ?? ''} onChange={(e) => setEditForm((s) => ({ ...s, institution: e.target.value }))} error={editErrors.institution?.[0]} />
              <Input label="Department" name="department" value={editForm.department ?? ''} onChange={(e) => setEditForm((s) => ({ ...s, department: e.target.value }))} error={editErrors.department?.[0]} />
              <Input label="Session" name="session" value={editForm.session ?? ''} onChange={(e) => setEditForm((s) => ({ ...s, session: e.target.value }))} error={editErrors.session?.[0]} />
              <Input label="Present Address" name="present_address" value={editForm.present_address ?? ''} onChange={(e) => setEditForm((s) => ({ ...s, present_address: e.target.value }))} error={editErrors.present_address?.[0]} />
              <Input label="Permanent Address" name="permanent_address" value={editForm.permanent_address ?? ''} onChange={(e) => setEditForm((s) => ({ ...s, permanent_address: e.target.value }))} error={editErrors.permanent_address?.[0]} />
            </div>

            <div className="grid md:grid-cols-3 gap-4 pt-1">
              <Input label="Member ID (Locked)" value={profile?.member_id ?? ''} disabled />
              <Input label="Status (Locked)" value={profile?.status ?? ''} disabled />
              <Input label="Role/Position (Locked)" value={activePosition?.role?.name ?? '—'} disabled />
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <p className={`text-sm ${editMessage ? 'text-emerald-700' : 'text-slate-500'}`}>{editMessage || 'Editable fields are limited by backend rules.'}</p>
              <Button type="submit" isLoading={editSaving}>Save Profile</Button>
            </div>
          </form>
          )
        )}

        {tab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="max-w-xl space-y-4">
            <Input type="password" label="Current Password" value={passwordForm.current_password} onChange={(e) => setPasswordForm((s) => ({ ...s, current_password: e.target.value }))} error={passwordErrors.current_password?.[0]} />
            <Input type="password" label="New Password" value={passwordForm.new_password} onChange={(e) => setPasswordForm((s) => ({ ...s, new_password: e.target.value }))} error={passwordErrors.new_password?.[0]} />
            <Input type="password" label="Confirm Password" value={passwordForm.new_password_confirmation} onChange={(e) => setPasswordForm((s) => ({ ...s, new_password_confirmation: e.target.value }))} error={passwordErrors.new_password_confirmation?.[0]} />
            <div className="flex items-center justify-between">
              <p className={`text-sm ${passwordMessage ? 'text-emerald-700' : 'text-slate-500'}`}>{passwordMessage || 'Use a strong password with at least 8 characters.'}</p>
              <Button type="submit" isLoading={passwordSaving}>Change Password</Button>
            </div>
          </form>
        )}

        {tab === 'photo' && (
          !hasMemberProfile ? (
            <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-600 bg-slate-50">
              Photo management is available only for accounts linked to a member profile.
            </div>
          ) : (
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-5">
              {photoUrl ? (
                <img src={photoUrl} alt="Preview" className="w-24 h-24 rounded-full object-cover border border-gray-200" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">No Photo</div>
              )}
              <div className="text-sm text-slate-600">
                <p>Constraints:</p>
                <ul className="list-disc ml-5 mt-1">
                  <li>JPG / PNG / WEBP only</li>
                  <li>Max size 2MB</li>
                </ul>
              </div>
            </div>

            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoPick} className="block text-sm" />
            {photoError && <p className="text-sm text-red-600">{photoError}</p>}

            <div className="flex flex-wrap gap-3">
              <Button onClick={handlePhotoUpload} isLoading={photoSaving} disabled={!photoFile}>Upload / Replace</Button>
              <Button variant="outline" onClick={handlePhotoRemove} isLoading={photoSaving}>Remove Photo</Button>
            </div>
          </div>
          )
        )}

        {tab === 'positions' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 p-4 bg-emerald-50/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Active Position</p>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{activePosition?.role?.name || 'No active position'}</h3>
              <p className="text-sm text-slate-600">{activePosition?.organizational_unit?.name || '—'}</p>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs uppercase tracking-wide text-slate-500">Role</th>
                    <th className="text-left px-4 py-2.5 text-xs uppercase tracking-wide text-slate-500">Unit</th>
                    <th className="text-left px-4 py-2.5 text-xs uppercase tracking-wide text-slate-500">Assigned Date</th>
                    <th className="text-left px-4 py-2.5 text-xs uppercase tracking-wide text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => (
                    <tr key={pos.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-4 py-2.5">{info(pos.role?.name)}</td>
                      <td className="px-4 py-2.5">{info(pos.organizational_unit?.name)}</td>
                      <td className="px-4 py-2.5">{pos.assigned_at ? new Date(pos.assigned_at).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${pos.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {pos.is_active ? 'Active' : 'Relieved'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {positions.length === 0 && <div className="p-6 text-center text-sm text-slate-500">No position history available.</div>}
            </div>

            {pastPositions.length > 0 && (
              <p className="text-xs text-slate-500">Past Positions: {pastPositions.length}</p>
            )}
          </div>
        )}

        {tab === 'activity' && (
          <div className="space-y-3">
            {activityLoading && <p className="text-sm text-slate-500">Loading activity…</p>}
            {!activityLoading && activity.length === 0 && (
              <div className="rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500">No activity found yet.</div>
            )}
            {activity.map((log) => (
              <div key={log.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                  <p className="text-sm font-semibold text-slate-800">{log.action?.replaceAll('.', ' ')}</p>
                  <p className="text-xs text-slate-500">{log.performed_at ? new Date(log.performed_at).toLocaleString() : '—'}</p>
                </div>
                <p className="text-xs text-slate-500 mt-2">IP: {info(log.ip_address)} · Device: {info(log.user_agent)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MemberProfilePage;
