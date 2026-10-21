import Link from 'next/link';
import {
  ShieldAlert, CheckCircle2, RotateCcw, Clock, AlertTriangle,
  ArrowLeft, Phone, Zap, Users, Sparkles, HelpCircle, ArrowRight
} from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Cancellation & Refund Policy | STM RIDER',
  description: 'Official Cancellation, Rescheduling and Refund Policy for STM RIDER vehicle rentals and group expeditions.',
};

const TRIP_REFUND_SLABS = [
  {
    days: '15 Days or More',
    subtitle: 'Prior to departure scheduled date',
    refund: '85% Cash Refund',
    alt: 'OR 100% STM Trip Credit Voucher',
    fee: '15% nominal administrative fee',
    theme: 'emerald',
    badge: 'Maximum Flexibility',
    badgeStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  },
  {
    days: '7 to 14 Days',
    subtitle: 'Prior to departure scheduled date',
    refund: '50% Cash Refund',
    alt: 'OR 60% STM Trip Credit Voucher',
    fee: '50% retained for vehicle & seat block',
    theme: 'amber',
    badge: 'Standard Window',
    badgeStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  },
  {
    days: '3 to 6 Days',
    subtitle: 'Prior to departure scheduled date',
    refund: '25% Cash Refund',
    alt: 'OR 35% STM Trip Credit Voucher',
    fee: '75% retained (hotels & transport pre-locked)',
    theme: 'orange',
    badge: 'Late Notice',
    badgeStyle: 'bg-orange-500/10 text-orange-400 border-orange-500/30'
  },
  {
    days: 'Under 72 Hours / No-Show',
    subtitle: 'Prior to trip start time',
    refund: '0% (Non-refundable)',
    alt: 'Transfer your seat to a friend for FREE',
    fee: 'All operational costs fully committed',
    theme: 'rose',
    badge: 'Strict Window',
    badgeStyle: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  }
];

const VEHICLE_REFUND_SLABS = [
  {
    timeframe: '24+ Hours Before Pickup',
    refund: '100% Full Refund',
    note: 'Zero cancellation fee if cancelled at least 24 hours prior to rental start.'
  },
  {
    timeframe: '12 to 24 Hours Before Pickup',
    refund: '75% Refund',
    note: '25% retained as vehicle reservation holding charge.'
  },
  {
    timeframe: 'Under 12 Hours / No-Show',
    refund: '50% Refund',
    note: '50% retained as vehicle was blocked and turned away other riders.'
  }
];

const CANCELLATION_STEPS = [
  {
    step: '01',
    title: 'Initiate Request',
    desc: 'Go to your Dashboard or message our 24/7 WhatsApp concierge (+91 94658 53502) with your Booking ID.'
  },
  {
    step: '02',
    title: 'Review Calculation',
    desc: 'Our system calculates your eligible refund slab or issues an instant 100% trip credit voucher.'
  },
  {
    step: '03',
    title: 'Direct Disbursal',
    desc: 'Approved refunds are transferred directly to your original UPI VPA or bank within 3 to 5 business days.'
  }
];

const FAQS = [
  {
    q: 'Can I transfer my booking to a friend instead of cancelling?',
    a: 'Yes! STM Rider permits 100% free seat and vehicle booking transfers to any friend or fellow student up to 24 hours prior to departure. Simply send us your friend’s name, phone number, and ID proof.'
  },
  {
    q: 'What happens if a trip is cancelled due to heavy snowfall or landslides?',
    a: 'If an expedition cannot depart due to unseasonal roadblocks, severe weather, or administrative curfew, STM Rider provides a 100% STM Trip Credit Voucher valid for 365 days, or reschedules to the next available weekend.'
  },
  {
    q: 'How long does a UPI or bank refund take to reflect in my account?',
    a: 'Refunds initiated via UPI reflect within 24 to 48 hours. Bank account transfers take 3 to 5 business days depending on your bank clearance cycles.'
  },
  {
    q: 'Can I reschedule my trip date instead of cancelling?',
    a: 'Date rescheduling is allowed free of charge if requested 10+ days prior to departure (subject to seat availability on the new date). Within 10 days, standard slab fees apply.'
  }
];

