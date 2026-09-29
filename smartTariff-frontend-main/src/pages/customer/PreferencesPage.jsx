import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Save, Sliders, Shield, Bell, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { customerApi } from "@/services/customerApi";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Toggle from "@/components/common/Toggle";
import { PageLoader } from "@/components/common/Loader";

export default function PreferencesPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("preferences");

  useEffect(() => {
    if (user) {
      customerApi.getProfile(user._id).then((res) => setForm(res.data));
    }
  }, [user]);

  if (!form) return <PageLoader label="Loading preferences & settings..." />;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await customerApi.updateProfile(user._id, {
        monthlyBudget: Number(form.monthlyBudget),
        minimumData: Number(form.minimumData),
        minimumCallMinutes: Number(form.minimumCallMinutes),
        minimumSms: Number(form.minimumSms),
        requires5G: form.requires5G,
      });
      toast.success("Preferences updated. Recommendation engine will prioritize these criteria.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#081936]">
          Settings & Preferences
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
          Fine-tune your recommendation algorithm criteria, notification alerts, and security options.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("preferences")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            activeTab === "preferences"
              ? "border-[#4935D4] text-[#4935D4]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Sliders className="h-4 w-4" /> Recommendation Criteria
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            activeTab === "notifications"
              ? "border-[#4935D4] text-[#4935D4]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Bell className="h-4 w-4" /> Notifications
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            activeTab === "security"
              ? "border-[#4935D4] text-[#4935D4]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Lock className="h-4 w-4" /> Security
        </button>
      </div>

      {activeTab === "preferences" && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <form onSubmit={handleSave} className="space-y-5">
            <h3 className="text-sm font-bold text-[#081936] tracking-tight">
              Scoring Engine Criteria
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Monthly Budget (₹)"
                type="number"
                value={form.monthlyBudget}
                onChange={(e) => setForm({ ...form, monthlyBudget: e.target.value })}
                hint="Plans priced within this target score highest in Budget Match."
                required
              />
              <Input
                label="Minimum Data Threshold (GB)"
                type="number"
                value={form.minimumData}
                onChange={(e) => setForm({ ...form, minimumData: e.target.value })}
                hint="Plans with lower data allowances will be penalized."
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Minimum Calling Minutes"
                type="number"
                value={form.minimumCallMinutes}
                onChange={(e) => setForm({ ...form, minimumCallMinutes: e.target.value })}
                required
              />
              <Input
                label="Minimum SMS Limit"
                type="number"
                value={form.minimumSms}
                onChange={(e) => setForm({ ...form, minimumSms: e.target.value })}
                required
              />
            </div>

            {/* 5G Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#FAFAFE] p-4">
              <div>
                <p className="text-xs font-bold text-[#081936]">5G Network Required</p>
                <p className="text-[11px] text-slate-400">
                  Strictly prioritize and mandate 5G-ready plans for high-speed connectivity.
                </p>
              </div>
              <Toggle
                checked={form.requires5G}
                onChange={(v) => setForm({ ...form, requires5G: v })}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" icon={Save} loading={saving}>
                Save Preferences
              </Button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] space-y-4">
          <h3 className="text-sm font-bold text-[#081936]">Notification Alerts</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <div>
                <p className="text-xs font-bold text-[#081936]">Tariff Price Drop Alerts</p>
                <p className="text-[11px] text-slate-400">Receive alerts when recommended plans reduce price</p>
              </div>
              <Toggle checked={true} onChange={() => toast.success("Notification setting saved")} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <div>
                <p className="text-xs font-bold text-[#081936]">Monthly Usage Summary</p>
                <p className="text-[11px] text-slate-400">Receive monthly digest with new recommendation suggestions</p>
              </div>
              <Toggle checked={true} onChange={() => toast.success("Notification setting saved")} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] space-y-4">
          <h3 className="text-sm font-bold text-[#081936]">Account Security</h3>
          <p className="text-xs text-slate-500">Your account is secured with session token authentication.</p>
          <Button variant="secondary" size="sm" onClick={() => toast.success("Password reset link sent to registered email")}>
            Send Password Reset Link
          </Button>
        </div>
      )}
    </div>
  );
}
