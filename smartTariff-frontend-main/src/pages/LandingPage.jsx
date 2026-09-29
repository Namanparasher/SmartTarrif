import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight, BarChart3, Sparkles, Scale, ShieldCheck, Gauge, Wallet,
  ClipboardList, Cpu, ThumbsUp, ChevronDown, Wifi,
} from "lucide-react";
import { useState, useEffect } from "react";

const STEPS = [
  { icon: ClipboardList, title: "Share your usage", desc: "Tell us your data, calling and SMS usage — or let us track it automatically once you're a customer." },
  { icon: Cpu, title: "We analyze it", desc: "Our rule-based scoring engine compares your usage and budget against every active tariff plan." },
  { icon: Sparkles, title: "Get top 3 plans", desc: "Receive personalized, ranked recommendations with clear reasons for every suggestion." },
  { icon: ThumbsUp, title: "Choose & give feedback", desc: "Compare, pick the best plan for you, and tell us if the recommendation was helpful." },
];

const FEATURES = [
  { icon: Gauge, title: "Personalized Recommendations", desc: "Every recommendation is generated from your real usage patterns and stated preferences — not generic bestsellers." },
  { icon: BarChart3, title: "Usage Analytics", desc: "Track data, call and SMS usage over time with clean, exportable charts across custom date ranges." },
  { icon: Scale, title: "Plan Comparison", desc: "Compare up to 3 plans side-by-side across price, data, calls, SMS, validity, 5G and match score." },
  { icon: Wallet, title: "Budget Aware", desc: "Set a monthly budget and minimum requirements — the engine respects them when scoring every plan." },
  { icon: ShieldCheck, title: "Transparent Scoring", desc: "See exactly why a plan was recommended: data match, budget fit, calling adequacy and overall value." },
  { icon: Wifi, title: "5G Ready", desc: "Filter and prioritize 5G-enabled plans automatically if your preferences require it." },
];

const FAQS = [
  { q: "Does SmartTariff use AI or machine learning?", a: "No. SmartTariff's current recommendation engine is a transparent, rule-based scoring system. It's architected so a machine learning service could be plugged in later without changing the app." },
  { q: "How are the Top 3 plans chosen?", a: "We score every active plan against your usage and preferences using weighted factors: data match (40%), call match (25%), SMS match (10%), budget fit (15%) and overall value (10%). The 3 highest-scoring plans are returned." },
  { q: "Can I compare plans manually?", a: "Yes. Browse all plans, add up to 3 to your comparison list, and view a detailed side-by-side comparison table." },
  { q: "Is my usage data secure?", a: "Your account is protected with hashed passwords and authenticated sessions. Only you and authorized admins can view your usage and recommendations." },
  { q: "Can I change my budget or requirements later?", a: "Absolutely — update your preferences anytime from the Preferences page, and regenerate recommendations instantly." },
];

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 py-4">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-left">
        <span className="font-medium text-slate-800">{item.q}</span>
        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="mt-3 text-sm text-slate-500">{item.a}</p>}
    </div>
  );
}

export default function LandingPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace("#", "");
      const elem = document.getElementById(targetId);
      if (elem) {
        setTimeout(() => {
          elem.scrollIntoView({ behavior: "smooth" });
        }, 60);
      }
    }
  }, [location.hash, location.pathname]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
              <Sparkles className="h-4 w-4" /> Rule-based recommendation engine
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Find the Telecom Plan <br className="hidden sm:block" />
              <span className="text-indigo-600">That Fits Your Usage</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              SmartTariff analyzes your data, calling and SMS usage — along with your budget — to
              recommend the top 3 tariff plans that genuinely fit how you use your phone.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/register">
                <span className="inline-flex items-center gap-2 rounded-xl bg-[#4935D4] px-6 py-3.5 font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-[#3D2ABF]">
                  Get Started <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link to="/plans">
                <span className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50">
                  Explore Plans
                </span>
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["20", "Curated Tariff Plans"],
              ["100%", "Smart Rule Scored"],
              ["Unlimited", "Voice on All Plans"],
              ["Up to 16.7%", "Bundle Savings"],
            ].map(([stat, label]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-indigo-600">{stat}</p>
                <p className="mt-1 text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
          <p className="mt-3 text-slate-500">From usage to recommendation in four simple steps.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <s.icon className="h-5 w-5" />
              </div>
              <span className="absolute right-5 top-5 text-3xl font-bold text-slate-100">{i + 1}</span>
              <h3 className="font-semibold text-slate-800">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900">Everything You Need to Choose Smarter</h2>
            <p className="mt-3 text-slate-500">Built for real telecom decision-making, not guesswork.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-200 p-6 transition hover:shadow-md">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-800">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits / CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 rounded-3xl bg-indigo-600 p-10 text-white lg:grid-cols-2 lg:p-16">
          <div>
            <h2 className="text-3xl font-bold">Stop overpaying for data you don't use.</h2>
            <p className="mt-4 text-indigo-100">
              Most customers are on plans that don't match their real usage. SmartTariff surfaces
              better-fit alternatives instantly — with a transparent score and clear reasoning for every suggestion.
            </p>
            <Link to="/register" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-indigo-700 hover:bg-indigo-50">
              Create your free account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ["Save money", "Avoid overpaying for unused data or minutes"],
              ["Save time", "Skip manual plan comparisons"],
              ["Stay informed", "Understand exactly why a plan fits you"],
              ["Full control", "Update preferences and regenerate anytime"],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-xs text-indigo-100">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
        </div>
        <div className="mt-10">
          {FAQS.map((f) => <FaqItem key={f.q} item={f} />)}
        </div>
      </section>
    </div>
  );
}
