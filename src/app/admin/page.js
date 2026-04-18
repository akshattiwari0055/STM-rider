"use client";
import { useEffect, useState } from 'react';
import { IndianRupee, Car, CalendarCheck, ClockAlert, TrendingUp, Calendar, CalendarDays } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ 
    revenue: 0, 
    totalBookings: 0, 
    activeRentals: 0, 
    totalVehicles: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    yearRevenue: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/bookings').then(res => res.json()),
      fetch('/api/vehicles').then(res => res.json())
    ]).then(([bookings, vehicles]) => {
      let revenue = 0;
      let activeRentals = 0;
      
      let weekRev = 0;
      let monthRev = 0;
      let yearRev = 0;

      const now = new Date();
      const thisYear = now.getFullYear();
      const thisMonth = now.getMonth();

      const monthMap = { 0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0 };
      const yearMap = {};
      
      if(Array.isArray(bookings)){
        bookings.forEach(b => {
          if (b.status === 'Completed' || b.status === 'Active' || b.status === 'Pending') {
            const price = b.totalPrice || 0;
            revenue += price;
            
            // Assume booking date is roughly when they pay, or use startDate
            const bDate = new Date(b.createdAt || b.startDate);
            
            // Difference in days
            const diffTime = Math.abs(now - bDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Financial trackers
            if (diffDays <= 7) weekRev += price;
            if (bDate.getMonth() === thisMonth && bDate.getFullYear() === thisYear) monthRev += price;
            if (bDate.getFullYear() === thisYear) yearRev += price;

            // Monthly breakdown (for current year only)
            if (bDate.getFullYear() === thisYear) {
               monthMap[bDate.getMonth()] += price;
            }

            // Yearly breakdown
            const yr = bDate.getFullYear();
            if (!yearMap[yr]) yearMap[yr] = 0;
            yearMap[yr] += price;
          }
          if (b.status === 'Active') activeRentals++;
        });
      }

      const mLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const mDataArray = Object.keys(monthMap).map(k => ({
        name: mLabels[k],
        Revenue: monthMap[k]
      }));

      const yDataArray = Object.keys(yearMap).sort().map(k => ({
        name: k.toString(),
        Revenue: yearMap[k]
      }));

      // Add a dummy previous year if we only have the current year, to make the chart look like a progression
      if (yDataArray.length === 1) {
         yDataArray.unshift({ name: (parseInt(yDataArray[0].name)-1).toString(), Revenue: 0 });
      } else if (yDataArray.length === 0) {
         yDataArray.push({ name: thisYear.toString(), Revenue: 0 });
         yDataArray.unshift({ name: (thisYear - 1).toString(), Revenue: 0 });
      }

      setMonthlyData(mDataArray);
      setYearlyData(yDataArray);

      setStats({
        revenue,
        totalBookings: Array.isArray(bookings) ? bookings.length : 0,
        activeRentals,
        totalVehicles: Array.isArray(vehicles) ? vehicles.length : 0,
        weekRevenue: weekRev,
        monthRevenue: monthRev,
        yearRevenue: yearRev
      });
      setLoading(false);
    });
  }, []);

  const topCards = [
    { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: CalendarCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Rentals', value: stats.activeRentals, icon: ClockAlert, color: 'text-[#FF6A00]', bg: 'bg-[#FF6A00]/10' },
    { label: 'Total Vehicles', value: stats.totalVehicles, icon: Car, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const trackerCards = [
    { label: 'Past 7 Days Earnings', value: `₹${stats.weekRevenue.toLocaleString('en-IN')}`, icon: TrendingUp },
    { label: 'Current Month Earnings', value: `₹${stats.monthRevenue.toLocaleString('en-IN')}`, icon: CalendarDays },
    { label: 'Current Year Earnings', value: `₹${stats.yearRevenue.toLocaleString('en-IN')}`, icon: Calendar },
  ];

  if (loading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-8 text-white">Dashboard Overview</h1>
      
      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {topCards.map((stat, i) => (
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

      {/* Financial Trackers */}
      <h2 className="text-xl font-bold mb-4 text-white">Profit & Expense Tracker</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {trackerCards.map((tr, i) => (
          <div key={i} className="bg-[#1a1a1a] border border-white/5 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <tr.icon size={100} />
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FFB300]/10 text-[#FFB300]">
              <tr.icon size={20} />
            </div>
            <div className="z-10">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1 mt-1">{tr.label}</p>
              <h3 className="text-2xl font-black text-white">{tr.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Monthly Bar Chart */}
        <div className="bg-[#111] border border-white/5 p-6 rounded-xl">
          <h2 className="text-lg font-bold text-white mb-6">Monthly Revenue ({new Date().getFullYear()})</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val>=1000 ? (val/1000)+'k' : val}`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#FFB300', fontWeight: 'bold' }}
                />
                <Bar dataKey="Revenue" fill="#FFB300" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Yearly Area Chart */}
        <div className="bg-[#111] border border-white/5 p-6 rounded-xl">
          <h2 className="text-lg font-bold text-white mb-6">Year-over-Year Growth</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val>=1000 ? (val/1000)+'k' : val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="Revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
