import { CheckCircle2, Shield } from "lucide-react";

export default function RecommendationReasons() {
  const reasons = [
    "These plans fit your usage pattern",
    "Stay within your monthly budget",
    "Low chance of overage charges",
    "Better value for money",
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
      {/* Decorative Shield Icon top-right */}
      <div className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-[#4935D4] shadow-sm">
        <Shield className="h-5 w-5 fill-[#4935D4] text-[#4935D4]" />
      </div>

      <h2 className="text-sm font-bold text-[#4935D4] tracking-tight">
        Why these plans?
      </h2>

      <div className="mt-4 space-y-3">
        {reasons.map((reason, idx) => (
          <div key={idx} className="flex items-center gap-2.5">
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4 fill-emerald-600 text-white" />
            </div>
            <span className="text-xs font-semibold text-slate-700">{reason}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
