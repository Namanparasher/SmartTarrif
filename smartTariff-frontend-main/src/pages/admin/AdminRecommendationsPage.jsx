import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { collections, getAll } from "@/mockApi/db";
import Card from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import EmptyState from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/Loader";
import Pagination from "@/components/common/Pagination";
import { formatDate, scoreColor } from "@/utils/format";

const PAGE_SIZE = 10;

export default function AdminRecommendationsPage() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const users = getAll(collections.users);
    const plans = getAll(collections.plans);
    const recs = getAll(collections.recommendations)
      .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt))
      .map((r) => {
        const top = r.plans.find((p) => p.rank === 1);
        return {
          _id: r._id,
          customerName: users.find((u) => u._id === r.customerId)?.name || "Unknown",
          generatedAt: r.generatedAt,
          topPlan: plans.find((p) => p._id === top?.planId)?.name || "N/A",
          topScore: top?.score || 0,
          planCount: r.plans.length,
        };
      });
    setRows(recs);
    setStatus("succeeded");
  }, []);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Recommendation Statistics</h1>
        <p className="mt-1 text-sm text-slate-500">All recommendation results generated across the platform.</p>
      </div>

      <Card>
        {status === "loading" && <TableSkeleton rows={6} cols={4} />}
        {status === "succeeded" && rows.length === 0 && <EmptyState icon={Sparkles} title="No recommendations generated yet" />}
        {status === "succeeded" && rows.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-slate-500">
                    <th className="p-4 font-medium">Customer</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Top Plan</th>
                    <th className="p-4 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r) => (
                    <tr key={r._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="p-4 font-medium text-slate-800">{r.customerName}</td>
                      <td className="p-4 text-slate-600">{formatDate(r.generatedAt)}</td>
                      <td className="p-4 text-slate-600">{r.topPlan}</td>
                      <td className="p-4"><Badge variant="info" className={scoreColor(r.topScore)}>{r.topScore}%</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
