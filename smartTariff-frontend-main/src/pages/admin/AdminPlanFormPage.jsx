import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Save, ArrowLeft } from "lucide-react";
import { planApi } from "@/services/planApi";
import Card, { CardBody, CardHeader } from "@/components/common/Card";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import Toggle from "@/components/common/Toggle";
import { PageLoader } from "@/components/common/Loader";

const CATEGORIES = [
  "Basic",
  "Caller",
  "Caller+",
  "Light",
  "Standard",
  "Standard+",
  "Streamer",
  "Streamer+",
  "Premium",
  "Premium+",
  "Basic Bundle",
  "Caller Bundle",
  "Light Bundle",
  "Standard+ Bundle",
  "Streamer+ Bundle",
  "Basic Annual",
  "Caller Annual",
  "Light Annual",
  "Standard+ Annual",
  "Streamer+ Annual",
];

const OFFER_TYPES = ["Standalone", "3-Month Bundle", "Annual Bundle"];

const emptyForm = {
  planCode: "",
  name: "",
  category: "Standard",
  price: "",
  monthlyEquivalent: "",
  durationMonths: 1,
  validity: 28,
  dataLimit: "",
  callMinutes: 999999,
  smsLimit: "",
  offerType: "Standalone",
  individualCost: "",
  discountInr: 0,
  discountPercent: 0,
  fiveG: false,
  description: "",
  benefits: "",
  isActive: true,
};

export default function AdminPlanFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      planApi.getById(id).then((res) => {
        const p = res.data;
        setForm({ ...p, benefits: (p.benefits || []).join(", ") });
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  if (loading) return <PageLoader label="Loading plan..." />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      monthlyEquivalent: form.monthlyEquivalent ? Number(form.monthlyEquivalent) : Number(form.price),
      durationMonths: Number(form.durationMonths) || 1,
      validity: Number(form.validity),
      dataLimit: Number(form.dataLimit),
      callMinutes: form.callMinutes === "Unlimited" || form.callMinutes === null || Number(form.callMinutes) >= 999999 ? 999999 : Number(form.callMinutes),
      smsLimit: Number(form.smsLimit),
      individualCost: form.individualCost ? Number(form.individualCost) : Number(form.price),
      discountInr: Number(form.discountInr) || 0,
      discountPercent: Number(form.discountPercent) || 0,
      benefits: typeof form.benefits === "string" ? form.benefits.split(",").map((b) => b.trim()).filter(Boolean) : (form.benefits || []),
    };
    try {
      if (isEdit) {
        await planApi.update(id, payload);
        toast.success("Plan updated successfully");
      } else {
        await planApi.create(payload);
        toast.success("Plan created successfully");
      }
      navigate("/admin/plans");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{isEdit ? "Edit Tariff Plan" : "Create Tariff Plan"}</h1>
        <p className="mt-1 text-sm text-slate-500">Fill in the plan details below.</p>
      </div>

      <Card>
        <CardHeader><h2 className="font-semibold text-slate-800">Plan Details</h2></CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Input label="Plan Code" placeholder="e.g. P01" value={form.planCode} onChange={(e) => setForm({ ...form, planCode: e.target.value })} />
              <div className="col-span-2">
                <Input label="Plan Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select label="Offer Type" value={form.offerType} onChange={(e) => setForm({ ...form, offerType: e.target.value })}>
                {OFFER_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input label="Total Price (₹)" type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <Input label="Monthly Equivalent (₹)" type="number" value={form.monthlyEquivalent} onChange={(e) => setForm({ ...form, monthlyEquivalent: e.target.value })} />
              <Input label="Validity (days)" type="number" required value={form.validity} onChange={(e) => setForm({ ...form, validity: e.target.value })} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input label="Duration (Months)" type="number" value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: e.target.value })} />
              <Input label="Discount (₹)" type="number" value={form.discountInr} onChange={(e) => setForm({ ...form, discountInr: e.target.value })} />
              <Input label="Discount (%)" type="number" step="0.1" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input label="Data Limit (GB)" type="number" required value={form.dataLimit} onChange={(e) => setForm({ ...form, dataLimit: e.target.value })} />
              <Input label="Call Minutes (null/999999 = Unlimited)" type="number" value={form.callMinutes} onChange={(e) => setForm({ ...form, callMinutes: e.target.value })} />
              <Input label="SMS Limit" type="number" required value={form.smsLimit} onChange={(e) => setForm({ ...form, smsLimit: e.target.value })} />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-700">5G Network Ready</p>
              <Toggle checked={form.fiveG} onChange={(v) => setForm({ ...form, fiveG: v })} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <Input label="Benefits (comma separated)" value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })}
              hint="e.g. Free OTT subscription, Unlimited 5G, 24x7 support" />

            {isEdit && (
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-700">Plan Active</p>
                <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
              </div>
            )}

            <Button type="submit" icon={Save} loading={saving} className="w-full">
              {isEdit ? "Update Plan" : "Create Plan"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
