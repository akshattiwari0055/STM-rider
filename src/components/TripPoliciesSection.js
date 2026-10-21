"use client";

import { useState } from 'react';
import {
  Luggage, ShieldAlert, FileText, CheckCircle2, AlertTriangle,
  RotateCcw, Sparkles, ChevronDown, Check, ArrowRight, ShieldCheck,
  HeartPulse, Award, Clock, DollarSign, RefreshCw, Zap, Users,
  MapPin, HelpCircle
} from 'lucide-react';

const DEFAULT_PACKING_CATEGORIES = [
  {
    id: 'docs',
    title: 'Mandatory Documents & Passes',
    icon: '🪪',
    badge: 'Must Have',
    badgeColor: 'bg-red-500/10 text-red-400 border-red-500/30',
    items: [
      { id: 'doc-1', name: 'Original Govt. Photo ID', note: 'Aadhaar, Passport, or Voter ID required for boarding & hotels' },
      { id: 'doc-2', name: 'College / Student ID Card', note: 'Physical or digital ID for student verification & benefits' },
      { id: 'doc-3', name: 'STM Rider Trip Confirmation', note: 'Digital PDF receipt or WhatsApp confirmation message' },
    ]
  },
  {
    id: 'clothing',
    title: 'Warm Layers & Mountain Clothing',
    icon: '🧥',
    badge: 'Essential',
    badgeColor: 'bg-[#FFB300]/10 text-[#FFB300] border-[#FFB300]/30',
    items: [
      { id: 'clo-1', name: 'Windproof Down Jacket / Windcheater', note: 'A heavy warm jacket with hood for chill mountain winds' },
      { id: 'clo-2', name: 'Thermal Inners (Top & Bottom)', note: 'At least 2 pairs for freezing evenings & high passes' },
      { id: 'clo-3', name: 'Comfortable Trek / Cargo Pants', note: '2-3 quick-dry pants (avoid stiff denim during activities)' },
      { id: 'clo-4', name: 'Woollen Beanie / Balaclava & Muffler', note: 'Crucial for ear and throat protection against cold winds' },
      { id: 'clo-5', name: 'Fleece Warm Gloves & Woollen Socks', note: '3-4 pairs of clean woollen & athletic cotton socks' },
    ]
  },
  {
    id: 'footwear',
    title: 'Footwear & Grip',
    icon: '🥾',
    badge: 'Safety First',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    items: [
      { id: 'foot-1', name: 'Sturdy Hiking Shoes / Sneakers', note: 'Shoes with deep rubber grip for snow, mud, and gravel' },
      { id: 'foot-2', name: 'Casual Flip-Flops / Slides', note: 'For comfort inside hotels, camps, and washrooms' },
    ]
  },
  {
    id: 'tech',
    title: 'Electronics & Connectivity',
    icon: '🔋',
    badge: 'Cold Resistant',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    items: [
      { id: 'tech-1', name: 'High-Capacity Power Bank (10,000mAh+)', note: 'Phone batteries drain rapidly in freezing temperatures' },
      { id: 'tech-2', name: 'Charging Cables & Multi-Plug', note: 'Braided fast-charging cords for overnight hotel recharge' },
      { id: 'tech-3', name: 'Camera / Action Cam (Optional)', note: 'With extra memory cards for scenic mountain vistas' },
    ]
  },
  {
    id: 'medical',
    title: 'Medical & Personal Wellness',
    icon: '💊',
    badge: 'High Altitude Care',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    items: [
      { id: 'med-1', name: 'Personal Prescription Medications', note: 'Sufficient supply for the entire journey + 1 extra day' },
      { id: 'med-2', name: 'Motion / Altitude Sickness Tablets', note: 'Avomine or physician-recommended altitude pills' },
      { id: 'med-3', name: 'First Aid (Band-Aids, ORS, Paracetamol)', note: 'Basic pain relief, hydration salts, and antiseptic cream' },
      { id: 'med-4', name: 'Lip Balm with SPF & Cold Cream', note: 'Protects lips and face skin from severe mountain dryness' },
      { id: 'med-5', name: 'High SPF Sunscreen (SPF 50+)', note: 'UV radiation is 2x stronger at high mountain altitudes' },
    ]
  },
  {
    id: 'accessories',
    title: 'Daypack & Outdoor Essentials',
    icon: '🎒',
    badge: 'Daily Carry',
    badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    items: [
      { id: 'acc-1', name: '15L - 25L Lightweight Daypack', note: 'Small backpack to hold water, jacket & snacks during day trips' },
      { id: 'acc-2', name: 'Insulated Hot / Cold Water Bottle', note: '1 Litre reusable thermos flask to stay warm & hydrated' },
      { id: 'acc-3', name: 'UV-Protected Polarized Sunglasses', note: 'Mandatory to prevent eye glare and snow blindness' },
      { id: 'acc-4', name: 'Hard Cash in INR (₹2,000 - ₹3,000)', note: 'High altitude mountain ATMs frequently run out of cash' },
      { id: 'acc-5', name: 'Wet Wipes, Tissues & Hand Sanitizer', note: 'Convenient for road travel and roadside dhaba stops' },
    ]
  }
];

