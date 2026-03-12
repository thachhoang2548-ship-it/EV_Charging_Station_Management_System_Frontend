import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../../api/apiUrls.js";
import paths from "../../path/paths.jsx";
import {
  CircleCheck, Receipt, CreditCard, Clock,
  Hash, Building2, ArrowRight, Home
} from "lucide-react";
import "./PaymentSuccess.css";

const AUTO_REDIRECT_SECONDS = 8;

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(AUTO_REDIRECT_SECONDS);
  const countdownRef = useRef(null);

  const [paymentInfo, setPaymentInfo] = useState({
    transactionId: "",
    amount: "",
    orderInfo: "",
    transactionNo: "",
    bankCode: "",
    payDate: "",
    responseCode: "",
  });

  // ── Format VNPay date (YYYYMMDDHHmmss → DD/MM/YYYY HH:mm) ──
  const formatPayDate = (dateStr) => {
    if (!dateStr || dateStr.length !== 14) return dateStr || "";
    const y = dateStr.substring(0, 4);
    const m = dateStr.substring(4, 6);
    const d = dateStr.substring(6, 8);
    const h = dateStr.substring(8, 10);
    const min = dateStr.substring(10, 12);
    return `${d}/${m}/${y} ${h}:${min}`;
  };

  // ── Fetch payment info ──
  useEffect(() => {
    const fetchPaymentInfo = async () => {
      try {
        const invoiceIdParam = searchParams.get("invoiceId");
        const transactionIdParam = searchParams.get("transactionId");
        const transactionNo = searchParams.get("vnp_TransactionNo");
        const bankCode = searchParams.get("vnp_BankCode");
        const payDate = searchParams.get("vnp_PayDate");
        const responseCode = searchParams.get("vnp_ResponseCode");

        // Check if payment failed
        if (responseCode && responseCode !== "00") {
          toast.error("Thanh toán thất bại!");
          navigate(paths.paymentFailed + `?vnp_ResponseCode=${responseCode}`, { replace: true });
          return;
        }

        let finalAmount = "0";
        let finalOrderInfo = "";
        let finalTransactionId = transactionIdParam || "";

        // 1) Try sessionStorage first
        const pendingStr = sessionStorage.getItem("pendingPayment");
        if (pendingStr) {
          try {
            const pending = JSON.parse(pendingStr);
            if (pending.amount) {
              finalAmount = pending.amount.toLocaleString("vi-VN");
              finalOrderInfo = pending.orderInfo || `Hóa đơn #${invoiceIdParam}`;
            }
            sessionStorage.removeItem("pendingPayment");
          } catch (e) { /* ignore */ }
        }

        // 2) Fallback: fetch from API
        if (finalAmount === "0" && transactionIdParam) {
          try {
            const txRes = await apiClient.get(`/api/driver/transactions`);
            const txs = txRes.data || [];
            const tx = txs.find(t => t.transactionId === parseInt(transactionIdParam));
            if (tx) {
              finalAmount = tx.amount.toLocaleString("vi-VN");
              finalOrderInfo = tx.description || `Hóa đơn #${invoiceIdParam}`;
            } else if (invoiceIdParam) {
              const invRes = await apiClient.get(`/api/invoices/${invoiceIdParam}`);
              if (invRes.data) {
                finalAmount = invRes.data.amount.toLocaleString("vi-VN");
                finalOrderInfo = `Hóa đơn #${invoiceIdParam}`;
              }
            }
          } catch (err) {
            console.error("Error fetching transaction:", err);
          }
        }

        setPaymentInfo({
          transactionId: finalTransactionId,
          amount: finalAmount,
          orderInfo: finalOrderInfo,
          transactionNo: transactionNo || "",
          bankCode: bankCode || "",
          payDate: payDate ? formatPayDate(payDate) : "",
          responseCode: responseCode || "",
        });

        toast.success("Thanh toán thành công!", { position: "top-center" });
      } catch (error) {
        console.error("Error in fetchPaymentInfo:", error);
        toast.error("Có lỗi khi tải thông tin thanh toán");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentInfo();
  }, [searchParams, navigate]);

  // ── Auto-redirect countdown ──
  useEffect(() => {
    if (loading) return;

    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          navigate(paths.transactionHistory, { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [loading, navigate]);

  // ── Navigation handlers ──
  const goToTransactions = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    navigate(paths.transactionHistory, { replace: true });
  };

  const goToHome = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    navigate(paths.home, { replace: true });
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="ps-page">
        <div className="ps-card">
          <div className="ps-loading">
            <div className="ps-spinner" />
            <span className="ps-loading-text">Đang xác nhận thanh toán...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ps-page">
      <div className="ps-card">
        {/* ── Header ── */}
        <div className="ps-header">
          <div className="ps-icon-ring">
            <div className="ps-icon-inner">
              <CircleCheck size={28} strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="ps-title">Thanh toán thành công!</h1>
          <p className="ps-subtitle">Cảm ơn bạn đã sử dụng dịch vụ EVCharge</p>
        </div>

        {/* ── Body ── */}
        <div className="ps-body">
          {/* Amount highlight */}
          {paymentInfo.amount && paymentInfo.amount !== "0" && (
            <div className="ps-amount-card">
              <div className="ps-amount-label">Số tiền thanh toán</div>
              <div className="ps-amount-value">
                {paymentInfo.amount}
                <span className="ps-amount-currency">VND</span>
              </div>
            </div>
          )}

          {/* Info rows */}
          <div className="ps-info">
            {paymentInfo.transactionId && (
              <div className="ps-info-row">
                <span className="ps-info-label"><Hash size={14} /> Mã giao dịch</span>
                <span className="ps-info-value">{paymentInfo.transactionId}</span>
              </div>
            )}
            {paymentInfo.orderInfo && (
              <div className="ps-info-row">
                <span className="ps-info-label"><Receipt size={14} /> Nội dung</span>
                <span className="ps-info-value">{paymentInfo.orderInfo}</span>
              </div>
            )}
            {paymentInfo.transactionNo && (
              <div className="ps-info-row">
                <span className="ps-info-label"><CreditCard size={14} /> Mã VNPay</span>
                <span className="ps-info-value">{paymentInfo.transactionNo}</span>
              </div>
            )}
            {paymentInfo.bankCode && (
              <div className="ps-info-row">
                <span className="ps-info-label"><Building2 size={14} /> Ngân hàng</span>
                <span className="ps-info-value">{paymentInfo.bankCode}</span>
              </div>
            )}
            {paymentInfo.payDate && (
              <div className="ps-info-row">
                <span className="ps-info-label"><Clock size={14} /> Thời gian</span>
                <span className="ps-info-value">{paymentInfo.payDate}</span>
              </div>
            )}
          </div>

          {/* Countdown */}
          <div className="ps-countdown">
            <span className="ps-countdown-text">
              Tự động chuyển hướng sau <span className="ps-countdown-num">{countdown}</span> giây
            </span>
          </div>

          {/* Buttons */}
          <button className="ps-btn-primary" onClick={goToTransactions}>
            <Receipt size={16} />
            Xem lịch sử giao dịch
            <ArrowRight size={16} />
          </button>
          <button className="ps-btn-secondary" onClick={goToHome}>
            <Home size={16} />
            Về trang chủ
          </button>
        </div>

        {/* Footer */}
        <div className="ps-footer-note">
          Biên lai thanh toán đã được lưu vào lịch sử giao dịch của bạn
        </div>
      </div>
    </div>
  );
}
