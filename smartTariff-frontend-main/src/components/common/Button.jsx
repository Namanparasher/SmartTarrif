import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "bg-[#4935D4] text-white hover:bg-[#3D2ABF] shadow-sm shadow-indigo-200/50 active:scale-[0.98]",
  secondary: "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 shadow-sm active:scale-[0.98]",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100/80 active:scale-[0.98]",
  danger: "bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.98]",
  outline: "bg-transparent border border-[#4935D4] text-[#4935D4] hover:bg-indigo-50/60 active:scale-[0.98]",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]",
  navy: "bg-[#081936] text-white hover:bg-[#0D2248] shadow-sm active:scale-[0.98]",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs font-semibold rounded-lg",
  md: "px-4 py-2.5 text-sm font-semibold rounded-xl",
  lg: "px-6 py-3 text-base font-semibold rounded-xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  loading = false,
  disabled,
  icon: Icon,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      {children}
    </button>
  );
}

