import { Outlet } from "react-router-dom";
import PublicNavbar from "@/components/layout/PublicNavbar";
import Footer from "@/components/layout/Footer";

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
