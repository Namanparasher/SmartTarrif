import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Radio,
  MessageSquare,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Menu,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/store/slices/authSlice";
import toast from "react-hot-toast";
import Logo from "@/components/common/Logo";

export default function Header({ onMenuClick, onAskAssistant }) {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Fallback demo name if none
  const displayName = user?.name || "Neha Sharma";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-100 bg-white px-6 sm:px-8">
      {/* Left side: Logo & Subtitle */}
      <div className="flex items-center gap-3.5">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4935D4] text-white shadow-sm shadow-indigo-200">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-[#081936]">
              Price Plan Advisor
            </h1>
            <p className="text-xs font-medium text-slate-400">
              Smart Plans. Perfect Match.
            </p>
          </div>
        </div>
      </div>

      {/* Right side: User profile dropdown */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* User profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-slate-50 cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 font-bold text-[#4935D4] ring-2 ring-purple-200">
              {initials}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-bold text-[#081936] leading-tight">
                {displayName}
              </p>
              <p className="text-[11px] font-medium text-slate-400 capitalize leading-tight">
                {user?.role || "Customer"}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition duration-150" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100 z-50">
              <div className="px-3 py-2 border-b border-slate-100 sm:hidden">
                <p className="text-xs font-bold text-[#081936]">{displayName}</p>
                <p className="text-[11px] text-slate-400 capitalize">{user?.role || "Customer"}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#4935D4]"
              >
                <User className="h-4 w-4" /> My Profile
              </Link>

              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#4935D4]"
              >
                <Settings className="h-4 w-4" /> Preferences & Settings
              </Link>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
