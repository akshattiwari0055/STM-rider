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
          <Link href="/admin" className="block space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-[0.2em] text-[#FFB300] uppercase hidden sm:block">
                Yellow Hut
              </span>
              <div className="w-6 h-6 rounded bg-gradient-to-br from-[#FFB300] to-[#FF6A00] flex items-center justify-center font-bold text-black text-xs shadow-[0_0_10px_rgba(255,179,0,0.5)]">
                S
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                STM<span className="text-[#FF6A00]">Riders</span>
              </span>
            </div>
            <span className="text-xs font-semibold text-gray-500 tracking-widest uppercase block border-t border-white/5 pt-2 mt-2">Admin Panel</span>
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
