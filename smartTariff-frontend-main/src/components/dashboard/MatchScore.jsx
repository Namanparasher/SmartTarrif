export default function MatchScore({ score = 90, size = 64, strokeWidth = 5.5, customColor }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  // Determine color based on score thresholds if not custom provided
  let strokeColor = customColor;
  let textColor = "text-[#081936]";

  if (!strokeColor) {
    if (clampedScore >= 90) {
      strokeColor = "#10B981"; // Green
    } else if (clampedScore >= 80) {
      strokeColor = "#2563EB"; // Blue
    } else if (clampedScore >= 70) {
      strokeColor = "#F97316"; // Orange
    } else {
      strokeColor = "#94A3B8"; // Neutral slate
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="h-full w-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
          {/* Background track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-sm font-extrabold tracking-tight ${textColor}`}>
            {clampedScore}%
          </span>
        </div>
      </div>
      <span className="mt-1 text-[9px] font-medium text-slate-400">Match Score</span>
    </div>
  );
}
