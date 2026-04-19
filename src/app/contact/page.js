import Link from 'next/link';
import { MapPin, Mail, Phone, Send } from 'lucide-react';

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

export const metadata = {
  title: 'Contact Us | Yellow Hut STM Riders',
  description: 'Get in touch with Yellow Hut STM Riders. Located at Law Gate Road in Meheru, Phagwara, Punjab.',
};

export default function ContactPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#FF6A00]/10 rounded-full blur-[60px]" />
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 relative z-10">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFB300] to-[#FF6A00]">Touch</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed relative z-10">
            Have questions about a booking, need support, or just want to say hi? We are here to help. Reach out to us through any of the channels below.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <a href="https://maps.app.goo.gl/Jk9zUr5mBorsP6ULA" target="_blank" rel="noopener noreferrer" className="glass p-8 rounded-3xl border border-white/5 hover:border-[#FFB300]/30 transition-colors flex items-start gap-6 group block">
              <div className="w-14 h-14 rounded-full bg-[#FFB300]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6 text-[#FFB300]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Our Location</h3>
                <p className="text-gray-400 leading-relaxed font-medium">
                  Law Gate Road, Meheru<br />
                  Phagwara, Punjab
                </p>
                <p className="text-xs text-[#FFB300] mt-2 font-semibold group-hover:underline">View on Google Maps &rarr;</p>
              </div>
            </a>

            <a href="https://www.instagram.com/stm.riders?igsh=dW4xcnpiMjJ1dGl6" target="_blank" rel="noopener noreferrer" className="glass p-8 rounded-3xl border border-white/5 hover:border-[#E1306C]/50 transition-colors flex items-start gap-6 group block">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-pink-500/20">
                <InstagramIcon />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Instagram</h3>
                <p className="text-gray-400 leading-relaxed font-medium group-hover:text-pink-400 transition-colors">
                  @stm.riders
                </p>
                <p className="text-xs text-gray-500 mt-1">Follow us for updates and exclusive offers!</p>
              </div>
            </a>

            <div className="glass p-8 rounded-3xl border border-white/5 hover:border-[#FFB300]/30 transition-colors flex items-start gap-6 group">
               <div className="w-14 h-14 rounded-full bg-[#FFB300]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                 <Phone className="w-6 h-6 text-[#FFB300]" />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-white mb-2">Call & WhatsApp</h3>
                 <p className="text-gray-400 leading-relaxed font-medium">
                   +91 94658 53502
                 </p>
                 <p className="text-xs text-gray-500 mt-1">Available 24/7 for support.</p>
               </div>
             </div>
          </div>

          {/* Map / Image Placeholder */}
          <a href="https://maps.app.goo.gl/Jk9zUr5mBorsP6ULA" target="_blank" rel="noopener noreferrer" className="relative h-full min-h-[400px] rounded-3xl overflow-hidden glass border border-white/10 group block">
             {/* Styled placeholder for a map or office image */}
             <div className="absolute inset-0 bg-[#0a0a0a] group-hover:bg-[#111] transition-colors" />
             {/* Map Grid Pattern */}
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
             
             <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/40 backdrop-blur-[2px] transition-all group-hover:backdrop-blur-0">
               <MapPin className="w-12 h-12 text-[#FFB300] mb-4 drop-shadow-[0_0_15px_rgba(255,179,0,0.8)]" />
               <h3 className="text-2xl font-black text-white mb-2 drop-shadow-md">Find Us Here</h3>
               <p className="text-[#FFB300] font-semibold tracking-wider font-mono bg-black/50 px-4 py-2 rounded-lg border border-[#FFB300]/30 backdrop-blur-md mb-4">
                 LAW GATE, MEHERU
               </p>
               <span className="text-sm border border-[#FFB300]/20 text-white px-4 py-2 rounded-full group-hover:bg-[#FFB300]/10 transition-colors">
                 Open in Google Maps
               </span>
             </div>
          </a>

        </div>
      </div>
    </div>
  );
}
