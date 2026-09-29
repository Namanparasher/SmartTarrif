import { Link } from "react-router-dom";
import { Radio } from "lucide-react";

export function LogoIcon({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "h-8 w-8 rounded-lg",
    md: "h-10 w-10 rounded-xl",
    lg: "h-12 w-12 rounded-2xl",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const containerClass = typeof size === "string" && sizeClasses[size] ? sizeClasses[size] : "h-10 w-10 rounded-xl";
  const iconClass = typeof size === "string" && iconSizes[size] ? iconSizes[size] : "h-5 w-5";

  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-[#4935D4] text-white shadow-sm shadow-indigo-200 ${containerClass} ${className}`}
    >
      <Radio className={iconClass} />
    </div>
  );
}

export default function Logo({
  to = "/",
  size = "md",
  showText = true,
  subtitle = "Price Plan Advisor",
  badge = null,
  variant = "light",
  className = "",
  onClick = null,
}) {
  const content = (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <LogoIcon size={size} />
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5 font-bold tracking-tight">
            <span
              className={`text-base font-extrabold tracking-tight ${
                variant === "dark" ? "text-white" : "text-[#081936]"
              }`}
            >
              SmartTariff
            </span>
            {badge && (
              <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-300">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <span
              className={`text-[11px] font-medium ${
                variant === "dark" ? "text-slate-400" : "text-slate-400"
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} onClick={onClick} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
