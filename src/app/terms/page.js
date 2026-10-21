import Link from 'next/link';
import {
  FileText, ShieldCheck, AlertCircle, Clock, MapPin, UserCheck,
  Scale, Ban, HelpCircle, ArrowLeft, ChevronRight, Phone, Mail
} from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms & Conditions | STM RIDER',
  description: 'Official Terms & Conditions and User Travel Agreement for STM RIDER vehicle rentals and group expeditions.',
};

const SECTIONS = [
  {
    id: 'eligibility',
    title: '1. User Eligibility & Identification',
    icon: '🪪',
    content: [
      'All users booking self-drive vehicles or joining STM Rider group expeditions must be at least 18 years of age.',
      'For self-drive rentals: A valid Indian driving licence (original or DigiLocker verified) matching the vehicle class (Two-wheeler / LMV Four-wheeler) is strictly mandatory prior to key handover.',
      'For Group Expeditions & Tours: An original government-issued photo identity proof (Aadhaar Card, Passport, or Voter ID) is mandatory for highway border checkpoints, military permits, and hotel registrations.',
      'Providing false information, fabricated driving documents, or misrepresenting identity will lead to immediate cancellation of booking with full forfeiture of payment and report to relevant authorities.'
    ]
  },
  {
    id: 'bookings-payment',
    title: '2. Bookings, Fares & Payments',
    icon: '💳',
    content: [
      'All bookings must be completed and paid for through official STM Rider digital channels (Website UPI, Razorpay Gateway, or Authorized Office Counter at LPU Law Gate).',
      'A booking is formally confirmed once payment is verified and the digital booking ID / PDF pass has been issued.',
      'Vehicle rental rates do not include fuel unless explicitly stated. Vehicles are delivered with a baseline fuel reserve and must be returned with an equivalent fuel level.',
      'Trip package fares include transportation, accommodation, specified meals, and itinerary assistance as explicitly outlined on each trip page.'
    ]
  },
  {
    id: 'code-conduct',
    title: '3. Code of Conduct & Zero-Tolerance Policy',
    icon: '🚫',
    content: [
      'STM Rider operates a zero-tolerance policy against the possession, consumption, sale, or transportation of illegal narcotics, substances, or weapons.',
      'Under no circumstances may any rented vehicle be operated under the influence of alcohol, drugs, or intoxicating substances.',
      'On group tours, excessive rowdiness, verbal or physical harassment of fellow passengers, local residents, or staff will result in immediate termination of the trip for that individual with zero refund and forfeiture of return transport.',
      'All riders must abide by local traffic laws, speed limits, state helmet rules, and seatbelt regulations.'
    ]
  },
  {
    id: 'vehicle-usage',
    title: '4. Vehicle Care, Security Deposits & Damage',
    icon: '🚗',
    content: [
      'Rented vehicles are solely for personal commuting and leisure. Sub-leasing, commercial ferrying, racing, or illegal contraband transport is strictly prohibited.',
      'Security deposits (where applicable) are 100% refundable upon safe, undamaged, and timely return of the vehicle.',
      'Any mechanical or body damage resulting from reckless driving, accidents, or negligence during the rental duration will be assessed and deducted from the deposit or billed to the customer at actual repair costs.',
      'In case of breakdown or puncture, the rider must contact STM Rider 24/7 assistance immediately before undertaking unauthorized mechanical repairs.'
    ]
  },
  {
    id: 'punctuality',
    title: '5. Punctuality & Reporting Protocols',
    icon: '⏰',
    content: [
      'For group trips: Departure timings are strictly enforced. Travelers must arrive at the designated pickup point (LPU Law Gate / Chandigarh) at least 30 minutes before departure.',
      'Vehicles cannot be delayed for tardy passengers due to mountain highway permit deadlines and safety schedules. Missed departures are treated as passenger No-Shows without refund.',
      'For vehicle rentals: Return deadlines must be strictly observed. Late vehicle returns without prior extension approval incur an hourly penalty fee of ₹150/hr for bikes and ₹300/hr for cars.'
    ]
  },
  {
    id: 'force-majeure',
    title: '6. Route Alterations & Force Majeure',
    icon: '🏔️',
    content: [
      'STM Rider reserves the right to alter, delay, re-route, or curtail any tour itinerary in cases of extreme mountain weather, landslides, flash floods, military movement, or administrative road closures.',
      'The on-ground decision of the Trip Captain or authorized fleet manager is final and made with passenger life and vehicle safety as the supreme priority.',
      'In genuine force majeure scenarios preventing trip departure, riders receive full credit vouchers valid for 365 days to use on any future STM Rider trip.'
    ]
  },
  {
    id: 'liability',
    title: '7. Limitation of Liability & Personal Belongings',
    icon: '🛡️',
    content: [
      'Travelers and riders are solely responsible for their personal belongings, jewelry, electronics, smartphones, and luggage. STM Rider accepts no liability for loss, theft, or damage to personal property.',
      'High-altitude travel carries inherent environmental risks. Participants must ensure medical fitness and carry personal emergency medications.',
      'STM Rider shall not be held liable for indirect, incidental, or consequential damages resulting from third-party actions, natural hazards, or unannounced governmental directives.'
    ]
  },
  {
    id: 'modifications',
    title: '8. Policy Revisions & Legal Jurisdiction',
    icon: '⚖️',
    content: [
      'STM Rider reserves the right to update or modify these Terms & Conditions at any time. Continued use of our platform or services constitutes acceptance of the modified terms.',
      'All disputes, claims, or legal actions arising out of services provided by STM Rider are subject exclusively to the jurisdiction of the courts of Phagwara / Kapurthala, Punjab, India.'
    ]
  }
];

