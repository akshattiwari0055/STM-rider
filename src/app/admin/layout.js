"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CarFront, FileText, LogOut } from 'lucide-react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col md:flex-row text-white font-sans">
      <aside className="w-full md:w-64 bg-[#111] border-b md:border-b-0 md:border-r border-white/10 shrink-0">
        <div className="p-6">
          <Link href="/admin" className="text-xl font-bold tracking-widest text-white uppercase block">
            <span className="text-[#FFB300]">Yellow</span> Hut<br />
            <span className="text-xs text-gray-500 tracking-normal">Admin Panel</span>
          </Link>
        </div>
        <nav className="px-4 pb-6 space-y-1">
          <Link href="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin' ? 'bg-[#FF6A00]/10 text-[#FFB300]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/admin/vehicles" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname.includes('/admin/vehicles') ? 'bg-[#FF6A00]/10 text-[#FFB300]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <CarFront size={18} /> Vehicles
          </Link>
          <Link href="/admin/bookings" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname.includes('/admin/bookings') ? 'bg-[#FF6A00]/10 text-[#FFB300]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <FileText size={18} /> Bookings
          </Link>
          <button onClick={() => {
            document.cookie = 'admin_token=; path=/; max-age=0;';
            window.location.href = '/admin/login';
          }} className="w-full mt-8 flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors text-left">
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto bg-black">
        {children}
      </main>
    </div>
  );
}
