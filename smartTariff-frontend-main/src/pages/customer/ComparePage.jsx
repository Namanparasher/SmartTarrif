import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { X, Scale, Check, Zap, Database, Phone, MessageSquare, IndianRupee } from "lucide-react";
import { planApi } from "@/services/planApi";
import { clearCompare, toggleCompare } from "@/store/slices/planSlice";
import EmptyState from "@/components/common/EmptyState";
import { PageLoader } from "@/components/common/Loader";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import { formatCurrency, formatData, formatMinutes, formatCount } from "@/utils/format";

export default function ComparePage() {
  const compareList = useSelector((s) => s.plans.compareList);
  const dispatch = useDispatch();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!compareList.length) {
      setPlans([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(
      compareList.map((id) =>
        planApi.getById(id).then((r) => r.data).catch(() => null)
      )
    )
      .then((res) => setPlans(res.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [compareList]);

  if (loading) return <PageLoader label="Loading plan comparisons..." />;

  if (!plans.length) {
    return (
      <EmptyState
        icon={Scale}
        title="No plans selected for comparison"
        description="Browse the Plan Catalogue and select up to 3 plans to compare them side-by-side."
        actionLabel="Browse Plan Catalogue"
        onAction={() => (window.location.href = "/plans")}
      />
    );
  }

  // Find best values for highlight
  const lowestPrice = Math.min(...plans.map((p) => p.price));
  const highestData = Math.max(...plans.map((p) => p.dataLimit));

  const rows = [
    {
      label: "Plan Code",
      render: (p) => (
        <span className="rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-xs font-extrabold text-[#4935D4]">
          {p.planCode || p.planId || "PLAN"}
        </span>
      ),
    },
    {
      label: "Total Price",
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <span className="text-base font-extrabold text-[#081936]">{formatCurrency(p.price)}</span>
          {p.price === lowestPrice && plans.length > 1 && (
            <Badge variant="success">Lowest Total</Badge>
          )}
        </div>
      ),
    },
    {
      label: "Monthly Equivalent",
      render: (p) => (
        <span className="font-bold text-[#4935D4]">
          {p.monthlyEquivalent ? `₹${p.monthlyEquivalent}/mo` : formatCurrency(p.price)}
        </span>
      ),
    },
    {
      label: "Offer Type / Duration",
      render: (p) => (
        <div className="space-y-0.5">
          <span className="font-semibold text-slate-700">{p.offerType || "Standalone"}</span>
          <p className="text-[10px] text-slate-400">{p.validity} days ({p.durationMonths || 1} Month)</p>
        </div>
      ),
    },
    {
      label: "Bundle Savings",
      render: (p) =>
        p.discountPercent > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
            Save {p.discountPercent}% (₹{p.discountInr})
          </span>
        ) : (
          <span className="text-slate-400">Standard Price</span>
        ),
    },
    {
      label: "Data Allowance",
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-800">{formatData(p.dataLimit)}/mo</span>
          {p.dataLimit === highestData && plans.length > 1 && (
            <Badge variant="purple">Max Data</Badge>
          )}
        </div>
      ),
    },
    {
      label: "Voice Calling",
      render: (p) => (
        <span className="font-semibold text-emerald-700">
          {p.callMinutes >= 999999 || p.callMinutes === null ? "Unlimited Calls" : formatMinutes(p.callMinutes)}
        </span>
      ),
    },
    {
      label: "SMS Allowance",
      render: (p) => `${formatCount(p.smsLimit)} SMS/mo`,
    },
    {
      label: "5G Connectivity",
      render: (p) =>
        p.fiveG ? (
          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
            <Zap className="h-3.5 w-3.5" /> 5G Ready
          </span>
        ) : (
          <span className="text-slate-400">4G Standard</span>
        ),
    },
    {
      label: "Category",
      render: (p) => <Badge variant="info">{p.category}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={() => navigate("/plans")}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#4935D4] hover:underline cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Plans
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#081936]">
            Plan Comparison
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Comparing {plans.length} selected tariff plans side-by-side.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Trash2}
            onClick={() => dispatch(clearCompare())}
          >
            Clear All
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => navigate("/plans")}
          >
            Add More Plans
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
        <table className="w-full min-w-[650px] border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-[#FAFAFE]">
              <th className="p-4 sm:p-5 text-left font-bold text-slate-500 w-1/4">
                Feature / Plan
              </th>
              {plans.map((p) => (
                <th key={p._id} className="p-4 sm:p-5 text-left w-1/4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="rounded-md bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 text-[10px] font-extrabold text-[#4935D4]">
                        {p.planCode || p.planId || "PLAN"}
                      </span>
                      <h3 className="mt-1 font-extrabold text-sm text-[#081936]">{p.name}</h3>
                    </div>
                    <button
                      onClick={() => dispatch(toggleCompare(p._id))}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition"
                      title="Remove from comparison"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/40 transition">
                <td className="p-4 sm:p-5 font-bold text-slate-600 bg-slate-50/20">
                  {row.label}
                </td>
                {plans.map((p) => (
                  <td key={p._id} className="p-4 sm:p-5 text-slate-700">
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-slate-50/40">
              <td className="p-4 sm:p-5 font-bold text-slate-600">Action</td>
              {plans.map((p) => (
                <td key={p._id} className="p-4 sm:p-5">
                  <Link to={`/plans/${p._id}`}>
                    <Button size="sm" variant="primary" className="w-full">
                      View Full Details
                    </Button>
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
