import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiUserPlus, FiTrash2, FiShield } from 'react-icons/fi';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import api from '../../../services/api';

const CommitteeDetail = () => {
    const { id } = useParams();
    const [committee, setCommittee] = useState(null);
    const [members, setMembers] = useState([]); // All system members for the dropdown
    const [loading, setLoading] = useState(true);
    
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [form, setForm] = useState({ member_id: '', designation: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const OFFICIAL_ROLES = [
        'President', 'Vice President', 'General Secretary', 'Joint General Secretary',
        'Organizing Secretary', 'Office Secretary', 'Finance Secretary / Treasurer',
        'Publicity Secretary', 'Information & Research Secretary', 'Education Affairs Secretary',
        'Cultural Secretary', 'Social Welfare Secretary', 'Sports Secretary',
        'Legal Affairs Secretary', 'International Affairs Secretary', 
        'Executive Member', 'General Member'
    ];

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [commRes, memRes] = await Promise.all([
                api.get(`/admin/committees/${id}`),
                api.get('/admin/members')
            ]);
            setCommittee(commRes.data.data);
            setMembers(memRes.data.data.data || memRes.data.data || []);
        } catch (error) {
            console.error('Failed to load detail data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await api.post(`/admin/committees/${id}/members`, form);
            setShowAssignModal(false);
            setForm({ member_id: '', designation: '' });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign role. Member mighty already hold this designation.');
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveRole = async (roleId) => {
        if (!window.confirm('Are you sure you want to remove this member from the committee?')) return;
        try {
            await api.delete(`/admin/committees/${id}/roles/${roleId}`);
            fetchData();
        } catch (error) {
            console.error('Failed to remove role', error);
        }
    };

    if (loading) return <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!committee) return <div className="text-center py-32">Committee not found.</div>;

    // Group roles visually
    const activeRoles = committee.roles?.filter(r => r.status === 'active') || [];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <Link to="/dashboard/admin/settings" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors">
                <FiArrowLeft /> Back to Settings
            </Link>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
                            {committee.level}
                        </span>
                        <span className={`px-2 py-1 rounded-md text-xs font-bold leading-none ${committee.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {committee.status}
                        </span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900">{committee.name}</h1>
                    <p className="text-gray-500 font-medium mt-1">Established: {committee.established_date || 'N/A'}</p>
                </div>
                <Button onClick={() => setShowAssignModal(true)} className="gap-2 shadow-lg shadow-primary/20">
                    <FiUserPlus /> Assign Leader
                </Button>
            </div>

            <div className="grid gap-4 mt-8">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FiShield className="text-primary" /> Active Leadership ({activeRoles.length})
                </h3>
                
                {activeRoles.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
                        <p className="text-gray-500">No members have been assigned to this committee yet.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeRoles.map(role => (
                            <div key={role.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleRemoveRole(role.id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-full">
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
                                        {role.member?.photo_path ? (
                                            <img src={`http://localhost:8000/storage/${role.member.photo_path}`} alt={role.member.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">
                                                {role.member?.full_name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 leading-tight">{role.member?.full_name}</h4>
                                        <p className="text-sm text-gray-500 mb-2">{role.member?.member_id}</p>
                                        <div className="inline-block bg-gold/10 border border-gold/30 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
                                            {role.designation}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Assign Modal */}
            <AnimatePresence>
                {showAssignModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold">Assign Designation</h2>
                                <p className="text-sm text-gray-500">Add a member to {committee.name}</p>
                            </div>
                            <form onSubmit={handleAssign} className="p-6 space-y-4">
                                {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">{error}</div>}
                                
                                <Select 
                                    label="Select Member" 
                                    options={[{id: '', name: 'Search member...'}, ...members.map(m => ({ id: m.id, name: `${m.full_name} (${m.member_id})` }))]}
                                    value={form.member_id}
                                    onChange={e => setForm({...form, member_id: e.target.value})}
                                    required
                                />
                                
                                <Select 
                                    label="Official Designation" 
                                    options={[{id: '', name: 'Select role...'}, ...OFFICIAL_ROLES.map(r => ({ id: r, name: r }))]}
                                    value={form.designation}
                                    onChange={e => setForm({...form, designation: e.target.value})}
                                    required
                                />

                                <div className="pt-4 flex justify-end gap-3">
                                    <Button type="button" variant="ghost" onClick={() => setShowAssignModal(false)}>Cancel</Button>
                                    <Button type="submit" isLoading={saving}>Assign Role</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CommitteeDetail;