export default function CancellationPolicyPage() {
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

        {/* Hero Section */}
        <div className="relative rounded-3xl p-8 sm:p-12 glass border border-white/10 mb-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-400 uppercase tracking-wider mb-4">
              <ShieldAlert className="w-3.5 h-3.5" />
              Fair & Transparent Policy
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Cancellation & <span className="text-gradient">Refund Policy</span>
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              We understand plans can change unexpectedly. STM RIDER offers the most flexible, rider-friendly cancellation, seat transfer, and refund terms in the industry.
            </p>
            <p className="text-xs text-gray-500 mt-4">
              Transparent slabs • Zero hidden deductions • Direct UPI disbursal
            </p>
          </div>
        </div>

        {/* Section 1: Group Trips Cancellation Slabs */}
        <div className="space-y-6 mb-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFB300]/10 border border-[#FFB300]/30 flex items-center justify-center text-[#FFB300]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Group Trips & Tours Cancellation Slabs</h2>
              <p className="text-xs text-gray-400">Refund percentages based on notice provided before the scheduled departure date.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TRIP_REFUND_SLABS.map((slab, idx) => (
              <div
                key={idx}
                className="glass rounded-3xl p-6 border border-white/10 hover:border-[#FFB300]/30 transition-all duration-300 relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${slab.badgeStyle}`}>
                      {slab.badge}
                    </span>
                    <span className="text-xs font-mono text-gray-500">Tier {idx + 1}</span>
                  </div>

                  <h3 className="text-xl font-black text-white mb-1">{slab.days}</h3>
                  <p className="text-xs text-gray-400 mb-4">{slab.subtitle}</p>

                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 mb-4">
                    <p className={`text-2xl font-black ${
                      slab.theme === 'emerald'
                        ? 'text-emerald-400'
                        : slab.theme === 'amber'
                        ? 'text-amber-400'
                        : slab.theme === 'orange'
                        ? 'text-orange-400'
                        : 'text-rose-400'
                    }`}>
                      {slab.refund}
                    </p>
                    <p className="text-xs font-medium text-gray-300">{slab.alt}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 pt-3 border-t border-white/5">
                  {slab.fee}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Vehicle Rental Cancellation */}
        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 mb-16 space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              🚗 Self-Drive Vehicle Rentals Cancellation Policy
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              For hourly, daily, and weekend car and bike rentals at Phagwara & LPU Law Gate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {VEHICLE_REFUND_SLABS.map((vs, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <p className="text-xs text-gray-400 font-mono">Window {idx + 1}</p>
                <h3 className="text-base font-bold text-white">{vs.timeframe}</h3>
                <p className="text-xl font-black text-[#FFB300]">{vs.refund}</p>
                <p className="text-xs text-gray-400 leading-relaxed pt-2 border-t border-white/5">{vs.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: How to Cancel in 3 Steps */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            How to Request a Cancellation or Refund
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CANCELLATION_STEPS.map((step) => (
              <div key={step.step} className="glass rounded-3xl p-6 border border-white/10 relative">
                <span className="text-3xl font-black text-gradient block mb-3 font-mono">
                  {step.step}
                </span>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Cancellation FAQs */}
        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 mb-16 space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#FFB300]" />
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAQS.map((faq, fIdx) => (
              <div key={fIdx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <h3 className="font-bold text-white text-sm sm:text-base">
                  {faq.q}
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp & Call Strip */}
        <div className="glass rounded-3xl p-8 border border-white/10 text-center relative overflow-hidden mb-12">
          <h3 className="text-2xl font-bold text-white mb-2">Need to Modify or Cancel Your Booking?</h3>
          <p className="text-gray-400 text-sm max-w-xl mx-auto mb-6">
            Our team handles modifications instantly on WhatsApp. Drop your Booking ID and reason for immediate support.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/919465853502?text=Hello%20STM%20Rider!%20I%20would%20like%20to%20request%20cancellation%20or%20date%20rescheduling%20for%20my%20booking."
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black font-black text-sm hover:opacity-90 flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(255,179,0,0.3)]"
            >
              <span>WhatsApp Us: +91 94658 53502</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
