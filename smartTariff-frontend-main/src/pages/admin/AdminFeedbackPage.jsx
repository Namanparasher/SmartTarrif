import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { feedbackApi } from "@/services/feedbackApi";
import Card from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import Pagination from "@/components/common/Pagination";
import EmptyState from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/Loader";
import { formatDate } from "@/utils/format";

export default function AdminFeedbackPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [status, setStatus] = useState("loading");

  const load = (page = 1) => {
    setStatus("loading");
    feedbackApi.listAll({ page, limit: 8 })
      .then((res) => { setData(res.data.data); setPagination(res.data.pagination); setStatus("succeeded"); })
      .catch(() => setStatus("failed"));
  };

  useEffect(() => { load(1); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customer Feedback</h1>
        <p className="mt-1 text-sm text-slate-500">Feedback submitted on recommendation usefulness.</p>
      </div>

      <Card>
        {status === "loading" && <TableSkeleton rows={6} cols={4} />}
        {status === "succeeded" && data.length === 0 && <EmptyState icon={MessageSquare} title="No feedback submitted yet" />}
        {status === "succeeded" && data.length > 0 && (
          <>
            <div className="divide-y divide-slate-100">
              {data.map((f) => (
                <div key={f._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-800">{f.customerName}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={f.rating === "up" ? "success" : "danger"}>{f.rating === "up" ? "👍 Helpful" : "👎 Not helpful"}</Badge>
                      <span className="text-xs text-slate-400">{formatDate(f.createdAt)}</span>
                    </div>
                  </div>
                  {f.comment && <p className="mt-2 text-sm text-slate-600">"{f.comment}"</p>}
                </div>
              ))}
            </div>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={load} />
          </>
        )}
      </Card>
    </div>
  );
}
