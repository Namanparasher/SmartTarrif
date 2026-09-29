import { Link } from "react-router-dom";
import { Database, Phone, MessageSquare, Zap, Scale, ArrowRight } from "lucide-react";
import Card from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import { formatCurrency, formatData, formatMinutes, formatCount } from "@/utils/format";

const CATEGORY_COLORS = {
  Basic: "default",
  "Basic Bundle": "default",
  "Basic Annual": "default",
  Caller: "warning",
  "Caller+": "warning",
  "Caller Bundle": "warning",
  "Caller Annual": "warning",
  Light: "info",
  "Light Bundle": "info",
  "Light Annual": "info",
  Standard: "info",
  "Standard+": "info",
  "Standard+ Bundle": "info",
  "Standard+ Annual": "info",
  Streamer: "purple",
  "Streamer+": "purple",
  "Streamer+ Bundle": "purple",
  "Streamer+ Annual": "purple",
  Premium: "success",
  "Premium+": "success",
};

export default function PlanCard({ plan, onCompareToggle, isComparing, compareDisabled }) {
  if (!plan) return null;

  const isMultiMonth = plan.durationMonths && plan.durationMonths > 1;
  const hasDiscount = plan.discountPercent && plan.discountPercent > 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition duration-200 hover:shadow-md hover:border-slate-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 bg-[#FAFAFE] px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[11px] font-extrabold text-[#4935D4]">
              {plan.planCode || plan.planId || "PLAN"}
            </span>
          </div>
          <h3 className="mt-1.5 text-base font-bold text-[#081936]">{plan.name}</h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={CATEGORY_COLORS[plan.category] || "default"}>{plan.category}</Badge>
          {hasDiscount && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/70">
              Save {plan.discountPercent}%
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-[#081936]">{formatCurrency(plan.price)}</span>
              <span className="text-xs font-medium text-slate-400">/{plan.validity} days</span>
            </div>
            {isMultiMonth && (
              <p className="mt-0.5 text-[11px] font-semibold text-[#4935D4]">
                ₹{plan.monthlyEquivalent}/mo equivalent • {plan.offerType || `${plan.durationMonths}-Month Bundle`}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-medium">
            <div className="flex items-center gap-2 text-slate-600">
              <Database className="h-4 w-4 text-[#4935D4]" />
              <span>{formatData(plan.dataLimit)}/mo</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="h-4 w-4 text-[#4935D4]" />
              <span>{plan.callMinutes >= 999999 || plan.callMinutes === null ? "Unlimited Voice" : formatMinutes(plan.callMinutes)}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <MessageSquare className="h-4 w-4 text-[#4935D4]" />
              <span>{formatCount(plan.smsLimit)} SMS/mo</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Zap className={`h-4 w-4 ${plan.fiveG ? "text-emerald-500" : "text-slate-400"}`} />
              <span>{plan.fiveG ? "5G Ready" : "4G"}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
          <Link to={`/plans/${plan._id}`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full justify-between">
              <span>View Details</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
          {onCompareToggle && (
            <Button
              variant={isComparing ? "primary" : "outline"}
              size="sm"
              icon={Scale}
              disabled={!isComparing && compareDisabled}
              onClick={() => onCompareToggle(plan._id)}
              title={isComparing ? "Remove from comparison" : "Add to comparison"}
            />
          )}
        </div>
      </div>
    </div>
  );
}

