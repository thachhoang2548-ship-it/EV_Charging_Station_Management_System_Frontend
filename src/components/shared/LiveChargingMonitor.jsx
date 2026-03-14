import React, { useEffect, useState, useCallback, useRef, memo } from "react";
import { stationAPI } from "../../api/stationApi.js";
import {
  BatteryCharging, Battery, Clock, Zap, Gauge, DollarSign,
  MapPin, Car, AlertTriangle
} from "lucide-react";
import MagSafeProgress from "./MagSafeProgress.jsx";
import "./LiveChargingMonitor.css";

// ── Constants ──
const POLL_INTERVAL_MS = 5000;
const CHARGING_EFFICIENCY = 0.9;

// ── Utility: battery capacity ──
const getBatteryCapacity = () => {
  const c = sessionStorage.getItem("batteryCapacityKWh");
  const n = Number(c);
  return Number.isFinite(n) && n > 0 ? n : 60;
};

const round2 = (v) => Math.round(v * 100) / 100;

// ── Utility: calculate realtime metrics ──
const calcMetrics = ({ startTime, initialSoc, powerKW, capacity, efficiency = CHARGING_EFFICIENCY }) => {
  const now = new Date();
  const start = new Date(startTime);
  const durationMinutes = Math.max(0, (now - start) / 60000);
  const hours = durationMinutes / 60;

  const energyDelivered = hours * powerKW * efficiency;
  const socIncrease = (energyDelivered / capacity) * 100;

  let rawSoc = (initialSoc ?? 0) + socIncrease;
  if (durationMinutes > 0 && Math.floor(rawSoc) === (initialSoc ?? 0)) {
    rawSoc = (initialSoc ?? 0) + 1;
  }

  const finalSoc = Math.min(100, Math.max(initialSoc ?? 0, Math.round(rawSoc)));
  const deltaSoc = finalSoc - (initialSoc ?? 0);
  const energyKWh = round2((deltaSoc / 100) * capacity);

  return { finalSoc, energyKWh, durationMinutes };
};

// ── Utility: extract power KW from session (mirrors Driver's extractPowerKW) ──
const extractPower = (session) => {
  // 1) check sessionStorage cache by bookingId (same as Driver logic)
  if (session?.bookingId) {
    try {
      const key = `booking_${session.bookingId}_maxPowerKW`;
      const stored = sessionStorage.getItem(key);
      if (stored) {
        const p = JSON.parse(stored);
        if (Number.isFinite(p) && p > 0) return p;
      }
    } catch (e) { /* ignore */ }
  }

  // 2) from session/chargingPoint object
  return (
    session?.chargingPoint?.maxPowerKW ??
    session?.maxPowerKW ??
    session?.ratedKW ??
    session?.powerKW ??
    11
  );
};

// ── Sub-component: Progress Bar ──
const ProgressBar = memo(function ProgressBar({ virtualSoc = 0 }) {
  const displaySoc = Math.round(Math.min(Math.max(virtualSoc, 0), 100));

  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%", padding: "10px 0" }}>
      <MagSafeProgress percentage={displaySoc} />
    </div>
  );
});

// ── Sub-component: Stat Card ──
const StatCard = memo(function StatCard({ icon: Icon, label, value, unit = "", color = "green" }) {
  return (
    <div className="lcm-stat-card">
      <div className={`lcm-stat-icon lcm-stat-${color}`}>
        {Icon ? <Icon size={16} /> : null}
      </div>
      <div className="lcm-stat-label">{label}</div>
      <div className="lcm-stat-value">
        {value ?? "—"}
        {unit && <span className="lcm-stat-unit">{unit}</span>}
      </div>
    </div>
  );
});

/**
 * LiveChargingMonitor — Shared realtime charging session viewer.
 *
 * Props:
 *   sessionId   (number|string, required) — ID of an IN_PROGRESS session
 *   onSessionEnd (function, optional)     — called when session finishes
 */
