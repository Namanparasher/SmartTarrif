import { Database, Phone, MessageSquare, IndianRupee, ArrowRight } from "lucide-react";
import Button from "@/components/common/Button";
import { formatCurrency, formatData, formatMinutes, formatCount } from "@/utils/format";

export default function UsageSummary({ usage, budget, onGetRecommendations, loading }) {
  // Default values if no usage recorded yet
  const dataValue = usage ? formatData(usage.dataUsage) : "42 GB";
  const voiceValue = usage ? formatMinutes(usage.callMinutes) : "350 mins";
  const smsValue = usage ? `${usage.smsCount} SMS` : "40 SMS";
  const budgetValue = budget ? budget : 500;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#4935D4] tracking-tight">
          Your Monthly Usage
        </h2>
      </div>

      {/* 4 Usage Metric Cards in 1 Row */}
      <div className="mt-4 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {/* Data Usage */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-[#FAFAFE] p-3.5 transition hover:border-slate-200">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Database className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Data Usage</span>
          </div>
          <div className="mt-2.5">
            <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#081936]">
              {dataValue}
            </p>
            <p className="text-[10px] font-medium text-slate-400">in GB</p>
          </div>
        </div>

        {/* Voice Usage */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-[#FAFAFE] p-3.5 transition hover:border-slate-200">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Phone className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Voice Usage</span>
          </div>
          <div className="mt-2.5">
            <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#081936]">
              {voiceValue}
            </p>
            <p className="text-[10px] font-medium text-slate-400">in minutes</p>
          </div>
        </div>

        {/* SMS Usage */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-[#FAFAFE] p-3.5 transition hover:border-slate-200">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <MessageSquare className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">SMS Usage</span>
          </div>
          <div className="mt-2.5">
            <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#081936]">
              {smsValue}
            </p>
            <p className="text-[10px] font-medium text-slate-400">in messages</p>
          </div>
        </div>

        {/* Monthly Budget */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-[#FAFAFE] p-3.5 transition hover:border-slate-200">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-[#4935D4]">
              <IndianRupee className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Monthly Budget</span>
          </div>
          <div className="mt-2.5">
            <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#081936]">
              ₹{budgetValue} <span className="text-xs font-normal text-slate-400">INR</span>
            </p>
            <p className="text-[10px] font-medium text-slate-400">amount in ₹</p>
          </div>
        </div>
      </div>

      {/* Action CTA Button */}
      <div className="mt-4 flex justify-end">
        <Button
          onClick={onGetRecommendations}
          loading={loading}
          className="rounded-xl px-5 py-2.5 text-xs font-bold shadow-md shadow-indigo-200 cursor-pointer"
        >
          <span>Get Recommendations</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