const CANCELLATION_TIERS = [
  {
    timeframe: '15+ Days',
    subtitle: 'Before Departure Date',
    refund: '85% Refund',
    voucher: 'Or 100% STM Trip Credit Voucher',
    fee: '15% nominal processing fee',
    theme: 'emerald',
    badge: 'Maximum Flexibility',
    badgeStyle: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
    fillWidth: 'w-[85%]',
    fillColor: 'bg-emerald-500',
    glowColor: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]'
  },
  {
    timeframe: '7 to 14 Days',
    subtitle: 'Before Departure Date',
    refund: '50% Refund',
    voucher: 'Or 60% STM Trip Credit Voucher',
    fee: '50% retained for vehicle & seat block',
    theme: 'amber',
    badge: 'Standard Window',
    badgeStyle: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
    fillWidth: 'w-[50%]',
    fillColor: 'bg-amber-500',
    glowColor: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]'
  },
  {
    timeframe: '3 to 6 Days',
    subtitle: 'Before Departure Date',
    refund: '25% Refund',
    voucher: 'Or 35% STM Trip Credit Voucher',
    fee: '75% retained (hotel rooms pre-paid)',
    theme: 'orange',
    badge: 'Late Notice',
    badgeStyle: 'bg-orange-500/15 border-orange-500/40 text-orange-400',
    fillWidth: 'w-[25%]',
    fillColor: 'bg-orange-500',
    glowColor: 'shadow-[0_0_20px_rgba(249,115,22,0.2)]'
  },
  {
    timeframe: 'Under 72 Hours',
    subtitle: 'Or No-Show on Trip Day',
    refund: '0% (Non-refundable)',
    voucher: 'Friend replacement allowed free',
    fee: 'All operational costs fully committed',
    theme: 'rose',
    badge: 'Strict Window',
    badgeStyle: 'bg-rose-500/15 border-rose-500/40 text-rose-400',
    fillWidth: 'w-[5%]',
    fillColor: 'bg-rose-500',
    glowColor: 'shadow-[0_0_20px_rgba(244,63,94,0.2)]'
  }
];

