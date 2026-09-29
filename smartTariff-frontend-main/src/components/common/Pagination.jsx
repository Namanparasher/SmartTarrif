import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
      <p className="text-sm text-slate-500">
        Page <span className="font-medium text-slate-700">{page}</span> of{" "}
        <span className="font-medium text-slate-700">{totalPages}</span>
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" icon={ChevronLeft} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Prev
        </Button>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
