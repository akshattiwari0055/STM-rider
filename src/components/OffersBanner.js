"use client";

export default function OffersBanner() {
  const items = [
    { icon: "🚗", text: "Book Your Vehicle Now", badge: "Easy & Fast" },
    { icon: "🛵", text: "Ride Anytime, Anywhere", badge: "Best Rates" },
    { icon: "🚙", text: "Hassle-Free Rentals", badge: "Book in Seconds" },
    { icon: "🛺", text: "Wide Range of Vehicles Available", badge: "Reserve Today" },
  ];

  // Duplicate for seamless infinite loop
  const repeated = [...items, ...items];

  return (
    <div className="overflow-hidden border-y-2 border-white/20 bg-gradient-to-r from-[#FF6A00] via-[#FFB300] to-[#FF6A00] py-3">
      <div
        className="flex w-max"
        style={{ animation: "ticker 22s linear infinite" }}
      >
        {repeated.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 whitespace-nowrap px-10 text-white"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-base font-bold tracking-wide">{item.text}</span>
            <span className="rounded-full bg-white/25 px-3 py-0.5 text-sm font-semibold">
              {item.badge}
            </span>
            <span className="h-2 w-2 rounded-full bg-white/60" />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}