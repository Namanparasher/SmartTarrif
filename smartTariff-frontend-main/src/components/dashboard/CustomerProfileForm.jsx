import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import Button from "@/components/common/Button";

export default function CustomerProfileForm({
  initialValues,
  onSubmit,
  loading,
}) {
  const [formData, setFormData] = useState({
    dataUsage: initialValues?.dataUsage || 200,
    callMinutes: initialValues?.callMinutes || 1000,
    smsCount: initialValues?.smsCount || 500,
    currentSpending: initialValues?.currentSpending || 1000,
    monthlyBudget: initialValues?.monthlyBudget || 10000,
    preferredDuration: initialValues?.preferredDuration || "365",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] transition-all">
      {/* Form Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#081936]">
          Customer Profile
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
          Enter your typical monthly usage and choose your preferred plan duration.
        </p>
      </div>

      {/* 2-Column Responsive Input Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* 1. Internet Usage */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Internet Usage (GB / month)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="200"
              value={formData.dataUsage}
              onChange={(e) => handleChange("dataUsage", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#4935D4] focus:ring-2 focus:ring-[#4935D4]/20"
              required
            />
          </div>

          {/* 2. Monthly Call Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Monthly Call Duration (minutes)
            </label>
            <input
              type="number"
              min="0"
              step="10"
              placeholder="1000"
              value={formData.callMinutes}
              onChange={(e) => handleChange("callMinutes", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#4935D4] focus:ring-2 focus:ring-[#4935D4]/20"
              required
            />
          </div>

          {/* 3. SMS Usage */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              SMS Usage (SMS / month)
            </label>
            <input
              type="number"
              min="0"
              step="5"
              placeholder="500"
              value={formData.smsCount}
              onChange={(e) => handleChange("smsCount", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#4935D4] focus:ring-2 focus:ring-[#4935D4]/20"
              required
            />
          </div>

          {/* 4. Current Monthly Spending */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Current Monthly Spending (₹)
            </label>
            <input
              type="number"
              min="0"
              step="50"
              placeholder="1000"
              value={formData.currentSpending}
              onChange={(e) => handleChange("currentSpending", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#4935D4] focus:ring-2 focus:ring-[#4935D4]/20"
              required
            />
          </div>

          {/* 5. Monthly Budget */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Monthly Budget (₹)
            </label>
            <input
              type="number"
              min="50"
              step="50"
              placeholder="10000"
              value={formData.monthlyBudget}
              onChange={(e) => handleChange("monthlyBudget", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#4935D4] focus:ring-2 focus:ring-[#4935D4]/20"
              required
            />
          </div>

          {/* 6. Preferred Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Preferred Duration
            </label>
            <div className="relative">
              <select
                value={formData.preferredDuration}
                onChange={(e) => handleChange("preferredDuration", e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-[#4935D4] focus:ring-2 focus:ring-[#4935D4]/20 cursor-pointer"
              >
                <option value="28">1 Month (28-30 Days)</option>
                <option value="84">3 Months (84-90 Days)</option>
                <option value="180">6 Months (180 Days)</option>
                <option value="365">1 Year (365 Days)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button at bottom right */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            loading={loading}
            className="rounded-xl bg-[#4935D4] hover:bg-[#3D2BB8] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition cursor-pointer flex items-center gap-2"
          >
            <span>Find My Plans</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
