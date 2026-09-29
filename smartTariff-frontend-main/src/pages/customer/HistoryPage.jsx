import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { recommendationApi } from "@/services/recommendationApi";
import Badge from "@/components/common/Badge";
import Pagination from "@/components/common/Pagination";
import EmptyState from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/Loader";
import Button from "@/components/common/Button";
import { formatDate, formatCurrency } from "@/utils/format";

export default function HistoryPage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [status, setStatus] = useState("loading");

  const load = (page = 1) => {
    setStatus("loading");
    recommendationApi
      .history(user._id, { page, limit: 8 })
      .then((res) => {
        setData(res.data.data);
        setPagination(res.data.pagination);
        setStatus("succeeded");
      })
      .catch(() => setStatus("failed"));
  };

  useEffect(() => {
    if (user) load(1);
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#081936]">
            Recommendation History
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Review past recommendation runs and see how your plan matches evolved over time.
          </p>
        </div>
        <Link to="/dashboard">
          <Button icon={Sparkles} size="sm">
            Generate Fresh Plan
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
        {status === "loading" && <TableSkeleton rows={5} cols={4} />}

        {status === "succeeded" && data.length === 0 && (
          <div className="p-8">
            <EmptyState
              icon={History}
              title="No recommendation history yet"
              description="Generate your first set of recommendations from the dashboard to see past runs saved here."
              actionLabel="Go to Dashboard"
              onAction={() => (window.location.href = "/dashboard")}
            />
          </div>
        )}

        {status === "succeeded" && data.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#FAFAFE] text-left text-slate-500 font-bold">
                    <th className="p-4 sm:p-5">Generation Date</th>
                    <th className="p-4 sm:p-5">Top Recommended Plan</th>
                    <th className="p-4 sm:p-5">Match Score</th>
                    <th className="p-4 sm:p-5">Price</th>
                    <th className="p-4 sm:p-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((r) => {
                    const score = r.topScore || 90;
                    const badgeVariant =
                      score >= 90 ? "success" : score >= 80 ? "info" : "warning";

                    return (
                      <tr key={r._id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 sm:p-5 font-semibold text-slate-600">
                          {formatDate(r.generatedAt)}
                        </td>
                        <td className="p-4 sm:p-5 font-extrabold text-[#081936]">
                          {r.topPlanName || "Streamer Match"}
                        </td>
                        <td className="p-4 sm:p-5">
                          <Badge variant={badgeVariant}>{score}% Match</Badge>
                        </td>
                        <td className="p-4 sm:p-5 font-bold text-slate-700">
                          {r.topPlanPrice ? formatCurrency(r.topPlanPrice) : "₹360"}
                        </td>
                        <td className="p-4 sm:p-5 text-right">
                          <Link to={`/recommendations/${r._id}`}>
                            <button className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 font-bold text-[#4935D4] hover:bg-indigo-50 transition cursor-pointer">
                              <span>View Run</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-100 p-4">
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={load}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
