import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../../api/apiUrls.js";
import {
  Receipt, MapPin, Clock, Zap, Battery, CreditCard,
  Wallet, Landmark, CircleCheck, AlertTriangle, Gift, Check, Home
} from "lucide-react";
import Header from "../../components/admin/Header.jsx";
import "../admin/Dashboard.css";
import "./Payment.css";

const CHARGING_EFFICIENCY = 0.9;

const getBatteryCapacityFromStorage = () => {
  const capacity = sessionStorage.getItem("batteryCapacityKWh");
  const n = Number(capacity);
  return Number.isFinite(n) && n > 0 ? n : 60;
};

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

  const rawSession = location?.state?.sessionResult ?? null;

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

  // ====== DISCOUNT / LOYALTY ======
  const [usePoints, setUsePoints] = useState(false);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountPreview, setDiscountPreview] = useState(null);
  const [pointsAvailable, setPointsAvailable] = useState(null);

  const invoiceId = useMemo(() => {
    if (!session) return null;
    const candidate =
        session.invoiceId ??
        session?.invoice?.invoiceId ??
        session?.invoice?.id ??
        location?.state?.invoiceId ??
        null;

    const n = Number(candidate);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [session, location?.state?.invoiceId]);

  useEffect(() => {
    if (!session) {
      toast.error("Không có thông tin thanh toán", { position: "top-center" });
      navigate(-1);
    }
  }, [session, navigate]);

  useEffect(() => {
    if (!session) return;
    const c = Number(session.cost);
    if (!Number.isFinite(c) || c <= 0) {
      console.warn("[PAYMENT] session.cost invalid:", session.cost, session);
    }
    if (!invoiceId) {
      console.warn("[PAYMENT] invoiceId missing:", session);
    }
  }, [session, invoiceId]);

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

  const timeSplit = useMemo(() => {
    if (!session) return null;

    const durationMinutes = Math.max(0, Number(session.durationMinutes ?? 0));
    const initialSoc = session.initialSoc;
    const finalSoc = session.finalSoc;

    const backendCharging = session.chargingMinutes;
    const backendOverstay = session.overstayMinutes;

    if (
        backendCharging != null &&
        backendOverstay != null &&
        Number.isFinite(Number(backendCharging)) &&
        Number.isFinite(Number(backendOverstay))
    ) {
      const overstayMinutes = Math.max(0, Math.floor(Number(backendOverstay)));
      const normalizedCharging = Math.max(0, durationMinutes - overstayMinutes);

      return {
        mode: "backend",
        durationMinutes,
        chargingMinutes: normalizedCharging,
        overstayMinutes,
      };
    }

    if (finalSoc == null || Number(finalSoc) < 100) {
      return {
        mode: "no-full",
        durationMinutes,
        chargingMinutes: durationMinutes,
        overstayMinutes: 0,
      };
    }

    const pricePerKWh = Number(session.pricePerKWh ?? 0);
    const pricePerMin = Number(session.pricePerMin ?? 0);
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

      const overstayMinutes = Math.max(0, Math.round(timeCost / pricePerMin));
      const chargingMinutes = Math.max(0, durationMinutes - overstayMinutes);

      return {
        mode: "money",
        durationMinutes,
        chargingMinutes,
        overstayMinutes,
        derived: { energyCost, timeCost, pricePerMin },
      };
    }

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

  const DISCOUNT_BASE = "/api/invoice";

  const discountApi = {
    preview: (invId, usePts) =>
        apiClient.post(`${DISCOUNT_BASE}/${invId}/preview-discount`, null, {
          params: { usePoints: usePts },
        }),
    apply: (invId, usePts) =>
        apiClient.post(`${DISCOUNT_BASE}/${invId}/apply-discount`, null, {
          params: { usePoints: usePts },
        }),
    availableByInvoice: (invId) =>
        apiClient.get(`/api/loyalty/available-by-invoice`, {
          params: { invoiceId: invId },
        }),
  };

  // ✅ fetchPreview trả về payload để handlePayment dùng ngay
  const fetchPreview = useCallback(async (invId, usePts) => {
    if (!invId) return null;
    try {
      setDiscountLoading(true);
      const res = await discountApi.preview(invId, usePts);
      const payload = res?.data?.data ?? res?.data ?? null;

      const base = Number(payload?.baseAmount);
      const final = Number(payload?.finalAmount);

      if (
          payload &&
          payload.invoiceId &&
          Number.isFinite(base) &&
          Number.isFinite(final) &&
          base >= 0 &&
          final >= 0
      ) {
        setDiscountPreview(payload);
        if (payload.pointsAvailable != null) {
          setPointsAvailable(Number(payload.pointsAvailable));
        }
        return payload;
      }

      setDiscountPreview(null);
      return null;
    } catch (e) {
      console.debug("preview-discount failed:", e);
      setDiscountPreview(null);
      return null;
    } finally {
      setDiscountLoading(false);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!invoiceId) {
        setPointsAvailable(null);
        setDiscountPreview(null);
        return;
      }

      try {
        const pRes = await discountApi.availableByInvoice(invoiceId);
        const p = pRes?.data?.pointsAvailable;
        if (p != null && Number.isFinite(Number(p))) setPointsAvailable(Number(p));
        else setPointsAvailable(0);
      } catch (e) {
        console.debug("available-by-invoice failed:", e);
        setPointsAvailable(null);
      }

      await fetchPreview(invoiceId, usePoints);
    };

    if (session) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, invoiceId]);

  useEffect(() => {
    if (!invoiceId) return;
    fetchPreview(invoiceId, usePoints);
  }, [usePoints, invoiceId, fetchPreview]);

  const payableAmount = useMemo(() => {
    const v = discountPreview?.finalAmount;
    const n = Number(v);
    if (Number.isFinite(n) && n >= 0) return n;
    return Number(session?.cost ?? 0);
  }, [discountPreview?.finalAmount, session]);

  const baseAmount = useMemo(() => {
    const v = discountPreview?.baseAmount;
    const n = Number(v);
    if (Number.isFinite(n) && n >= 0) return n;
    return Number(session?.cost ?? 0);
  }, [discountPreview?.baseAmount, session]);

  const discountAmount = useMemo(() => {
    const v = discountPreview?.discountAmount ?? 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }, [discountPreview?.discountAmount]);

  // Fetch payment methods
  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const response = await apiClient.get("/api/payment-methods");
        const data = response.data;
        let methods = Array.isArray(data) ? data : data.data || [];

        const totalCost = Number(payableAmount ?? session?.cost ?? 0);
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

    if (session) fetchMethods();
  }, [session, payableAmount]);

  // ✅ handlePayment (fixed VNPay create)
  const handlePayment = async () => {
    if (!session) return;

    if (!selectedMethod) {
      toast.warning("Vui lòng chọn phương thức thanh toán", { position: "top-center" });
      return;
    }

    if (!invoiceId) {
      toast.error("Thiếu invoiceId nên không thể thanh toán/áp giảm giá.", { position: "top-center" });
      return;
    }

    try {
      setPaymentProcessing(true);

      const method = paymentMethods.find((m) => m.methodId === selectedMethod);
      if (!method) {
        toast.error("Không tìm thấy phương thức thanh toán!", { position: "top-center" });
        return;
      }

      // ✅ 1) apply discount trước
      let latest = discountPreview;
      try {
        await discountApi.apply(invoiceId, usePoints);
        latest = await fetchPreview(invoiceId, usePoints);
        if (!latest) latest = discountPreview;
      } catch (e) {
        console.debug("apply-discount failed:", e);
        toast.warning("Không áp dụng được giảm giá (sẽ thanh toán theo giá gốc).", {
          position: "top-center",
        });
      }

      const latestPayable =
          Number(latest?.finalAmount) >= 0 && Number.isFinite(Number(latest?.finalAmount))
              ? Number(latest.finalAmount)
              : Number(session?.cost ?? 0);

      const latestBase =
          Number(latest?.baseAmount) >= 0 && Number.isFinite(Number(latest?.baseAmount))
              ? Number(latest.baseAmount)
              : Number(session?.cost ?? 0);

      const latestDiscount =
          Number.isFinite(Number(latest?.discountAmount)) ? Number(latest.discountAmount) : 0;

      // ✅ Debug: confirm usePoints actually true/false
      console.log("[PAYMENT] invoiceId=", invoiceId, "usePoints=", usePoints);

      // ✅ 2) Save pendingPayment
      sessionStorage.setItem(
          "pendingPayment",
          JSON.stringify({
            amount: latestPayable,
            baseAmount: latestBase,
            discountAmount: latestDiscount,
            usePoints,
            pointsAvailable: pointsAvailable ?? latest?.pointsAvailable ?? null,
            discountRatePct: latest?.discountRatePct ?? 0,

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
            invoiceId,
          })
      );

      // CASH/EVM => pay invoice directly
      if (method.methodType === "CASH" || method.provider === "EVM") {
        await apiClient.post(`/api/invoice/pay/${invoiceId}`, null, {
          params: { usePoints },
        });

        toast.success("Thanh toán thành công! Hóa đơn đã được lưu.", {
          position: "top-center",
          autoClose: 1500,
        });

        setTimeout(() => {
          setPaymentCompleted(true);
          navigate("/");
        }, 1500);

        return;
      }

      // ✅ VNPay/EWALLET => MUST pass usePoints
      if (method.provider === "VNPAY" || method.methodType === "EWALLET") {
        console.log("[PAYMENT] Creating VNPay with params:", {
          sessionId: session.sessionId,
          paymentMethodId: selectedMethod,
          usePoints,
        });

        const response = await apiClient.post(`/api/payment/vnpay/create`, null, {
          params: {
            sessionId: session.sessionId,
            paymentMethodId: selectedMethod,
            usePoints, // ✅ FIX: this was missing
          },
        });

        if (response.data?.paymentUrl) {
          window.location.href = response.data.paymentUrl;
          return;
        }

        toast.error("Không nhận được liên kết thanh toán từ server!", {
          position: "top-center",
        });
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
        else if (status === 404) errorMessage = "Không tìm thấy thông tin hóa đơn!";
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

  const timeFeeView =
      timeSplit?.mode === "money" && timeSplit?.derived?.timeCost > 0
          ? Math.round(timeSplit.derived.timeCost)
          : null;

  const canUsePointsUI = Boolean(invoiceId) && !paymentProcessing;

  return (
      <div className="dashboard-container">
        <Header />
        <div className="pay-page">
          {/* ── HERO ── */}
          <div className="pay-hero">
            <div className="pay-hero-content">
              <div className="pay-hero-icon"><CircleCheck size={44} color="#fff" /></div>
              <h1 className="pay-hero-title">Phiên sạc hoàn thành!</h1>
              <p className="pay-hero-sub">Vui lòng thanh toán để hoàn tất giao dịch</p>
            </div>
          </div>

          {/* ── TOTAL AMOUNT ── */}
          <div className="pay-total-card">
            <div className="pay-total-label">Tổng thanh toán</div>
            <div className="pay-total-amount">
              {Number(payableAmount ?? 0).toLocaleString("vi-VN")}
              <span className="pay-total-currency">{currency}</span>
            </div>
            {discountAmount > 0 && (
              <div className="pay-total-base">
                <s>{fmtMoney(baseAmount, currency)}</s>
                <span className="pay-total-discount-tag">- {fmtMoney(discountAmount, currency)}</span>
              </div>
            )}
          </div>

          {/* ── INVOICE DETAILS ── */}
          <div className="pay-card">
            <div className="pay-card-header">
              <div className="pay-card-header-icon pay-icon-green"><Receipt size={18} /></div>
              <h3 className="pay-card-title">Chi tiết hóa đơn</h3>
            </div>
            <div className="pay-card-body">
              <div className="pay-row">
                <span className="pay-row-label"><MapPin size={14} /> Trạm sạc</span>
                <span className="pay-row-value">{session.stationName ?? "—"}</span>
              </div>
              <div className="pay-row">
                <span className="pay-row-label"><Zap size={14} /> Trụ sạc</span>
                <span className="pay-row-value">{session.pointNumber ?? "—"}</span>
              </div>
              <div className="pay-row">
                <span className="pay-row-label">🚗 Biển số xe</span>
                <span className="pay-row-value">{session.vehiclePlate ?? "—"}</span>
              </div>
              <div className="pay-row">
                <span className="pay-row-label"><Clock size={14} /> Bắt đầu</span>
                <span className="pay-row-value">
                  {session.startTime ? new Date(session.startTime).toLocaleString("vi-VN") : "—"}
                </span>
              </div>
              <div className="pay-row">
                <span className="pay-row-label"><Clock size={14} /> Kết thúc</span>
                <span className="pay-row-value">
                  {(session.endTime || session.actualEndTime)
                    ? new Date(session.endTime || session.actualEndTime).toLocaleString("vi-VN")
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* ── TIME & ENERGY ── */}
          <div className="pay-card">
            <div className="pay-card-header">
              <div className="pay-card-header-icon pay-icon-blue"><Clock size={18} /></div>
              <h3 className="pay-card-title">Thời gian & Năng lượng</h3>
            </div>
            <div className="pay-card-body">
              <div className="pay-row">
                <span className="pay-row-label"><Clock size={14} /> Tổng thời lượng</span>
                <span className="pay-row-value blue">{session.durationMinutes ?? 0} phút</span>
              </div>

              {timeSplit && (
                <>
                  <div className="pay-row">
                    <span className="pay-row-label"><Battery size={14} /> Thời gian sạc</span>
                    <span className="pay-row-value green">
                      {timeSplit.chargingMinutes} phút
                      {timeSplit.mode === "estimate" && <span style={{ opacity: 0.6, fontWeight: 400, marginLeft: 4 }}>(ước tính)</span>}
                    </span>
                  </div>
                  {timeSplit.overstayMinutes > 0 && (
                    <>
                      <div className="pay-row">
                        <span className="pay-row-label"><AlertTriangle size={14} /> Thời gian lãng phí</span>
                        <span className="pay-row-value orange">{timeSplit.overstayMinutes} phút</span>
                      </div>
                      <div className="pay-overstay-banner">
                        <AlertTriangle size={16} />
                        <span>Xe đã cắm sạc sau khi pin đầy. Phần thời gian này có thể tính <b>phí thời gian</b>.</span>
                      </div>
                    </>
                  )}
                </>
              )}

              <div className="pay-row">
                <span className="pay-row-label"><Zap size={14} /> Năng lượng đã sạc</span>
                <span className="pay-row-value green">{Number(session.energyKWh ?? 0).toFixed(2)} kWh</span>
              </div>
              {session.initialSoc != null && (
                <div className="pay-row">
                  <span className="pay-row-label"><Battery size={14} /> SOC ban đầu</span>
                  <span className="pay-row-value">{session.initialSoc}%</span>
                </div>
              )}
              {session.finalSoc != null && (
                <div className="pay-row">
                  <span className="pay-row-label"><Battery size={14} /> SOC cuối</span>
                  <span className="pay-row-value green">{session.finalSoc}%</span>
                </div>
              )}
            </div>
          </div>

          {/* ── PRICING ── */}
          <div className="pay-card">
            <div className="pay-card-header">
              <div className="pay-card-header-icon pay-icon-orange"><CreditCard size={18} /></div>
              <h3 className="pay-card-title">Bảng giá áp dụng</h3>
            </div>
            <div className="pay-card-body">
              {session.pricePerKWh != null && session.pricePerKWh > 0 && (
                <div className="pay-row">
                  <span className="pay-row-label"><Zap size={14} /> Đơn giá điện năng</span>
                  <span className="pay-row-value green">
                    {Number(session.pricePerKWh).toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}/kWh
                  </span>
                </div>
              )}
              {session.pricePerMin != null && Number(session.pricePerMin) > 0 && (
                <div className="pay-row">
                  <span className="pay-row-label"><Clock size={14} /> Đơn giá thời gian</span>
                  <span className="pay-row-value orange">{Number(session.pricePerMin).toLocaleString("vi-VN")} {currency}/phút</span>
                </div>
              )}
              {timeFeeView != null && timeFeeView > 0 && (
                <div className="pay-row">
                  <span className="pay-row-label"><AlertTriangle size={14} /> Phí thời gian lãng phí</span>
                  <span className="pay-row-value orange">{fmtMoney(timeFeeView, currency)}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── LOYALTY / DISCOUNT ── */}
          <div className="pay-card">
            <div className="pay-card-header">
              <div className="pay-card-header-icon pay-icon-purple"><Gift size={18} /></div>
              <h3 className="pay-card-title">Giảm giá & Điểm thưởng</h3>
            </div>
            <div className="pay-card-body">
              {!invoiceId ? (
                <div className="pay-row">
                  <span className="pay-row-label">Không tìm thấy hóa đơn để áp dụng giảm giá</span>
                </div>
              ) : (
                <div className="pay-loyalty-box">
                  <div className="pay-loyalty-top">
                    <div className="pay-loyalty-info">
                      <div className="pay-loyalty-title">Dùng điểm để giảm giá</div>
                      <div className="pay-loyalty-points">
                        Điểm hiện có: <b>{pointsAvailable == null ? "—" : pointsAvailable}</b> • 1 điểm = 1%
                      </div>
                    </div>
                    <label className="pay-loyalty-toggle">
                      <input
                        type="checkbox"
                        checked={usePoints}
                        disabled={!canUsePointsUI || discountLoading}
                        onChange={(e) => setUsePoints(e.target.checked)}
                      />
                      <span className="pay-loyalty-slider" />
                    </label>
                  </div>

                  {discountPreview && (
                    <div className="pay-loyalty-detail">
                      <div className="pay-row">
                        <span className="pay-row-label">Giá trước giảm</span>
                        <span className="pay-row-value">{fmtMoney(discountPreview.baseAmount, currency)}</span>
                      </div>
                      <div className="pay-row">
                        <span className="pay-row-label">Tỉ lệ giảm</span>
                        <span className="pay-row-value green">{discountPreview.discountRatePct ?? 0}%</span>
                      </div>
                      <div className="pay-row">
                        <span className="pay-row-label">Tiết kiệm</span>
                        <span className="pay-row-value green">- {fmtMoney(discountPreview.discountAmount ?? 0, currency)}</span>
                      </div>
                      <div className="pay-row">
                        <span className="pay-row-label">Điểm sẽ dùng</span>
                        <span className="pay-row-value">{discountPreview.pointsWillUse ?? 0}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── PAYMENT METHODS ── */}
          {!paymentCompleted && (
            <div className="pay-card">
              <div className="pay-card-header">
                <div className="pay-card-header-icon pay-icon-amber"><Wallet size={18} /></div>
                <h3 className="pay-card-title">Phương thức thanh toán</h3>
              </div>
              <div className="pay-card-body">
                {loadingMethods ? (
                  <div className="pay-loading">
                    <div className="pay-spinner" />
                    <span className="pay-loading-text">Đang tải phương thức...</span>
                  </div>
                ) : paymentMethods.length === 0 ? (
                  <div className="pay-empty-methods">
                    <div className="pay-empty-methods-icon"><AlertTriangle size={24} /></div>
                    <span className="pay-empty-methods-text">Không có phương thức thanh toán khả dụng</span>
                  </div>
                ) : (
                  <div className="pay-methods-grid">
                    {paymentMethods.map((method) => {
                      const isActive = selectedMethod === method.methodId;
                      const icon = method.provider === "VNPAY"
                        ? <Wallet size={20} />
                        : method.methodType === "CASH"
                          ? <Landmark size={20} />
                          : <CreditCard size={20} />;

                      return (
                        <button
                          key={method.methodId}
                          className={`pay-method-card${isActive ? " active" : ""}`}
                          onClick={() => setSelectedMethod(method.methodId)}
                          disabled={paymentProcessing}
                        >
                          <div className="pay-method-icon">{icon}</div>
                          <div className="pay-method-info">
                            <div className="pay-method-name">{method.provider} ({method.methodType})</div>
                            {method.accountNo && (
                              <div className="pay-method-desc">Tài khoản: {method.accountNo}</div>
                            )}
                          </div>
                          <div className="pay-method-check">
                            {isActive && <Check size={14} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── CTA ── */}
          {!paymentCompleted ? (
            <button
              className="pay-cta"
              onClick={handlePayment}
              disabled={paymentProcessing || !selectedMethod || discountLoading}
            >
              {paymentProcessing ? (
                <>
                  <span className="pay-cta-spinner" />
                  Đang xử lý...
                </>
              ) : discountLoading ? (
                "Đang tính giảm giá..."
              ) : (
                <>
                  <CreditCard size={20} />
                  Xác nhận thanh toán • {fmtMoney(payableAmount, currency)}
                </>
              )}
            </button>
          ) : (
            <button className="pay-cta pay-cta-secondary" onClick={() => navigate("/")}>
              <Home size={20} />
              Về trang chủ
            </button>
          )}
        </div>
      </div>
  );
}
