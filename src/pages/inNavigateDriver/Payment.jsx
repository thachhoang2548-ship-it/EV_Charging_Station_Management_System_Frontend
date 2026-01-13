import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../../api/apiUrls.js";
import "./Payment.css";

const CHARGING_EFFICIENCY = 0.9;

const getBatteryCapacityFromStorage = () => {
  const capacity = sessionStorage.getItem("batteryCapacityKWh");
  const n = Number(capacity);
  return Number.isFinite(n) && n > 0 ? n : 60;
};

// Ước tính số phút để tăng từ initialSoc -> targetSoc
function estimateMinutesToReachTargetSoc({
                                           initialSoc,
                                           targetSoc,
                                           batteryCapacityKWh,
                                           ratedKW,
                                           efficiency,
                                         }) {
  const from = Math.max(0, Math.min(100, Number(initialSoc ?? 0)));
  const to = Math.max(0, Math.min(100, Number(targetSoc ?? 100)));
  if (to <= from) return 0;

  const cap = Number(batteryCapacityKWh);
  const p = Number(ratedKW);
  const eta = Number(efficiency);

  const safeCap = Number.isFinite(cap) && cap > 0 ? cap : 60;
  const safeP = Number.isFinite(p) && p > 0 ? p : 11;
  const safeEta = Number.isFinite(eta) && eta > 0 ? eta : 0.9;

  const deltaKWh = ((to - from) / 100) * safeCap;
  const effectiveKW = Math.max(0.1, safeP * Math.max(0.1, safeEta));
  const hours = deltaKWh / effectiveKW;

  return Math.max(0, Math.ceil(hours * 60));
}

