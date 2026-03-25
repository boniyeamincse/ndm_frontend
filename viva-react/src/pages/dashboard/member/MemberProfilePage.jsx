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
				setForm(res.data.data ?? {});
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
			const res = await api.put('/profile', form);
			setForm(res.data.data ?? form);
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
				<h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
				<p className="text-sm text-gray-500 mt-1">Update your personal, academic, and emergency information.</p>
			</div>

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
					<h2 className="text-base font-semibold text-gray-800">Address And Emergency Contact</h2>
					<div className="grid md:grid-cols-2 gap-4">
						<Input label="Present Address" name="present_address" value={form.present_address ?? ''} onChange={handleChange} error={errors.present_address?.[0]} />
						<Input label="Permanent Address" name="permanent_address" value={form.permanent_address ?? ''} onChange={handleChange} error={errors.permanent_address?.[0]} />
						<Input label="Emergency Contact Name" name="emergency_contact_name" value={form.emergency_contact_name ?? ''} onChange={handleChange} error={errors.emergency_contact_name?.[0]} />
						<Input label="Emergency Contact Phone" name="emergency_contact_phone" value={form.emergency_contact_phone ?? ''} onChange={handleChange} error={errors.emergency_contact_phone?.[0]} />
					</div>
					<div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
						<p className={`text-sm ${message ? 'text-green-700' : 'text-gray-400'}`}>{message || 'Only profile-safe fields can be changed here.'}</p>
						<Button type="submit" isLoading={saving}>Save Changes</Button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default MemberProfilePage;
