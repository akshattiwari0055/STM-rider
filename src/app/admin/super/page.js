"use client";

import { useState, useEffect } from 'react';
import { Shield, Mail, CheckCircle2, Trash2, Loader2, AlertCircle } from 'lucide-react';

export default function SuperAdminPortal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/users?role=admin');
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: `Invite sent to ${email} successfully!` });
        setEmail('');
        setPassword('');
        fetchAdmins();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send invite.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (id) => {
    if (!confirm('Are you sure you want to revoke admin access for this user?')) return;
    
    try {
      const res = await fetch('/api/admin/users/' + id + '/revoke', {
        method: 'POST',
      });
      if (res.ok) {
        fetchAdmins();
      } else {
        alert('Failed to revoke access.');
      }
    } catch (error) {
      alert('Error revoking access.');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10 flex items-center gap-4 border-b border-white/10 pb-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
          <Shield className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">Super Admin Portal</h1>
          <p className="text-gray-400 mt-1">Manage platform administrators and grant access.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Invite Form */}
        <div className="bg-[#111] border border-white/5 p-6 rounded-2xl h-fit">
          <h2 className="text-xl font-bold text-white mb-4">Grant Admin Access</h2>
          <p className="text-sm text-gray-400 mb-6">
            Enter the email address of the person you want to make an administrator. They will receive an email with a secure link to claim their admin role.
          </p>

          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Initial Password (Optional)</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set temporary/initial password"
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                minLength={6}
              />
              <p className="text-[10px] text-gray-500 mt-1">If set, the admin is pre-registered and can log in instantly. If blank, they will sign up on accept.</p>
            </div>

            {message && (
              <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {message.text}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
              Send Access Link
            </button>
          </form>
        </div>

        {/* Current Admins List */}
        <div className="bg-[#111] border border-white/5 p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Current Administrators</h2>
          
          {fetching ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No other admins found.
            </div>
          ) : (
            <div className="space-y-4">
              {admins.map((admin) => (
                <div key={admin._id} className="bg-black border border-white/5 p-4 rounded-xl flex items-center justify-between group">
                  <div>
                    <p className="font-bold text-white">{admin.name}</p>
                    <p className="text-sm text-gray-400">{admin.email}</p>
                  </div>
                  {admin.email !== 'akshattiwari6939@gmail.com' && (
                    <button 
                      onClick={() => handleRemoveAdmin(admin._id)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Revoke Access"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
