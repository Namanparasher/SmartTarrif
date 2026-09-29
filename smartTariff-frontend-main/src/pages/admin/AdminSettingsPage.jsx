import { useState } from "react";
import toast from "react-hot-toast";
import { RotateCcw, ShieldCheck, Radio } from "lucide-react";
import Card, { CardBody, CardHeader } from "@/components/common/Card";
import Button from "@/components/common/Button";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { resetDatabase } from "@/mockApi/db";
import { seedIfNeeded } from "@/mockApi/seedData";

const OPERATORS = [
  { name: "Airtel", plans: "6+ active plans", color: "bg-red-100 text-red-700" },
  { name: "Jio", plans: "6+ active plans", color: "bg-blue-100 text-blue-700" },
  { name: "Vi", plans: "6+ active plans", color: "bg-purple-100 text-purple-700" },
  { name: "BSNL", plans: "6+ active plans", color: "bg-amber-100 text-amber-700" },
];

export default function AdminSettingsPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleReset = () => {
    resetDatabase();
    seedIfNeeded();
    toast.success("Demo database reset with fresh seed data");
    setConfirmOpen(false);
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Operator information and platform administration.</p>
      </div>

      <Card>
        <CardHeader className="flex items-center gap-2"><Radio className="h-4 w-4 text-indigo-500" /><h2 className="font-semibold text-slate-800">Operator Information</h2></CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {OPERATORS.map((op) => (
              <div key={op.name} className="rounded-xl border border-slate-200 p-4 text-center">
                <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full font-bold ${op.color}`}>
                  {op.name.charAt(0)}
                </div>
                <p className="font-semibold text-slate-800">{op.name}</p>
                <p className="text-xs text-slate-400">{op.plans}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-indigo-500" /><h2 className="font-semibold text-slate-800">Recommendation Engine</h2></CardHeader>
        <CardBody className="space-y-2 text-sm text-slate-600">
          <p><strong>Engine type:</strong> Rule-based scoring (no ML/AI)</p>
          <p><strong>Weights:</strong> Data 40% · Calls 25% · SMS 10% · Budget 15% · Value 10%</p>
          <p><strong>Output:</strong> Top 3 ranked plans with explainable reasons</p>
          <p className="text-xs text-slate-400">Architected to be swapped for an ML-based scoring service without frontend changes.</p>
        </CardBody>
      </Card>

      <Card className="border-rose-200">
        <CardHeader><h2 className="font-semibold text-rose-700">Danger Zone</h2></CardHeader>
        <CardBody className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-slate-700">Reset demo database</p>
            <p className="text-xs text-slate-400">Wipes all local data and reseeds fresh sample plans, customers and usage.</p>
          </div>
          <Button variant="danger" icon={RotateCcw} onClick={() => setConfirmOpen(true)}>Reset Data</Button>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleReset}
        title="Reset all demo data?"
        message="This will permanently erase all customers, plans, usage and recommendations stored locally, then reseed fresh sample data."
        confirmLabel="Reset Database"
      />
    </div>
  );
}
