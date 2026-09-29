import { useEffect, useRef, useState } from "react";
import { Search, Upload, Database, Download } from "lucide-react";
import toast from "react-hot-toast";
import { usageApi } from "@/services/usageApi";
import { parseUsageCsv } from "@/utils/csv";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Pagination from "@/components/common/Pagination";
import EmptyState from "@/components/common/EmptyState";
import Modal from "@/components/common/Modal";
import { TableSkeleton } from "@/components/common/Loader";
import { formatData, formatMinutes, formatCount, monthKeyToLabel } from "@/utils/format";

export default function AdminUsagePage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [status, setStatus] = useState("loading");
  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  const load = (page = 1) => {
    setStatus("loading");
    usageApi.listAll({ page, limit: 8, search, month })
      .then((res) => { setData(res.data.data); setPagination(res.data.pagination); setStatus("succeeded"); })
      .catch(() => setStatus("failed"));
  };

  useEffect(() => { load(1); }, [search, month]);

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    try {
      const rows = await parseUsageCsv(file);
      const res = await usageApi.bulkImport(rows);
      setImportResult(res.data);
      toast.success(`Imported ${res.data.created} records`);
      load(1);
    } catch (err) {
      toast.error("Failed to parse CSV file");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usage Management</h1>
          <p className="mt-1 text-sm text-slate-500">View customer usage records and import bulk data via CSV.</p>
        </div>
        <Button icon={Upload} onClick={() => setImportOpen(true)}>Import CSV</Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="Search customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="max-w-xs" />
      </div>

      <Card>
        {status === "loading" && <TableSkeleton rows={6} cols={5} />}
        {status === "succeeded" && data.length === 0 && <EmptyState icon={Database} title="No usage records found" />}
        {status === "succeeded" && data.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-slate-500">
                    <th className="p-4 font-medium">Customer</th>
                    <th className="p-4 font-medium">Month</th>
                    <th className="p-4 font-medium">Data</th>
                    <th className="p-4 font-medium">Calls</th>
                    <th className="p-4 font-medium">SMS</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((u) => (
                    <tr key={u._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="p-4">
                        <p className="font-medium text-slate-800">{u.customerName}</p>
                        <p className="text-xs text-slate-400">{u.customerEmail}</p>
                      </td>
                      <td className="p-4 text-slate-600">{monthKeyToLabel(u.month)}</td>
                      <td className="p-4 text-slate-600">{formatData(u.dataUsage)}</td>
                      <td className="p-4 text-slate-600">{formatMinutes(u.callMinutes)}</td>
                      <td className="p-4 text-slate-600">{formatCount(u.smsCount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={load} />
          </>
        )}
      </Card>

      <Modal open={importOpen} onClose={() => { setImportOpen(false); setImportResult(null); }} title="Import Usage Data (CSV)">
        <div className="space-y-4">
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            <p className="mb-1 font-medium text-slate-600">Expected CSV format:</p>
            <code className="block whitespace-pre-wrap">customerId,dataUsage,callMinutes,smsCount,month{"\n"}C001,25,500,200,2026-08</code>
            <p className="mt-1">Use the customer's email address or internal ID as customerId.</p>
          </div>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} disabled={importing}
            className="w-full rounded-lg border border-dashed border-slate-300 p-4 text-sm" />
          {importResult && (
            <div className="rounded-lg border border-slate-200 p-3 text-sm">
              <p className="font-medium text-emerald-600">{importResult.created} records imported successfully</p>
              {importResult.errors.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-rose-500">
                  {importResult.errors.map((e, i) => <li key={i}>Row {e.row}: {e.message}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
