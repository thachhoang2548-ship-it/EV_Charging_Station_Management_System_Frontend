import React, { useEffect, useState, useCallback, memo, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import paths from "../../path/paths.jsx";
import { toast } from "react-toastify";
import { stationAPI } from "../../api/stationApi.js";
import { getMySessions } from "../../api/driverApi.js";
import { isAuthenticated } from "../../utils/authUtils.js";

/**
 * FIX for new billing logic:
 * - SOC reaches 100%: DO NOT auto-stop, DO NOT auto-redirect.
 * - Keep session running so backend can charge "time fee after full".
 * - Redirect ONLY when backend marks session COMPLETED/STOPPED/FINISHED.
 */

// ========== CONSTANTS ==========
const CHARGING_EFFICIENCY = 0.9;
const POLLING_INTERVAL = 5000;
const POWER_POLLING_INTERVAL = 15000;
const ENERGY_POLLING_INTERVAL = 60000;

// ========== UTILITY FUNCTIONS ==========
const getBatteryCapacity = () => {
    const capacity = sessionStorage.getItem("batteryCapacityKWh");
    return capacity ? parseFloat(capacity) : 60;
};

const round2 = (value) => Math.round(value * 100.0) / 100.0;

const calculateChargingMetrics = ({
                                      startTime,
                                      initialSoc,
                                      powerKW,
                                      capacity = getBatteryCapacity(),
                                      efficiency = CHARGING_EFFICIENCY,
                                  }) => {
    const now = new Date();
    const start = new Date(startTime);
    const durationMs = now - start;
    const durationMinutes = durationMs / (1000 * 60);
    const hours = durationMinutes / 60;

    const estimatedEnergyDelivered = hours * powerKW * efficiency;
    const estimatedSocIncrease = (estimatedEnergyDelivered / capacity) * 100.0;

    let rawFinalSOC = initialSoc + estimatedSocIncrease;

    if (durationMinutes > 0 && Math.floor(rawFinalSOC) === initialSoc) {
        rawFinalSOC = initialSoc + 1;
    }

    let finalSOC = Math.round(rawFinalSOC);
    finalSOC = Math.min(100, Math.max(initialSoc, finalSOC));

    const deltaSoc = finalSOC - initialSoc;
    const energyKWh = round2((deltaSoc / 100.0) * capacity);

    return { finalSOC, energyKWh, durationMinutes };
};

const extractPowerKW = (session, bookingId) => {
    if (bookingId) {
        try {
            const key = `booking_${bookingId}_maxPowerKW`;
            const storedPower = sessionStorage.getItem(key);
            if (storedPower) {
                const power = JSON.parse(storedPower);
                return power;
            }
        } catch (e) {
            // ignore
        }
    }

    return (
        session?.chargingPoint?.maxPowerKW ??
        session?.maxPowerKW ??
        session?.ratedKW ??
        session?.powerKW ??
        11.0
    );
};

// ✅ FIX: map invoiceId đúng cách
const syncSessionFromBackend = (backendData, currentState = {}) => {
    const resolvedInvoiceId =
        backendData?.invoiceId ??
        backendData?.invoice?.invoiceId ??
        currentState?.invoiceId ??
        currentState?.invoice?.invoiceId ??
        null;

    return {
        ...currentState,
        ...backendData,

        invoiceId: resolvedInvoiceId,

        status: backendData.status ?? currentState.status,
        endTime: backendData.endTime ?? currentState.endTime,
        finalSoc: backendData.finalSoc ?? currentState.finalSoc,
        energyKWh: backendData.energyKWh ?? currentState.energyKWh,
        cost: backendData.cost ?? currentState.cost,
        durationMinutes: backendData.durationMinutes ?? currentState.durationMinutes,
        virtualSoc: backendData.finalSoc ?? currentState.virtualSoc,
        pointNumber: backendData.pointNumber ?? currentState.pointNumber,
        stationName: backendData.stationName ?? currentState.stationName,
        vehiclePlate: backendData.vehiclePlate ?? currentState.vehiclePlate,
        pricePerKWh: backendData.pricePerKWh ?? currentState.pricePerKWh,
        currency: backendData.currency ?? currentState.currency,
    };
};

// ========== RESPONSIVE CSS (inject once) ==========
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  :root{
    --brand: #00BFA6;
    --blue: #2196f3;
    --red: #f44336;
    --text: #222;
    --muted: #666;
    --card: #ffffff;
    --bg: #f6f7f9;
    --border: #e9ecef;
    --shadow: 0 2px 12px rgba(0,0,0,0.06);
  }

  .cs-wrap{ max-width: 1200px; margin: 0 auto; padding: 16px; }
  .cs-title{
    color: var(--brand);
    margin: 0 0 16px;
    font-size: clamp(20px, 3vw, 28px);
    font-weight: 800;
    letter-spacing: -0.2px;
  }

  .cs-card{
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    box-shadow: var(--shadow);
    padding: 16px;
  }

  .cs-subtitle{
    margin: 0 0 12px;
    font-size: clamp(16px, 2.4vw, 20px);
    font-weight: 800;
    color: #333;
  }

  .cs-section{ margin-bottom: 16px; }
  .cs-row{ display: grid; grid-template-columns: 1fr; gap: 10px; }

  .cs-pill{
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 12px;
    border-radius: 999px;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    line-height: 1;
  }

  .cs-badge{
    margin-top: 10px;
    padding: 10px 12px;
    border-radius: 12px;
    font-weight: 800;
  }
  .cs-badge--soc{
    background: rgba(0, 191, 166, 0.08);
    border: 1px solid rgba(0, 191, 166, 0.25);
    color: #007f6f;
  }
  .cs-badge--full{
    background: rgba(255, 152, 0, 0.12);
    border: 1px solid rgba(255, 152, 0, 0.35);
    color: #b26a00;
  }

  .cs-quick{
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }
  .cs-quickItem{
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 12px;
    min-width: 0;
  }
  .cs-quickLabel{
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--muted);
    font-size: 13px;
    margin-bottom: 6px;
  }
  .cs-quickValue{
    font-weight: 800;
    color: #333;
    font-size: 16px;
    word-break: break-word;
  }

  .cs-infoGrid{
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .cs-actions{
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 16px;
  }

  .cs-btn{
    appearance: none;
    border: none;
    border-radius: 10px;
    padding: 12px 16px;
    font-weight: 800;
    cursor: pointer;
    font-size: 15px;
    line-height: 1;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex: 0 0 auto;
  }

  .cs-btn--primary{ background: var(--brand); color: #fff; }
  .cs-btn--danger{ background: var(--red); color: #fff; }
  .cs-btn:disabled{ background: #cfcfcf; cursor: not-allowed; }

  @media (hover: hover) and (pointer: fine){
    .cs-infoCard:hover{
      transform: translateY(-3px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    }
  }

  @media (max-width: 992px){
    .cs-quick{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .cs-infoGrid{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (max-width: 600px){
    .cs-wrap{ padding: 12px; }
    .cs-card{ padding: 12px; border-radius: 12px; }
    .cs-quick{ grid-template-columns: 1fr; }
    .cs-infoGrid{ grid-template-columns: 1fr; }
    .cs-actions{ flex-direction: column; }
    .cs-btn{ width: 100%; }
  }
`;
if (!document.head.querySelector("style[data-charging-session-styles]")) {
    styleSheet.setAttribute("data-charging-session-styles", "true");
    document.head.appendChild(styleSheet);
}

// ========== UI COMPONENTS ==========
const BatteryProgressCircle = memo(function BatteryProgressCircle({
                                                                      initialSoc,
                                                                      energyKWh,
                                                                      capacity,
                                                                      isCharging,
                                                                      virtualSoc,
                                                                  }) {
    const deltaPercent = (energyKWh / capacity) * 100;
    const calculatedSoc = Math.min(initialSoc + deltaPercent, 100);
    const currentSoc = virtualSoc ?? calculatedSoc;
    const isComplete = currentSoc >= 100;

    const [animatedSoc, setAnimatedSoc] = useState(currentSoc);

    useEffect(() => {
        const diff = currentSoc - animatedSoc;
        if (Math.abs(diff) < 0.1) {
            setAnimatedSoc(currentSoc);
            return;
        }
        const step = diff / 20;
        const interval = setInterval(() => {
            setAnimatedSoc((prev) => {
                const next = prev + step;
                if ((diff > 0 && next >= currentSoc) || (diff < 0 && next <= currentSoc)) {
                    clearInterval(interval);
                    return currentSoc;
                }
                return next;
            });
        }, 50);
        return () => clearInterval(interval);
    }, [currentSoc, animatedSoc]);

    // responsive size (simple)
    const size = Math.round(Math.min(260, Math.max(180, window.innerWidth * 0.55)));
    const strokeWidth = 16;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animatedSoc / 100) * circumference;

    const progressColor = isComplete ? "#2196f3" : "#00BFA6";
    const trackColor = "#e0e0e0";

    return (
        <div
            className="battery-progress-circle"
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "18px 14px",
                background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                borderRadius: "18px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                margin: "0 auto 18px",
                maxWidth: "420px",
            }}
        >
            <div
                style={{
                    fontSize: "44px",
                    marginBottom: "10px",
                    animation: isCharging && !isComplete ? "pulse 2s ease-in-out infinite" : "none",
                }}
            >
                🔋
            </div>

            <div style={{ position: "relative", marginBottom: "14px" }}>
                <svg
                    width={size}
                    height={size}
                    style={{
                        transform: "rotate(-90deg)",
                        filter: "drop-shadow(0 2px 8px rgba(0,191,166,0.3))",
                    }}
                >
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={trackColor}
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={progressColor}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{
                            transition:
                                "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease",
                        }}
                    />
                </svg>

                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        width: "100%",
                    }}
                >
                    <div
                        style={{
                            fontSize: "clamp(34px, 7vw, 48px)",
                            fontWeight: "900",
                            color: progressColor,
                            lineHeight: "1",
                            marginBottom: "4px",
                        }}
                    >
                        {animatedSoc.toFixed(0)}%
                    </div>
                    <div
                        style={{
                            fontSize: "12px",
                            color: "#666",
                            fontWeight: "600",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                        }}
                    >
                        Pin hiện tại
                    </div>
                </div>
            </div>

            <div
                style={{
                    textAlign: "center",
                    fontSize: "14px",
                    color: isComplete ? "#2196f3" : isCharging ? "#00BFA6" : "#666",
                    fontWeight: "700",
                    padding: "10px 14px",
                    background: isComplete
                        ? "rgba(33, 150, 243, 0.1)"
                        : isCharging
                            ? "rgba(0, 191, 166, 0.1)"
                            : "rgba(0, 0, 0, 0.05)",
                    borderRadius: "999px",
                }}
            >
                {isComplete ? "✅ Pin đã đầy 100%" : isCharging ? "⚡ Đang sạc..." : "Dung lượng pin (ước tính)"}
            </div>

            <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
      `}</style>
        </div>
    );
});

const InfoCard = memo(function InfoCard({ icon, label, value, color = "#00BFA6", unit = "" }) {
    return (
        <div
            className="cs-infoCard"
            style={{
                background: "white",
                padding: "14px",
                borderRadius: "12px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                textAlign: "center",
                border: `2px solid ${color}15`,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                minWidth: 0,
            }}
        >
            <div style={{ fontSize: "28px", marginBottom: "6px" }}>{icon}</div>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "6px", fontWeight: "600" }}>{label}</div>
            <div style={{ fontSize: "22px", fontWeight: "900", color, wordBreak: "break-word" }}>
                {value}
                {unit && <span style={{ fontSize: "14px", fontWeight: "700", marginLeft: "4px" }}>{unit}</span>}
            </div>
        </div>
    );
});

export default function ChargingSession() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    const [currentSession, setCurrentSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [stopping, setStopping] = useState(false);
    const [autoRedirected, setAutoRedirected] = useState(false);
    const [currentPower, setCurrentPower] = useState(0);
    const [lastEnergySync, setLastEnergySync] = useState(null);
    const [batteryCapacity, setBatteryCapacity] = useState(getBatteryCapacity());

    // ✅ show toast initial SOC once per session
    const initialSocToastShownRef = useRef({ sessionId: null, shown: false });

    const qrFromState = location?.state?.qrBlobUrl;
    const stateBooking = location?.state?.booking;
    const bookingIdFromParams = params?.bookingId;

    const [qrUrl, setQrUrl] = useState(qrFromState || null);
    const [booking, setBooking] = useState(stateBooking || null);
    const [bookingLoading, setBookingLoading] = useState(false);

    const statusColors = {
        IN_PROGRESS: "#4caf50",
        COMPLETED: "#2196f3",
        FAILED: "#f44336",
        PENDING: "#ff9800",
        STOPPING: "#9e9e9e",
    };

    const qrStorageKey = (id) => (id ? `qr_booking_${id}` : null);

    // ---- derived stable keys (để fix polling) ----
    const sessionId = currentSession?.sessionId ?? null;
    const sessionStatusUpper = String(currentSession?.status || "").toUpperCase();
    const isInProgress = sessionStatusUpper === "IN_PROGRESS";

    useEffect(() => {
        setBatteryCapacity(getBatteryCapacity());
    }, []);

    const getSimulationKey = (sid) => (sid ? `chargingSession_simulation_${sid}` : null);

    const saveSimState = useCallback((session) => {
        if (!session || !session.sessionId) return;
        try {
            const key = getSimulationKey(session.sessionId);
            if (!key) return;
            localStorage.setItem(
                key,
                JSON.stringify({
                    sessionId: session.sessionId,
                    virtualSoc: session.virtualSoc,
                    energyKWh: session.energyKWh,
                    durationMinutes: session.durationMinutes,
                    lastUpdated: Date.now(),
                    status: session.status,
                })
            );
        } catch (e) {
            // ignore
        }
    }, []);

    const clearSimState = useCallback(
        (sid) => {
            if (!sid) return;
            try {
                const key = getSimulationKey(sid);
                if (key) localStorage.removeItem(key);

                if (currentSession?.bookingId) {
                    const powerKey = `booking_${currentSession.bookingId}_maxPowerKW`;
                    sessionStorage.removeItem(powerKey);
                }
            } catch (e) {
                // ignore
            }
        },
        [currentSession?.bookingId] // ✅ tránh phụ thuộc object currentSession
    );

    // ✅ Restore QR (tránh chạy mỗi giây): chỉ phụ thuộc bookingId / session bookingId, không phụ thuộc object currentSession
    useEffect(() => {
        if (qrUrl) return;

        const attemptRestore = () => {
            const idCandidates = [
                bookingIdFromParams,
                booking?.bookingId ?? booking?.id,
                currentSession?.bookingId,
            ];

            for (const id of idCandidates) {
                if (!id) continue;
                try {
                    const key = qrStorageKey(id);
                    const stored = key ? sessionStorage.getItem(key) : null;
                    if (stored) {
                        setQrUrl(stored);
                        return;
                    }
                } catch (e) {
                    // ignore
                }
            }

            try {
                const keys = Object.keys(sessionStorage).filter((k) => k && k.startsWith("qr_booking_"));
                if (keys.length === 1) {
                    const s = sessionStorage.getItem(keys[0]);
                    if (s) setQrUrl(s);
                }
            } catch (e) {
                // ignore
            }
        };

        attemptRestore();
    }, [
        bookingIdFromParams,
        booking?.bookingId,
        booking?.id,
        currentSession?.bookingId, // ✅ chỉ lấy field cần
        qrUrl,
    ]);

    useEffect(() => {
        if (!isAuthenticated()) {
            toast.warning("Bạn chưa đăng nhập. Vui lòng đăng nhập để xem phiên sạc!", {
                position: "top-center",
                autoClose: 3000,
            });
            navigate(paths.login);
            return;
        }

        fetchCurrentSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    const fetchCurrentSession = async () => {
        try {
            setLoading(true);
            const response = await stationAPI.getCurrentChargingSession();
            if (!response || response.success === false) {
                setCurrentSession(null);
                setCurrentPower(0);
                return;
            }
            const session = response.data ?? response;

            const resolvedInvoiceId = session?.invoiceId ?? session?.invoice?.invoiceId ?? null;

            const power = extractPowerKW(session, session.bookingId);
            const pointNumber =
                session.pointNumber ??
                session.chargingPoint?.pointNumber ??
                session.chargingPoint?.point_number ??
                null;

            setCurrentPower(power);
            setCurrentSession({
                ...session,
                pointNumber,
                invoiceId: resolvedInvoiceId,
            });
        } catch (error) {
            console.error("Lỗi khi lấy phiên sạc hiện tại:", error);
            toast.error("Không thể lấy thông tin phiên sạc", { position: "top-center" });
        } finally {
            setLoading(false);
        }
    };

    // ✅ Toast báo pin đầu vào đúng 1 lần mỗi session
    useEffect(() => {
        const sid = currentSession?.sessionId ?? null;
        const initialSoc = currentSession?.initialSoc;

        if (!sid || initialSoc == null) return;

        if (initialSocToastShownRef.current.sessionId !== sid) {
            initialSocToastShownRef.current = { sessionId: sid, shown: false };
        }

        if (!initialSocToastShownRef.current.shown) {
            initialSocToastShownRef.current.shown = true;
            toast.info(`🔋 Pin đầu vào: ${initialSoc}%`, { position: "top-center", autoClose: 2500 });
        }
    }, [currentSession?.sessionId, currentSession?.initialSoc]);

    // ✅ Poll power (FIX: không phụ thuộc currentSession object)
    useEffect(() => {
        if (!sessionId || !isInProgress) return;

        const pollPowerInterval = setInterval(async () => {
            try {
                const response = await stationAPI.getCurrentChargingSession();
                const updatedSession = response.data ?? response;
                const newPower = updatedSession?.chargingPoint?.maxPowerKW;

                if (newPower && newPower !== currentPower) {
                    setCurrentPower(newPower);
                }
            } catch (e) {
                // ignore
            }
        }, POWER_POLLING_INTERVAL);

        return () => clearInterval(pollPowerInterval);
    }, [sessionId, isInProgress, currentPower]);

    // ✅ Energy polling (FIX: không phụ thuộc currentSession object => hết spam request)
    useEffect(() => {
        if (!sessionId || !isInProgress) return;

        const doSync = async () => {
            try {
                const response = await stationAPI.getCurrentChargingSession();
                const backendSession = response.data ?? response;

                if (!backendSession || String(backendSession.status || "").toUpperCase() !== "IN_PROGRESS") return;

                const startTime = new Date(backendSession.startTime);
                const now = new Date();
                const durationMinutes = (now - startTime) / (1000 * 60);
                const hours = durationMinutes / 60;

                const power = currentPower || 11.0;
                const capacity = batteryCapacity;
                const initialSoc = backendSession.initialSoc ?? 20;

                const estimatedEnergyDelivered = hours * power * CHARGING_EFFICIENCY;
                const estimatedSocIncrease = (estimatedEnergyDelivered / capacity) * 100.0;

                let rawFinalSOC = initialSoc + estimatedSocIncrease;
                if (durationMinutes > 0 && Math.floor(rawFinalSOC) === initialSoc) {
                    rawFinalSOC = initialSoc + 1;
                }

                let finalSOC = Math.round(rawFinalSOC);
                finalSOC = Math.min(100, Math.max(initialSoc, finalSOC));

                const deltaSoc = finalSOC - initialSoc;
                const backendEnergy = round2((deltaSoc / 100.0) * capacity);

                setCurrentSession((prev) => {
                    if (!prev || String(prev.status || "").toUpperCase() !== "IN_PROGRESS") return prev;

                    const inv =
                        prev.invoiceId ??
                        backendSession?.invoiceId ??
                        backendSession?.invoice?.invoiceId ??
                        null;

                    return {
                        ...prev,
                        energyKWh: backendEnergy,
                        virtualSoc: finalSOC,
                        durationMinutes,
                        invoiceId: inv,
                    };
                });

                setLastEnergySync(new Date());
            } catch (err) {
                console.debug("Energy polling error:", err);
            }
        };

        doSync();
        const pollEnergyInterval = setInterval(doSync, ENERGY_POLLING_INTERVAL);
        return () => clearInterval(pollEnergyInterval);
    }, [sessionId, isInProgress, currentPower, batteryCapacity]);

    // Poll sessions status
    useEffect(() => {
        let intervalId = null;

        const poll = async () => {
            try {
                const response = await getMySessions();
                if (!response || response.success === false) return;

                const sessions = response.data ?? response;
                if (!Array.isArray(sessions) || sessions.length === 0) return;

                const inProgressSession = sessions.find(
                    (s) => String(s.status || "").toUpperCase() === "IN_PROGRESS"
                );

                if (inProgressSession) {
                    const bookingId = inProgressSession.bookingId;
                    if (bookingId) {
                        try {
                            const key = `booking_${bookingId}_maxPowerKW`;
                            const storedPower = sessionStorage.getItem(key);
                            if (storedPower) {
                                const power = JSON.parse(storedPower);
                                setCurrentPower(power);
                            }
                        } catch (e) {
                            // ignore
                        }
                    }

                    setCurrentSession((prev) => {
                        const inv =
                            inProgressSession?.invoiceId ??
                            inProgressSession?.invoice?.invoiceId ??
                            prev?.invoiceId ??
                            null;

                        if (!prev) return { ...inProgressSession, invoiceId: inv };
                        if (prev.sessionId !== inProgressSession.sessionId) return { ...inProgressSession, invoiceId: inv };
                        return prev;
                    });
                    return;
                }

                setCurrentSession((prev) => {
                    if (!prev || !prev.sessionId) return null;

                    const prevSessionId = prev.sessionId;
                    const found = sessions.find((s) => s.sessionId === prevSessionId);
                    if (!found) return prev;

                    const status = String(found.status || "").toUpperCase();
                    if (status === "COMPLETED" || status === "FINISHED" || status === "STOPPED") {
                        const inv = found?.invoiceId ?? found?.invoice?.invoiceId ?? prev?.invoiceId ?? null;

                        return {
                            ...found,
                            virtualSoc: found.finalSoc ?? prev.virtualSoc,
                            pointNumber: prev.pointNumber || found.pointNumber,
                            invoiceId: inv,
                        };
                    }

                    return prev;
                });
            } catch (err) {
                console.error("Polling getMySessions error:", err);
            }
        };

        poll();
        intervalId = setInterval(poll, POLLING_INTERVAL);

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    // ✅ Virtual SOC smoothing (FIX: không phụ thuộc currentSession object)
    useEffect(() => {
        if (!sessionId) return;

        if (!isInProgress) {
            clearSimState(sessionId);
            return;
        }

        const startTime = currentSession?.startTime;
        const initialSoc = currentSession?.initialSoc ?? 20;

        if (!startTime) return;

        if (currentSession?.virtualSoc == null) {
            setCurrentSession((prev) => (prev ? { ...prev, virtualSoc: initialSoc } : prev));
        }

        const capacity = batteryCapacity;
        const efficiency = CHARGING_EFFICIENCY;

        const virtualChargeInterval = setInterval(() => {
            setCurrentSession((prev) => {
                if (!prev || String(prev.status || "").toUpperCase() !== "IN_PROGRESS") return prev;

                const now = new Date();
                const st = new Date(prev.startTime);
                const durationMinutes = (now - st) / (1000 * 60);

                const { finalSOC } = calculateChargingMetrics({
                    startTime: prev.startTime,
                    initialSoc,
                    powerKW: currentPower || 11.0,
                    capacity,
                    efficiency,
                });

                const updatedSession = {
                    ...prev,
                    virtualSoc: finalSOC,
                    durationMinutes,
                };

                saveSimState(updatedSession);

                try {
                    const liveDataKey = `session_${prev.sessionId}_live_soc`;
                    const liveData = {
                        sessionId: prev.sessionId,
                        virtualSoc: Math.round(finalSOC),
                        energyKWh: prev.energyKWh ?? 0,
                        durationMinutes,
                        timestamp: Date.now(),
                        lastEnergySync: lastEnergySync?.toISOString() ?? null,
                    };
                    sessionStorage.setItem(liveDataKey, JSON.stringify(liveData));
                } catch (e) {
                    // ignore
                }

                return updatedSession;
            });
        }, 1000);

        return () => clearInterval(virtualChargeInterval);
    }, [
        sessionId,
        isInProgress,
        currentSession?.startTime,
        currentSession?.initialSoc,
        currentPower,
        batteryCapacity,
        saveSimState,
        clearSimState,
        lastEnergySync,
    ]);

    // Auto redirect only when ended
    useEffect(() => {
        if (!currentSession) return;

        const normalizedStatus = String(currentSession.status || "").toUpperCase();
        const isSessionEnded =
            normalizedStatus === "COMPLETED" ||
            normalizedStatus === "STOPPED" ||
            normalizedStatus === "FINISHED";

        if (isSessionEnded && !autoRedirected) {
            const hasRequiredData =
                currentSession.finalSoc != null &&
                currentSession.energyKWh != null &&
                currentSession.cost != null &&
                currentSession.durationMinutes != null;

            if (!hasRequiredData) return;

            setAutoRedirected(true);

            toast.info("⚡ Phiên sạc đã kết thúc. Đang chuyển sang trang thanh toán...", {
                position: "top-center",
                autoClose: 1500,
            });

            clearSimState(currentSession.sessionId);

            try {
                const liveDataKey = `session_${currentSession.sessionId}_live_soc`;
                sessionStorage.removeItem(liveDataKey);
            } catch (e) {
                // ignore
            }

            setTimeout(() => {
                navigate(paths.payment, { state: { sessionResult: currentSession } });
            }, 1500);
        }
    }, [currentSession, autoRedirected, navigate, clearSimState]);

    // Auto-stop when booking time expires
    useEffect(() => {
        if (!currentSession || String(currentSession.status || "").toUpperCase() !== "IN_PROGRESS") return;
        if (!currentSession.windowEnd) return;

        const checkExpiry = setInterval(() => {
            const now = new Date();
            const endTime = new Date(currentSession.windowEnd);

            if (now >= endTime) {
                const currentFinalSoc = Math.round(
                    currentSession.virtualSoc || currentSession.initialSoc || 20
                );

                stationAPI
                    .stopChargingSession(currentSession.sessionId, currentFinalSoc)
                    .then((response) => {
                        const sessionResult = response.data ?? response;
                        setCurrentSession((cur) => (cur ? syncSessionFromBackend(sessionResult, cur) : cur));
                    })
                    .catch((err) => console.error("❌ Failed to stop session on time expiry:", err));

                clearInterval(checkExpiry);
            }
        }, 5000);

        return () => clearInterval(checkExpiry);
    }, [currentSession]);

    const handleStopSession = async () => {
        if (!currentSession?.sessionId) {
            toast.error("Không có sessionId để dừng", { position: "top-center" });
            return;
        }
        if (!window.confirm("Bạn có chắc chắn muốn dừng phiên sạc này không?")) return;

        try {
            setStopping(true);
            setCurrentSession((prev) => (prev ? { ...prev, status: "STOPPING" } : prev));

            const finalSocToSend = Math.round(
                currentSession.virtualSoc || currentSession.initialSoc || 20
            );

            const response = await stationAPI.stopChargingSession(
                currentSession.sessionId,
                finalSocToSend
            );
            if (!response || response.success === false) {
                setCurrentSession((prev) => (prev ? { ...prev, status: "IN_PROGRESS" } : prev));
                toast.error(response?.message || "Dừng phiên sạc thất bại", { position: "top-center" });
                return;
            }

            const sessionResult = response.data ?? response;
            setCurrentSession((prev) => (prev ? syncSessionFromBackend(sessionResult, prev) : prev));

            toast.success("Dừng phiên sạc thành công!", { position: "top-center" });

            clearSimState(currentSession.sessionId);

            try {
                const key = qrStorageKey(
                    booking?.bookingId ?? bookingIdFromParams ?? sessionResult?.bookingId ?? currentSession?.bookingId
                );
                if (key) sessionStorage.removeItem(key);
            } catch (e) {
                // ignore
            }
        } catch (err) {
            console.error("Lỗi khi dừng phiên sạc:", err);
            setCurrentSession((prev) => (prev ? { ...prev, status: "IN_PROGRESS" } : prev));
            toast.error("Dừng phiên sạc thất bại", { position: "top-center" });
        } finally {
            setStopping(false);
        }
    };

    // Load booking if needed
    useEffect(() => {
        if (!booking && bookingIdFromParams) {
            (async () => {
                try {
                    setBookingLoading(true);
                    const res = await stationAPI.getBookingById(bookingIdFromParams);
                    if (!res || res.success === false) {
                        toast.error(res?.message || "Không thể lấy booking", { position: "top-center" });
                        return;
                    }
                    setBooking(res.data ?? res);
                } catch (err) {
                    console.error("Error fetching booking:", err);
                } finally {
                    setBookingLoading(false);
                }
            })();
        }
    }, [booking, bookingIdFromParams]);

    // Remove persisted QR when in progress
    useEffect(() => {
        if (!currentSession) return;
        if (String(currentSession.status || "").toUpperCase() === "IN_PROGRESS") {
            try {
                const id = booking?.bookingId ?? bookingIdFromParams ?? currentSession.bookingId;
                const key = qrStorageKey(id);
                if (key) sessionStorage.removeItem(key);
                setQrUrl(null);
            } catch (e) {
                // ignore
            }
        }
    }, [currentSession?.status, currentSession?.bookingId, booking?.bookingId, bookingIdFromParams]);

    // Cleanup blob URL
    useEffect(() => {
        return () => {
            if (qrUrl && typeof qrUrl === "string" && qrUrl.startsWith("blob:")) {
                try {
                    URL.revokeObjectURL(qrUrl);
                } catch (e) {
                    // ignore
                }
            }
        };
    }, [qrUrl]);

    const handleDownload = () => {
        if (!qrUrl) return;
        const a = document.createElement("a");
        a.href = qrUrl;
        a.download = `booking-${booking?.bookingId ?? bookingIdFromParams ?? "qr"}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    const restoreAnyQr = () => {
        try {
            const keys = Object.keys(sessionStorage).filter((k) => k && k.startsWith("qr_booking_"));
            if (!keys || keys.length === 0) {
                toast.info("Không tìm thấy QR lưu trữ nào trong sessionStorage", { position: "top-center" });
                return;
            }
            let keyToUse = null;
            const idCandidates = [bookingIdFromParams, booking?.bookingId ?? booking?.id, currentSession?.bookingId];
            for (const id of idCandidates) {
                if (!id) continue;
                const candidateKey = `qr_booking_${id}`;
                if (keys.includes(candidateKey)) {
                    keyToUse = candidateKey;
                    break;
                }
            }
            if (!keyToUse) keyToUse = keys[0];

            const val = sessionStorage.getItem(keyToUse);
            if (val) {
                setQrUrl(val);
                toast.success("Khôi phục QR thành công", { position: "top-center" });
            } else {
                toast.error("Không thể đọc QR từ sessionStorage", { position: "top-center" });
            }
        } catch (e) {
            console.warn("restoreAnyQr error", e);
            toast.error("Lỗi khi khôi phục QR", { position: "top-center" });
        }
    };

    const isFull100 = (currentSession?.virtualSoc ?? 0) >= 100 && isInProgress;

    return (
        <div className="cs-wrap">
            <h1 className="cs-title">Phiên sạc hiện tại</h1>

            {loading ? (
                <div className="cs-card">
                    <p style={{ margin: 0, color: "#444", fontWeight: 700 }}>Đang tải thông tin phiên sạc...</p>
                </div>
            ) : qrUrl && (!currentSession || !isInProgress) ? (
                <div className="cs-card">
                    <h2 className="cs-subtitle">Mã QR đặt chỗ</h2>

                    {bookingLoading ? (
                        <p style={{ margin: 0, color: "#444", fontWeight: 700 }}>Đang tải thông tin booking...</p>
                    ) : (
                        <>
                            {qrUrl ? (
                                <div style={{ textAlign: "center", marginTop: 12 }}>
                                    <img
                                        src={qrUrl}
                                        alt="QR Code"
                                        style={{
                                            maxWidth: "320px",
                                            width: "100%",
                                            height: "auto",
                                            borderRadius: 12,
                                            border: "1px solid #e9ecef",
                                            background: "#fff",
                                        }}
                                    />
                                    <div className="cs-actions" style={{ justifyContent: "center" }}>
                                        <button onClick={handleDownload} className="cs-btn cs-btn--primary">
                                            Tải mã QR
                                        </button>
                                        <button
                                            onClick={restoreAnyQr}
                                            className="cs-btn"
                                            style={{ background: "#1976d2", color: "#fff" }}
                                        >
                                            Khôi phục QR
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ marginTop: 12 }}>
                                    <p style={{ margin: "0 0 10px", color: "#555", fontWeight: 700 }}>
                                        QR chưa có. Vui lòng xác nhận booking trước.
                                    </p>
                                    <button
                                        onClick={restoreAnyQr}
                                        className="cs-btn"
                                        style={{ background: "#1976d2", color: "#fff" }}
                                    >
                                        Khôi phục QR
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            ) : currentSession ? (
                <div className="cs-card">
                    <h2 className="cs-subtitle">⚡ Thông tin phiên sạc</h2>

                    <div className="cs-section">
                        <div className="cs-row">
                            <p style={{ margin: 0 }}>
                                <strong>Booking ID:</strong> {currentSession.bookingId ?? "-"}
                            </p>

                            {currentSession.invoiceId != null && (
                                <p style={{ margin: 0 }}>
                                    <strong>Invoice ID:</strong> {currentSession.invoiceId}
                                </p>
                            )}

                            <p style={{ margin: 0 }}>
                                <strong>Trạng thái:</strong>{" "}
                                <span
                                    className="cs-pill"
                                    style={{ background: statusColors[currentSession.status] || "#9e9e9e", marginLeft: 8 }}
                                >
                  {sessionStatusUpper === "IN_PROGRESS"
                      ? "Đang sạc"
                      : sessionStatusUpper === "COMPLETED"
                          ? "Hoàn thành"
                          : sessionStatusUpper === "FAILED"
                              ? "Thất bại"
                              : currentSession.status ?? "-"}
                </span>
                            </p>
                        </div>

                        {currentSession?.initialSoc != null && (
                            <div className="cs-badge cs-badge--soc">
                                🔰 Pin đầu vào (SOC ban đầu): <b>{currentSession.initialSoc}%</b>
                            </div>
                        )}

                        {isFull100 && (
                            <div className="cs-badge cs-badge--full">
                                ⚠️ Pin đã đầy 100%. Phiên sạc vẫn đang chạy để tính <b>phí thời gian sau khi đầy</b>. Hãy bấm{" "}
                                <b>Dừng phiên sạc</b> để kết thúc và thanh toán.
                            </div>
                        )}
                    </div>

                    <div className="cs-quick cs-section">
                        <div className="cs-quickItem">
                            <div className="cs-quickLabel">🚗 Thông tin xe</div>
                            <div className="cs-quickValue">{currentSession.vehiclePlate ?? "-"}</div>
                        </div>

                        <div className="cs-quickItem">
                            <div className="cs-quickLabel">🏢 Thông tin trạm</div>
                            <div className="cs-quickValue">{currentSession.stationName ?? "-"}</div>
                        </div>

                        <div className="cs-quickItem">
                            <div className="cs-quickLabel">⏰ Bắt đầu</div>
                            <div className="cs-quickValue">
                                {currentSession.startTime
                                    ? new Date(currentSession.startTime).toLocaleString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        day: "2-digit",
                                        month: "2-digit",
                                    })
                                    : "-"}
                            </div>
                        </div>
                    </div>

                    {currentSession.initialSoc != null && (
                        <BatteryProgressCircle
                            initialSoc={currentSession.initialSoc}
                            energyKWh={currentSession.energyKWh ?? 0}
                            capacity={batteryCapacity}
                            isCharging={isInProgress}
                            virtualSoc={currentSession.virtualSoc}
                        />
                    )}

                    <div className="cs-infoGrid cs-section">
                        <InfoCard icon="🔰" label="Pin đầu vào" value={currentSession.initialSoc ?? 0} unit="%" color="#00BFA6" />
                        <InfoCard
                            icon="⚡"
                            label="Năng lượng đã sạc"
                            value={(currentSession.energyKWh ?? 0).toFixed(2)}
                            unit="kWh"
                            color="#4caf50"
                        />
                        <InfoCard
                            icon="⏱️"
                            label="Thời lượng"
                            value={(currentSession.durationMinutes ?? 0).toFixed(0)}
                            unit="phút"
                            color="#2196f3"
                        />
                        <InfoCard icon="⚡" label="Công suất sạc" value={currentPower.toFixed(1)} unit="kW" color="#9c27b0" />
                    </div>

                    <div className="cs-actions">
                        <button onClick={fetchCurrentSession} className="cs-btn cs-btn--primary">
                            🔄 Làm mới
                        </button>

                        {isInProgress && (
                            <button onClick={handleStopSession} disabled={stopping} className="cs-btn cs-btn--danger">
                                {stopping ? "Đang dừng..." : "🛑 Dừng phiên sạc"}
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="cs-card" style={{ background: "#f5f5f5" }}>
                    <p style={{ color: "#666", margin: 0, fontWeight: 700, textAlign: "center" }}>
                        Không có phiên sạc nào đang hoạt động
                    </p>
                </div>
            )}
        </div>
    );
}