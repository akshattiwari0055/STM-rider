"use client";

import { useEffect, useRef } from 'react';
import { ShieldCheck, Wallet, Clock, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function WhyChooseUs() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  const features = [
    { title: "Affordable", desc: "Best prices in the market without hidden fees.", icon: Wallet },
    { title: "Verified Vehicles", desc: "All our vehicles are thoroughly checked & sanitized.", icon: ShieldCheck },
    { title: "24/7 Support", desc: "We are here for you round the clock.", icon: Clock },
    { title: "Easy Booking", desc: "Book your ride in just a few clicks.", icon: CheckCircle2 },
  ];

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(cardsRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out"
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-6 max-w-7xl mx-auto relative cursor-default">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFB300]/5 rounded-full blur-[80px] z-0"></div>
      
      <div className="relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose <span className="text-gradient">Us</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Experience the best rental service with premium benefits.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, index) => (
            <div 
              key={index}
              ref={el => cardsRef.current[index] = el}
              className="glass p-8 rounded-2xl flex flex-col items-center text-center transition-transform hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(255,106,0,0.1)] group"
            >
              <div className="w-16 h-16 rounded-full bg-[#FF6A00]/10 flex items-center justify-center mb-6 border border-[#FF6A00]/20 group-hover:bg-[#FF6A00]/20 transition-colors">
                <feat.icon className="text-[#FFB300] w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feat.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
