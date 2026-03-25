import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const CommitteeManagement = () => {
    const [committees, setCommittees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', level: 'central', parent_id: '', status: 'active' });
    const [saving, setSaving] = useState(false);

    const levels = [
        { id: 'central', name: 'Central (National)' },
        { id: 'division', name: 'Division' },
        { id: 'district', name: 'District / Metro' },
        { id: 'upazila', name: 'Upazila / Thana' },
        { id: 'union', name: 'Union / Ward' },
        { id: 'institutional', name: 'Institutional' },
    ];

    useEffect(() => {
        fetchCommittees();
    }, []);

    const fetchCommittees = async () => {
        try {
            const res = await api.get('/admin/committees');
            setCommittees(res.data.data || []);
        } catch (error) {
            console.error('Failed to load committees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/admin/committees', form);
            setShowModal(false);
            setForm({ name: '', level: 'central', parent_id: '', status: 'active' });
            fetchCommittees();
        } catch (error) {
            console.error('Failed to create committee', error);
        } finally {
            setSaving(false);
        }
    };

    const getLevelBadgeColor = (level) => {
        switch (level) {
            case 'central': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'division': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'district': return 'bg-teal-100 text-teal-700 border-teal-200';
            case 'upazila': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Committee Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Organize the 5-tier political hierarchy system.</p>
                </div>
                <Button onClick={() => setShowModal(true)} className="gap-2 shrink-0">
                    + New Committee
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : committees.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">
                        &#128193;
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No Committees Found</h3>
                    <p className="text-gray-500 mt-2 max-w-sm mx-auto">Start building your organizational structure by creating the Central Committee.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {committees.map((committee) => (
                        <div
                            key={committee.id}
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 relative group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getLevelBadgeColor(committee.level)}`}>
                                    {committee.level}
                                </div>
                                <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-gray-50 rounded-lg">&#8942;</button>
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{committee.name}</h3>
                            <p className="text-sm text-gray-500 mb-6 line-clamp-1">
                                {committee.parent ? `Under ${committee.parent.name}` : 'National Level Unit'}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <span className={`text-xs font-medium px-2 py-1 rounded-md ${committee.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {committee.status}
                                </span>
                                <Link to={`/dashboard/admin/settings/committees/${committee.id}`}>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        Manage Members
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold">Create New Committee</h2>
                            <p className="text-sm text-gray-500">Define a new political unit in the hierarchy.</p>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <Input
                                label="Committee Name"
                                placeholder="e.g. Dhaka District North"
                                value={form.name}
                                onChange={e => setForm({...form, name: e.target.value})}
                                required
                            />
                            <Select
                                label="Level"
                                options={levels}
                                value={form.level}
                                onChange={e => setForm({...form, level: e.target.value})}
                            />
                            {form.level !== 'central' && (
                                <Select
                                    label="Parent Committee"
                                    options={[{id: '', name: 'Select Parent...'}, ...committees.map(c => ({ id: c.id, name: c.name }))]}
                                    value={form.parent_id}
                                    onChange={e => setForm({...form, parent_id: e.target.value})}
                                />
                            )}
                            <div className="pt-4 flex justify-end gap-3">
                                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit" isLoading={saving}>Create Unit</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommitteeManagement;
