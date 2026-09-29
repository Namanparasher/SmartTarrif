import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Logo from "@/components/common/Logo";
import { login, clearAuthError } from "@/store/slices/authSlice";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    const res = await dispatch(login(form));
    if (login.fulfilled.match(res)) {
      toast.success(`Welcome back, ${res.payload.user.name.split(" ")[0]}!`);
      const dest = res.payload.user.role === "admin" ? "/admin/dashboard" : location.state?.from?.pathname || "/dashboard";
      navigate(dest, { replace: true });
    } else {
      toast.error(res.payload || "Login failed");
    }
  };

  const fillDemo = (role) => {
    if (role === "admin") setForm({ email: "admin@smarttariff.com", password: "admin123" });
    if (role === "customer") setForm({ email: "aarav.sharma1@example.com", password: "password123" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Logo to="/" size="lg" showText={true} subtitle="" />
        </div>
        <h1 className="text-center text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-center text-sm text-slate-500">Sign in to view your personalized recommendations.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Email address" type="email" placeholder="you@example.com" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" type="password" placeholder="••••••••" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Button type="submit" className="w-full" icon={LogIn} loading={status === "loading"}>
            Sign In
          </Button>
        </form>

        <div className="mt-5 rounded-xl border border-slate-100 bg-[#F7F7FF] p-3.5 text-xs">
          <p className="font-semibold text-slate-700 mb-2">⚡ Quick One-Click Demo Logins:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo("customer")}
              className="flex flex-col items-start rounded-lg border border-indigo-100 bg-white p-2 text-left hover:border-indigo-300 hover:bg-indigo-50/50 transition"
            >
              <span className="font-semibold text-[#4935D4]">👤 Customer Demo</span>
              <span className="text-[10px] text-slate-500 truncate w-full">aarav.sharma1@example.com</span>
              <span className="text-[10px] text-slate-400">pass: password123</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo("admin")}
              className="flex flex-col items-start rounded-lg border border-slate-200 bg-white p-2 text-left hover:border-slate-300 hover:bg-slate-50 transition"
            >
              <span className="font-semibold text-slate-800">🛡️ Admin Demo</span>
              <span className="text-[10px] text-slate-500 truncate w-full">admin@smarttariff.com</span>
              <span className="text-[10px] text-slate-400">pass: admin123</span>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account? <Link to="/register" className="font-medium text-indigo-600">Create one</Link>
        </p>
      </div>
    </div>
  );
}
