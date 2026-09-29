import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { PlusCircle, Database, Phone, MessageSquare, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fetchMyUsage, addUsage } from "@/store/slices/usageSlice";
import Button from "@/components/common/Button";
import Select from "@/components/common/Select";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";
import EmptyState from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/Loader";
import { UsageAreaChart } from "@/components/charts/UsageChart";
import { formatData, formatMinutes, formatCount } from "@/utils/format";

const RANGES = [
  { value: "3m", label: "Last 3 months", months: 3 },
  { value: "6m", label: "Last 6 months", months: 6 },
  { value: "1y", label: "Last 1 year", months: 12 },
];

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function UsagePage() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { records, status } = useSelector((s) => s.usage);
  const [range, setRange] = useState("6m");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    dataUsage: "",
    callMinutes: "",
    smsCount: "",
    numberOfCalls: "",
    month: currentMonthKey(),
  });

  useEffect(() => {
    if (user) dispatch(fetchMyUsage(user._id));
  }, [dispatch, user]);

  const rangeMonths = RANGES.find((r) => r.value === range)?.months || 6;
  const filtered = useMemo(() => records.slice(0, rangeMonths), [records, rangeMonths]);

  const stats = useMemo(() => {
    if (!filtered.length) return null;
    const current = filtered[0];
    const previous = filtered[1];
    const avg = (key) => filtered.reduce((sum, r) => sum + r[key], 0) / filtered.length;
    const peak = (key) => Math.max(...filtered.map((r) => r[key]));
    return {
      current,
      previous,
      avgData: avg("dataUsage").toFixed(1),
      peakData: peak("dataUsage"),
      avgCalls: Math.round(avg("callMinutes")),
      peakCalls: peak("callMinutes"),
      totalCalls: filtered.reduce((s, r) => s + r.numberOfCalls, 0),
      avgCallDuration: (
        filtered.reduce((s, r) => s + (r.averageCallDuration || 0), 0) / filtered.length
      ).toFixed(1),
      totalSms: filtered.reduce((s, r) => s + r.smsCount, 0),
      avgSms: Math.round(avg("smsCount")),
    };
  }, [filtered]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const payload = {
      customerId: user._id,
      dataUsage: Number(form.dataUsage),
      callMinutes: Number(form.callMinutes),
      smsCount: Number(form.smsCount),
      numberOfCalls: Number(form.numberOfCalls) || undefined,
      month: form.month,
    };
    const res = await dispatch(addUsage(payload));
    if (addUsage.fulfilled.match(res)) {
      toast.success("Usage record saved successfully");
      setShowModal(false);
      setForm({
        dataUsage: "",
        callMinutes: "",
        smsCount: "",
        numberOfCalls: "",
        month: currentMonthKey(),
      });
    } else {
      toast.error(res.payload || "Failed to add usage record");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#081936]">
            Usage Analytics
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Detailed consumption telemetry across mobile data, call minutes and SMS volume.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 outline-none shadow-sm focus:border-[#4935D4]"
          >
            {RANGES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <Button icon={PlusCircle} onClick={() => setShowModal(true)}>
            Add Usage
          </Button>
        </div>
      </div>

      {status === "loading" && <TableSkeleton rows={4} cols={4} />}

      {status !== "loading" && !filtered.length && (
        <EmptyState
          title="No telemetry records logged yet"
          description="Add your first month's usage to unlock detailed visual trend analytics."
          actionLabel="Add Usage"
          onAction={() => setShowModal(true)}
        />
      )}

      {stats && (
        <>
          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <UsageDetailCard
              icon={Database}
              title="Data Consumption"
              color="indigo"
              rows={[
                ["Current Month", formatData(stats.current.dataUsage)],
                ["Previous Month", stats.previous ? formatData(stats.previous.dataUsage) : "-"],
                ["Average Usage", `${stats.avgData} GB`],
                ["Peak Month", formatData(stats.peakData)],
              ]}
            />
            <UsageDetailCard
              icon={Phone}
              title="Calling Minutes"
              color="emerald"
              rows={[
                ["Current Minutes", formatMinutes(stats.current.callMinutes)],
                ["Avg Duration/Call", `${stats.avgCallDuration} min`],
                ["Total Calls Placed", stats.totalCalls],
                ["Peak Minutes", formatMinutes(stats.peakCalls)],
              ]}
            />
            <UsageDetailCard
              icon={MessageSquare}
              title="SMS Messages"
              color="amber"
              rows={[
                ["Current Month", formatCount(stats.current.smsCount)],
                ["Previous Month", stats.previous ? formatCount(stats.previous.smsCount) : "-"],
                ["Average Monthly", formatCount(stats.avgSms)],
                ["Total Outgoing", formatCount(stats.totalSms)],
              ]}
            />
          </div>

          {/* 3 Area Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
              <h3 className="text-xs font-bold text-[#081936] mb-3">Data Trend (GB)</h3>
              <UsageAreaChart data={filtered} dataKey="dataUsage" color="#4935D4" label="Data" />
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
              <h3 className="text-xs font-bold text-[#081936] mb-3">Call Minutes Trend</h3>
              <UsageAreaChart data={filtered} dataKey="callMinutes" color="#10B981" label="Minutes" />
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
              <h3 className="text-xs font-bold text-[#081936] mb-3">SMS Volume Trend</h3>
              <UsageAreaChart data={filtered} dataKey="smsCount" color="#F97316" label="SMS" />
            </div>
          </div>
        </>
      )}

      {/* Add Usage Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Log Monthly Usage">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            label="Month"
            type="month"
            value={form.month}
            onChange={(e) => setForm({ ...form, month: e.target.value })}
            required
          />
          <Input
            label="Data Usage (GB)"
            type="number"
            step="0.1"
            value={form.dataUsage}
            onChange={(e) => setForm({ ...form, dataUsage: e.target.value })}
            required
          />
          <Input
            label="Call Minutes"
            type="number"
            value={form.callMinutes}
            onChange={(e) => setForm({ ...form, callMinutes: e.target.value })}
            required
          />
          <Input
            label="SMS Count"
            type="number"
            value={form.smsCount}
            onChange={(e) => setForm({ ...form, smsCount: e.target.value })}
            required
          />
          <Input
            label="Total Calls Placed (Optional)"
            type="number"
            value={form.numberOfCalls}
            onChange={(e) => setForm({ ...form, numberOfCalls: e.target.value })}
          />
          <Button type="submit" className="w-full" icon={TrendingUp}>
            Save Usage Record
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function UsageDetailCard({ icon: Icon, title, color, rows }) {
  const colors = {
    indigo: "bg-indigo-50 text-[#4935D4]",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3.5 mb-3.5">
        <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${colors[color]}`}>
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-xs font-bold text-[#081936]">{title}</h2>
      </div>
      <div className="space-y-2.5">
        {rows.map(([label, val]) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">{label}</span>
            <span className="font-extrabold text-slate-800">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
