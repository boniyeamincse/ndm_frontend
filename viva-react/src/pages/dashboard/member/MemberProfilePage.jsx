import React, { useEffect, useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import api from '../../../services/api';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((value) => ({ id: value, name: value }));
const genders = [
  { id: 'male', name: 'Male' },
  { id: 'female', name: 'Female' },
  { id: 'other', name: 'Other' },
];

const profilePayload = (form) => ({
  full_name: form.full_name ?? '',
  father_name: form.father_name ?? '',
  mother_name: form.mother_name ?? '',
  date_of_birth: form.date_of_birth ?? '',
  gender: form.gender ?? '',
  blood_group: form.blood_group ?? '',
  mobile: form.mobile ?? '',
  phone: form.phone ?? '',
  institution: form.institution ?? '',
  department: form.department ?? '',
  session: form.session ?? '',
  present_address: form.present_address ?? '',
  permanent_address: form.permanent_address ?? '',
  division: form.division ?? '',
  district: form.district ?? '',
  upazila: form.upazila ?? '',
  union: form.union ?? '',
  ward: form.ward ?? '',
  emergency_contact_name: form.emergency_contact_name ?? '',
  emergency_contact_phone: form.emergency_contact_phone ?? '',
});

const normalizeProfile = (data) => ({
  ...data,
  date_of_birth: data?.date_of_birth ? String(data.date_of_birth).slice(0, 10) : '',
});

const MemberProfilePage = () => {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/profile');
        setForm(normalizeProfile(res.data.data ?? {}));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: null }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await api.put('/profile', profilePayload(form));
      setForm(normalizeProfile(res.data.data ?? form));
      setMessage('Profile updated successfully.');
      setErrors({});
    } catch (error) {
      setErrors(error.response?.data?.errors ?? {});
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Management</h1>
        <p className="text-sm text-gray-500 mt-1">Update your own profile information. Sensitive fields remain locked.</p>
      </div>

      {form.committee_roles && form.committee_roles.filter(r => r.status === 'active').length > 0 && (
        <div className="flex flex-wrap gap-3 p-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="w-full text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Active Political Roles</div>
          {form.committee_roles.filter(r => r.status === 'active').map(role => (
            <div key={role.id} className="inline-flex items-center gap-2 bg-gradient-to-r from-gold/20 to-gold/10 border border-gold/30 px-4 py-2 rounded-xl">
               <span className="text-yellow-800 font-black text-sm">{role.designation}</span>
               <span className="text-gray-600 text-xs font-semibold px-2 border-l border-gold/30">
                 {role.committee?.name}
               </span>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">Personal Information</h2>
          <Input label="Full Name" name="full_name" value={form.full_name ?? ''} onChange={handleChange} error={errors.full_name?.[0]} />
          <Input label="Father Name" name="father_name" value={form.father_name ?? ''} onChange={handleChange} error={errors.father_name?.[0]} />
          <Input label="Mother Name" name="mother_name" value={form.mother_name ?? ''} onChange={handleChange} error={errors.mother_name?.[0]} />
          <Input label="Date of Birth" type="date" name="date_of_birth" value={form.date_of_birth ?? ''} onChange={handleChange} error={errors.date_of_birth?.[0]} />
          <Select label="Gender" name="gender" value={form.gender ?? ''} onChange={handleChange} options={genders} error={errors.gender?.[0]} />
          <Select label="Blood Group" name="blood_group" value={form.blood_group ?? ''} onChange={handleChange} options={bloodGroups} error={errors.blood_group?.[0]} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">Contact And Academic</h2>
          <Input label="Mobile" name="mobile" value={form.mobile ?? ''} onChange={handleChange} error={errors.mobile?.[0]} />
          <Input label="Phone" name="phone" value={form.phone ?? ''} onChange={handleChange} error={errors.phone?.[0]} />
          <Input label="Institution" name="institution" value={form.institution ?? ''} onChange={handleChange} error={errors.institution?.[0]} />
          <Input label="Department" name="department" value={form.department ?? ''} onChange={handleChange} error={errors.department?.[0]} />
          <Input label="Session" name="session" value={form.session ?? ''} onChange={handleChange} error={errors.session?.[0]} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-800">Political Area</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input label="Division" name="division" value={form.division ?? ''} onChange={handleChange} error={errors.division?.[0]} />
            <Input label="District" name="district" value={form.district ?? ''} onChange={handleChange} error={errors.district?.[0]} />
            <Input label="Upazila" name="upazila" value={form.upazila ?? ''} onChange={handleChange} error={errors.upazila?.[0]} />
            <Input label="Union" name="union" value={form.union ?? ''} onChange={handleChange} error={errors.union?.[0]} />
            <Input label="Ward" name="ward" value={form.ward ?? ''} onChange={handleChange} error={errors.ward?.[0]} />
          </div>
          <p className="text-xs text-gray-500">Set local political area details for committee-level mapping.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-800">Address And Emergency Contact</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Present Address" name="present_address" value={form.present_address ?? ''} onChange={handleChange} error={errors.present_address?.[0]} />
            <Input label="Permanent Address" name="permanent_address" value={form.permanent_address ?? ''} onChange={handleChange} error={errors.permanent_address?.[0]} />
            <Input label="Emergency Contact Name" name="emergency_contact_name" value={form.emergency_contact_name ?? ''} onChange={handleChange} error={errors.emergency_contact_name?.[0]} />
            <Input label="Emergency Contact Phone" name="emergency_contact_phone" value={form.emergency_contact_phone ?? ''} onChange={handleChange} error={errors.emergency_contact_phone?.[0]} />
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
            <p className={`text-sm ${message ? 'text-green-700' : 'text-gray-400'}`}>{message || 'Only your own profile-safe fields can be changed here.'}</p>
            <Button type="submit" isLoading={saving}>Save Changes</Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MemberProfilePage;
