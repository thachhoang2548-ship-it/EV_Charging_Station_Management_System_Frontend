import { useState, useEffect } from "react";
import {
  getNotificationsApi,
  markNotificationAsReadApi,
} from "../../api/driverApi.js";
import { toast } from "react-toastify";
import Header from "../../components/admin/Header.jsx";
import "../admin/Dashboard.css";
import "./Notification.css";
import {
  Bell, BellRing, Zap, PlugZap, Clock, Battery,
  DollarSign, CreditCard, X, Info, CheckCircle2,
  CalendarCheck, XCircle, AlertTriangle, ShieldAlert,
} from "lucide-react";

/* ── type config (icon + bg cho vòng tròn) ── */
const TYPE_MAP = {
  BOOKING_CONFIRMED:  { Icon: CalendarCheck,  bg: "#dcfce7", color: "#16a34a", label: "Đặt chỗ" },
  BOOKING_CANCELED:   { Icon: XCircle,        bg: "#fee2e2", color: "#dc2626", label: "Hủy đặt chỗ" },
  CHARGING_STARTED:   { Icon: PlugZap,        bg: "#dbeafe", color: "#2563eb", label: "Bắt đầu sạc" },
  CHARGING_COMPLETED: { Icon: Zap,            bg: "#dcfce7", color: "#16a34a", label: "Sạc hoàn tất" },
  PAYMENT_SUCCESS:    { Icon: CreditCard,     bg: "#d1fae5", color: "#059669", label: "Thanh toán" },
  BOOKING_OVERDUE:    { Icon: AlertTriangle,  bg: "#fef3c7", color: "#d97706", label: "Quá hạn" },
  USER_BANNED:        { Icon: ShieldAlert,    bg: "#fee2e2", color: "#dc2626", label: "Cảnh báo" },
  SYSTEM:             { Icon: Info,           bg: "#e0e7ff", color: "#4f46e5", label: "Hệ thống" },
  WARNING:            { Icon: AlertTriangle,  bg: "#fef3c7", color: "#d97706", label: "Cảnh báo" },
};
const getTypeInfo = (type) =>
  TYPE_MAP[type] || { Icon: Bell, bg: "#f3f4f6", color: "#6b7280", label: "Thông báo" };

