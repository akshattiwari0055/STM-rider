"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, LogOut } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user || null);
        setAuthChecked(true);
      })
      .catch(() => setAuthChecked(true));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setMobileMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Our Fleet', path: '/vehicles' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md py-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-white/5' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center group">
          <img 
            src="/logo.png" 
            alt="Yellow Hut STM Riders Logo" 
            className="h-10 md:h-12 w-auto object-contain group-hover:scale-105 transition-transform" 
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className={`text-sm tracking-wide transition-colors ${pathname === link.path ? 'text-[#FFB300] font-semibold' : 'text-gray-300 hover:text-white'}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {!authChecked ? (
            <div className="w-20 h-8 bg-white/5 rounded-full animate-pulse" />
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                id="nav-dashboard"
                className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
              >
                <LayoutDashboard className="w-4 h-4 text-[#FFB300]" />
                Dashboard
              </Link>
              <button
                id="nav-logout"
                onClick={handleLogout}
                className="text-sm font-medium text-gray-400 hover:text-red-400 transition-colors px-4 py-2 rounded-lg hover:bg-red-500/5 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-white hover:text-[#FFB300] transition-colors px-4 py-2">
                Log In
              </Link>
              <Link href="/signup" className="text-sm font-medium bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black px-5 py-2 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap shadow-[0_0_15px_rgba(255,179,0,0.3)]">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-white p-2 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          id="mobile-menu-toggle"
        >
          <div className="w-6 flex flex-col gap-1.5">
            <span className={`h-0.5 w-full bg-white transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`h-0.5 w-full bg-[#FFB300] transition-opacity ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`h-0.5 w-full bg-white transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-t border-white/10 flex flex-col py-4 px-6 gap-4 shadow-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-lg py-2 border-b border-white/5 ${pathname === link.path ? 'text-[#FFB300]' : 'text-gray-300'}`}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col gap-3 mt-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-center py-3 border border-[#FFB300]/30 rounded-lg text-[#FFB300] font-medium justify-center"
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-center py-3 border border-red-500/30 rounded-lg text-red-400 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-3 border border-white/20 rounded-lg text-white">
                  Log In
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="text-center py-3 bg-gradient-to-r from-[#FFB300] to-[#FF6A00] rounded-lg text-black font-bold">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
