import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/admin/Header.jsx";
import "../admin/Dashboard.css";
import "./BookingDetail.css";
import { stationAPI } from "../../api/stationApi.js";
import { toast } from "react-toastify";
import { ArrowLeft, Download, QrCode, Loader } from "lucide-react";

export default function BookingQRCode() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const bookingIdParam = params?.bookingId;

  const stateBooking = location?.state?.booking;
  const qrFromState = location?.state?.qrBlobUrl;

  const [booking, setBooking] = useState(stateBooking || null);
  const [qrUrl, setQrUrl] = useState(qrFromState || null);
  const [loading, setLoading] = useState(false);

  // Try to restore QR from sessionStorage when needed
  useEffect(() => {
    if (qrUrl) return;

    const attemptRestore = async () => {
      try {
        const id = booking?.bookingId ?? booking?.id ?? bookingIdParam;
        if (id) {
          const key = `qr_booking_${id}`;
          const stored = sessionStorage.getItem(key);
          if (stored) {
            setQrUrl(stored);
            return;
          }
        }

        // fallback: if exactly one qr_booking_ key exists, use it
        const keys = Object.keys(sessionStorage).filter(
          (k) => k && k.startsWith("qr_booking_")
        );
        if (keys.length === 1) {
          const s = sessionStorage.getItem(keys[0]);
          if (s) setQrUrl(s);
        }
      } catch (e) {
        console.warn("Could not restore QR from sessionStorage", e);
      }
    };

    attemptRestore();
  }, [qrUrl, booking, bookingIdParam]);

  // If we have a bookingId param but no booking data, fetch it
  useEffect(() => {
    if (!booking && bookingIdParam) {
      (async () => {
        try {
          setLoading(true);
          const res = await stationAPI.getBookingById(bookingIdParam);
          if (!res || res.success === false) {
            toast.error(res?.message || "Không thể lấy booking", {
              position: "top-center",
            });
            return;
          }
          setBooking(res.data ?? res);
        } catch (err) {
          console.error("Error fetching booking:", err);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [booking, bookingIdParam]);

  useEffect(() => {
    return () => {
      // Revoke object URL to avoid memory leaks
      if (qrUrl && typeof qrUrl === "string" && qrUrl.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(qrUrl);
        } catch {
          // ignore
        }
      }
    };
  }, [qrUrl]);

  const handleDownload = () => {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `booking-${booking?.bookingId ?? bookingIdParam ?? "qr"}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="dashboard-container">
      <Header />

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="bd-hero">
        <button className="bd-hero-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Quay lại
        </button>
        <h1>Mã QR đặt chỗ</h1>
        <p>Quét mã QR tại trạm sạc để bắt đầu phiên sạc</p>
      </section>

      <div className="bd-card">
        {loading ? (
          <div className="bd-loading">
            <Loader size={28} style={{ marginBottom: 8, opacity: .5 }} />
            <p>Đang tải...</p>
          </div>
        ) : qrUrl ? (
          <div className="bd-qr-wrap">
            <img src={qrUrl} alt="QR Code" className="bd-qr-img" />
            <div>
              <button className="bd-qr-download" onClick={handleDownload}>
                <Download size={16} /> Tải mã QR
              </button>
            </div>
          </div>
        ) : (
          <div className="bd-qr-wrap">
            <QrCode size={48} style={{ opacity: .3, marginBottom: 12 }} />
            <p className="bd-qr-empty">QR chưa có. Vui lòng xác nhận booking trước.</p>
          </div>
        )}
      </div>
    </div>
  );
}
