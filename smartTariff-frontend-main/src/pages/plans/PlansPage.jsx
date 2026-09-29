import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, SlidersHorizontal, X, Scale, PackageSearch } from "lucide-react";
import { fetchPlans, toggleCompare, clearCompare } from "@/store/slices/planSlice";
import PlanCard from "@/components/plans/PlanCard";
import Select from "@/components/common/Select";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Pagination from "@/components/common/Pagination";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { CardSkeleton } from "@/components/common/Loader";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  "Basic",
  "Caller",
  "Caller+",
  "Light",
  "Standard",
  "Standard+",
  "Streamer",
  "Streamer+",
  "Premium",
  "Premium+",
  "Basic Bundle",
  "Caller Bundle",
  "Light Bundle",
  "Standard+ Bundle",
  "Streamer+ Bundle",
  "Basic Annual",
  "Caller Annual",
  "Light Annual",
  "Standard+ Annual",
  "Streamer+ Annual",
];

const OFFER_TYPES = [
  { value: "", label: "All Offer Types" },
  { value: "Standalone", label: "Standalone (1-Month)" },
  { value: "3-Month Bundle", label: "3-Month Bundle" },
  { value: "Annual Bundle", label: "Annual Bundle (1-Year)" },
];

export default function PlansPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, pagination, status, error } = useSelector((s) => s.plans);
  const compareList = useSelector((s) => s.plans.compareList);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    offerType: "",
    fiveG: "",
    sortBy: "",
    minPrice: "",
    maxPrice: "",
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [priceTier, setPriceTier] = useState("all");

  useEffect(() => {
    dispatch(fetchPlans({ page, limit: 9, ...filters }));
  }, [dispatch, page, filters]);

  const handleFilterChange = (key, value) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const handlePriceTierChange = (tier) => {
    setPriceTier(tier);
    setPage(1);
    switch (tier) {
      case "under400":
        setFilters((f) => ({ ...f, minPrice: "", maxPrice: "400" }));
        break;
      case "400to1000":
        setFilters((f) => ({ ...f, minPrice: "400", maxPrice: "1000" }));
        break;
      case "1000to3000":
        setFilters((f) => ({ ...f, minPrice: "1000", maxPrice: "3000" }));
        break;
      case "above3000":
        setFilters((f) => ({ ...f, minPrice: "3000", maxPrice: "" }));
        break;
      default:
        setFilters((f) => ({ ...f, minPrice: "", maxPrice: "" }));
        break;
    }
  };

  const handleResetFilters = () => {
    setPriceTier("all");
    setPage(1);
    setFilters({
      search: "",
      category: "",
      offerType: "",
      fiveG: "",
      sortBy: "",
      minPrice: "",
      maxPrice: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#081936]">
            Plan Catalogue
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Search, filter and compare 20 tariff plans by price, bundle discounts, data, or benefits.
          </p>
        </div>

        {compareList.length > 0 && (
          <div className="flex items-center gap-3 rounded-2xl bg-indigo-50 border border-indigo-100/80 px-4 py-2 text-xs font-semibold text-[#4935D4] shadow-sm">
            <Scale className="h-4 w-4" />
            <span>{compareList.length} of 3 plans selected</span>
            <Button size="sm" onClick={() => navigate("/compare")}>
              Compare Now
            </Button>
            <button
              onClick={() => dispatch(clearCompare())}
              className="text-slate-400 hover:text-rose-600 transition"
              title="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#4935D4] focus:bg-white focus:ring-1 focus:ring-[#4935D4]"
              placeholder="Search by plan ID (e.g. P01, P16), name, price (e.g. 199, ₹1999), or category..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={SlidersHorizontal}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters {showFilters ? "(Hide)" : ""}
            </Button>
          </div>
        </div>

        {/* Quick Price Filter Chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">Quick Price:</span>
          {[
            { id: "all", label: "All Prices" },
            { id: "under400", label: "Under ₹400" },
            { id: "400to1000", label: "₹400 - ₹1,000" },
            { id: "1000to3000", label: "₹1,000 - ₹3,000" },
            { id: "above3000", label: "₹3,000+" },
          ].map((tier) => (
            <button
              key={tier.id}
              onClick={() => handlePriceTierChange(tier.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                priceTier === tier.id
                  ? "bg-[#4935D4] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tier.label}
            </button>
          ))}
          {(filters.search || filters.category || filters.offerType || filters.fiveG || filters.minPrice || filters.maxPrice || filters.sortBy) && (
            <button
              onClick={handleResetFilters}
              className="ml-auto text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Expandable Filter Grid */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 gap-3.5 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#4935D4]"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Offer / Validity</label>
              <select
                value={filters.offerType}
                onChange={(e) => handleFilterChange("offerType", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#4935D4]"
              >
                {OFFER_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 mb-1 block">5G Network</label>
              <select
                value={filters.fiveG}
                onChange={(e) => handleFilterChange("fiveG", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#4935D4]"
              >
                <option value="">All (4G & 5G)</option>
                <option value="true">5G Ready Only</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Min Price (₹)</label>
              <input
                type="number"
                placeholder="e.g. 199"
                value={filters.minPrice}
                onChange={(e) => {
                  setPriceTier("custom");
                  handleFilterChange("minPrice", e.target.value);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#4935D4]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#4935D4]"
              >
                <option value="">Default Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popularity">Most Popular</option>
                <option value="data_desc">Data: High to Low</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Plan Grid */}
      {status === "loading" && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {status === "failed" && (
        <ErrorState
          message={error}
          onRetry={() => dispatch(fetchPlans({ page, ...filters }))}
        />
      )}

      {status === "succeeded" && items.length === 0 && (
        <EmptyState
          icon={PackageSearch}
          title="No plans match your current filters"
          description="Try resetting some filters or searching with different keywords."
        />
      )}

      {status === "succeeded" && items.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((plan) => (
              <PlanCard
                key={plan._id}
                plan={plan}
                onCompareToggle={(id) => dispatch(toggleCompare(id))}
                isComparing={compareList.includes(plan._id)}
                compareDisabled={compareList.length >= 3}
              />
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