export default function TermsPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-background text-white flex flex-col">
      <div className="max-w-5xl mx-auto px-6 w-full flex-1">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Hero Banner */}
        <div className="relative rounded-3xl p-8 sm:p-12 glass border border-white/10 mb-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFB300]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFB300]/10 border border-[#FFB300]/30 text-xs font-bold text-[#FFB300] uppercase tracking-wider mb-4">
              <Scale className="w-3.5 h-3.5" />
              Legal & User Agreement
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Terms & <span className="text-gradient">Conditions</span>
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Welcome to STM RIDER. Please read this agreement carefully before booking rental vehicles or participating in our curated group expeditions. Your safety, trust, and exceptional travel experience are our highest priorities.
            </p>
            <p className="text-xs text-gray-500 mt-4">
              Last updated: October 2026 • Effective for all bookings through STM RIDER Phagwara & Online
            </p>
          </div>
        </div>

        {/* Quick Nav Chips */}
        <div className="mb-10 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Jump to Section:</p>
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map((sec, idx) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-[#FFB300] transition-colors"
              >
                {sec.title}
              </a>
            ))}
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-8 mb-16">
          {SECTIONS.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="glass rounded-3xl p-6 sm:p-8 border border-white/10 scroll-mt-28 relative group hover:border-[#FFB300]/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl select-none">{section.icon}</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-[#FFB300]/30">
                {section.content.map((point, pIdx) => (
                  <p key={pIdx} className="text-sm sm:text-base text-gray-300 leading-relaxed">
                    {point}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Strip */}
        <div className="glass rounded-3xl p-8 border border-white/10 text-center relative overflow-hidden mb-12">
          <h3 className="text-2xl font-bold text-white mb-2">Have Questions About Our Policies?</h3>
          <p className="text-gray-400 text-sm max-w-xl mx-auto mb-6">
            Our support team is available 24/7 at Law Gate, Phagwara to answer queries regarding vehicle security, booking terms, or student guidelines.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+919465853502"
              className="px-6 py-3 rounded-xl bg-[#FFB300] text-black font-bold text-sm hover:opacity-90 flex items-center gap-2 transition-opacity shadow-[0_0_20px_rgba(255,179,0,0.3)]"
            >
              <Phone className="w-4 h-4" />
              Call +91 94658 53502
            </a>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              Contact Desk
            </Link>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
