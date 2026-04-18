"use client";
import { useEffect, useState } from 'react';
import { IndianRupee, Car, CalendarCheck, ClockAlert } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ revenue: 0, totalBookings: 0, activeRentals: 0, totalVehicles: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/bookings').then(res => res.json()),
      fetch('/api/vehicles').then(res => res.json())
    ]).then(([bookings, vehicles]) => {
      let revenue = 0;
      let activeRentals = 0;
      
      if(Array.isArray(bookings)){
        bookings.forEach(b => {
          if (b.status === 'Completed' || b.status === 'Active') {
            revenue += b.totalPrice || 0;
          }
          if (b.status === 'Active') activeRentals++;
        });
      }

      setStats({
        revenue,
        totalBookings: Array.isArray(bookings) ? bookings.length : 0,
        activeRentals,
        totalVehicles: Array.isArray(vehicles) ? vehicles.length : 0
      });
      setLoading(false);
    });
  }, []);

  const statsCards = [
    { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: IndianRupee, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: CalendarCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Rentals', value: stats.activeRentals, icon: ClockAlert, color: 'text-[#FF6A00]', bg: 'bg-[#FF6A00]/10' },
    { label: 'Total Vehicles', value: stats.totalVehicles, icon: Car, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  if (loading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-8 text-white">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => (
          <div key={i} className="bg-[#111] border border-white/5 p-6 rounded-xl flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
