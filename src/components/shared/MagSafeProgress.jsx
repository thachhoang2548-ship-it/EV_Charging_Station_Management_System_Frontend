import React, { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import "./MagSafeProgress.css";

export default function MagSafeProgress({ percentage }) {
  const [animatedPercent, setAnimatedPercent] = useState(0);

  // Smoothly animate the percentage value when it changes
  useEffect(() => {
    setAnimatedPercent(percentage);
  }, [percentage]);

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const validPercent = Math.min(100, Math.max(0, animatedPercent || 0));
  const strokeDashoffset = circumference - (validPercent / 100) * circumference;

  return (
    <div className="magsafe-container">
      <div className="magsafe-svg-wrapper">
        <svg
          className="magsafe-svg"
          viewBox="0 0 220 220"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ── Background Circle (Track) ── */}
          <circle
            className="magsafe-track"
            cx="110"
            cy="110"
            r={radius}
            strokeWidth="16"
            fill="none"
          />

          {/* ── Progress Circle (Green Glow) ── */}
          <circle
            className="magsafe-progress"
            cx="110"
            cy="110"
            r={radius}
            strokeWidth="16"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />

          {/* ── MagSafe "Active Flow" Animation Ring ── */}
          {/* This ring spins continuously to simulate moving energy */}
          {validPercent > 0 && validPercent < 100 && (
            <circle
              className="magsafe-flow"
              cx="110"
              cy="110"
              r={radius}
              strokeWidth="16"
              fill="none"
              strokeDasharray={`10 ${circumference - 10}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* ── Inside Center Text & Icon ── */}
        <div className="magsafe-center">
          <Zap className="magsafe-icon" size={24} strokeWidth={2.5} />
          <div className="magsafe-percent">
            {Math.round(validPercent)}<span className="magsafe-percent-symbol">%</span>
          </div>
          <div className="magsafe-label">Đang sạc...</div>
        </div>
      </div>
    </div>
  );
}
