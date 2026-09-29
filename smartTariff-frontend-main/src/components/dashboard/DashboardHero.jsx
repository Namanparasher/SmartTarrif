import { Wifi, PhoneCall, Sparkles } from "lucide-react";

export default function DashboardHero() {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center pt-1 pb-2">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#081936]">
          Find Your Best Plan
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium max-w-xl">
          Tell us about your monthly usage and we will recommend the best plans for you.
        </p>
      </div>

      {/* Decorative Telecom Hero Illustration */}
      <div className="hidden md:flex items-center gap-3 shrink-0 select-none">
        <div className="relative flex items-center justify-center">
          {/* Subtle floating bubble 1: WiFi */}
          <div className="absolute -top-3 left-4 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-[#4935D4] shadow-sm animate-bounce duration-1000">
            <Wifi className="h-3.5 w-3.5" />
          </div>
          {/* Subtle floating bubble 2: Phone */}
          <div className="absolute -bottom-2 -left-3 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-sm">
            <PhoneCall className="h-3.5 w-3.5" />
          </div>

          {/* Clean Vector Character Avatar */}
          <div className="h-16 w-16 overflow-hidden rounded-full bg-gradient-to-tr from-indigo-100 to-purple-50 ring-4 ring-white shadow-md flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="h-full w-full object-cover">
              <circle cx="50" cy="50" r="50" fill="#EEECFC" />
              {/* Hair back */}
              <path d="M28 45 C 28 20, 72 20, 72 45 C 72 65, 68 75, 68 75 L 32 75 C 32 75, 28 65, 28 45 Z" fill="#202124" />
              {/* Face */}
              <ellipse cx="50" cy="48" rx="18" ry="20" fill="#FCD5B5" />
              {/* Hair front */}
              <path d="M30 40 Q 50 25 70 40 Q 60 30 50 32 Q 40 30 30 40 Z" fill="#202124" />
              {/* Clothes */}
              <path d="M24 95 Q 50 72 76 95 Z" fill="#4935D4" />
              {/* Smartphone */}
              <rect x="58" y="52" width="12" height="22" rx="2" fill="#081936" transform="rotate(-10 58 52)" />
              <rect x="60" y="54" width="8" height="15" rx="1" fill="#60A5FA" transform="rotate(-10 58 52)" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
