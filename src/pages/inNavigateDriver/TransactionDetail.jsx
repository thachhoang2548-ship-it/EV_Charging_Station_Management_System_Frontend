import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../../api/apiUrls.js";
import { isAuthenticated } from "../../utils/authUtils.js";
import paths from "../../path/paths.jsx";
import Header from "../../components/admin/Header.jsx";
import "../admin/Dashboard.css";
import "./TransactionDetail.css";
import {
  ArrowLeft,
  CircleCheck,
  CircleX,
  Clock,
  FileText,
  MapPin,
  Car,
  List,
  AlertTriangle,
} from "lucide-react";

export default function TransactionDetail() {
  const navigate = useNavigate();
  const { transactionId } = useParams();
  const location = useLocation();
  const [transaction, setTransaction] = useState(
    location.state?.transaction || null
  );
  const [loading, setLoading] = useState(!transaction);

  const fetchTransactionDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/api/driver/transactions/${transactionId}`
      );
      setTransaction(response.data);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết giao dịch:", error);
      toast.error("Không thể tải chi tiết giao dịch", {
        position: "top-center",
      });
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [transactionId, navigate]);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.warning("Bạn chưa đăng nhập. Vui lòng đăng nhập!", {
        position: "top-center",
      });
      navigate(paths.login);
      return;
    }
    if (!transaction && transactionId) {
      fetchTransactionDetail();
    }
  }, [navigate, transactionId, transaction, fetchTransactionDetail]);

  /* ── Helpers ── */
  const getStatusKey = (status) => {
    switch (status) {
      case "COMPLETED": return "completed";
      case "FAILED": return "failed";
      default: return "pending";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "COMPLETED": return "Hoàn tất";
      case "FAILED": return "Thất bại";
      case "PENDING": return "Chờ xử lý";
      default: return status;
    }
  };

  const StatusIcon = ({ status }) => {
    switch (status) {
      case "COMPLETED": return <CircleCheck className="td-status-icon" />;
      case "FAILED": return <CircleX className="td-status-icon" />;
      default: return <Clock className="td-status-icon" />;
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "-";
    return new Date(dateTime).toLocaleString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatCurrency = (amount, currency = "VND") =>
    `${amount?.toLocaleString("vi-VN") || 0} ${currency}`;

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="dashboard-container">
        <Header />
        <div className="td-loading">
          <div className="td-spinner" />
          <p className="td-loading-text">Đang tải chi tiết giao dịch...</p>
        </div>
      </div>
    );
  }

  /* ── Error State ── */
  if (!transaction) {
    return (
      <div className="dashboard-container">
        <Header />
        <div className="td-error">
          <AlertTriangle className="td-error-icon" />
          <p className="td-error-text">Không tìm thấy giao dịch</p>
          <button className="td-back" onClick={() => navigate(-1)}>
            <ArrowLeft className="td-back-icon" /> Quay lại
          </button>
        </div>
      </div>
    );
  }

  const statusKey = getStatusKey(transaction.status);

  /* ── Main Render ── */
  return (
    <div className="dashboard-container">
      <Header />

      {/* Back Button */}
      <button className="td-back" onClick={() => navigate(-1)}>
        <ArrowLeft className="td-back-icon" /> Quay lại
      </button>

      {/* Status Hero */}
      <div className={`td-status-hero td-status-hero--${statusKey}`}>
        <div className="td-status-icon-wrap">
          <StatusIcon status={transaction.status} />
        </div>
        <h2 className="td-status-text">{getStatusText(transaction.status)}</h2>
        <div className="td-status-id">Mã giao dịch: #{transaction.transactionId}</div>
      </div>

      {/* Amount Card */}
      <div className="td-amount">
        <div className="td-amount-label">Số tiền thanh toán</div>
        <div className="td-amount-value">
          {formatCurrency(transaction.amount, transaction.currency)}
        </div>
      </div>

      {/* Info Sections */}
      <div className="td-sections">
        {/* Transaction Info */}
        <div className="td-section">
          <div className="td-section-header">
            <div className="td-section-icon-wrap td-section-icon-wrap--green">
              <FileText className="td-section-icon" />
            </div>
            <h3 className="td-section-title">Thông tin giao dịch</h3>
          </div>
          <div className="td-grid">
            {transaction.description && (
              <div className="td-grid-item td-grid-item--full">
                <div className="td-grid-label">Mô tả</div>
                <div className="td-grid-value">{transaction.description}</div>
              </div>
            )}
            <div className="td-grid-item">
              <div className="td-grid-label">Thời gian tạo</div>
              <div className="td-grid-value">{formatDateTime(transaction.createdAt)}</div>
            </div>
            {transaction.invoiceId && (
              <div className="td-grid-item">
                <div className="td-grid-label">Mã hóa đơn</div>
                <div className="td-grid-value td-grid-value--mono">#{transaction.invoiceId}</div>
              </div>
            )}
            {transaction.sessionId && (
              <div className="td-grid-item">
                <div className="td-grid-label">Mã phiên sạc</div>
                <div className="td-grid-value td-grid-value--mono">#{transaction.sessionId}</div>
              </div>
            )}
            {transaction.bookingId && (
              <div className="td-grid-item">
                <div className="td-grid-label">Mã đặt chỗ</div>
                <div className="td-grid-value td-grid-value--mono">#{transaction.bookingId}</div>
              </div>
            )}
          </div>
        </div>

        {/* Station Info */}
        {transaction.stationName && (
          <div className="td-section">
            <div className="td-section-header">
              <div className="td-section-icon-wrap td-section-icon-wrap--blue">
                <MapPin className="td-section-icon" />
              </div>
              <h3 className="td-section-title">Thông tin trạm sạc</h3>
            </div>
            <div className="td-grid">
              <div className="td-grid-item">
                <div className="td-grid-label">Tên trạm</div>
                <div className="td-grid-value">{transaction.stationName}</div>
              </div>
              {transaction.stationId && (
                <div className="td-grid-item">
                  <div className="td-grid-label">Mã trạm</div>
                  <div className="td-grid-value td-grid-value--mono">#{transaction.stationId}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vehicle Info */}
        {transaction.vehiclePlate && (
          <div className="td-section">
            <div className="td-section-header">
              <div className="td-section-icon-wrap td-section-icon-wrap--purple">
                <Car className="td-section-icon" />
              </div>
              <h3 className="td-section-title">Thông tin phương tiện</h3>
            </div>
            <div className="td-grid">
              <div className="td-grid-item">
                <div className="td-grid-label">Biển số xe</div>
                <div className="td-grid-value">{transaction.vehiclePlate}</div>
              </div>
              {transaction.vehicleId && (
                <div className="td-grid-item">
                  <div className="td-grid-label">Mã xe</div>
                  <div className="td-grid-value td-grid-value--mono">#{transaction.vehicleId}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="td-actions">
        <button
          className="td-btn td-btn--secondary"
          onClick={() => navigate(paths.transactionHistory)}
        >
          <List className="td-btn-icon" /> Xem tất cả giao dịch
        </button>
      </div>
    </div>
  );
}