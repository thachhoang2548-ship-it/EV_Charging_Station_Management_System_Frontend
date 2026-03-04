import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../../api/apiUrls.js";
import { isAuthenticated } from "../../utils/authUtils.js";
import paths from "../../path/paths.jsx";
import Header from "../../components/admin/Header.jsx";
import "../admin/Dashboard.css";
import "./TransactionHistory.css";
import {
  Wallet,
  Search,
  RefreshCw,
  MapPin,
  Car,
  CircleCheck,
  CircleX,
  Clock,
  AlertTriangle,
  CreditCard,
  Inbox,
  Zap,
} from "lucide-react";

const TAB_CONFIG = [
  { key: "ALL", label: "Tất cả" },
  { key: "COMPLETED", label: "Thành công" },
  { key: "PENDING", label: "Chờ duyệt" },
  { key: "UNPAID", label: "Chưa thanh toán" },
  { key: "FAILED", label: "Thất bại" },
];

export default function TransactionHistory() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("DATE_DESC");

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.warning("Bạn chưa đăng nhập. Vui lòng đăng nhập!", {
        position: "top-center",
        autoClose: 3000,
      });
      navigate(paths.login);
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    await Promise.all([fetchTransactions(), fetchUnpaidInvoices()]);
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/driver/transactions");
      const sortedData = (response.data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTransactions(sortedData);
    } catch (error) {
      console.error("Lỗi tải lịch sử:", error);
      toast.error("Không thể tải lịch sử giao dịch");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnpaidInvoices = async () => {
    try {
      const response = await apiClient.get("/api/driver/invoices/unpaid");
      setUnpaidInvoices(response.data || []);
    } catch (error) {
      console.error("Lỗi tải hóa đơn nợ:", error);
    }
  };

  /* ── Helpers ── */
  const getStatusKey = (status) => (status || "").toLowerCase();

  const getStatusText = (status) => {
    switch (status) {
      case "COMPLETED": return "Hoàn tất";
      case "FAILED": return "Thất bại";
      case "PENDING": return "Đang xử lý";
      case "UNPAID": return "Chờ thanh toán";
      default: return status;
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "-";
    return new Date(dateTime).toLocaleString("vi-VN", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const formatCurrency = (amount, currency = "VND") =>
    `${amount?.toLocaleString("vi-VN") || 0} ${currency}`;

  const filterByDate = (item) => {
    if (dateFilter === "ALL") return true;
    const itemDate = new Date(item.createdAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (dateFilter) {
      case "TODAY": return itemDate >= today;
      case "WEEK": {
        const d = new Date(today); d.setDate(d.getDate() - 7); return itemDate >= d;
      }
      case "MONTH": {
        const d = new Date(today); d.setMonth(d.getMonth() - 1); return itemDate >= d;
      }
      default: return true;
    }
  };

  /* ── Event Handlers ── */
  const handleItemClick = async (item) => {
    if (item.type === "INVOICE" || (item.status === "PENDING" && item.invoiceId)) {
      handlePaymentNavigation(item);
    } else {
      if (paths.transactionDetail) {
        navigate(paths.transactionDetail.replace(":transactionId", item.id), {
          state: { transaction: item },
        });
      } else {
        toast.info(`Chi tiết giao dịch #${item.id}`);
      }
    }
  };

  const handlePaymentNavigation = async (item) => {
    try {
      const invoiceId = item.invoiceId || item.id;
      const response = await apiClient.get(`/api/driver/invoices/${invoiceId}`);
      const invoiceData = response.data;
      if (invoiceData.status === "PAID") {
        toast.info("Hóa đơn này đã được thanh toán!");
        fetchData();
        return;
      }
      navigate(paths.payment, {
        state: {
          sessionResult: {
            sessionId: item.sessionId || invoiceData.sessionId,
            invoiceId,
            stationName: item.stationName || invoiceData.stationName,
            pointNumber: invoiceData.pointNumber || "-",
            vehiclePlate: item.vehiclePlate || invoiceData.vehiclePlate,
            startTime: invoiceData.startTime || item.createdAt,
            endTime: invoiceData.endTime || item.createdAt,
            energyKWh: invoiceData.energyKWh || 0,
            cost: item.amount || invoiceData.amount,
            durationMinutes: invoiceData.durationMinutes || 0,
            initialSoc: invoiceData.initialSoc || 0,
            finalSoc: invoiceData.finalSoc || 0,
            pricePerKWh: invoiceData.pricePerKWh || 0,
            currency: item.currency || "VND",
            status: "COMPLETED",
          },
        },
      });
    } catch (error) {
      console.error("Lỗi lấy thông tin hóa đơn:", error);
      toast.error("Không thể tải thông tin thanh toán");
    }
  };

  /* ── Data Merge & Filter ── */
  const formattedUnpaid = unpaidInvoices.map((inv) => ({
    ...inv, type: "INVOICE", id: inv.invoiceId,
    createdAt: inv.issuedAt, status: "UNPAID",
    description: "Thanh toán hóa đơn sạc",
  }));

  const formattedTransactions = transactions.map((t) => ({
    ...t, type: "TRANSACTION", id: t.transactionId,
  }));

  let displayItems = [];
  if (filter === "ALL") displayItems = [...formattedUnpaid, ...formattedTransactions];
  else if (filter === "UNPAID") displayItems = formattedUnpaid;
  else displayItems = formattedTransactions.filter((t) => t.status === filter);

  displayItems = displayItems
    .filter(filterByDate)
    .filter((item) => {
      const s = searchTerm.toLowerCase();
      return (
        searchTerm === "" ||
        item.id?.toString().includes(s) ||
        item.stationName?.toLowerCase().includes(s) ||
        item.vehiclePlate?.toLowerCase().includes(s) ||
        (item.description && item.description.toLowerCase().includes(s))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "DATE_DESC": return new Date(b.createdAt) - new Date(a.createdAt);
        case "DATE_ASC": return new Date(a.createdAt) - new Date(b.createdAt);
        case "AMOUNT_DESC": return b.amount - a.amount;
        case "AMOUNT_ASC": return a.amount - b.amount;
        default: return 0;
      }
    });

  const stats = {
    total: transactions.length + unpaidInvoices.length,
    completed: transactions.filter((t) => t.status === "COMPLETED").length,
    unpaid: unpaidInvoices.length,
    failed: transactions.filter((t) => t.status === "FAILED").length,
  };

  const getTabCount = (key) => {
    if (key === "ALL") return stats.total;
    if (key === "UNPAID") return stats.unpaid;
    return transactions.filter((t) => t.status === key).length;
  };

  /* ── Render ── */
  return (
    <div className="dashboard-container">
      <Header />

      {/* Hero */}
      <div className="tx-hero">
        <div className="tx-hero-chip"><Wallet size={14} /> Ví giao dịch</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 className="tx-hero-title">Lịch sử giao dịch</h1>
            <p className="tx-hero-sub">Theo dõi tất cả giao dịch sạc điện và hóa đơn của bạn</p>
          </div>
          <button className="tx-refresh" onClick={fetchData}>
            <RefreshCw className="tx-refresh-icon" /> Làm mới
          </button>
        </div>

        <div className="tx-counters">
          <div className="tx-counter">
            <div className="tx-counter-num">{stats.total}</div>
            <div className="tx-counter-label">Tổng cộng</div>
          </div>
          <div className="tx-counter">
            <div className="tx-counter-num">{stats.completed}</div>
            <div className="tx-counter-label">Hoàn tất</div>
          </div>
          <div className="tx-counter">
            <div className="tx-counter-num">{stats.unpaid}</div>
            <div className="tx-counter-label">Chưa trả</div>
          </div>
          <div className="tx-counter">
            <div className="tx-counter-num">{stats.failed}</div>
            <div className="tx-counter-label">Thất bại</div>
          </div>
        </div>
      </div>

      {/* Alert */}
      {stats.unpaid > 0 && filter === "ALL" && (
        <div className="tx-alert">
          <AlertTriangle className="tx-alert-icon" />
          Bạn có <strong style={{ margin: "0 4px" }}>{stats.unpaid}</strong> hóa đơn cần thanh toán.
        </div>
      )}

      {/* Controls */}
      <div className="tx-controls">
        <div className="tx-search">
          <Search className="tx-search-icon" />
          <input
            className="tx-search-input"
            type="text"
            placeholder="Tìm kiếm mã, biển số, trạm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="tx-select" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
          <option value="ALL">Tất cả thời gian</option>
          <option value="TODAY">Hôm nay</option>
          <option value="WEEK">7 ngày qua</option>
          <option value="MONTH">30 ngày qua</option>
        </select>
        <select className="tx-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="DATE_DESC">Mới nhất</option>
          <option value="DATE_ASC">Cũ nhất</option>
          <option value="AMOUNT_DESC">Giá trị cao</option>
          <option value="AMOUNT_ASC">Giá trị thấp</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="tx-tabs">
        {TAB_CONFIG.map(({ key, label }) => (
          <button
            key={key}
            className={`tx-tab ${filter === key ? "tx-tab--active" : ""}`}
            onClick={() => setFilter(key)}
          >
            {label}
            <span className="tx-tab-count">{getTabCount(key)}</span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="tx-list">
        {loading ? (
          <div className="tx-loading">
            <div className="tx-spinner" />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : displayItems.length === 0 ? (
          <div className="tx-empty">
            <Inbox className="tx-empty-icon" />
            <p className="tx-empty-text">Không tìm thấy giao dịch nào</p>
          </div>
        ) : (
          displayItems.map((item) => {
            const isUnpaid = item.status === "UNPAID";
            const statusKey = getStatusKey(item.status);

            return (
              <div
                key={`${item.type}-${item.id}`}
                className="tx-card"
                onClick={() => handleItemClick(item)}
              >
                <div className={`tx-card-accent tx-card-accent--${statusKey}`} />

                <div className="tx-card-body">
                  <div className="tx-card-main">
                    <div className="tx-card-top">
                      <span className="tx-card-id">#{item.id}</span>
                      <span className="tx-card-date">{formatDateTime(item.createdAt)}</span>
                    </div>
                    <div className="tx-card-desc">
                      {isUnpaid ? "Thanh toán hóa đơn sạc" : (item.description || "Giao dịch trạm sạc")}
                    </div>
                    <div className="tx-card-details">
                      {item.stationName && (
                        <span className="tx-chip">
                          <MapPin className="tx-chip-icon" />
                          {item.stationName}
                        </span>
                      )}
                      {item.stationName && item.vehiclePlate && (
                        <span className="tx-chip-dot" />
                      )}
                      {item.vehiclePlate && (
                        <span className="tx-chip">
                          <Car className="tx-chip-icon" />
                          {item.vehiclePlate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="tx-card-side">
                    <div className="tx-card-price">
                      {formatCurrency(item.amount, item.currency)}
                    </div>
                    <span className={`tx-badge tx-badge--${statusKey}`}>
                      <span className="tx-badge-dot" />
                      {getStatusText(item.status)}
                    </span>
                    {(isUnpaid || item.status === "PENDING") && (
                      <button className="tx-btn-pay" onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}>
                        <CreditCard size={13} /> Thanh toán
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}