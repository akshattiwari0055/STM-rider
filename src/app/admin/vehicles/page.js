"use client";
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, CheckCircle, XCircle, Wrench, RefreshCw, AlertTriangle, RotateCcw } from 'lucide-react';

const STATUS_CONFIG = {
  Available: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle },
  Busy: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: XCircle },
  'Under Maintenance': { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: Wrench },
};

const defaultTiers = {
  Car: [{ hours: 5, price: '' }, { hours: 12, price: '' }, { hours: 24, price: '' }],
  Bike: [{ hours: 3, price: '' }, { hours: 12, price: '' }, { hours: 24, price: '' }],
  Scooty: [{ hours: 3, price: '' }, { hours: 12, price: '' }, { hours: 24, price: '' }],
};

const emptyForm = {
  name: '', type: 'Car', image: '', status: 'Available',
  t1: '', t2: '', t3: '',   // tier prices for hours 1,2,3
};

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  // tieredPricing for the current form vehicle type
  const [tiers, setTiers] = useState(defaultTiers.Car);

  const fetchVehicles = () => {
    setLoading(true);
    fetch('/api/vehicles')
      .then(r => r.json())
      .then(data => { setVehicles(Array.isArray(data) ? data : []); setLoading(false); });
  };

  useEffect(() => fetchVehicles(), []);

  // Keep tiers in sync with form type selection when adding new vehicle
  useEffect(() => {
    if (!editingId) {
      setTiers(defaultTiers[formData.type].map(t => ({ ...t, price: '' })));
    }
  }, [formData.type, editingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all tier prices filled
    if (tiers.some(t => !t.price || isNaN(Number(t.price)))) {
      alert('Please fill in all pricing tiers.');
      return;
    }

    const tieredPricing = tiers.map(t => ({ hours: t.hours, price: Number(t.price) }));
    const minPrice = Math.min(...tieredPricing.map(t => t.price));

    const payload = {
      name: formData.name,
      type: formData.type,
      image: formData.image,
      status: formData.status,
      pricePerDay: minPrice,
      tieredPricing,
    };

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/vehicles/${editingId}` : '/api/vehicles';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

    setShowModal(false);
    fetchVehicles();
  };

  const handleDelete = async (id) => {
    if (confirm('Permanently delete this vehicle?')) {
      await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      fetchVehicles();
    }
  };

  const handleStatusToggle = async (vehicle, newStatus) => {
    setTogglingId(vehicle._id);
    await fetch(`/api/vehicles/${vehicle._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setTogglingId(null);
    fetchVehicles();
  };

  const handleResetAll = async () => {
    if (!confirm('This will mark ALL vehicles as Available and complete all active bookings. Continue?')) return;
    setResetting(true);
    const res = await fetch('/api/admin/reset-vehicles', { method: 'POST' });
    const data = await res.json();
    setResetting(false);
    if (res.ok) {
      alert(`✅ Reset complete. ${data.vehiclesReset} vehicles set to Available.`);
      fetchVehicles();
    } else {
      alert(`Error: ${data.error}`);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setFormData({ ...emptyForm });
    setTiers(defaultTiers.Car.map(t => ({ ...t, price: '' })));
    setShowModal(true);
  };

  const openEdit = (v) => {
    setEditingId(v._id);
    setFormData({ name: v.name, type: v.type, image: v.image, status: v.status });
    // Populate tier prices from existing vehicle
    const existingTiers = (v.tieredPricing && v.tieredPricing.length > 0)
      ? v.tieredPricing.map(t => ({ hours: t.hours, price: String(t.price) }))
      : defaultTiers[v.type]?.map(t => ({ ...t, price: '' })) || [];
    setTiers(existingTiers);
    setShowModal(true);
  };

  const updateTierPrice = (index, value) => {
    setTiers(prev => prev.map((t, i) => i === index ? { ...t, price: value } : t));
  };

  const busyCount = vehicles.filter(v => v.status === 'Busy').length;
  const maintCount = vehicles.filter(v => v.status === 'Under Maintenance').length;

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Vehicles</h1>
          <p className="text-gray-500 text-sm mt-1">
            {vehicles.length} total · <span className="text-emerald-400">{vehicles.filter(v => v.status === 'Available').length} available</span>
            {busyCount > 0 && <> · <span className="text-red-400">{busyCount} busy</span></>}
            {maintCount > 0 && <> · <span className="text-yellow-400">{maintCount} maintenance</span></>}
          </p>
        </div>
        <div className="flex gap-3">
          {(busyCount > 0 || maintCount > 0) && (
            <button
              onClick={handleResetAll}
              disabled={resetting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-colors text-sm font-semibold disabled:opacity-50"
            >
              {resetting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Reset All to Available
            </button>
          )}
          <button onClick={openAdd} className="bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:opacity-90 transition-opacity">
            <Plus size={18} /> Add Vehicle
          </button>
        </div>
      </div>

      {/* Vehicles table */}
      <div className="bg-[#111] border border-white/5 rounded-xl overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-[#1a1a1a] text-gray-400 text-xs uppercase tracking-wider border-b border-white/5">
            <tr>
              <th className="p-4">Vehicle</th>
              <th className="p-4">Type</th>
              <th className="p-4">Pricing</th>
              <th className="p-4">Status</th>
              <th className="p-4">Change Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : vehicles.map(v => {
              const cfg = STATUS_CONFIG[v.status] || STATUS_CONFIG.Available;
              const Icon = cfg.icon;
              const isToggling = togglingId === v._id;

              return (
                <tr key={v._id} className="hover:bg-white/3 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={v.image} alt={v.name} className="w-16 h-11 object-cover rounded-lg flex-shrink-0" />
                      <span className="font-semibold text-white text-sm">{v.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{v.type}</td>
                  <td className="p-4">
                    {v.tieredPricing?.length > 0 ? (
                      <div className="space-y-0.5">
                        {v.tieredPricing.map(tier => (
                          <div key={tier.hours} className="flex gap-2 text-xs">
                            <span className="text-gray-500">{tier.hours}h</span>
                            <span className="text-white font-medium">₹{tier.price?.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs">₹{v.pricePerDay}/day</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
                      <Icon className="w-3 h-3" />{v.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {(['Available', 'Busy', 'Under Maintenance']).filter(s => s !== v.status).map(s => {
                        const c = STATUS_CONFIG[s];
                        const SI = c.icon;
                        return (
                          <button
                            key={s}
                            onClick={() => handleStatusToggle(v, s)}
                            disabled={isToggling}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold border transition-colors disabled:opacity-40 ${c.bg} ${c.color} hover:opacity-80`}
                          >
                            {isToggling ? <RefreshCw className="w-3 h-3 animate-spin" /> : <SI className="w-3 h-3" />}
                            {s === 'Available' ? 'Available' : s === 'Busy' ? 'Busy' : 'Maint.'}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(v)} className="text-blue-400 hover:text-blue-300 transition-colors" title="Edit vehicle">
                        <Edit2 size={17} />
                      </button>
                      <button onClick={() => handleDelete(v._id)} className="text-red-400 hover:text-red-300 transition-colors" title="Delete vehicle">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] p-6 rounded-2xl w-full max-w-lg border border-white/10 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-white">{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Vehicle Name</label>
                <input required type="text" value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#FFB300]"
                  placeholder="e.g. Honda Activa 7G"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Vehicle Type</label>
                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#FFB300]">
                  <option>Car</option><option>Bike</option><option>Scooty</option>
                </select>
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Image Path</label>
                <input required type="text" value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#FFB300]"
                  placeholder="/images/vehicle_name.png"
                />
              </div>

              {/* Tiered Pricing */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Rental Pricing <span className="text-gray-600">(₹ per duration)</span>
                </label>
                <div className="space-y-2">
                  {tiers.map((tier, i) => (
                    <div key={tier.hours} className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-lg px-4 py-2">
                      <span className="text-gray-400 text-sm w-20 flex-shrink-0">{tier.hours} hours</span>
                      <span className="text-gray-600">₹</span>
                      <input
                        type="number" required min="1"
                        value={tier.price}
                        onChange={e => updateTierPrice(i, e.target.value)}
                        className="flex-1 bg-transparent text-white focus:outline-none text-sm"
                        placeholder="Enter price"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Initial Status</label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#FFB300]">
                  <option>Available</option><option>Busy</option><option>Under Maintenance</option>
                </select>
              </div>

              {/* Warning if editing a busy vehicle */}
              {editingId && vehicles.find(v => v._id === editingId)?.status === 'Busy' && (
                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  This vehicle is currently Busy (active booking). Changing prices will apply to future bookings only.
                </div>
              )}

              <button type="submit" className="w-full bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black py-3 rounded-xl font-bold hover:opacity-90 transition-opacity mt-2">
                {editingId ? 'Save Changes' : 'Add Vehicle'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
