import { Inbox } from "lucide-react";
import Button from "./Button";

export default function EmptyState({ icon: Icon = Inbox, title = "Nothing here yet", description, actionLabel, onAction, className }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center ${className || ""}`}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
        <Icon className="h-7 w-7 text-indigo-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
