import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Scale,
  ClipboardList,
  User,
  History,
  Settings,
  Radio,
  Users,
  PackageSearch,
  Database,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  HelpCircle,
  MessageCircle,
} from "lucide-react";
import Logo from "@/components/common/Logo";

export const customerNavItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/compare", label: "Compare Plans", icon: Scale },
  { to: "/plans", label: "Plan Catalogue", icon: ClipboardList },
  { to: "/profile", label: "My Profile", icon: User },
  { to: "/history", label: "Recommendation History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
];

export const adminNavItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/plans", label: "Tariff Plans", icon: PackageSearch },
  { to: "/admin/usage", label: "Usage Records", icon: Database },
  { to: "/admin/recommendations", label: "Recommendations", icon: Sparkles },
  { to: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ variant = "customer", onItemClick, onAskAssistant }) {
  const navItems = variant === "admin" ? adminNavItems : customerNavItems;

  return (
    <aside className="relative flex h-full w-[230px] flex-col justify-between bg-[#081936] text-white select-none">
      {/* Top Section */}
      <div>
        {/* Brand Logo Box */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#4935D4] text-white shadow-lg shadow-indigo-900/40">
            <Radio className="h-5 w-5 animate-pulse-subtle" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-white">
              <span className="text-base">SmartTariff</span>
              {variant === "admin" && (
                <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-300">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Price Plan Advisor</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="mt-2 space-y-1 px-3.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard" || item.to === "/admin/dashboard"}
              onClick={onItemClick}
              className={({ isActive }) =>
                `group flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wide transition-all duration-150 ${
                  isActive
                    ? "bg-[#4935D4] text-white shadow-md shadow-indigo-900/50"
                    : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Decorative Telecom Tower Vector background */}
      <div className="pointer-events-none absolute bottom-36 left-0 right-0 overflow-hidden opacity-10">
        <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M100 10 L85 110 L115 110 Z" stroke="white" strokeWidth="2" />
          <line x1="88" y1="90" x2="112" y2="90" stroke="white" strokeWidth="1.5" />
          <line x1="91" y1="70" x2="109" y2="70" stroke="white" strokeWidth="1.5" />
          <line x1="94" y1="50" x2="106" y2="50" stroke="white" strokeWidth="1.5" />
          <line x1="97" y1="30" x2="103" y2="30" stroke="white" strokeWidth="1.5" />
          <circle cx="100" cy="10" r="4" fill="white" />
          <path d="M80 20 A25 25 0 0 1 120 20" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M70 12 A38 38 0 0 1 130 12" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      </div>

      {/* Bottom Footer Section */}
      <div className="relative z-10 p-4 border-t border-white/5">
        <p className="text-[10px] font-medium text-slate-400 text-center">
          SmartTariff © {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  );
}
