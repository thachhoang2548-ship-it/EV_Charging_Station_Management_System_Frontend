import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/slices/authSlice.js";
import { getProfileApi, getMyVehiclesApi, getNotificationsApi } from "../../api/driverApi.js";
import apiClient from "../../api/apiUrls.js";
import Header from "../../components/admin/Header.jsx";
import paths from "../../path/paths.jsx";
import "../admin/Dashboard.css";
import "./DriverDashboard.css";

// ─── Feature cards config ────────────────────────────────────────
const FEATURES = [
  {
    icon: "📍",
    title: "Tìm trạm sạc",
    desc: "Tìm kiếm & xem thông tin trạm sạc gần bạn trên bản đồ",
    path: "stations",
    badge: null,
  },
  {
    icon: "⚡",
    title: "Phiên sạc",
    desc: "Theo dõi phiên sạc đang diễn ra theo thời gian thực",
    path: "chargingSession",
    badge: "live",
  },
  {
    icon: "🚗",
    title: "Xe của tôi",
    desc: "Quản lý danh sách phương tiện điện của bạn",
    path: "myVehicle",
    badge: null,
  },
  {
    icon: "💳",
    title: "Lịch sử giao dịch",
    desc: "Xem chi tiết các giao dịch và hoá đơn thanh toán",
    path: "transactionHistory",
    badge: null,
  },
  {
    icon: "🔔",
    title: "Thông báo",
    desc: "Cập nhật tin tức và thông báo từ hệ thống",
    path: "notifications",
    badge: "unread",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────
const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);

const formatTime = (isoStr) => {
  if (!isoStr) return "—";
  const d = new Date(isoStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const txStatusLabel = (status) => {
  const map = {
    PAID: { label: "Đã thanh toán", cls: "success" },
    PENDING: { label: "Chờ thanh toán", cls: "pending" },
    FAILED: { label: "Thất bại", cls: "error" },
    REFUNDED: { label: "Hoàn tiền", cls: "info" },
  };
  return map[status] || { label: status, cls: "info" };
};

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

// ─────────────────────────────────────────────────────────────────
export default function DriverDashboard() {
  const navigate = useNavigate();
  const reduxUser = useSelector(selectUser);

  // State
  const [profile, setProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // ── Greet time ──────────────────────────────────────────────────
  const greetText = () => {
    const h = new Date().getHours();
    if (h < 12) return "Chào buổi sáng";
    if (h < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  // ── Data fetching ────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [profileRes, vehiclesRes, notiRes, txRes, unpaidRes] = await Promise.allSettled([
          getProfileApi(),
          getMyVehiclesApi(),
          getNotificationsApi(),
          apiClient.get("/api/driver/transactions"),
          apiClient.get("/api/driver/invoices/unpaid"),
        ]);

        if (profileRes.status === "fulfilled" && profileRes.value?.success) {
          setProfile(profileRes.value.data);
        }
        if (vehiclesRes.status === "fulfilled" && vehiclesRes.value?.success) {
          setVehicles(toArray(vehiclesRes.value.data));
        }
        if (notiRes.status === "fulfilled" && notiRes.value?.success) {
          setNotifications(toArray(notiRes.value.data));
        }
        if (txRes.status === "fulfilled") {
          const sorted = toArray(txRes.value?.data)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
          setTransactions(sorted);
        }
        if (unpaidRes.status === "fulfilled") {
          setUnpaidCount(toArray(unpaidRes.value?.data).length);
        }
      } catch {
        // Silent — individual states remain empty
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Derived stats ─────────────────────────────────────────────
  const displayName =
    profile?.name || reduxUser?.name || localStorage.getItem("userDetails")
      ? (() => {
          try { return JSON.parse(localStorage.getItem("userDetails"))?.name; } catch { return null; }
        })()
      : "Tài xế";

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const totalSpent = transactions
    .filter((t) => t.status === "PAID")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // ── Stat cards config (dynamic) ───────────────────────────────
  const STATS = [
    {
      icon: "🚗",
      iconCls: "green",
      value: loading ? null : vehicles.length,
      label: "Phương tiện",
    },
    {
      icon: "🔔",
      iconCls: "blue",
      value: loading ? null : unreadCount,
      label: "Thông báo mới",
    },
    {
      icon: "💳",
      iconCls: "amber",
      value: loading ? null : unpaidCount,
      label: "Hoá đơn chưa trả",
    },
    {
      icon: "⚡",
      iconCls: "purple",
      value: loading ? null : transactions.filter((t) => t.status === "PAID").length,
      label: "Giao dịch đã TT",
    },
  ];

  // ── Navigate helper ───────────────────────────────────────────
  const goTo = (pathKey) => navigate(paths[pathKey]);

  // ── Badge resolver ────────────────────────────────────────────
  const getBadge = (feat) => {
    if (feat.badge === "live")   return <span className="dd-pill info">● Live</span>;
    if (feat.badge === "unread" && unreadCount > 0)
      return <span className="dd-pill success">{unreadCount} mới</span>;
    return null;
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-container">
      <Header />

      <h1 className="dashboard-header">
        {greetText()}, {displayName || "Tài xế"} 👋
      </h1>

      {/* ── KPI CARDS ── */}
      <div className="kpi-grid">
        {STATS.map((s, i) => (
          <div className="kpi-card" key={i}>
            <span className="kpi-title">{s.label}</span>
            {s.value === null ? (
              <span className="kpi-value dd-loading-bar" />
            ) : (
              <span className="kpi-value">{s.value}</span>
            )}
            <span className="kpi-unit">{s.icon}</span>
          </div>
        ))}
      </div>

        {/* ── FEATURE GRID ── */}
        <div className="dd-section-head">
          <h2 className="dd-section-title">Chức năng</h2>
          <span className="dd-section-badge">Dành cho tài xế</span>
        </div>

        <div className="dd-feature-grid">
          {FEATURES.map((feat) => (
            <div
              className="dd-feature-card"
              key={feat.path}
              onClick={() => goTo(feat.path)}
            >
              <div className="dd-feat-icon-wrap">{feat.icon}</div>
              <div className="dd-feat-body">
                <div className="dd-feat-title">{feat.title}</div>
                <div className="dd-feat-desc">{feat.desc}</div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span className="dd-feat-arrow">
                  Xem ngay →
                </span>
                {getBadge(feat)}
              </div>
            </div>
          ))}
        </div>

        {/* ── RECENT TRANSACTIONS ── */}
        <div className="dd-section-head" style={{ marginTop: 8 }}>
          <h2 className="dd-section-title">Giao dịch gần đây</h2>
          <button className="dd-view-all" onClick={() => goTo("transactionHistory")}>
            Xem tất cả →
          </button>
        </div>

        {loading ? (
          <div className="dd-activity-list">
            {[1, 2, 3].map((i) => (
              <div className="dd-activity-item" key={i} style={{ opacity: 0.5 }}>
                <div
                  className="dd-act-icon"
                  style={{
                    background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.4s infinite",
                  }}
                />
                <div className="dd-act-body">
                  <div
                    style={{
                      height: 14,
                      width: "60%",
                      background: "#e2e8f0",
                      borderRadius: 6,
                      marginBottom: 6,
                    }}
                  />
                  <div style={{ height: 12, width: "40%", background: "#f1f5f9", borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="dd-empty">
            <div className="dd-empty-icon">💳</div>
            <p>Chưa có giao dịch nào. Hãy bắt đầu sạc xe nhé!</p>
          </div>
        ) : (
          <div className="dd-activity-list">
            {transactions.map((tx, i) => {
              const status = txStatusLabel(tx.status);
              return (
                <div
                  className="dd-activity-item"
                  key={tx.transactionId || tx.id || i}
                  onClick={() =>
                    tx.transactionId &&
                    navigate(
                      paths.transactionDetail.replace(
                        ":transactionId",
                        tx.transactionId
                      )
                    )
                  }
                >
                  <div className="dd-act-icon">⚡</div>
                  <div className="dd-act-body">
                    <div className="dd-act-title">
                      {tx.stationName || tx.description || `Giao dịch #${tx.transactionId || i + 1}`}
                    </div>
                    <div className="dd-act-sub">{formatTime(tx.createdAt)}</div>
                  </div>
                  <div className="dd-act-right">
                    <span className="dd-act-amount">
                      {formatCurrency(tx.amount)}
                    </span>
                    <span className={`dd-pill ${status.cls}`}>{status.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── VEHICLE SHORTCUTS ── */}
        {vehicles.length > 0 && (
          <>
            <div className="dd-section-head" style={{ marginTop: 32 }}>
              <h2 className="dd-section-title">Phương tiện của tôi</h2>
              <button className="dd-view-all" onClick={() => goTo("myVehicle")}>
                Xem tất cả →
              </button>
            </div>
            <div className="dd-activity-list">
              {vehicles.slice(0, 3).map((v, i) => (
                <div
                  className="dd-activity-item"
                  key={v.vehicleId || v.id || i}
                  onClick={() => goTo("myVehicle")}
                >
                  <div className="dd-act-icon">🚗</div>
                  <div className="dd-act-body">
                    <div className="dd-act-title">
                      {v.brand} {v.model || v.modelName}
                    </div>
                    <div className="dd-act-sub">{v.licensePlate || v.plateNumber || "—"}</div>
                  </div>
                  <div className="dd-act-right">
                    <span
                      className={`dd-pill ${v.status === "ACTIVE" ? "success" : "pending"}`}
                    >
                      {v.status === "ACTIVE" ? "Đang dùng" : v.status || "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

    </div>
  );
}