/* ── Relative time (kiểu Facebook) ── */
const relativeTime = (raw) => {
  if (!raw) return "";
  const now = Date.now();
  const t = new Date(raw).getTime();
  const diffSec = Math.floor((now - t) / 1000);
  if (diffSec < 60) return "Vừa xong";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs} giờ trước`;
  const diffDay = Math.floor(diffHrs / 24);
  if (diffDay < 7) return `${diffDay} ngày trước`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 4) return `${diffWeek} tuần trước`;
  return new Date(raw).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
};

/* ── tabs ── */
const TAB_CONFIG = [
  { key: "all",      label: "Tất cả" },
  { key: "unread",   label: "Chưa đọc" },
  { key: "read",     label: "Đã đọc" },
  { key: "charging", label: "Sạc điện" },
];

/* ══════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════ */
export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  /* ── fetch ── */
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotificationsApi();
      if (response.success) {
        const data = Array.isArray(response.data) ? response.data : [];
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch my notifications:", error);
      toast.error("Không thể tải danh sách thông báo!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  /* ── format money ── */
  const formatMoney = (value) => {
    if (!value) return "";
    const number = parseFloat(value.replace(/[^\d.-]/g, ""));
    if (isNaN(number)) return value;
    return number.toLocaleString("vi-VN", {
      style: "currency", currency: "VND", minimumFractionDigits: 0,
    });
  };

  /* ── mark as read (optimistic) ── */
  const handleReaded = async (notification) => {
    if (notification.isRead) return;

    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationId === notification.notificationId
          ? { ...n, isRead: true, status: "READ" }
          : n
      )
    );

    try {
      const response = await markNotificationAsReadApi(notification.notificationId);
      if (!response.success) {
        toast.error("Đánh dấu đã đọc thất bại, vui lòng thử lại.");
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationId === notification.notificationId
              ? { ...n, isRead: false, status: "UNREAD" }
              : n
          )
        );
      }
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notification.notificationId
            ? { ...n, isRead: false, status: "UNREAD" }
            : n
        )
      );
    }
  };

  /* ── filter by tab ── */
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread")   return !n.isRead && n.status === "UNREAD";
    if (activeTab === "read")     return n.isRead || n.status !== "UNREAD";
    if (activeTab === "charging") return n.type === "CHARGING_COMPLETED";
    return true;
  });

  /* ── derived stats ── */
  const totalCount  = notifications.length;
  const unreadCount = notifications.filter((n) => !n.isRead && n.status === "UNREAD").length;
  const readCount   = totalCount - unreadCount;

  const tabCounts = {
    all:      totalCount,
    unread:   unreadCount,
    read:     readCount,
    charging: notifications.filter((n) => n.type === "CHARGING_COMPLETED").length,
  };

  /* ── card click → open modal ── */
  const handleItemClick = (notification) => {
    setSelectedNotification(notification);
    if (notification.status === "UNREAD") {
      handleReaded(notification);
    }
  };

  const closeModal = () => setSelectedNotification(null);

  /* ── parse charging content ── */
  const parseChargingContent = (content) => {
    const info = {};
    const patterns = {
      point:     /Điểm sạc:\s*([^|]+)/,
      duration:  /Thời lượng:\s*([^|]+)/,
      soc:       /Tăng SOC:\s*([^|]+)/,
      energy:    /Năng lượng:\s*([^|]+)/,
      timeFee:   /Phí thời gian:\s*([^|]+)/,
      energyFee: /Phí điện năng:\s*([^|]+)/,
      total:     /Tổng(?:\s*phí)?:\s*(.+)/,
    };
    Object.entries(patterns).forEach(([key, regex]) => {
      const match = content.match(regex);
      if (match) info[key] = match[1].trim();
    });
    return Object.keys(info).length > 0 ? info : null;
  };

  /* ── charging detail items ── */
  const CHARGE_ITEMS = [
    { key: "point",     label: "ĐIỂM SẠC",       Icon: PlugZap,    color: "blue" },
    { key: "duration",  label: "THỜI LƯỢNG",      Icon: Clock,      color: "purple" },
    { key: "soc",       label: "TĂNG SOC",        Icon: Battery,    color: "green" },
    { key: "energy",    label: "NĂNG LƯỢNG",      Icon: Zap,        color: "amber" },
    { key: "timeFee",   label: "PHÍ THỜI GIAN",   Icon: DollarSign, color: "cyan", fmt: true },
    { key: "energyFee", label: "PHÍ ĐIỆN NĂNG",   Icon: DollarSign, color: "cyan", fmt: true },
  ];

  /* ══════════ RENDER ══════════ */
  return (
    <div className="dashboard-container">
      <Header />

      {/* ── HERO BANNER ── */}
      <div className="nt-hero">
        <div className="nt-hero-chip">
          <BellRing size={14} /> Trung tâm thông báo
        </div>
        <h1 className="nt-hero-title">Thông Báo</h1>
        <p className="nt-hero-sub">Theo dõi cập nhật và thông tin từ hệ thống</p>

        <div className="nt-counters">
          <div className="nt-counter">
            <div className="nt-counter-num">{loading ? "—" : totalCount}</div>
            <div className="nt-counter-label">Tổng</div>
          </div>
          <div className="nt-counter">
            <div className="nt-counter-num">{loading ? "—" : unreadCount}</div>
            <div className="nt-counter-label">Chưa đọc</div>
          </div>
          <div className="nt-counter">
            <div className="nt-counter-num">{loading ? "—" : readCount}</div>
            <div className="nt-counter-label">Đã đọc</div>
          </div>
        </div>
      </div>

      {/* ── FILTER TABS ── */}
      <div className="nt-tabs">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.key}
            className={`nt-tab ${activeTab === tab.key ? "nt-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className="nt-tab-count">{tabCounts[tab.key]}</span>
          </button>
        ))}
      </div>

      {/* ── NOTIFICATION LIST (META Style) ── */}
      {loading ? (
        <div className="nt-loading">
          <div className="nt-spinner" />
          <p className="nt-loading-text">Đang tải thông báo...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="nt-empty">
          <div className="nt-empty-illustration">
            <div className="nt-empty-bell-wrapper">
              <Bell className="nt-empty-bell-icon" />
            </div>
            <div className="nt-empty-sparkle nt-empty-sparkle--1" />
            <div className="nt-empty-sparkle nt-empty-sparkle--2" />
            <div className="nt-empty-sparkle nt-empty-sparkle--3" />
          </div>
          <p className="nt-empty-title">
            {activeTab === "all" ? "Hộp thư trống" : "Không có kết quả"}
          </p>
          <p className="nt-empty-desc">
            {activeTab === "all"
              ? "Bạn chưa có thông báo nào. Khi đặt lịch sạc hoặc hoàn tất phiên sạc, thông báo sẽ xuất hiện tại đây."
              : `Không có thông báo nào trong mục "${TAB_CONFIG.find(t => t.key === activeTab)?.label}"`}
          </p>
        </div>
      ) : (
        <div className="nt-meta-list">
          {filteredNotifications.map((n) => {
            const { Icon, bg, color } = getTypeInfo(n.type);
            const isUnread = !n.isRead && n.status === "UNREAD";

            return (
              <div
                key={n.notificationId}
                className={`nt-meta-item ${isUnread ? "nt-meta-item--unread" : ""}`}
                onClick={() => handleItemClick(n)}
              >
                {/* ── Left: Circular Icon ── */}
                <div
                  className="nt-meta-avatar"
                  style={{ background: bg, color: color }}
                >
                  <Icon size={22} />
                </div>

                {/* ── Middle: Rich Text + Relative Time ── */}
                <div className="nt-meta-content">
                  <p className="nt-meta-text">
                    <span className="nt-meta-bold">{n.title}</span>
                    {n.contentNoti && <> — {n.contentNoti}</>}
                    {!n.contentNoti && n.content && <> — {n.content}</>}
                  </p>
                  <span className={`nt-meta-time ${isUnread ? "nt-meta-time--unread" : ""}`}>
                    {relativeTime(n.createdAt)}
                  </span>
                </div>

                {/* ── Right: Unread Dot ── */}
                <div className="nt-meta-status">
                  {isUnread && <span className="nt-meta-dot" />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL ── */}
      {selectedNotification && (
        <div className="nt-modal-overlay" onClick={closeModal}>
          <div className="nt-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="nt-modal-header">
              <div className="nt-modal-header-left">
                <div className="nt-modal-header-icon">
                  {(() => {
                    const { Icon } = getTypeInfo(selectedNotification.type);
                    return <Icon size={22} />;
                  })()}
                </div>
                <h3 className="nt-modal-title">{selectedNotification.title}</h3>
              </div>
              <button className="nt-modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="nt-modal-body">
              {(() => {
                if (selectedNotification.type === "CHARGING_COMPLETED") {
                  const raw = selectedNotification.contentNoti || selectedNotification.content;
                  const chargingInfo = raw ? parseChargingContent(raw) : null;
                  if (!chargingInfo) return (
                    <div className="nt-modal-content-block">
                      {raw || "Không có nội dung"}
                    </div>
                  );

                  return (
                    <div className="nt-charge-grid">
                      {CHARGE_ITEMS.map(({ key, label, Icon, color, fmt }) =>
                        chargingInfo[key] ? (
                          <div key={key} className={`nt-charge-item nt-charge-item--${color}`}>
                            <div className="nt-charge-label">
                              <Icon size={14} /> {label}
                            </div>
                            <div className="nt-charge-value">
                              {fmt ? formatMoney(chargingInfo[key]) : chargingInfo[key]}
                            </div>
                          </div>
                        ) : null
                      )}

                      {chargingInfo.total && (
                        <div className="nt-charge-item nt-charge-item--green nt-charge-total">
                          <div className="nt-charge-label">
                            <CreditCard size={14} /> TỔNG THANH TOÁN
                          </div>
                          <div className="nt-charge-value">
                            {formatMoney(chargingInfo.total)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                /* Default content */
                return (
                  <div className="nt-modal-content-block">
                    {selectedNotification.contentNoti || selectedNotification.content || "Không có nội dung"}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="nt-modal-footer">
              <Clock size={15} />
              {new Date(selectedNotification.createdAt).toLocaleString("vi-VN")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}