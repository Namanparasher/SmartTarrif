import { useEffect, useState } from "react";
import { Users, PackageCheck, Sparkles, Gauge } from "lucide-react";
import { adminApi } from "@/services/adminApi";
import Card, { CardBody, CardHeader } from "@/components/common/Card";
import { CardSkeleton } from "@/components/common/Loader";
import { SimpleBarChart, SimplePieChart, SimpleLineChart } from "@/components/charts/UsageChart";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    adminApi.dashboard().then((res) => { setData(res.data); setStatus("succeeded"); }).catch(() => setStatus("failed"));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Platform-wide statistics and recommendation performance.</p>
      </div>

      {status === "loading" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {data && (
        <>
          {/* ML Engine Status Banner */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900">SmartTariff V3.2 ML Engine</h3>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                    Active & Serving
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  RandomForestRegressor • 10 Input Features • 100 Estimators • Trained on 20,000 Customers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-white border border-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs">
                20 Active Tariff Plans Seeded
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Users} label="Total Customers" value={data.cards.totalCustomers} color="indigo" />
            <StatCard icon={PackageCheck} label="Total Active Plans" value={data.cards.activePlans} color="emerald" />
            <StatCard icon={Sparkles} label="Total Recommendations" value={data.cards.totalRecommendations} color="purple" />
            <StatCard icon={Gauge} label="Avg. Recommendation Score" value={`${data.cards.avgScore}%`} color="amber" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><h2 className="font-semibold text-slate-800">Customers Over Time</h2></CardHeader>
              <CardBody><SimpleLineChart data={data.customersOverTime} xKey="month" dataKey="customers" color="#6366f1" /></CardBody>
            </Card>
            <Card>
              <CardHeader><h2 className="font-semibold text-slate-800">Most Recommended Plans</h2></CardHeader>
              <CardBody><SimpleBarChart data={data.mostRecommended} xKey="name" dataKey="count" color="#8b5cf6" /></CardBody>
            </Card>
            <Card>
              <CardHeader><h2 className="font-semibold text-slate-800">Plan Category Distribution</h2></CardHeader>
              <CardBody><SimplePieChart data={data.usageDistribution} /></CardBody>
            </Card>
            <Card>
              <CardHeader><h2 className="font-semibold text-slate-800">Recommendation Score Distribution</h2></CardHeader>
              <CardBody><SimpleBarChart data={data.scoreDistribution} xKey="range" dataKey="count" color="#f59e0b" /></CardBody>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader><h2 className="font-semibold text-slate-800">Feedback Statistics</h2></CardHeader>
              <CardBody><SimplePieChart data={data.feedbackStats} height={220} /></CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = { indigo: "bg-indigo-50 text-indigo-600", emerald: "bg-emerald-50 text-emerald-600", purple: "bg-purple-50 text-purple-600", amber: "bg-amber-50 text-amber-600" };
  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{label}</p>
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors[color]}`}><Icon className="h-4.5 w-4.5" /></span>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      </CardBody>
    </Card>
  );
}
