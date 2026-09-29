import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { customerApi } from "@/services/customerApi";
import Card, { CardBody, CardHeader } from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import { PageLoader } from "@/components/common/Loader";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import { formatData, formatMinutes, formatCount, formatCurrency, formatDate, monthKeyToLabel, scoreColor } from "@/utils/format";
import { UsageAreaChart } from "@/components/charts/UsageChart";

export default function AdminCustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    customerApi.getDetail(id).then((res) => { setData(res.data); setStatus("succeeded"); }).catch(() => setStatus("failed"));
  }, [id]);

  if (status === "loading") return <PageLoader label="Loading customer profile..." />;
  if (status === "failed") return <ErrorState message="Could not load customer details" />;

  const { user, profile, usage, recommendations, feedback, currentPlan } = data;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600">
        <ArrowLeft className="h-4 w-4" /> Back to Customers
      </button>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-sm text-slate-500">{user.email} · {user.phone}</p>
          </div>
        </div>
        <Badge variant={user.isActive ? "success" : "danger"}>{user.isActive ? "Active" : "Inactive"}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><h2 className="font-semibold text-slate-800">Current Plan</h2></CardHeader>
          <CardBody>
            {currentPlan ? (
              <>
                <p className="font-semibold text-slate-800">{currentPlan.name}</p>
                <p className="text-sm text-slate-500">{currentPlan.operator} · {formatCurrency(currentPlan.price)}/mo</p>
              </>
            ) : <p className="text-sm text-slate-400">No active plan assigned</p>}
          </CardBody>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold text-slate-800">Preferences</h2></CardHeader>
          <CardBody className="space-y-1.5 text-sm">
            <p className="flex justify-between"><span className="text-slate-500">Monthly Budget</span><span className="font-medium">{formatCurrency(profile?.monthlyBudget)}</span></p>
            <p className="flex justify-between"><span className="text-slate-500">Min. Data</span><span className="font-medium">{formatData(profile?.minimumData)}</span></p>
            <p className="flex justify-between"><span className="text-slate-500">Min. Calls</span><span className="font-medium">{formatMinutes(profile?.minimumCallMinutes)}</span></p>
            <p className="flex justify-between"><span className="text-slate-500">5G Required</span><span className="font-medium">{profile?.requires5G ? "Yes" : "No"}</span></p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold text-slate-800">Latest Usage</h2></CardHeader>
          <CardBody className="space-y-1.5 text-sm">
            {usage[0] ? (
              <>
                <p className="flex justify-between"><span className="text-slate-500">Data</span><span className="font-medium">{formatData(usage[0].dataUsage)}</span></p>
                <p className="flex justify-between"><span className="text-slate-500">Calls</span><span className="font-medium">{formatMinutes(usage[0].callMinutes)}</span></p>
                <p className="flex justify-between"><span className="text-slate-500">SMS</span><span className="font-medium">{formatCount(usage[0].smsCount)}</span></p>
              </>
            ) : <p className="text-slate-400">No usage recorded</p>}
          </CardBody>
        </Card>
      </div>

      {usage.length > 0 && (
        <Card>
          <CardHeader><h2 className="font-semibold text-slate-800">Data Usage Trend</h2></CardHeader>
          <CardBody><UsageAreaChart data={usage.slice(0, 6)} dataKey="dataUsage" color="#6366f1" label="Data (GB)" /></CardBody>
        </Card>
      )}

      <Card>
        <CardHeader><h2 className="font-semibold text-slate-800">Recommendation History</h2></CardHeader>
        <CardBody>
          {recommendations.length ? (
            <div className="space-y-3">
              {recommendations.slice(0, 5).map((r) => {
                const top = r.plans.find((p) => p.rank === 1);
                return (
                  <div key={r._id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 text-sm">
                    <span className="text-slate-500">{formatDate(r.generatedAt)}</span>
                    <span className={`font-semibold ${scoreColor(top?.score || 0)}`}>{top?.score}%</span>
                  </div>
                );
              })}
            </div>
          ) : <EmptyState title="No recommendations generated" />}
        </CardBody>
      </Card>

      <Card>
        <CardHeader><h2 className="font-semibold text-slate-800">Feedback</h2></CardHeader>
        <CardBody>
          {feedback.length ? (
            <div className="space-y-3">
              {feedback.map((f) => (
                <div key={f._id} className="rounded-lg border border-slate-100 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <Badge variant={f.rating === "up" ? "success" : "danger"}>{f.rating === "up" ? "Helpful" : "Not helpful"}</Badge>
                    <span className="text-xs text-slate-400">{formatDate(f.createdAt)}</span>
                  </div>
                  {f.comment && <p className="mt-2 text-slate-600">{f.comment}</p>}
                </div>
              ))}
            </div>
          ) : <EmptyState title="No feedback submitted" />}
        </CardBody>
      </Card>
    </div>
  );
}
