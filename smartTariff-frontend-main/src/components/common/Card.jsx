import { cn } from "@/utils/cn";

export default function Card({ children, className, ...props }) {
  return (
    <div className={cn("rounded-2xl border border-slate-100/90 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={cn("px-6 py-4 border-b border-slate-100", className)}>{children}</div>;
}

export function CardBody({ children, className }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

