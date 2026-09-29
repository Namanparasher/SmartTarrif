import { Database, Phone, MessageSquare } from "lucide-react";
import { formatData, formatMinutes, formatCount } from "@/utils/format";

export default function UsageVsPlan({ usage, topPlan }) {
  // Safe defaults if usage or topPlan are not loaded yet
  const userUsageData = usage?.dataUsage ?? 42;
  const planData = topPlan?.dataLimit ?? 100;
  const dataPercentage = Math.min(100, Math.round((userUsageData / Math.max(planData, 1)) * 100));

  const userCalls = usage?.callMinutes ?? 350;
  const planCalls = topPlan?.callMinutes ?? 999999;
  const callsLabel = planCalls === null || planCalls >= 999999 ? "Unlimited" : formatMinutes(planCalls);
  const callsPercentage = planCalls === null || planCalls >= 999999 ? 40 : Math.min(100, Math.round((userCalls / planCalls) * 100));

  const userSms = usage?.smsCount ?? 40;
  const planSms = topPlan?.smsLimit ?? 100;
  const smsPercentage = planSms === null || planSms >= 999999 ? 30 : Math.min(100, Math.round((userSms / Math.max(planSms, 1)) * 100));

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
      <h2 className="text-sm font-bold text-[#4935D4] tracking-tight">
        Your Usage vs Plan (Top 1)
      </h2>

      {/* Legend */}
      <div className="mt-2.5 flex items-center gap-4 text-[11px] font-medium text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#4935D4]" />
          <span>Your Usage</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#E2E8F0]" />
          <span>Plan Allowance</span>
        </div>
      </div>

      {/* Horizontal Comparisons */}
      <div className="mt-4 space-y-4">
        {/* Data Item */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 text-slate-700">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-50 text-emerald-600">
                <Database className="h-3 w-3" />
              </div>
              <span>Data</span>
            </div>
            <div className="text-[11px] text-slate-500">
              <span className="font-bold text-[#081936]">{userUsageData} GB</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative h-2 w-full flex-1 overflow-hidden rounded-full bg-[#E2E8F0]">
              <div
                className="h-full rounded-full bg-[#4935D4] transition-all duration-700"
                style={{ width: `${dataPercentage}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400 min-w-10 text-right">
              {formatData(planData)}
            </span>
          </div>
        </div>

        {/* Voice Item */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 text-slate-700">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-50 text-emerald-600">
                <Phone className="h-3 w-3" />
              </div>
              <span>Voice</span>
            </div>
            <div className="text-[11px] text-slate-500">
              <span className="font-bold text-[#081936]">{userCalls} mins</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative h-2 w-full flex-1 overflow-hidden rounded-full bg-[#E2E8F0]">
              <div
                className="h-full rounded-full bg-[#4935D4] transition-all duration-700"
                style={{ width: `${callsPercentage}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400 min-w-10 text-right">
              {callsLabel}
            </span>
          </div>
        </div>

        {/* SMS Item */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 text-slate-700">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-purple-50 text-[#4935D4]">
                <MessageSquare className="h-3 w-3" />
              </div>
              <span>SMS</span>
            </div>
            <div className="text-[11px] text-slate-500">
              <span className="font-bold text-[#081936]">{userSms} SMS</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative h-2 w-full flex-1 overflow-hidden rounded-full bg-[#E2E8F0]">
              <div
                className="h-full rounded-full bg-[#4935D4] transition-all duration-700"
                style={{ width: `${smsPercentage}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400 min-w-10 text-right">
              {planSms >= 999999 ? "Unlimited" : `${planSms} SMS`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