const TERMS_LIST = [
  {
    id: 't-1',
    title: 'Mandatory Government Identification',
    category: 'Verification',
    icon: '🪪',
    summary: 'Original Govt. ID is required for boarding checkpoints, state borders, and hotel check-in.',
    details: 'All travelers must carry a valid original Government-issued photo ID (Aadhaar Card, Passport, or Voter ID) matching their booking name. College IDs are also accepted for verified student discount passes. Digital soft copies on DigiLocker are acceptable, but carrying original hardcopy is strongly advised in remote mountain areas. Boarding will be denied without valid ID with zero refund.'
  },
  {
    id: 't-2',
    title: 'Punctuality, Boarding & Departure Times',
    category: 'Timing Protocol',
    icon: '⏰',
    summary: 'Buses depart strictly on time. Please report 30 minutes before departure.',
    details: 'Trip departures are precisely scheduled to maintain mountain transit safety and beat valley traffic jams. Passengers must reach the designated pickup point (e.g., LPU Law Gate / Chandigarh) at least 30 minutes prior to scheduled departure. STM Rider vehicles will not wait for delayed passengers, and missed departures are classified as a No-Show without refund.'
  },
  {
    id: 't-3',
    title: 'Substance & Behavioral Zero-Tolerance Policy',
    category: 'Safety & Code of Conduct',
    icon: '🚫',
    summary: 'Strict zero-tolerance on illicit drugs, narcotics, weapons, and harassment.',
    details: 'STM Rider enforces a strict zero-tolerance policy against the possession, consumption, or transportation of illegal narcotics, substances, or weapons. Excessive intoxication, disorderly conduct, harassment of co-travelers, or disrespect towards local communities or crew will lead to immediate deboarding at the passenger\'s sole expense, forfeiture of booking fees, and handover to law enforcement authorities.'
  },
  {
    id: 't-4',
    title: 'Baggage Allowance & Personal Valuables',
    category: 'Luggage Policy',
    icon: '🎒',
    summary: '1 main rucksack/trolley (up to 15kg) + 1 small daypack allowed per rider.',
    details: 'To ensure comfortable seating and vehicle roof weight safety, each passenger is allowed 1 main rucksack or trolley bag (maximum 15kg) and 1 personal small daypack. STM Rider and our transport crew take utmost care, but passengers are personally responsible for their valuables (smartphones, cameras, cash, laptops, jewelry). STM Rider is not liable for lost, stolen, or damaged personal belongings.'
  },
  {
    id: 't-5',
    title: 'Dynamic Itinerary Adjustments & Force Majeure',
    category: 'Route Safety',
    icon: '🏔️',
    summary: 'Routes may adapt dynamically in case of landslides, snow, or administration orders.',
    details: 'Mountain terrain and high-altitude weather can be unpredictable. In circumstances of heavy snowfall, landslides, flash floods, military exercises, or state-ordered road closures, STM Rider and the on-ground Trip Captain reserve the right to alter, reverse, or substitute itinerary routes in real-time to prioritize passenger safety above all else.'
  },
  {
    id: 't-6',
    title: 'Health, Physical Fitness & High Altitude',
    category: 'Medical Notice',
    icon: '🩺',
    summary: 'Travelers must declare severe respiratory or heart conditions prior to departure.',
    details: 'High-altitude trips involve steep altitude gains and sub-zero night temperatures. Travelers must be reasonably fit. If you suffer from pre-existing medical conditions (such as asthma, severe heart conditions, extreme vertigo, or high blood pressure), you must disclose this to the STM Rider coordinator prior to departure and carry prescribed medication. Participation is at the passenger\'s voluntary discretion.'
  },
  {
    id: 't-7',
    title: 'Media, Group Photography & Social Highlights',
    category: 'Media Release',
    icon: '📸',
    summary: 'STM Rider creates trip reels and recap photos for community highlights.',
    details: 'During the journey, our trip coordinators and photographers may capture candid photographs and videos for trip memories, group reels, and STM Rider community showcases. If you prefer not to appear in public social media footage, kindly inform your Trip Captain during morning boarding.'
  },
  {
    id: 't-8',
    title: 'Leave No Trace & Mountain Eco-Ethics',
    category: 'Eco Responsibility',
    icon: '🌿',
    summary: 'Preserve the pristine Himalayas. Zero single-use plastic littering.',
    details: 'STM Rider is deeply committed to sustainable and responsible tourism. Littering on trails, polluting mountain streams, or disrespecting local temples, monasteries, and customs is strictly forbidden. All passengers are expected to bring back their plastic wrappers and bottles to designated disposal points in the vehicle.'
  }
];

