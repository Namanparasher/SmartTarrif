import React, { useState, useEffect } from "react";
import { X, ArrowRight, SlidersHorizontal, Sparkles } from "lucide-react";
import Button from "@/components/common/Button";

export default function CustomerProfileModal({
  isOpen,
  onClose,
  initialValues,
  onSubmit,
  loading,
}) {
  const [formData, setFormData] = useState({
    dataUsage: initialValues?.dataUsage || 42,
    callMinutes: initialValues?.callMinutes || 350,
    smsCount: initialValues?.smsCount || 40,
    currentSpending: initialValues?.currentSpending || 1000,
    monthlyBudget: initialValues?.monthlyBudget || 500,
    preferredDuration: initialValues?.preferredDuration || "30",
  });

  useEffect(() => {
    if (initialValues) {
      setFormData({
        dataUsage: initialValues.dataUsage ?? 42,
        callMinutes: initialValues.callMinutes ?? 350,
        smsCount: initialValues.smsCount ?? 40,
        currentSpending: initialValues.currentSpending ?? 1000,
        monthlyBudget: initialValues.monthlyBudget ?? 500,
        preferredDuration: initialValues.preferredDuration ?? "30",
      });
    }
  }, [initialValues, isOpen]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-2xl z-10 my-8 transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-[#4935D4] border border-indigo-100">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#081936]">
                Set Your Usage & Budget Inputs
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Enter your requirements to instantly match the top tariff plans.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 6-Field Responsive Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            {/* 1. Data Usage */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Internet Usage (GB / month)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="42"
                value={formData.dataUsage}
                onChange={(e) => handleChange("dataUsage", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#4935D4] focus:bg-white focus:ring-2 focus:ring-[#4935D4]/20"
                required
              />
            </div>

            {/* 2. Voice Call Minutes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Monthly Call Duration (minutes)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                placeholder="350"
                value={formData.callMinutes}
                onChange={(e) => handleChange("callMinutes", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#4935D4] focus:bg-white focus:ring-2 focus:ring-[#4935D4]/20"
                required
              />
            </div>

            {/* 3. SMS Usage */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                SMS Usage (SMS / month)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                placeholder="40"
                value={formData.smsCount}
                onChange={(e) => handleChange("smsCount", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#4935D4] focus:bg-white focus:ring-2 focus:ring-[#4935D4]/20"
                required
              />
            </div>

            {/* 4. Current Monthly Spending */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Current Monthly Spending (₹)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                placeholder="1000"
                value={formData.currentSpending}
                onChange={(e) => handleChange("currentSpending", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#4935D4] focus:bg-white focus:ring-2 focus:ring-[#4935D4]/20"
                required
              />
            </div>

            {/* 5. Monthly Budget */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Monthly Budget (₹)
              </label>
              <input
                type="number"
                min="50"
                step="50"
                placeholder="500"
                value={formData.monthlyBudget}
                onChange={(e) => handleChange("monthlyBudget", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#4935D4] focus:bg-white focus:ring-2 focus:ring-[#4935D4]/20"
                required
              />
            </div>

            {/* 6. Preferred Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Preferred Duration
              </label>
              <div className="relative">
                <select
                  value={formData.preferredDuration}
                  onChange={(e) => handleChange("preferredDuration", e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 pr-10 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#4935D4] focus:bg-white focus:ring-2 focus:ring-[#4935D4]/20 cursor-pointer"
                >
                  <option value="28">1 Month (28-30 Days)</option>
                  <option value="84">3 Months (84-90 Days)</option>
                  <option value="180">6 Months (180 Days)</option>
                  <option value="365">1 Year (365 Days)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <Button
              type="submit"
              loading={loading}
              className="rounded-xl bg-[#4935D4] hover:bg-[#3D2BB8] px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition cursor-pointer flex items-center gap-2"
            >
              <span>Find My Plans</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
