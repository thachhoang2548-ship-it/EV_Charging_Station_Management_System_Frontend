import React, { memo, useState, useEffect } from "react";
import { BatteryCharging, CheckCircle2, Clock, Zap } from "lucide-react";
import "./CircularChargingProgress.css";

/**
 * CircularChargingProgress — Vòng tròn tiến trình sạc EV
 *
 * @param {number}  percentage   — Phần trăm pin hiện tại (0–100)
 * @param {string}  timeElapsed  — Thời gian đã sạc (vd: "01:23:45")
 * @param {string}  status       — "charging" | "complete" | "idle"
 * @param {number}  [powerKW]    — Công suất sạc hiện tại (kW), tùy chọn
 * @param {number}  [size=220]   — Kích thước SVG (px)
 */
const CircularChargingProgress = memo(function CircularChargingProgress({
  percentage = 0,
  timeElapsed = "--:--",
  status = "idle",
  powerKW,
  size = 220,
}) {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Smoothly animate the percentage
  const [animatedPct, setAnimatedPct] = useState(percentage);

  useEffect(() => {
    const diff = percentage - animatedPct;
    if (Math.abs(diff) < 0.1) {
      setAnimatedPct(percentage);
      return;
    }
    const step = diff / 20;
    const interval = setInterval(() => {
      setAnimatedPct((prev) => {
        const next = prev + step;
        if ((diff > 0 && next >= percentage) || (diff < 0 && next <= percentage)) {
          clearInterval(interval);
          return percentage;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [percentage]);

  const clampedPct = Math.min(Math.max(animatedPct, 0), 100);
  const offset = circumference - (clampedPct / 100) * circumference;

  const isCharging = status === "charging";
  const isComplete = status === "complete";

  // Colors based on status
  const progressColor = isComplete ? "#3b82f6" : "#16a34a";
  const trackColor = isComplete ? "#dbeafe" : "#dcfce7";

  const statusConfig = {
    charging: {
      className: "ccp-status--charging",
      icon: <BatteryCharging size={16} />,
      text: "Đang sạc...",
    },
    complete: {
      className: "ccp-status--complete",
      icon: <CheckCircle2 size={16} />,
      text: "Pin đã đầy",
    },
    idle: {
      className: "ccp-status--idle",
      icon: null,
      text: "Mức pin hiện tại",
    },
  };

  const currentStatus = statusConfig[status] || statusConfig.idle;

  return (
    <div className="ccp-wrapper">
      {/* SVG Circle */}
      <div className="ccp-svg-container">
        <svg
          width={size}
          height={size}
          className={`ccp-svg ${isCharging ? "ccp-svg--charging" : ""}`}
        >
          {/* Track circle */}
          <circle
            className="ccp-track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            className="ccp-progress"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>

        {/* Center content */}
        <div className="ccp-center">
          <div className="ccp-percentage" style={{ color: progressColor }}>
            {clampedPct.toFixed(0)}
            <span className="ccp-percentage-unit">%</span>
          </div>
          <div className="ccp-label">Pin hiện tại</div>
        </div>
      </div>

      {/* Status badge */}
      <div className={`ccp-status ${currentStatus.className}`}>
        {isCharging && (
          <span className="ccp-charging-icon">{currentStatus.icon}</span>
        )}
        {isComplete && currentStatus.icon}
        {currentStatus.text}
      </div>

      {/* Stats row */}
      <div className="ccp-stats">
        <div className="ccp-stat">
          <div
            className="ccp-stat-icon"
            style={{ background: "rgba(22, 163, 74, 0.1)" }}
          >
            <Clock size={18} color="#16a34a" />
          </div>
          <span className="ccp-stat-value">{timeElapsed}</span>
          <span className="ccp-stat-label">Thời gian</span>
        </div>

        {powerKW !== undefined && (
          <div className="ccp-stat">
            <div
              className="ccp-stat-icon"
              style={{ background: "rgba(245, 158, 11, 0.1)" }}
            >
              <Zap size={18} color="#f59e0b" />
            </div>
            <span className="ccp-stat-value">{powerKW} kW</span>
            <span className="ccp-stat-label">Công suất</span>
          </div>
        )}
      </div>
    </div>
  );
});

export default CircularChargingProgress;
