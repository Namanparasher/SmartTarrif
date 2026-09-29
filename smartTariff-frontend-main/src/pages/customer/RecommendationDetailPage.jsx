import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { recommendationApi } from "@/services/recommendationApi";
import RecommendationCard from "@/components/dashboard/RecommendationCard";
import SavingsSummary from "@/components/dashboard/SavingsSummary";
import { PageLoader } from "@/components/common/Loader";
import ErrorState from "@/components/common/ErrorState";
import { formatDate } from "@/utils/format";

export default function RecommendationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => {
    setStatus("loading");
    recommendationApi
      .getById(id)
      .then((res) => {
        setRecord(res.data);
        setStatus("succeeded");
      })
      .catch((err) => {
        setError(err.message);
        setStatus("failed");
      });
  }, [id]);

  if (status === "loading") return <PageLoader label="Loading recommendation result..." />;
  if (status === "failed") return <ErrorState message={error} />;
  if (!record) return null;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#4935D4] transition cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Back to History
      </button>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#081936]">
          Historical Recommendation Run
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
          Generated on {formatDate(record.generatedAt)} based on your logged usage snapshot.
        </p>
      </div>

      <div className="space-y-3">
        {record.plans.map((item, idx) => (
          <RecommendationCard
            key={item.planId || idx}
            item={item}
            rank={idx + 1}
          />
        ))}
      </div>

      <SavingsSummary savings={120} overage="₹0 - ₹20" benchmarkCount="1000+" />
    </div>
  );
}
