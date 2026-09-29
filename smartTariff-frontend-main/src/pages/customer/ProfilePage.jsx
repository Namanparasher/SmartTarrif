import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { Save, User, Shield, Phone, Mail, Package, IndianRupee, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile } from "@/store/slices/authSlice";
import { customerApi } from "@/services/customerApi";
import { planApi } from "@/services/planApi";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import { formatCurrency, formatData, formatMinutes } from "@/utils/format";

export default function ProfilePage() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [profile, setProfile] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    customerApi.getProfile(user._id).then((res) => {
      setProfile(res.data);
      if (res.data?.currentPlan) {
        planApi.getById(res.data.currentPlan).then((r) => setCurrentPlan(r.data)).catch(() => {});
      }
    });
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await dispatch(updateProfile({ userId: user._id, payload: form }));
    setSaving(false);
    if (updateProfile.fulfilled.match(res)) {
      toast.success("Profile details updated successfully");
    } else {
      toast.error(res.payload || "Failed to update profile");
    }
  };

  const displayName = user?.name || "Neha Sharma";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#081936]">
          My Profile
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
          Manage your account credentials, current subscription, and telecom preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Avatar & Summary Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] text-center flex flex-col items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 text-2xl font-extrabold text-[#4935D4] ring-4 ring-purple-50 shadow-inner">
            {initials}
          </div>
          <h2 className="mt-3 text-lg font-bold text-[#081936]">{displayName}</h2>
          <p className="text-xs text-slate-400 font-medium">{user?.email}</p>
          <div className="mt-3">
            <Badge variant="purple">{user?.role === "admin" ? "System Administrator" : "Verified Customer"}</Badge>
          </div>

          <div className="mt-6 w-full border-t border-slate-100 pt-4 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Customer ID</span>
              <span className="font-mono font-semibold text-slate-700">{user?._id?.slice(0, 10)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Account Status</span>
              <span className="font-semibold text-emerald-600">Active</span>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Information & Current Plan */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Form */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
            <h3 className="text-sm font-bold text-[#4935D4] tracking-tight mb-4">
              Personal Information
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <Input
                  label="Phone Number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Email Address"
                value={user?.email}
                disabled
                hint="Contact support to update your registered email address."
              />

              <div className="flex justify-end pt-2">
                <Button type="submit" icon={Save} loading={saving}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Current Active Plan Card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#081936] tracking-tight">
                Current Active Plan
              </h3>
              <Badge variant="info">Active Subscription</Badge>
            </div>

            {currentPlan ? (
              <div className="rounded-xl border border-slate-100 bg-[#FAFAFE] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] font-extrabold text-[#4935D4]">
                    {currentPlan.planCode || currentPlan.planId || "PLAN"}
                  </span>
                  <p className="mt-1 text-base font-bold text-[#081936]">{currentPlan.name}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                    <span>{formatData(currentPlan.dataLimit)} Data</span>
                    <span>•</span>
                    <span>{formatMinutes(currentPlan.callMinutes)} Calls</span>
                    <span>•</span>
                    <span>{currentPlan.validity} Days</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-[#081936]">{formatCurrency(currentPlan.price)}</p>
                  <p className="text-[10px] text-slate-400">per cycle</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                No active plan linked yet. Generate recommendations to pick your best match.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