const fmtMoney = (v, currency = "VND") => {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return `0 ${currency}`;
  return `${n.toLocaleString("vi-VN")} ${currency}`;
};

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  // luôn lấy 1 bản sessionResult ổn định
  const rawSession = location?.state?.sessionResult ?? null;

  // ✅ restore pointNumber từ sessionStorage (không dùng hook)
  const session = useMemo(() => {
    if (!rawSession) return null;
    if (rawSession.pointNumber) return rawSession;

    try {
      if (rawSession.sessionId) {
        const cachedPointNumber = sessionStorage.getItem(
            `session_${rawSession.sessionId}_pointNumber`
        );
        if (cachedPointNumber) {
          return { ...rawSession, pointNumber: cachedPointNumber };
        }
      }
    } catch (err) {
      console.debug("Failed to read pointNumber from cache:", err);
    }
    return rawSession;
  }, [rawSession]);

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    if (!session) {
      toast.error("Không có thông tin thanh toán", { position: "top-center" });
      navigate(-1);
    }
  }, [session, navigate]);

  // ✅ Ước tính công suất (fallback)
  const inferredPowerKW = useMemo(() => {
    if (!session) return 11;

    let power =
        session.maxPowerKW ??
        session.powerKW ??
        session.ratedKW ??
        session.chargingPoint?.maxPowerKW ??
        null;

    if ((!power || Number.isNaN(Number(power))) && session.bookingId) {
      try {
        const key = `booking_${session.bookingId}_maxPowerKW`;
        const stored = sessionStorage.getItem(key);
        if (stored) power = JSON.parse(stored);
      } catch {
        // ignore
      }
    }

    const n = Number(power);
    return Number.isFinite(n) && n > 0 ? n : 11;
  }, [session]);

  /**
   * ✅ Tách thời gian CHUẨN:
   * Ưu tiên:
   * 1) backend: chargingMinutes + overstayMinutes
   * 2) suy ra từ tiền: overstayMinutes = round((cost - energyCost)/pricePerMin)
   * 3) fallback estimate theo pin/công suất
   *
   * BẢO ĐẢM: chargingMinutes + overstayMinutes = durationMinutes
   */
  const timeSplit = useMemo(() => {
    if (!session) return null;

    const durationMinutes = Math.max(0, Number(session.durationMinutes ?? 0));
    const initialSoc = session.initialSoc;
    const finalSoc = session.finalSoc;

    // ---- (1) BACKEND PROVIDED ----
    const backendCharging = session.chargingMinutes;
    const backendOverstay = session.overstayMinutes;

    if (
        backendCharging != null &&
        backendOverstay != null &&
        Number.isFinite(Number(backendCharging)) &&
        Number.isFinite(Number(backendOverstay))
    ) {
      const overstayMinutes = Math.max(0, Math.floor(Number(backendOverstay)));
      const chargingMinutes = Math.max(
          0,
          Math.floor(Math.min(durationMinutes, Number(backendCharging)))
      );

      // normalize sum
      const normalizedCharging = Math.max(0, durationMinutes - overstayMinutes);

      return {
        mode: "backend",
        durationMinutes,
        chargingMinutes: normalizedCharging,
        overstayMinutes,
      };
    }

    // nếu chưa đầy thì không có lãng phí
    if (finalSoc == null || Number(finalSoc) < 100) {
      return {
        mode: "no-full",
        durationMinutes,
        chargingMinutes: durationMinutes,
        overstayMinutes: 0,
      };
    }

    // ---- (2) INFER FROM MONEY (chuẩn nhất nếu có pricePerMin) ----
    // NOTE: muốn dùng cái này thì backend nên trả pricePerMin
    const pricePerKWh = Number(session.pricePerKWh ?? 0);
    const pricePerMin = Number(session.pricePerMin ?? 0); // <-- nếu chưa có, hãy add ở backend response
    const energyKWh = Number(session.energyKWh ?? 0);
    const totalCost = Number(session.cost ?? 0);

    if (
        pricePerMin > 0 &&
        Number.isFinite(totalCost) &&
        Number.isFinite(energyKWh) &&
        Number.isFinite(pricePerKWh)
    ) {
      const energyCost = energyKWh * pricePerKWh;
      const timeCost = Math.max(0, totalCost - energyCost);

      // làm tròn để ra phút (tránh dính round2 ở backend)
      const overstayMinutes = Math.max(0, Math.round(timeCost / pricePerMin));
      const chargingMinutes = Math.max(0, durationMinutes - overstayMinutes);

      return {
        mode: "money",
        durationMinutes,
        chargingMinutes,
        overstayMinutes,
        derived: {
          energyCost,
          timeCost,
          pricePerMin,
        },
      };
    }

    // ---- (3) FALLBACK ESTIMATE ----
    if (initialSoc == null) {
      return {
        mode: "estimate",
        durationMinutes,
        chargingMinutes: durationMinutes,
        overstayMinutes: 0,
        note: "missing initialSoc",
      };
    }

    const batteryCapacityKWh =
        Number(session.batteryCapacityKWh ?? session.batteryCapacity) ||
        getBatteryCapacityFromStorage();

    const minutesToFull = estimateMinutesToReachTargetSoc({
      initialSoc,
      targetSoc: 100,
      batteryCapacityKWh,
      ratedKW: inferredPowerKW,
      efficiency: CHARGING_EFFICIENCY,
    });

    const overstayMinutes = Math.max(0, durationMinutes - minutesToFull);
    const chargingMinutes = Math.max(0, durationMinutes - overstayMinutes);

    return {
      mode: "estimate",
      durationMinutes,
      chargingMinutes,
      overstayMinutes,
      minutesToFull,
      inferredPowerKW,
      batteryCapacityKWh,
    };
  }, [session, inferredPowerKW]);

  // Fetch payment methods
  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const response = await apiClient.get("/api/payment-methods");
        const data = response.data;
        let methods = Array.isArray(data) ? data : data.data || [];

        const totalCost = session?.cost || 0;
        if (totalCost < 10000) {
          methods = methods.filter(
              (m) => m.provider !== "VNPAY" && m.methodType !== "EWALLET"
          );
        }

        setPaymentMethods(methods);
      } catch (err) {
        console.error("❌ Lỗi khi tải phương thức thanh toán:", err);
        toast.error("Không thể tải phương thức thanh toán", {
          position: "top-center",
        });
      } finally {
        setLoadingMethods(false);
      }
    };

    // chỉ gọi khi có session
    if (session) fetchMethods();
  }, [session]);

  const handlePayment = async () => {
    if (!session) return;

    if (!selectedMethod) {
      toast.warning("Vui lòng chọn phương thức thanh toán", {
        position: "top-center",
      });
      return;
    }

    try {
      setPaymentProcessing(true);

      const method = paymentMethods.find((m) => m.methodId === selectedMethod);
      if (!method) {
        toast.error("Không tìm thấy phương thức thanh toán!", {
          position: "top-center",
        });
        return;
      }

      const response = await apiClient.post(
          `/api/payment/vnpay/create?sessionId=${session.sessionId}&paymentMethodId=${selectedMethod}`
      );

      if (method.provider === "VNPAY" || method.methodType === "EWALLET") {
        if (response.data?.paymentUrl) {
          sessionStorage.setItem(
              "pendingPayment",
              JSON.stringify({
                amount: session.cost || 0,
                currency: session.currency || "VND",
                orderInfo: `Thanh toán phiên sạc #${session.sessionId}`,
                stationName: session.stationName,
                vehiclePlate: session.vehiclePlate,
                energyKWh: session.energyKWh,
                durationMinutes: session.durationMinutes,
                chargingMinutes: timeSplit?.chargingMinutes ?? null,
                overstayMinutes: timeSplit?.overstayMinutes ?? null,
                pricePerKWh: session.pricePerKWh,
                pricePerMin: session.pricePerMin ?? null,
              })
          );
          window.location.href = response.data.paymentUrl;
          return;
        }
        toast.error("Không nhận được liên kết thanh toán từ server!", {
          position: "top-center",
        });
        return;
      }

      if (method.methodType === "CASH" || method.provider === "EVM") {
        if (response.data?.message) {
          toast.success("Thanh toán thành công! Hóa đơn đã được lưu.", {
            position: "top-center",
            autoClose: 2000,
          });
          setTimeout(() => {
            setPaymentCompleted(true);
            navigate("/");
          }, 2000);
          return;
        }
        toast.error("Thanh toán thất bại!", { position: "top-center" });
        return;
      }

      toast.warning("Phương thức thanh toán chưa được hỗ trợ!", {
        position: "top-center",
      });
    } catch (error) {
      console.error("❌ Lỗi khi gọi API thanh toán:", error);

      let errorMessage = "Thanh toán thất bại";
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 409) errorMessage = "Hóa đơn đã được thanh toán rồi!";
        else if (status === 404)
          errorMessage = "Không tìm thấy thông tin phiên sạc hoặc hóa đơn!";
        else if (data?.message) errorMessage = data.message;
      } else if (error.request) {
        errorMessage = "Không thể kết nối đến server!";
      }

      toast.error(errorMessage, { position: "top-center" });
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (!session) return null;

  const currency = session.currency ?? "VND";

  // (optional) hiển thị phí thời gian nếu suy ra được
  const timeFeeView =
      timeSplit?.mode === "money" && timeSplit?.derived?.timeCost > 0
          ? Math.round(timeSplit.derived.timeCost)
          : null;

  return (
      <div className="payment-container">
        <h1
            className="payment-header"
            style={{
              textAlign: "center",
              fontSize: "32px",
              fontWeight: "700",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "30px",
            }}
        >
          💳 Thanh toán phiên sạc
        </h1>

        <div
            className="payment-card"
            style={{
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
              padding: "30px",
              maxWidth: "800px",
              margin: "0 auto",
            }}
        >
          <div
              className="payment-status"
              style={{
                textAlign: "center",
                padding: "30px",
                background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
                borderRadius: "12px",
                marginBottom: "30px",
              }}
          >
            <div className="status-icon" style={{ fontSize: "64px", marginBottom: "15px" }}>
              ✅
            </div>
            <h2 style={{ color: "#2e7d32", fontSize: "28px", fontWeight: "700", marginBottom: "10px" }}>
              Phiên sạc hoàn thành!
            </h2>
            <p className="status-text" style={{ color: "#558b2f", fontSize: "16px" }}>
              Vui lòng thanh toán để hoàn tất giao dịch
            </p>
          </div>

          <div className="payment-section">
            <h3 className="section-title">🚗 Thông tin xe</h3>
            <div className="info-row">
              <span className="info-label">Biển số xe:</span>
              <span className="info-value">{session.vehiclePlate ?? "-"}</span>
            </div>
          </div>

          <div className="payment-section">
            <h3 className="section-title">🏢 Thông tin trạm</h3>
            <div className="info-row">
              <span className="info-label">Trạm sạc:</span>
              <span className="info-value">{session.stationName ?? "-"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Trụ sạc:</span>
              <span className="info-value">{session.pointNumber ?? "-"}</span>
            </div>
          </div>

          <div className="payment-section">
            <h3 className="section-title">⏰ Thời gian</h3>
            <div className="info-row">
              <span className="info-label">Bắt đầu:</span>
              <span className="info-value">
              {session.startTime ? new Date(session.startTime).toLocaleString("vi-VN") : "-"}
            </span>
            </div>
            <div className="info-row">
              <span className="info-label">Kết thúc:</span>
              <span className="info-value">
              {session.endTime || session.actualEndTime
                  ? new Date(session.endTime || session.actualEndTime).toLocaleString("vi-VN")
                  : "-"}
            </span>
            </div>

            <div className="info-row">
              <span className="info-label">Tổng thời lượng:</span>
              <span className="info-value highlight">{session.durationMinutes ?? 0} phút</span>
            </div>

            {timeSplit && (
                <>
                  <div className="info-row">
                    <span className="info-label">Thời gian sạc đầy:</span>
                    <span className="info-value" style={{ fontWeight: 800, color: "#2c3e50" }}>
                  {timeSplit.chargingMinutes} phút
                      {timeSplit.mode === "estimate" && (
                          <span style={{ marginLeft: 8, opacity: 0.7, fontWeight: 500 }}>(ước tính)</span>
                      )}
                </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Thời gian lãng phí:</span>
                    <span
                        className="info-value"
                        style={{
                          fontWeight: 900,
                          color: timeSplit.overstayMinutes > 0 ? "#e67e22" : "#2c3e50",
                        }}
                    >
                  {timeSplit.overstayMinutes} phút
                </span>
                  </div>

                  {timeSplit.overstayMinutes > 0 && (
                      <div
                          style={{
                            marginTop: 10,
                            padding: "12px 14px",
                            borderRadius: 10,
                            background: "rgba(255, 152, 0, 0.12)",
                            border: "1px solid rgba(255, 152, 0, 0.35)",
                            color: "#b26a00",
                            fontWeight: 700,
                          }}
                      >
                        ⚠️ Xe đã cắm sạc sau khi pin đầy. Phần thời gian này có thể bị tính <b>phí thời gian</b>.
                      </div>
                  )}
                </>
            )}
          </div>

          <div className="payment-section">
            <h3 className="section-title">⚡ Năng lượng & SOC</h3>
            <div className="info-row">
              <span className="info-label">Năng lượng đã sạc:</span>
              <span className="info-value highlight-green">
              {(Number(session.energyKWh ?? 0)).toFixed(2)} kWh
            </span>
            </div>
            {session.initialSoc != null && (
                <div className="info-row">
                  <span className="info-label">SOC ban đầu:</span>
                  <span className="info-value">{session.initialSoc}%</span>
                </div>
            )}
            {session.finalSoc != null && (
                <div className="info-row">
                  <span className="info-label">SOC cuối:</span>
                  <span className="info-value">{session.finalSoc}%</span>
                </div>
            )}
          </div>

          <div className="payment-section payment-summary">
            <h3 className="section-title">💰 Chi tiết thanh toán</h3>

            {session.pricePerKWh != null && session.pricePerKWh > 0 && (
                <div className="info-row">
                  <span className="info-label">💵 Đơn giá điện năng:</span>
                  <span className="info-value" style={{ fontWeight: "600", color: "#667eea" }}>
                {Number(session.pricePerKWh).toLocaleString("vi-VN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                    {currency}/kWh
              </span>
                </div>
            )}

            {/* (optional) nếu backend có pricePerMin thì show */}
            {session.pricePerMin != null && Number(session.pricePerMin) > 0 && (
                <div className="info-row">
                  <span className="info-label">⏱️ Đơn giá thời gian:</span>
                  <span className="info-value" style={{ fontWeight: 700, color: "#e67e22" }}>
                {Number(session.pricePerMin).toLocaleString("vi-VN")} {currency}/phút
              </span>
                </div>
            )}

            <div className="info-row">
              <span className="info-label">⚡ Năng lượng tiêu thụ:</span>
              <span className="info-value" style={{ fontWeight: "600", color: "#27ae60" }}>
              {(Number(session.energyKWh ?? 0)).toFixed(2)} kWh
            </span>
            </div>

            <div className="info-row">
              <span className="info-label">⏱️ Tổng thời gian:</span>
              <span className="info-value">{session.durationMinutes ?? 0} phút</span>
            </div>

            {timeSplit && timeSplit.overstayMinutes > 0 && (
                <div className="info-row">
                  <span className="info-label">⚠️ Thời gian lãng phí:</span>
                  <span className="info-value" style={{ fontWeight: 800, color: "#e67e22" }}>
                {timeSplit.overstayMinutes} phút
              </span>
                </div>
            )}

            {/* optional show time fee derived */}
            {timeFeeView != null && timeFeeView > 0 && (
                <div className="info-row">
                  <span className="info-label">⚠️ Phí thời gian lãng phí:</span>
                  <span className="info-value" style={{ fontWeight: 900, color: "#e67e22" }}>
                {fmtMoney(timeFeeView, currency)}
              </span>
                </div>
            )}

            <div style={{ borderTop: "2px dashed #e0e0e0", margin: "15px 0" }} />

            <div
                className="total-row"
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  padding: "15px 20px",
                  borderRadius: "10px",
                  marginTop: "10px",
                }}
            >
            <span style={{ color: "white", fontSize: "18px", fontWeight: "700" }}>
              💳 Tổng thanh toán:
            </span>
              <span style={{ color: "white", fontSize: "24px", fontWeight: "800" }}>
              {fmtMoney(session.cost ?? 0, currency)}
            </span>
            </div>
          </div>

          {!paymentCompleted && (
              <div
                  className="payment-section"
                  style={{
                    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                    padding: "25px",
                    borderRadius: "12px",
                    marginTop: "20px",
                  }}
              >
                <h3
                    className="section-title"
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      marginBottom: "20px",
                      color: "#2c3e50",
                    }}
                >
                  💳 Chọn phương thức thanh toán
                </h3>

                {loadingMethods ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                      <div style={{ fontSize: "48px", marginBottom: "15px" }}>⏳</div>
                      <p>Đang tải phương thức thanh toán...</p>
                    </div>
                ) : paymentMethods.length === 0 ? (
                    <div
                        style={{
                          textAlign: "center",
                          padding: "40px",
                          color: "#f44336",
                          background: "white",
                          borderRadius: "8px",
                        }}
                    >
                      <div style={{ fontSize: "48px", marginBottom: "15px" }}>⚠️</div>
                      <p>Không có phương thức thanh toán khả dụng</p>
                    </div>
                ) : (
                    <div className="method-list" style={{ display: "grid", gap: "12px" }}>
                      {paymentMethods.map((method) => (
                          <button
                              key={method.methodId}
                              className={`method-btn ${selectedMethod === method.methodId ? "selected" : ""}`}
                              onClick={() => setSelectedMethod(method.methodId)}
                              disabled={paymentProcessing}
                              style={{
                                padding: "18px 24px",
                                border: selectedMethod === method.methodId ? "3px solid #667eea" : "2px solid #ddd",
                                borderRadius: "10px",
                                background:
                                    selectedMethod === method.methodId
                                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                        : "white",
                                color: selectedMethod === method.methodId ? "white" : "#333",
                                cursor: paymentProcessing ? "not-allowed" : "pointer",
                                transition: "all 0.3s ease",
                                textAlign: "left",
                                fontWeight: "600",
                                boxShadow:
                                    selectedMethod === method.methodId
                                        ? "0 8px 20px rgba(102, 126, 234, 0.4)"
                                        : "0 2px 8px rgba(0,0,0,0.1)",
                              }}
                          >
                            <div style={{ fontSize: "16px", marginBottom: "5px" }}>
                              {method.provider === "VNPAY" ? "💳" : "💵"} {method.provider} ({method.methodType})
                            </div>
                            {method.accountNo && (
                                <div style={{ fontSize: "13px", opacity: 0.9 }}>
                                  📋 Tài khoản: {method.accountNo}
                                </div>
                            )}
                          </button>
                      ))}
                    </div>
                )}
              </div>
          )}

          <div className="payment-actions">
            {!paymentCompleted ? (
                <button
                    className="btn-payment"
                    onClick={handlePayment}
                    disabled={paymentProcessing || !selectedMethod}
                >
                  {paymentProcessing ? "Đang xử lý..." : "💳 Thanh toán ngay"}
                </button>
            ) : (
                <button className="btn-payment" onClick={() => navigate("/")}>
                  ✅ Về trang chủ
                </button>
            )}
          </div>
        </div>
      </div>
  );
}
