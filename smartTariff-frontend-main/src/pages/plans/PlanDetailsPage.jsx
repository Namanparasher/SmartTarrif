import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
  Database,
  Phone,
  MessageSquare,
  Zap,
  Calendar,
  Scale,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { planApi } from "@/services/planApi";
import { toggleCompare } from "@/store/slices/planSlice";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import { PageLoader } from "@/components/common/Loader";
import ErrorState from "@/components/common/ErrorState";
import { formatCurrency, formatData, formatMinutes, formatCount } from "@/utils/format";
import { useAuth } from "@/hooks/useAuth";

export default function PlanDetailsPage() {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer } = useAuth();

  useEffect(() => {
    setStatus("loading");
    planApi
      .getById(id)
      .then((res) => {
        setPlan(res.data);
        setStatus("succeeded");
      })
      .catch((err) => {
        setError(err.message);
        setStatus("failed");
      });
  }, [id]);

  if (status === "loading") return <PageLoader label="Loading plan details..." />;
  if (status === "failed")
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState message={error} />
      </div>
    );
  if (!plan) return null;

  const handleGetRecommendation = () => {
    if (!isAuthenticated) return navigate("/login");
    navigate("/dashboard");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#4935D4] transition cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Catalogue
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-slate-100 bg-[#FAFAFE] p-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-xs font-extrabold text-[#4935D4]">
                    {plan.planCode || plan.planId || "PLAN"}
                  </span>
                </div>
                <h1 className="mt-1 text-2xl font-extrabold text-[#081936]">{plan.name}</h1>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <Badge variant="purple">{plan.category}</Badge>
                  {plan.offerType && <Badge variant="info">{plan.offerType}</Badge>}
                  {plan.fiveG && <Badge variant="success">5G Ready</Badge>}
                  {plan.discountPercent > 0 && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                      Save {plan.discountPercent}% (₹{plan.discountInr})
                    </span>
                  )}
                  {!plan.isActive && <Badge variant="danger">Inactive</Badge>}
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-3xl font-extrabold text-[#081936]">{formatCurrency(plan.price)}</p>
                <p className="text-xs text-slate-400">Total for {plan.validity} days</p>
                {plan.durationMonths > 1 && (
                  <p className="mt-1 text-xs font-bold text-[#4935D4]">
                    ₹{plan.monthlyEquivalent}/month equivalent
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Bundle Savings Highlight */}
              {plan.discountPercent > 0 && (
                <div className="rounded-xl bg-emerald-50/80 border border-emerald-200/80 p-4 text-xs font-semibold text-emerald-900 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-extrabold text-emerald-800">Bundle Value Offer: </span>
                    Individual monthly recharge would cost ₹{plan.individualCost}. With this {plan.durationMonths}-month plan, you pay ₹{plan.price} and save ₹{plan.discountInr} ({plan.discountPercent}% off).
                  </div>
                  <span className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                    {plan.discountPercent}% OFF
                  </span>
                </div>
              )}

              {/* 4 Feature Cards */}
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                {[
                  [Database, "Data Allowance", `${formatData(plan.dataLimit)}/mo`],
                  [Phone, "Voice Calling", plan.callMinutes >= 999999 || plan.callMinutes === null ? "Unlimited Voice" : formatMinutes(plan.callMinutes)],
                  [MessageSquare, "SMS Allowance", `${formatCount(plan.smsLimit)} SMS/mo`],
                  [Calendar, "Validity Period", `${plan.validity} Days (${plan.durationMonths || 1}M)`],
                ].map(([Icon, label, val]) => (
                  <div key={label} className="rounded-xl border border-slate-100 bg-[#FAFAFE] p-3.5 text-center">
                    <Icon className="mx-auto mb-1.5 h-4 w-4 text-[#4935D4]" />
                    <p className="text-[10px] font-medium text-slate-400">{label}</p>
                    <p className="mt-0.5 text-xs font-bold text-[#081936]">{val}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold text-[#081936] mb-1.5">Plan Overview</h3>
                <p className="text-xs leading-relaxed text-slate-600 font-medium">
                  {plan.description}
                </p>
              </div>

              {/* Included Benefits */}
              <div>
                <h3 className="text-xs font-bold text-[#081936] mb-2.5">Included Benefits & Value Adds</h3>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {plan.benefits?.map((b, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 rounded-xl border border-slate-100 bg-[#FAFAFE] p-3 text-xs font-semibold text-slate-700"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Regulatory Policy */}
              <div className="rounded-xl bg-amber-50/70 border border-amber-100 p-3.5 text-[11px] text-amber-800 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <p>
                  <strong>Terms & Compliance:</strong> Plan benefits are governed by telecom TRAI fair usage policies and operator network terms.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Action Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] space-y-3">
            <Button className="w-full" icon={Sparkles} onClick={handleGetRecommendation}>
              Score Against My Usage
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              icon={Scale}
              onClick={() => {
                dispatch(toggleCompare(plan._id));
                toast.success("Plan added to comparison");
                navigate("/compare");
              }}
            >
              Add to Compare
            </Button>
            <Link to="/plans">
              <Button variant="ghost" className="w-full">
                Browse More Plans
              </Button>
            </Link>
          </div>

          <div className="rounded-2xl bg-[#081936] p-5 text-white shadow-md">
            <h4 className="text-xs font-bold">Unsure if this plan fits you?</h4>
            <p className="mt-1 text-[11px] text-slate-300 leading-relaxed">
              Use our rule-based scoring engine to test this plan against your actual voice and data consumption habits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
