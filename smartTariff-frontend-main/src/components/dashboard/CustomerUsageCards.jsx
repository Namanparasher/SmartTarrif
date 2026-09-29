import React from "react";
import {
  Database,
  Phone,
  MessageSquare,
  IndianRupee,
  Wallet,
  Calendar,
  Edit3,
} from "lucide-react";
import Button from "@/components/common/Button";

function formatDuration(val) {
  if (!val) return { display: "1 Month", unit: "28d" };
  const num = Number(val);
  if (num === 28 || num === 30) return { display: "1 Month", unit: "28-30d" };
  if (num === 84 || num === 90) return { display: "3 Months", unit: "84-90d" };
  if (num === 180) return { display: "6 Months", unit: "180d" };
  if (num === 365) return { display: "1 Year", unit: "365d" };
  return { display: `${num} Days`, unit: "days" };
}

export default function CustomerUsageCards({
  usage = {
    dataUsage: 42,
    callMinutes: 350,
    smsCount: 40,
    currentSpending: 1000,
    monthlyBudget: 500,
    preferredDuration: "28",
  },
  onOpenForm,
}) {
  const durationInfo = formatDuration(usage.preferredDuration);

  const cards = [
    {
      id: "data",
      label: "Data Usage",
      value: usage.dataUsage || 0,
      unit: "GB",
      subtext: "in GB",
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100/60",
      icon: Database,
    },
    {
      id: "voice",
      label: "Voice Usage",
      value: usage.callMinutes || 0,
      unit: "mins",
      subtext: "in minutes",
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100/60",
      icon: Phone,
    },
    {
      id: "sms",
      label: "SMS Usage",
      value: usage.smsCount || 0,
      unit: "SMS",
      subtext: "in messages",
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100/60",
      icon: MessageSquare,
    },
    {
      id: "spending",
      label: "Current Spending",
      value: usage.currentSpending || 1000,
      unit: "INR",
      subtext: "monthly spend",
      iconBg: "bg-amber-50 text-amber-600 border border-amber-100/60",
      icon: Wallet,
    },
    {
      id: "budget",
      label: "Monthly Budget",
      value: usage.monthlyBudget || 500,
      unit: "INR",
      subtext: "amount in ₹",
      iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-100/60",
      icon: IndianRupee,
    },
    {
      id: "duration",
      label: "Preferred Duration",
      value: durationInfo.display,
      unit: durationInfo.unit,
      subtext: "plan validity",
      iconBg: "bg-sky-50 text-sky-600 border border-sky-100/60",
      icon: Calendar,
      isTextValue: true,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Header bar with Set Input Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-[#081936] tracking-tight flex items-center gap-2">
            <span>Your Usage & Budget Input</span>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200/60">
              Active
            </span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Click &quot;Set Input&quot; to change your usage requirements and match fresh plans.
          </p>
        </div>

        <Button
          onClick={onOpenForm}
          variant="primary"
          size="sm"
          icon={Edit3}
          className="rounded-xl shadow-md shadow-indigo-500/20 text-xs font-bold py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
        >
          <span>Set Input</span>
        </Button>
      </div>

      {/* 6 Usage & Budget Cards Grid (Matches User Image Style) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              onClick={onOpenForm}
              className="group relative cursor-pointer rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:border-[#4935D4]/40 hover:shadow-md transition-all duration-200"
            >
              {/* Top Row: Icon + Label */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${card.iconBg}`}
                >
                  <IconComponent className="h-5 w-5 stroke-[2.2]" />
                </div>
                <span className="text-xs sm:text-[13px] font-bold text-slate-700 leading-tight">
                  {card.label}
                </span>
              </div>

              {/* Middle Row: Big Number + Unit */}
              <div className="mt-3.5 flex items-baseline justify-between border-b border-slate-100/90 pb-2.5">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#081936]">
                  {card.isTextValue ? card.value : Number(card.value || 0).toLocaleString()}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-500">
                  {card.unit}
                </span>
              </div>

              {/* Bottom Row: Subtitle label */}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">
                  {card.subtext}
                </span>
                <span className="text-[10px] font-semibold text-[#4935D4] opacity-0 group-hover:opacity-100 transition">
                  Edit →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