export default function TripPoliciesSection({ trip }) {
  // 'carry' | 'cancellation' | 'terms' | 'all'
  const [activeTab, setActiveTab] = useState('carry');
  const [checkedItems, setCheckedItems] = useState({});
  const [openTerms, setOpenTerms] = useState({ 't-1': true, 't-2': true });

  // Calculate total items and packed count
  const allPackItems = DEFAULT_PACKING_CATEGORIES.flatMap(cat => cat.items);
  const totalItemsCount = allPackItems.length;
  const packedCount = Object.values(checkedItems).filter(Boolean).length;
  const packedPercentage = Math.round((packedCount / totalItemsCount) * 100);

  const toggleCheck = (itemId) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const checkAll = () => {
    const full = {};
    allPackItems.forEach(item => {
      full[item.id] = true;
    });
    setCheckedItems(full);
  };

  const resetAll = () => {
    setCheckedItems({});
  };

  const toggleTerm = (termId) => {
    setOpenTerms(prev => ({
      ...prev,
      [termId]: !prev[termId]
    }));
  };

  const toggleAllTerms = () => {
    const allOpen = TERMS_LIST.every(t => openTerms[t.id]);
    if (allOpen) {
      setOpenTerms({});
    } else {
      const full = {};
      TERMS_LIST.forEach(t => {
        full[t.id] = true;
      });
      setOpenTerms(full);
    }
  };

  return (
    <div id="trip-policies" className="space-y-6 pt-4 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFB300]/10 border border-[#FFB300]/30 text-xs font-bold text-[#FFB300] uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#FFB300]" />
            Essential Rider Hub
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            Policies & Packing Guide
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Everything you need for a safe, well-prepared, and worry-free expedition.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('carry')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'carry'
                ? 'bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black shadow-[0_0_20px_rgba(255,179,0,0.4)]'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Luggage className="w-3.5 h-3.5" />
            <span>Things to Carry</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              activeTab === 'carry' ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-300'
            }`}>
              {packedCount > 0 ? `${packedCount}/${totalItemsCount}` : totalItemsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cancellation')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'cancellation'
                ? 'bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black shadow-[0_0_20px_rgba(255,179,0,0.4)]'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Cancellation Policy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'terms'
                ? 'bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black shadow-[0_0_20px_rgba(255,179,0,0.4)]'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms & Conditions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'all' ? 'carry' : 'all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'all'
                ? 'bg-white/20 text-white font-bold border border-white/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {activeTab === 'all' ? 'Tabs View' : 'View All'}
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────
          TAB 1: THINGS TO CARRY (Interactive Packing Checklist)
      ──────────────────────────────────────────────────────────────────────── */}
      {(activeTab === 'carry' || activeTab === 'all') && (
        <div className="glass rounded-3xl p-5 sm:p-7 border border-white/10 space-y-6 animate-in fade-in-50 duration-300 relative overflow-hidden">
          {/* Ambient Corner Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFB300]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Tab Header & Interactive Progress */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFB300]/20 to-[#FF6A00]/10 border border-[#FFB300]/40 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(255,179,0,0.2)]">
                  🎒
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    Interactive Packing Checklist
                  </h3>
                  <p className="text-xs text-gray-400">
                    Tap any item to check off your bag. Prepared for high altitude & changing weather.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={checkAll}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Check All
                </button>
                <button
                  type="button"
                  onClick={resetAll}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </div>

            {/* Packing Readiness Bar */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                  <CheckCircle2 className={`w-4 h-4 ${packedPercentage === 100 ? 'text-emerald-400' : 'text-[#FFB300]'}`} />
                  Packing Readiness:
                  <span className="text-white font-bold ml-1">
                    {packedCount} of {totalItemsCount} Packed
                  </span>
                </span>
                <span className={`font-black text-xs px-2 py-0.5 rounded-md ${
                  packedPercentage === 100
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-[#FFB300]'
                }`}>
                  {packedPercentage}% Ready
                </span>
              </div>

              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-[#FFB300] via-[#FF8C00] to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(255,179,0,0.6)]"
                  style={{ width: `${packedPercentage}%` }}
                />
              </div>

              {packedPercentage === 100 && (
                <div className="pt-1 flex items-center gap-2 text-xs text-emerald-400 font-bold animate-in fade-in slide-in-from-top-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  You are 100% packed and ready to hit the highway!
                </div>
              )}
            </div>
          </div>

          {/* Packing Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEFAULT_PACKING_CATEGORIES.map(category => {
              const catItemsPacked = category.items.filter(item => checkedItems[item.id]).length;
              const catComplete = catItemsPacked === category.items.length;

              return (
                <div
                  key={category.id}
                  className={`rounded-2xl p-4 sm:p-5 border transition-all duration-300 ${
                    catComplete
                      ? 'bg-emerald-950/10 border-emerald-500/30'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg select-none shrink-0">{category.icon}</span>
                      <h4 className="font-bold text-white text-sm truncate">
                        {category.title}
                      </h4>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${category.badgeColor}`}>
                      {catItemsPacked}/{category.items.length}
                    </span>
                  </div>

                  {/* Item List with Interactive Checks */}
                  <div className="space-y-2">
                    {category.items.map(item => {
                      const isChecked = Boolean(checkedItems[item.id]);

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleCheck(item.id)}
                          className={`w-full p-2.5 rounded-xl border text-left transition-all duration-200 flex items-start gap-3 cursor-pointer group ${
                            isChecked
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                              : 'bg-black/30 border-white/5 hover:border-[#FFB300]/40 hover:bg-white/[0.04]'
                          }`}
                        >
                          {/* Animated Checkbox Icon */}
                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
                              isChecked
                                ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_8px_rgba(16,185,129,0.5)] scale-105'
                                : 'border-white/20 group-hover:border-[#FFB300] bg-black/40'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-semibold leading-tight transition-colors ${
                              isChecked ? 'line-through text-emerald-300/80' : 'text-gray-200 group-hover:text-white'
                            }`}>
                              {item.name}
                            </p>
                            <p className={`text-[11px] mt-0.5 transition-colors ${
                              isChecked ? 'text-emerald-400/60 line-through' : 'text-gray-500 group-hover:text-gray-400'
                            }`}>
                              {item.note}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Luggage Weight Reminder */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFB300]/10 via-[#FF6A00]/5 to-transparent border border-[#FFB300]/20 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFB300]/20 text-[#FFB300] flex items-center justify-center shrink-0">
              <Luggage className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              <strong className="text-[#FFB300]">Luggage Tip:</strong> Please travel light with 1 main rucksack or trolley (max 15kg) and 1 small 20L daypack. Excess heavy baggage may restrict vehicle boot space.
            </p>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          TAB 2: CANCELLATION & REFUND POLICY (Visual Roadmap & Guarantees)
      ──────────────────────────────────────────────────────────────────────── */}
      {(activeTab === 'cancellation' || activeTab === 'all') && (
        <div className="glass rounded-3xl p-5 sm:p-7 border border-white/10 space-y-6 animate-in fade-in-50 duration-300 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Section Heading */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/40 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              🛡️
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Cancellation & Refund Matrix
              </h3>
              <p className="text-xs text-gray-400">
                Transparent refund slabs based on how many days prior to departure you request cancellation.
              </p>
            </div>
          </div>

          {/* Refund Tiers Visual Roadmap Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CANCELLATION_TIERS.map((tier, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-5 border bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 relative flex flex-col justify-between group hover:-translate-y-1 ${
                  tier.theme === 'emerald'
                    ? 'border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                    : tier.theme === 'amber'
                    ? 'border-amber-500/30 hover:border-amber-500/60'
                    : tier.theme === 'orange'
                    ? 'border-orange-500/30 hover:border-orange-500/60'
                    : 'border-rose-500/30 hover:border-rose-500/60'
                }`}
              >
                {/* Header Tag */}
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${tier.badgeStyle}`}>
                      {tier.badge}
                    </span>
                    <span className="text-xs font-mono text-gray-500">Tier {idx + 1}</span>
                  </div>

                  <h4 className="text-lg font-black text-white">{tier.timeframe}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{tier.subtitle}</p>

                  {/* Main Highlight Refund Pill */}
                  <div className="mt-4 p-3 rounded-xl bg-black/50 border border-white/5 space-y-2">
                    <p className={`text-xl font-black ${
                      tier.theme === 'emerald'
                        ? 'text-emerald-400'
                        : tier.theme === 'amber'
                        ? 'text-amber-400'
                        : tier.theme === 'orange'
                        ? 'text-orange-400'
                        : 'text-rose-400'
                    }`}>
                      {tier.refund}
                    </p>

                    {/* Percentage Bar */}
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${tier.fillWidth} ${tier.fillColor} rounded-full`} />
                    </div>

                    <p className="text-[11px] text-gray-400 font-medium">
                      {tier.voucher}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5">
                  <p className="text-[11px] text-gray-500">
                    {tier.fee}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Customer Protection Safeguards (Bento Grid) */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FFB300]" />
              STM Rider Traveler Safeguards
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Safeguard 1: Friend Transfer */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#FFB300]/40 transition-colors space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#FFB300]/10 border border-[#FFB300]/20 flex items-center justify-center text-[#FFB300]">
                  <Users className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-white text-sm">Zero-Fee Seat Transfer</h5>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Unable to travel? Transfer your confirmed booking to a friend or college mate up to <strong className="text-white">24 hours prior to departure</strong> with ₹0 transfer charges!
                </p>
              </div>

              {/* Safeguard 2: Weather & Landslide Guarantee */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#FFB300]/40 transition-colors space-y-2">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-white text-sm">Force Majeure & Weather</h5>
                <p className="text-xs text-gray-400 leading-relaxed">
                  If the trip cannot proceed due to severe landslides, snow blockades, or government administration restrictions, receive a <strong className="text-white">100% STM Trip Credit Voucher</strong> valid for 1 year.
                </p>
              </div>

              {/* Safeguard 3: Fast UPI Disbursal */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#FFB300]/40 transition-colors space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Zap className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-white text-sm">Fast UPI / Bank Refund</h5>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Approved cancellation refunds are credited back directly to your original UPI account or bank within <strong className="text-white">3 to 5 business days</strong> with zero hidden deductions.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Support Strip */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-gray-300">
              <HelpCircle className="w-4 h-4 text-[#FFB300] shrink-0" />
              <span>Need help with a cancellation or rescheduling request?</span>
            </div>
            <a
              href="https://wa.me/919465853502?text=Hello%20STM%20Rider!%20I%20have%20a%20query%20regarding%20trip%20cancellation%20or%20date%20change."
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition-colors inline-flex items-center gap-1.5 shrink-0"
            >
              <span>Contact 24/7 WhatsApp Concierge</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FFB300]" />
            </a>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          TAB 3: TERMS & CONDITIONS (Interactive Accordion & Rules)
      ──────────────────────────────────────────────────────────────────────── */}
      {(activeTab === 'terms' || activeTab === 'all') && (
        <div className="glass rounded-3xl p-5 sm:p-7 border border-white/10 space-y-6 animate-in fade-in-50 duration-300 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6A00]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFB300]/20 to-[#FF6A00]/10 border border-[#FFB300]/40 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(255,179,0,0.2)]">
                📜
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Terms & Conditions
                </h3>
                <p className="text-xs text-gray-400">
                  Official travel agreement, passenger safety protocols, and operational guidelines.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleAllTerms}
              className="self-start sm:self-auto text-xs text-[#FFB300] hover:text-[#FF6A00] font-bold px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              {TERMS_LIST.every(t => openTerms[t.id]) ? 'Collapse All' : 'Expand All'}
            </button>
          </div>

          {/* Terms Accordion Items */}
          <div className="space-y-3">
            {TERMS_LIST.map((item, idx) => {
              const isOpen = Boolean(openTerms[item.id]);

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? 'bg-black/50 border-[#FFB300]/30 shadow-[0_4px_25px_rgba(255,179,0,0.06)]'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Clickable Header */}
                  <button
                    type="button"
                    onClick={() => toggleTerm(item.id)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center text-xs shrink-0 font-mono font-bold">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFB300]/10 border border-[#FFB300]/20 text-[#FFB300] uppercase tracking-wider">
                            {item.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm sm:text-base truncate">
                          {item.title}
                        </h4>
                        {!isOpen && (
                          <p className="text-xs text-gray-500 truncate mt-0.5 max-w-sm sm:max-w-xl">
                            {item.summary}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <ChevronDown
                        className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-[#FFB300]' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expanded Body Content */}
                  {isOpen && (
                    <div className="px-4 pb-5 pt-2 sm:px-6 sm:pb-6 border-t border-white/5 bg-gradient-to-b from-black/40 via-black/20 to-transparent">
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs sm:text-sm text-gray-300 leading-relaxed">
                        {item.details}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legal Acceptance Note */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>By proceeding with your booking, you acknowledge and agree to STM Rider terms & safety policies.</span>
            </div>
            <span className="text-[11px] font-mono text-gray-500 hidden sm:inline">Updated Oct 2026</span>
          </div>
        </div>
      )}
    </div>
  );
}
