import Link from 'next/link';
import { Shield, Clock, MapPin, Star } from 'lucide-react';

export const metadata = {
  title: 'About Us | Yellow Hut STM Riders',
  description: 'Learn about Yellow Hut STM Riders, your trusted vehicle rental platform in Phagwara, Punjab.',
};

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Hero Section */}
        <div className="text-center mb-20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FFB300]/10 rounded-full blur-[80px]" />
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 relative z-10">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFB300] to-[#FF6A00]">STM Riders</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed relative z-10">
            We are dedicated to providing the most reliable, affordable, and flexible two-wheeler and four-wheeler rental services for college students and professionals in Phagwara, Punjab.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Our Mission</h2>
            <p className="text-gray-400 leading-relaxed">
              Based out of Law Gate Road, Meheru, Yellow Hut STM Riders was founded with a single goal: to empower mobility. We understand that finding quick, affordable transport near university campuses can be tough. 
            </p>
            <p className="text-gray-400 leading-relaxed">
              That's why we've streamlined the entire rental process. Whether you need a scooter for a quick grocery run, a bike for a weekend trip, or a car with your friends, we've got you covered with completely transparent tiered pricing and no hidden fees.
            </p>
          </div>
          <div className="relative h-[400px] rounded-3xl overflow-hidden glass border border-white/10 group">
             {/* Using a sleek placeholder gradient for the about image */}
             <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-[#222]" />
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded bg-gradient-to-br from-[#FFB300] to-[#FF6A00] flex items-center justify-center font-bold text-black text-3xl shadow-[0_0_30px_rgba(255,179,0,0.4)] mb-4 transform group-hover:scale-110 transition-transform">
                    S
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-widest uppercase">Yellow Hut</h3>
                </div>
             </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose Us?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass p-6 rounded-2xl border border-white/5 hover:border-[#FFB300]/30 transition-colors">
              <Shield className="w-10 h-10 text-[#FFB300] mb-4" />
              <h3 className="text-white font-bold text-xl mb-2">Verified Secure</h3>
              <p className="text-gray-500 text-sm">Full ID verification ensures complete safety for both our riders and vehicles.</p>
            </div>
            <div className="glass p-6 rounded-2xl border border-white/5 hover:border-[#FFB300]/30 transition-colors">
              <Clock className="w-10 h-10 text-[#FFB300] mb-4" />
              <h3 className="text-white font-bold text-xl mb-2">Flexible Hours</h3>
              <p className="text-gray-500 text-sm">Rent for 3 hours, 12 hours, a week, or an entire month. You decide the timeline.</p>
            </div>
            <div className="glass p-6 rounded-2xl border border-white/5 hover:border-[#FFB300]/30 transition-colors">
              <MapPin className="w-10 h-10 text-[#FFB300] mb-4" />
              <h3 className="text-white font-bold text-xl mb-2">Prime Location</h3>
              <p className="text-gray-500 text-sm">Conveniently located right at Law Gate Road in Meheru for instant access.</p>
            </div>
            <div className="glass p-6 rounded-2xl border border-white/5 hover:border-[#FFB300]/30 transition-colors">
              <Star className="w-10 h-10 text-[#FFB300] mb-4" />
              <h3 className="text-white font-bold text-xl mb-2">Top Quality</h3>
              <p className="text-gray-500 text-sm">All our vehicles are regularly serviced and kept in immaculate condition.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-[#111] rounded-3xl p-12 border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFB300]/10 to-[#FF6A00]/10" />
          <h2 className="text-2xl md:text-4xl font-black text-white mb-6 relative z-10">Ready to hit the road?</h2>
          <Link href="/vehicles" className="relative z-10 inline-block bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black px-8 py-4 rounded-full font-bold text-lg hover:shadow-[0_0_30px_rgba(255,106,0,0.4)] transition-all transform hover:-translate-y-1">
            Explore Our Fleet
          </Link>
        </div>

      </div>
    </div>
  );
}
