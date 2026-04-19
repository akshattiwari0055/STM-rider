import Link from 'next/link';
import { Phone, MapPin, Mail } from 'lucide-react';

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black pt-16 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-[#FF6A00]/5 to-transparent z-0"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="text-3xl font-bold mb-4 uppercase text-white tracking-widest"><span className="text-[#FFB300]">Yellow</span> Hut</h3>
            <p className="text-gray-400 mb-6">STM Riders - Premium car and bike rentals for elite travelers. Your journey, our wheels.</p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/stm.riders?igsh=dW4xcnpiMjJ1dGl6" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[#FF6A00] transition-colors"><InstagramIcon /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[#FF6A00] transition-colors"><FacebookIcon /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[#FF6A00] transition-colors"><TwitterIcon /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-xl font-bold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-400 hover:text-[#FFB300] transition-colors">Home</Link></li>
              <li><Link href="/vehicles" className="text-gray-400 hover:text-[#FFB300] transition-colors">Our Fleet</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-[#FFB300] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-[#FFB300] transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xl font-bold text-white mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-[#FF6A00] mt-1 shrink-0" size={20} />
                <a href="https://maps.app.goo.gl/Jk9zUr5mBorsP6ULA" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">Law Gate Road, Meheru, Phagwara, Punjab</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-[#FF6A00] shrink-0" size={20} />
                <a href="tel:+919465853502" className="text-gray-400 hover:text-white transition-colors">+91 94658 53502</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-[#FF6A00] shrink-0" size={20} />
                <a href="mailto:info@yellowhut.com" className="text-gray-400 hover:text-white transition-colors">info@yellowhut.com</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Yellow Hut STM Riders. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/admin" className="hover:text-[#FFB300] transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
