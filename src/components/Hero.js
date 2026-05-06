"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Link from 'next/link';

export default function Hero() {
  const heroRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(".hero-title", 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out", clearProps: "all" }
      );
      gsap.fromTo(".hero-subtitle", 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.5, ease: "power3.out", clearProps: "all" }
      );
      gsap.fromTo(".hero-btn", 
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, delay: 0.8, ease: "back.out(1.7)", clearProps: "all" }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative h-[90vh] flex items-center justify-center overflow-hidden">
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover hidden md:block z-0"
      >
        <source src="/videos/hero-desktop.mp4" type="video/mp4" />
      </video>

      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover block md:hidden z-0"
      >
        <source src="/videos/hero-mobile.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40 z-0"></div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center" ref={textRef}>
        <div className="hero-title mb-10 flex flex-col items-center">
          <div className="flex flex-col items-center hover:scale-[1.02] transition-transform duration-500 cursor-default group">
            <h1 className="text-6xl sm:text-7xl md:text-8xl md:text-[6rem] font-black uppercase tracking-tighter mb-2 text-center drop-shadow-2xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300">
                Singh
              </span>
              {' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFB300] to-[#FF6A00] animate-pulse drop-shadow-[0_0_25px_rgba(255,179,0,0.5)]">
                Tours
              </span>
            </h1>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-[0.3em] text-white/90 uppercase mt-2 group-hover:tracking-[0.4em] transition-all duration-500 group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
              & Travel
            </h2>
          </div>
        </div>
        
        <p className="hero-subtitle text-xl md:text-2xl text-gray-300 mb-10 font-light">
          Your Destination. <span className="font-semibold text-white">Our Wheels.</span>
        </p>
        <Link 
          href="/login"
          className="hero-btn mt-4 inline-block bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black font-extrabold text-xl px-12 py-5 rounded-full shadow-[0_0_20px_rgba(255,106,0,0.4)] hover:shadow-[0_0_30px_rgba(255,106,0,0.6)] hover:scale-105 transition-all duration-300 relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center gap-2">
            Book Now
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </Link>
      </div>
    </section>
  );
}
