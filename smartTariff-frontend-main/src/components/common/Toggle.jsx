import { cn } from "@/utils/cn";

export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          checked ? "bg-indigo-600" : "bg-slate-300"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-0"
          )}
        />
      </button>
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
    </label>
  );
}
