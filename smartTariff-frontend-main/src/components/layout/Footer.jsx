import { Link } from "react-router-dom";
import Logo from "@/components/common/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Logo to="/" size="sm" showText={true} subtitle="" />
            <p className="mt-3 text-sm text-slate-500">
              Personalized telecom tariff recommendations powered by transparent, rule-based usage analysis.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/plans" className="hover:text-indigo-600">Browse Plans</Link></li>
              <li><Link to="/register" className="hover:text-indigo-600">Get Recommendations</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-indigo-600">How It Works</Link></li>
              <li><Link to="/#faq" className="hover:text-indigo-600">FAQ</Link></li>
              <li><Link to="/login" className="hover:text-indigo-600">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>About SmartTariff</li>
              <li>Careers</li>
              <li>Contact Support</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Refund Policy</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-100 pt-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} SmartTariff. All rights reserved. Built for the KIET telecom recommendation initiative.
        </div>
      </div>
    </footer>
  );
}
