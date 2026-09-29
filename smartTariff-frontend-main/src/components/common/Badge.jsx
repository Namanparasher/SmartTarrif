import { cn } from "@/utils/cn";

const VARIANTS = {
  default: "bg-slate-100 text-slate-700 border border-slate-200/60",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold",
  warning: "bg-amber-50 text-amber-700 border border-amber-200/60 font-semibold",
  danger: "bg-rose-50 text-rose-700 border border-rose-200/60 font-semibold",
  info: "bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold",
  purple: "bg-indigo-50 text-[#4935D4] border border-indigo-100 font-semibold",
};

export default function Badge({ children, variant = "default", className }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs tracking-wide", VARIANTS[variant], className)}>
      {children}
    </span>
  );
}