export default function LiveChargingMonitor({ sessionId, onSessionEnd }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [virtualSoc, setVirtualSoc] = useState(null);
  const [power, setPower] = useState(11);
  const capacity = useRef(getBatteryCapacity());
  const pollRef = useRef(null);
  const simRef = useRef(null);

  // ── Fetch session from backend ──
  // Only updates metadata fields; does NOT overwrite energyKWh/durationMinutes
  // that the simulation tick computes — avoids data fights.
  const fetchSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await stationAPI.getChargingSessionById(sessionId);
      const data = res?.data ?? res;
      if (!data) {
        setError("Không tìm thấy phiên sạc");
        return;
      }

      const status = String(data.status || "").toUpperCase();
      if (status === "COMPLETED" || status === "FINISHED" || status === "STOPPED") {
        setSession(data);
        setVirtualSoc(data.finalSoc ?? 100);
        if (onSessionEnd) onSessionEnd(data);
        return;
      }

      // Update power from backend
      const newPower = extractPower(data);
      setPower(newPower);

      setSession(prev => {
        if (!prev) return data; // first load — use full backend data
        // Subsequent polls — only update metadata, keep sim-computed fields
        return {
          ...prev,
          status: data.status,
          stationName: data.stationName ?? prev.stationName,
          pointNumber: data.pointNumber ?? data.chargingPoint?.pointNumber ?? prev.pointNumber,
          vehiclePlate: data.vehiclePlate ?? prev.vehiclePlate,
          pricePerKWh: data.pricePerKWh ?? prev.pricePerKWh,
          pricePerMin: data.pricePerMin ?? prev.pricePerMin,
          initialSoc: data.initialSoc ?? prev.initialSoc,
          startTime: data.startTime ?? prev.startTime,
          bookingId: data.bookingId ?? prev.bookingId,
          invoiceId: data.invoiceId ?? data.invoice?.invoiceId ?? prev.invoiceId,
          currency: data.currency ?? prev.currency,
          // NOTE: energyKWh, durationMinutes, virtualSoc are left to the simulation tick
        };
      });
      setError(null);
    } catch (err) {
      console.error("LiveChargingMonitor fetch error:", err);
      setError("Lỗi khi tải dữ liệu phiên sạc");
    } finally {
      setLoading(false);
    }
  }, [sessionId, onSessionEnd]);

  // ── Initial fetch + polling ──
  useEffect(() => {
    fetchSession();
    pollRef.current = setInterval(fetchSession, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchSession]);

  // ── Virtual SOC simulation (every 2s) ──
  useEffect(() => {
    if (!session || String(session.status).toUpperCase() !== "IN_PROGRESS") return;

    const tick = () => {
      const { finalSoc, energyKWh, durationMinutes } = calcMetrics({
        startTime: session.startTime,
        initialSoc: session.initialSoc,
        powerKW: power,
        capacity: capacity.current,
      });
      setVirtualSoc(finalSoc);
      // Update session with calculated metrics
      setSession(prev => {
        if (!prev || String(prev.status).toUpperCase() !== "IN_PROGRESS") return prev;
        return { ...prev, energyKWh, durationMinutes };
      });
    };

    tick();
    simRef.current = setInterval(tick, 2000);
    return () => {
      if (simRef.current) clearInterval(simRef.current);
    };
  }, [session?.sessionId, session?.status, session?.startTime, session?.initialSoc, power]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="lcm-monitor">
        <div className="lcm-loading">
          <div className="lcm-spinner" />
          <span className="lcm-loading-text">Đang tải phiên sạc...</span>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error || !session) {
    return (
      <div className="lcm-monitor">
        <div className="lcm-error">
          <div className="lcm-error-icon"><AlertTriangle size={24} /></div>
          <span className="lcm-error-text">{error || "Không tìm thấy phiên sạc"}</span>
        </div>
      </div>
    );
  }

  // ── Derived values ──
  const isCharging = String(session.status).toUpperCase() === "IN_PROGRESS";
  const durationMin = Math.floor(session.durationMinutes ?? 0);
  const energyKWh = Number(session.energyKWh ?? 0).toFixed(2);
  const pricePerKWh = session.pricePerKWh ?? 0;
  const estimatedCost = round2(Number(energyKWh) * pricePerKWh);

  return (
    <div className="lcm-monitor">
      {/* ── Header ── */}
      <div className="lcm-header">
        <div className="lcm-header-icon"><Zap size={20} /></div>
        <div className="lcm-header-info">
          <div className="lcm-station-name">{session.stationName ?? "Trạm sạc"}</div>
          <div className="lcm-session-id">
            <span className="lcm-live-dot" />
            Phiên #{session.sessionId}
          </div>
        </div>
        {isCharging && <span className="lcm-status-badge">⚡ Đang sạc</span>}
      </div>

      {/* ── Progress Bar ── */}
      <ProgressBar
        initialSoc={session.initialSoc ?? 0}
        virtualSoc={virtualSoc ?? session.initialSoc ?? 0}
        isCharging={isCharging}
      />

      {/* ── Stats ── */}
      <div className="lcm-stats">
        <StatCard icon={Clock} label="Thời gian sạc" value={durationMin} unit="phút" color="blue" />
        <StatCard icon={Zap} label="Điện năng" value={energyKWh} unit="kWh" color="green" />
        <StatCard icon={Gauge} label="Công suất" value={power} unit="kW" color="orange" />
        <StatCard icon={DollarSign} label="Tiền tạm tính" value={estimatedCost.toLocaleString("vi-VN")} unit="₫" color="amber" />
      </div>

      {/* ── Meta info ── */}
      <div className="lcm-meta">
        <div className="lcm-meta-row">
          <span className="lcm-meta-label"><MapPin size={13} /> Trạm sạc</span>
          <span className="lcm-meta-value">{session.stationName ?? "—"}</span>
        </div>
        <div className="lcm-meta-row">
          <span className="lcm-meta-label"><Zap size={13} /> Trụ sạc</span>
          <span className="lcm-meta-value">{session.pointNumber ?? session.chargingPoint?.pointNumber ?? "—"}</span>
        </div>
        <div className="lcm-meta-row">
          <span className="lcm-meta-label"><Car size={13} /> Biển số xe</span>
          <span className="lcm-meta-value">{session.vehiclePlate ?? "—"}</span>
        </div>
        <div className="lcm-meta-row">
          <span className="lcm-meta-label"><Clock size={13} /> Bắt đầu</span>
          <span className="lcm-meta-value">
            {session.startTime ? new Date(session.startTime).toLocaleString("vi-VN") : "—"}
          </span>
        </div>
        {pricePerKWh > 0 && (
          <div className="lcm-meta-row">
            <span className="lcm-meta-label"><DollarSign size={13} /> Đơn giá</span>
            <span className="lcm-meta-value">{Number(pricePerKWh).toLocaleString("vi-VN")} ₫/kWh</span>
          </div>
        )}
      </div>
    </div>
  );
}
