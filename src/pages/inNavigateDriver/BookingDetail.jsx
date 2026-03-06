import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import paths from "../../path/paths.jsx";
import Header from "../../components/admin/Header.jsx";
import "../admin/Dashboard.css";
import "./BookingDetail.css";
import { toast } from "react-toastify";
import { stationAPI } from "../../api/stationApi.js";
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, Loader,
  CalendarCheck, Car, MapPin, Zap, PlugZap, Hash, Tag
} from "lucide-react";
import { showConfirm } from '../../utils/alertUtils.js';

export default function BookingDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // bookingId may come from URL param or navigation state
  const bookingIdFromParam = params?.bookingId;
  const bookingState = location?.state?.booking;
  const bookingIdState = location?.state?.bookingId;

  const bookingId = bookingIdFromParam ?? bookingIdState;

  const [booking, setBooking] = useState(bookingState || null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!booking && bookingId) {
      // fetch booking detail
      (async () => {
        try {
          setLoading(true);
          const res = await stationAPI.getBookingById(bookingId);
          if (!res || res.success === false) {
            console.error("❌ getBookingById failed:", res);
            toast.error(res?.message || "Không thể lấy thông tin booking", {
              position: "top-center",
            });
            navigate(-1);
            return;
          }
          const data = res.data ?? res;
          setBooking(data);
        } catch (err) {
          console.error("❌ Lỗi khi lấy booking:", err);
          toast.error("Không thể lấy thông tin booking", {
            position: "top-center",
          });
          navigate(-1);
        } finally {
          setLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  /* ── Confirm handler ──────────────────────────────── */
  const handleConfirm = async () => {
    if (!bookingId) {
      toast.error("Không có bookingId để xác nhận", { position: "top-center" });
      return;
    }

    try {
      setConfirming(true);
      const res = await stationAPI.confirmBooking(bookingId);

      if (!res || res.success === false) {
        console.error("❌ confirmBooking failed:", res);
        toast.error(res?.message || "Xác nhận thất bại", {
          position: "top-center",
        });
        return;
      }

      // res.data is binary ArrayBuffer (PNG). Create blob URL and data URL
      const arrayBuffer = res.data;
      const blob = new Blob([arrayBuffer], { type: "image/png" });
      const blobUrl = URL.createObjectURL(blob);

      const toDataURL = (blob) =>
        new Promise((resolve, reject) => {
          try {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          } catch (e) {
            reject(e);
          }
        });

      let dataUrl = null;
      try {
        dataUrl = await toDataURL(blob);
        if (dataUrl && bookingId) {
          try {
            sessionStorage.setItem(`qr_booking_${bookingId}`, dataUrl);
          } catch (e) {
            console.warn("Could not persist QR to sessionStorage", e);
          }
        }
      } catch (err) {
        console.warn("Could not convert QR blob to data URL:", err);
      }

      setBooking((prev) => ({ ...(prev || {}), status: "confirmed" }));

      navigate(paths.chargingSession, {
        state: { booking: booking || {}, qrBlobUrl: blobUrl },
      });
    } catch (err) {
      console.error("❌ Lỗi khi xác nhận booking:", err);
      toast.error("Xác nhận thất bại", { position: "top-center" });
    } finally {
      setConfirming(false);
    }
  };

  /* ── Cancel handler ───────────────────────────────── */
  const handleCancel = async () => {
    if (!bookingId) {
      toast.error("Không có bookingId để hủy", { position: "top-center" });
      return;
    }

    if (!(await showConfirm("Bạn có chắc chắn muốn hủy booking này không?", 'Xác nhận hủy booking'))) {
      return;
    }

    try {
      setCancelling(true);
      const res = await stationAPI.cancelBooking(bookingId);

      if (!res || res.success === false) {
        console.error("❌ cancelBooking failed:", res);
        toast.error(res?.message || "Hủy booking thất bại", {
          position: "top-center",
        });
        return;
      }

      setBooking((prev) => ({ ...(prev || {}), status: "cancelled" }));
      toast.success("Hủy booking thành công!", { position: "top-center" });

      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (err) {
      console.error("❌ Lỗi khi hủy booking:", err);
      toast.error("Hủy booking thất bại", { position: "top-center" });
    } finally {
      setCancelling(false);
    }
  };

  /* ── Helper: status badge ─────────────────────────── */
  const statusBadge = (status) => {
    const s = (status || "").toLowerCase();
    let cls = "bd-status--default";
    let icon = <Clock size={14} />;
    let text = status || "Không rõ";

    if (s === "pending" || s === "created") {
      cls = "bd-status--pending";
      icon = <Clock size={14} />;
      text = "Chờ xác nhận";
    } else if (s === "confirmed") {
      cls = "bd-status--confirmed";
      icon = <CheckCircle2 size={14} />;
      text = "Đã xác nhận";
    } else if (s === "cancelled" || s === "canceled") {
      cls = "bd-status--cancelled";
      icon = <XCircle size={14} />;
      text = "Đã hủy";
    }

    return <span className={`bd-status ${cls}`}>{icon} {text}</span>;
  };

  /* ── Fallback: no booking ─────────────────────────── */
  if (!booking && !bookingId) {
    return (
      <div className="dashboard-container">
        <Header />
        <div className="bd-empty">
          <p>Không có thông tin booking. Vui lòng quay lại.</p>
          <button className="bd-empty-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Quay lại
          </button>
        </div>
      </div>
    );
  }

  const b = booking || {};

  return (
    <div className="dashboard-container">
      <Header />

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="bd-hero">
        <button className="bd-hero-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Quay lại
        </button>
        <h1>Chi tiết đặt chỗ</h1>
        <p>Xem và quản lý thông tin đặt chỗ sạc của bạn</p>
      </section>

      {loading ? (
        <div className="bd-loading">
          <Loader size={28} style={{ marginBottom: 8, opacity: .5 }} />
          <p>Đang tải thông tin booking...</p>
        </div>
      ) : (
        <div className="bd-card">
          {/* Status badge */}
          {statusBadge(b.status)}

          {/* Fields grid */}
          <div className="bd-fields">
            <div className="bd-field">
              <span className="bd-field-label"><Hash size={12} /> Booking ID</span>
              <span className="bd-field-value">{b.bookingId ?? b.bookingID ?? b.id ?? "–"}</span>
            </div>
            <div className="bd-field">
              <span className="bd-field-label"><Car size={12} /> Xe</span>
              <span className="bd-field-value">{b.vehicleName ?? "–"}</span>
            </div>
            <div className="bd-field">
              <span className="bd-field-label"><Clock size={12} /> Thời gian</span>
              <span className="bd-field-value">{b.timeRange ?? b.timeRangeString ?? b.bookingDate ?? "–"}</span>
            </div>
            <div className="bd-field">
              <span className="bd-field-label"><Tag size={12} /> Slot</span>
              <span className="bd-field-value">{b.slotName ?? "–"}</span>
            </div>
            <div className="bd-field">
              <span className="bd-field-label"><PlugZap size={12} /> Connector</span>
              <span className="bd-field-value">{b.connectorType ?? "–"}</span>
            </div>
            <div className="bd-field">
              <span className="bd-field-label"><Zap size={12} /> Giá</span>
              <span className="bd-field-value">{b.price ?? "–"}</span>
            </div>
            <div className="bd-field">
              <span className="bd-field-label"><MapPin size={12} /> Trạm</span>
              <span className="bd-field-value">{b.stationName ?? "–"}</span>
            </div>
            <div className="bd-field">
              <span className="bd-field-label"><CalendarCheck size={12} /> Ngày đặt</span>
              <span className="bd-field-value">{b.bookingDate ?? b.bookingTime ?? "–"}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="bd-actions">
            <button
              className="bd-btn bd-btn--confirm"
              onClick={handleConfirm}
              disabled={confirming || b.status === "confirmed" || b.status === "cancelled"}
            >
              {b.status === "confirmed" ? (
                <><CheckCircle2 size={16} /> Đã xác nhận</>
              ) : confirming ? (
                <><Loader size={16} /> Đang xác nhận...</>
              ) : (
                <><CheckCircle2 size={16} /> Xác nhận</>
              )}
            </button>

            <button
              className="bd-btn bd-btn--cancel"
              onClick={handleCancel}
              disabled={cancelling || b.status === "cancelled"}
            >
              {b.status === "cancelled" ? (
                <><XCircle size={16} /> Đã hủy</>
              ) : cancelling ? (
                <><Loader size={16} /> Đang hủy...</>
              ) : (
                <><XCircle size={16} /> Hủy booking</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
