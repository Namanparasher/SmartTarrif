import { Link } from "react-router-dom";
import { CheckCircle2, Wifi, Phone, MessageSquare, Trophy } from "lucide-react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { formatCurrency, formatData, formatMinutes, formatCount, scoreColor } from "@/utils/format";

const RANK_STYLES = {
  1: "from-amber-400 to-yellow-500",
  2: "from-slate-300 to-slate-400",
  3: "from-orange-300 to-amber-500",
};

export default function RecommendationCard({ item, onCompareToggle, isComparing }) {
  const { plan, score, rank, reasons } = item;
  if (!plan) return null;

  return (
    <Card className="relative flex flex-col overflow-hidden">
      <div className={`flex items-center justify-between bg-gradient-to-r ${RANK_STYLES[rank] || "from-indigo-400 to-indigo-600"} px-5 py-3 text-white`}>
        <div className="flex items-center gap-2 font-semibold">
          <Trophy className="h-4 w-4" /> Rank #{rank}
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide opacity-90">Match Score</p>
          <p className="text-xl font-bold leading-none">{score}%</p>
        </div>
      </div>

      <div className="flex-1 px-5 py-4">
        <p className="text-xs font-medium uppercase text-indigo-500">{plan.operator}</p>
        <h3 className="mt-0.5 text-lg font-semibold text-slate-900">{plan.name}</h3>
        <p className={`mt-1 text-2xl font-bold ${scoreColor(score)}`}>{formatCurrency(plan.price)}<span className="text-sm font-normal text-slate-400">/month</span></p>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center text-xs">
          <div>
            <Wifi className="mx-auto mb-1 h-4 w-4 text-indigo-500" />
            <p className="font-semibold text-slate-800">{formatData(plan.dataLimit)}</p>
          </div>
          <div>
            <Phone className="mx-auto mb-1 h-4 w-4 text-indigo-500" />
            <p className="font-semibold text-slate-800">{formatMinutes(plan.callMinutes)}</p>
          </div>
          <div>
            <MessageSquare className="mx-auto mb-1 h-4 w-4 text-indigo-500" />
            <p className="font-semibold text-slate-800">{formatCount(plan.smsLimit)}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-slate-700">Why this plan?</p>
          <ul className="space-y-1.5">
            {reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex gap-2 border-t border-slate-100 px-5 py-3">
        <Link to={`/plans/${plan._id}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full">View Plan</Button>
        </Link>
        {onCompareToggle && (
          <Button variant={isComparing ? "primary" : "outline"} size="sm" onClick={() => onCompareToggle(plan._id)}>
            Compare
          </Button>
        )}
      </div>
    </Card>
  );
}
