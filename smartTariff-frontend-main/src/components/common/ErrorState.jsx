import { AlertOctagon } from "lucide-react";
import Button from "./Button";

export default function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
        <AlertOctagon className="h-7 w-7 text-rose-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">We hit a snag</h3>
      <p className="max-w-sm text-sm text-slate-500">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  );
}
