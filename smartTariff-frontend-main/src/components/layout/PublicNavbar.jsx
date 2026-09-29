import { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import Button from "@/components/common/Button";
import Logo from "@/components/common/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import toast from "react-hot-toast";

const links = [
  { to: "/", label: "Home" },
  { to: "/plans", label: "Plans" },
  { to: "/#how-it-works", label: "How It Works" },
  { to: "/#faq", label: "FAQ" },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isAdmin, user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleNavClick = (to, e) => {
    setOpen(false);
    if (to.includes("#")) {
      const [path, hash] = to.split("#");
      if (location.pathname === "/" || location.pathname === "") {
        e.preventDefault();
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", `#${hash}`);
        }
      }
    } else if (to === "/" && (location.pathname === "/" || location.pathname === "")) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.pushState(null, "", "/");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Logo to="/" size="md" onClick={(e) => handleNavClick("/", e)} />

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={(e) => handleNavClick(l.to, e)}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link to={isAdmin ? "/admin/dashboard" : "/dashboard"}>
                <Button variant="secondary" size="sm" icon={LayoutDashboard}>
                  {isAdmin ? "Admin Panel" : `Hi, ${user.name.split(" ")[0]}`}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" icon={LogOut} onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link to="/register"><Button size="sm">Get Started</Button></Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={(e) => handleNavClick(l.to, e)}
                className="text-sm font-medium text-slate-600"
              >
                {l.label}
              </NavLink>
            ))}
            <hr />
            {isAuthenticated ? (
              <>
                <Link to={isAdmin ? "/admin/dashboard" : "/dashboard"} onClick={() => setOpen(false)}>
                  <Button className="w-full" variant="secondary">Dashboard</Button>
                </Link>
                <Button className="w-full" variant="ghost" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}><Button className="w-full" variant="ghost">Login</Button></Link>
                <Link to="/register" onClick={() => setOpen(false)}><Button className="w-full">Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
