import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { X } from "lucide-react";

export default function DashboardLayout({ variant = "customer" }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAskAssistant = () => {
    const el = document.getElementById("ask-plan-advisor-chat");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const inputEl = el.querySelector("input");
      if (inputEl) inputEl.focus();
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F7FF] text-[#081936]">
      {/* Desktop Left Sidebar (Fixed 230px, Dark Navy) */}
      <div className="hidden lg:block lg:w-[230px] lg:shrink-0">
        <div className="fixed inset-y-0 left-0 z-40 w-[230px]">
          <Sidebar
            variant={variant}
            onAskAssistant={handleAskAssistant}
          />
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[#081936] shadow-2xl">
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Sidebar
              variant={variant}
              onItemClick={() => setMobileMenuOpen(false)}
              onAskAssistant={() => {
                setMobileMenuOpen(false);
                handleAskAssistant();
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top White Header */}
        <Header
          onMenuClick={() => setMobileMenuOpen(true)}
          onAskAssistant={handleAskAssistant}
        />

        {/* Page Body */}
        <main className="flex-1 px-5 py-5 sm:px-7 sm:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
