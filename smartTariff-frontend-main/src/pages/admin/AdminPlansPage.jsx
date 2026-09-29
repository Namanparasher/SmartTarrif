import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, PlusCircle, PackageSearch, Pencil, Trash2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { planApi } from "@/services/planApi";
import Card from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Select from "@/components/common/Select";
import Pagination from "@/components/common/Pagination";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { TableSkeleton } from "@/components/common/Loader";
import { formatCurrency, formatData, formatMinutes } from "@/utils/format";

export default function AdminPlansPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [status, setStatus] = useState("loading");
  const [confirmTarget, setConfirmTarget] = useState(null);

  const load = (page = 1) => {
    setStatus("loading");
    planApi.list({ page, limit: 8, search, status: statusFilter })
      .then((res) => { setData(res.data.data); setPagination(res.data.pagination); setStatus("succeeded"); })
      .catch(() => setStatus("failed"));
  };

  useEffect(() => { load(1); }, [search, statusFilter]);

  const handleToggleStatus = async () => {
    const { _id, isActive } = confirmTarget;
    if (isActive) await planApi.deactivate(_id);
    else await planApi.activate(_id);
    toast.success(`Plan ${isActive ? "deactivated" : "activated"}`);
    setConfirmTarget(null);
    load(pagination.page);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tariff Plan Management</h1>
          <p className="mt-1 text-sm text-slate-500">Create, edit and manage all tariff plans.</p>
        </div>
        <Link to="/admin/plans/create"><Button icon={PlusCircle}>Create Plan</Button></Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="Search by plan ID or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-xs">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      <Card>
        {status === "loading" && <TableSkeleton rows={6} cols={6} />}
        {status === "succeeded" && data.length === 0 && <EmptyState icon={PackageSearch} title="No plans found" actionLabel="Create Plan" onAction={() => (window.location.href = "/admin/plans/create")} />}
        {status === "succeeded" && data.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-slate-500">
                    <th className="p-4 font-medium">Plan</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Price</th>
                    <th className="p-4 font-medium">Data</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((p) => (
                    <tr key={p._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="p-4 font-medium text-slate-800">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-bold text-indigo-600 mr-2">
                          {p.planCode || p.planId || "PLAN"}
                        </span>
                        {p.name}
                      </td>
                      <td className="p-4 text-slate-600">{p.category}</td>
                      <td className="p-4 text-slate-600">{formatCurrency(p.price)}</td>
                      <td className="p-4 text-slate-600">{formatData(p.dataLimit)}</td>
                      <td className="p-4"><Badge variant={p.isActive ? "success" : "danger"}>{p.isActive ? "Active" : "Inactive"}</Badge></td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link to={`/admin/plans/${p._id}/edit`}><Button size="sm" variant="secondary" icon={Pencil}>Edit</Button></Link>
                          <Button size="sm" variant={p.isActive ? "danger" : "success"} icon={p.isActive ? Trash2 : CheckCircle} onClick={() => setConfirmTarget(p)}>
                            {p.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={load} />
          </>
        )}
      </Card>

      <ConfirmDialog
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleToggleStatus}
        title={confirmTarget?.isActive ? "Deactivate plan?" : "Activate plan?"}
        message={`This will ${confirmTarget?.isActive ? "deactivate" : "activate"} "${confirmTarget?.name}". Deactivated plans are hidden from customers but not deleted.`}
        confirmLabel={confirmTarget?.isActive ? "Deactivate" : "Activate"}
        variant={confirmTarget?.isActive ? "danger" : "success"}
      />
    </div>
  );
}
