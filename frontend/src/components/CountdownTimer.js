"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function CountdownTimer({ expiryTime, size = "md" }) {
  const [timeLeft, setTimeLeft] = useState(expiryTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const isUrgent = timeLeft < 60;
  const isWarning = timeLeft < 240 && !isUrgent;

  const sizeMap = {
    sm: { text: "text-xs", padding: "px-2 py-1", icon: "w-3 h-3" },
    md: { text: "text-sm", padding: "px-3 py-1.5", icon: "w-4 h-4" },
    lg: { text: "text-base", padding: "px-4 py-2", icon: "w-5 h-5" },
  };

  const colorClass = isUrgent
    ? "bg-red-50 text-red-700 border-red-200"
    : isWarning
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-emerald-50 text-emerald-700 border-emerald-200";

  const s = sizeMap[size];

  const display =
    timeLeft < 60
      ? `${timeLeft}m left`
      : timeLeft < 1440
      ? `${Math.round(timeLeft / 60)}h left`
      : `${Math.round(timeLeft / 1440)}d left`;

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg border ${s.padding} ${colorClass} ${s.text}`}
    >
      <Clock className={s.icon} />
      <span>{display}</span>
    </div>
  );
}
