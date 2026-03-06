import { useState, useEffect } from "react";
import {
  getNotificationsApi,
  markNotificationAsReadApi,
} from "../../api/driverApi.js";
import { toast } from "react-toastify";
import NotificationCard from "../../components/driver/NotifiationCard.jsx";
import Header from "../../components/admin/Header.jsx";
import "../admin/Dashboard.css";
import "./Notification.css";
import {
  Bell, BellRing, Zap, PlugZap, Clock, Battery,
  DollarSign, CreditCard, X, Info, Inbox,
} from "lucide-react";

/* --- type helpers (same as Card) --- */
const TYPE_MAP = {
  CHARGING_COMPLETED: { Icon: Zap, cls: "charging" },
  SYSTEM:             { Icon: Info, cls: "system" },
  WARNING:            { Icon: Info, cls: "warning" },
};
const getTypeInfo = (type) => TYPE_MAP[type] || { Icon: Info, cls: "default" };

/* --- tabs config --- */
const TAB_CONFIG = [
  { key: "all",      label: "Tất cả" },
  { key: "unread",   label: "Chưa đọc" },
  { key: "read",     label: "Đã đọc" },
  { key: "charging", label: "Sạc điện" },
];

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotificationsApi();
      if (response.success) {
        setNotifications(response.data.content || []);
      }
    } catch (error) {
      console.error("Failed to fetch my notifications:", error);
      toast.error("Không thể tải danh sách thông báo!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  /* --- format money --- */
  const formatMoney = (value) => {
    if (!value) return "";
    const number = parseFloat(value.replace(/[^\d.-]/g, ""));
    if (isNaN(number)) return value;
    return number.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    });
  };

  /* --- mark as read (optimistic) --- */
  const handleReaded = async (notification) => {
    if (notification.isRead) return;

    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationId === notification.notificationId
          ? { ...n, isRead: true }
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
              ? { ...n, isRead: false }
              : n
          )
        );
      }
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
      toast.error("Lỗi khi đánh dấu đã đọc.");
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notification.notificationId
            ? { ...n, isRead: false }
            : n
        )
      );
    }
  };

  /* --- sort --- */
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  /* --- filter by tab --- */
  const filteredNotifications = sortedNotifications.filter((n) => {
    if (activeTab === "unread")   return !n.isRead && n.status === "UNREAD";
    if (activeTab === "read")     return n.isRead || n.status !== "UNREAD";
    if (activeTab === "charging") return n.type === "CHARGING_COMPLETED";
    return true;
  });

  /* --- derived stats --- */
  const totalCount  = notifications.length;
  const unreadCount = notifications.filter((n) => !n.isRead && n.status === "UNREAD").length;
  const readCount   = totalCount - unreadCount;

  /* --- tab counts --- */
  const tabCounts = {
    all:      totalCount,
    unread:   unreadCount,
    read:     readCount,
    charging: notifications.filter((n) => n.type === "CHARGING_COMPLETED").length,
  };

  /* --- card click -> open modal --- */
  const handleCardClick = (notification) => {
    setSelectedNotification(notification);
    if (notification.status === "UNREAD") {
      handleReaded(notification);
    }
  };

  const closeModal = () => setSelectedNotification(null);

  /* --- parse charging content --- */
  const parseChargingContent = (content) => {
    const info = {};
    const patterns = {
      point:     /Điểm sạc:\s*([^|]+)/,
      duration:  /Thời lượng:\s*([^|]+)/,
      soc:       /Tăng SOC:\s*([^|]+)/,
      energy:    /Năng lượng:\s*([^|]+)/,
      timeFee:   /Phí thời gian:\s*([^|]+)/,
      energyFee: /Phí điện năng:\s*([^|]+)/,
      total:     /Tổng:\s*(.+)/,
    };
    Object.entries(patterns).forEach(([key, regex]) => {
      const match = content.match(regex);
      if (match) info[key] = match[1].trim();
    });
    return Object.keys(info).length > 0 ? info : null;
  };

  /* --- charging info items config --- */
  const CHARGE_ITEMS = [
    { key: "point",     label: "ĐIỂM SẠC",       Icon: PlugZap,    color: "blue" },
    { key: "duration",  label: "THỜI LƯỢNG",     Icon: Clock,      color: "purple" },
    { key: "soc",       label: "TĂNG SOC",                  Icon: Battery,    color: "green" },
    { key: "energy",    label: "NĂNG LƯỢNG",      Icon: Zap,        color: "amber" },
    { key: "timeFee",   label: "PHÍ THỜI GIAN",       Icon: DollarSign,  color: "cyan", fmt: true },
    { key: "energyFee", label: "PHÍ ĐIỆN NĂNG", Icon: DollarSign, color: "cyan", fmt: true },
  ];

  /* ========== RENDER ========== */
  return (
    <div className="dashboard-container">
      <Header />

      {/* -- HERO BANNER -- */}
      <div className="nt-hero">
        <div className="nt-hero-chip">
          <BellRing size={14} /> Trung tâm thông báo
        </div>
        <h1 className="nt-hero-title">Thông Báo</h1>
        <p className="nt-hero-sub">Theo dõi cập nhật và thông tin từ hệ thống</p>

        {/* Glass counters */}
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

      {/* -- FILTER TABS -- */}
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

      {/* -- CONTENT -- */}
      {loading ? (
        <div className="nt-loading">
          <div className="nt-spinner" />
          <p className="nt-loading-text">Đang tải thông báo...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="nt-empty">
          <Inbox className="nt-empty-icon" />
          <p className="nt-empty-title">Không có thông báo nào</p>
          <p className="nt-empty-desc">
            {activeTab === "all"
              ? "Bạn chưa có thông báo nào từ hệ thống"
              : "Không có thông báo phù hợp với bộ lọc"}
          </p>
        </div>
      ) : (
        <div className="nt-list">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.notificationId}
              onClick={() => handleCardClick(notification)}
            >
              <NotificationCard
                notification={notification}
                onSelect={handleReaded}
              />
            </div>
          ))}
        </div>
      )}

      {/* -- MODAL -- */}
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
                  const chargingInfo = parseChargingContent(selectedNotification.content);
                  if (!chargingInfo) return null;

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

                      {/* Total */}
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
                    {selectedNotification.content}
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