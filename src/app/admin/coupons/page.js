"use client";

import { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Power } from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [usageLimit, setUsageLimit] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons');
      if (res.ok) setCoupons(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code || !discountPercentage || !usageLimit) return alert('Please fill all fields');
    
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, discountPercentage, usageLimit })
    });
    
    if (res.ok) {
      setCode(''); setDiscountPercentage(''); setUsageLimit('');
      fetchCoupons();
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to create coupon');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    await fetch(`/api/admin/coupons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentStatus })
    });
    fetchCoupons();
  };

  const deleteCoupon = async (id) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
    fetchCoupons();
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Tag className="w-8 h-8 text-[#FFB300]" />
        <h1 className="text-3xl font-black text-white">Coupon Management</h1>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/10 mb-8 max-w-3xl">
        <h2 className="text-xl font-bold text-white mb-4">Create New Coupon</h2>
        <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Code</label>
            <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-[#FFB300] outline-none" placeholder="e.g. SUMMER10" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Discount (%)</label>
            <input type="number" min="1" max="100" value={discountPercentage} onChange={e => setDiscountPercentage(e.target.value)} required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-[#FFB300] outline-none" placeholder="10" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Usage Limit</label>
            <input type="number" min="1" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-[#FFB300] outline-none" placeholder="Count, e.g. 3" />
          </div>
          <button type="submit" className="bg-[#FFB300] text-black font-bold px-6 py-2 rounded-xl hover:opacity-90 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Create
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map(coupon => (
          <div key={coupon._id} className="glass p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full ${coupon.isActive ? 'bg-[#FFB300]' : 'bg-red-500'}`} />
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-mono text-2xl font-black tracking-widest text-[#FFB300]">{coupon.code}</p>
                <p className="text-gray-400 text-sm mt-1">{coupon.discountPercentage}% OFF</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${coupon.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'}`}>
                {coupon.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="h-2 w-full bg-white/5 rounded-full mb-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" 
                style={{ width: `${Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mb-4">{coupon.usedCount} / {coupon.usageLimit} uses</p>

            <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
              <button onClick={() => toggleActive(coupon._id, coupon.isActive)} title={coupon.isActive ? "Deactivate" : "Activate"}
                className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${coupon.isActive ? 'text-red-400' : 'text-green-400'}`}>
                <Power className="w-4 h-4" />
              </button>
              <button onClick={() => deleteCoupon(coupon._id)} title="Delete Coupon"
                className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {coupons.length === 0 && <p className="text-gray-500 col-span-3">No coupons created yet.</p>}
      </div>
    </div>
  );
}
