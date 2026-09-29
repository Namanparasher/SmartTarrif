import { Link } from "react-router-dom";
import { LogoIcon } from "@/components/common/Logo";
import Button from "@/components/common/Button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <LogoIcon size={64} />
      <h1 className="mt-6 text-6xl font-extrabold text-slate-900">404</h1>
      <p className="mt-2 text-lg font-medium text-slate-700">Page not found</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">The page you're looking for doesn't exist or may have been moved.</p>
      <Link to="/" className="mt-6">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
