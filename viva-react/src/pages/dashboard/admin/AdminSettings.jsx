import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';

const AdminSettings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Settings</h1>
        <p className="text-sm text-slate-500 mt-1">System preferences and account controls for administrators.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-800">Account</h2>
          <div className="text-sm space-y-2">
            <p><span className="text-slate-500 inline-block w-28">Email</span>{user?.email ?? '—'}</p>
            <p><span className="text-slate-500 inline-block w-28">Role</span>{user?.user_type ?? 'admin'}</p>
          </div>
          <Button variant="accent" onClick={handleLogout}>Log Out</Button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-800">Security</h2>
          <p className="text-sm text-slate-600">Password rotation, session controls, and advanced admin security options can be added here.</p>
          <Button variant="outline" onClick={() => navigate('/dashboard/admin')}>Back to Dashboard</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
