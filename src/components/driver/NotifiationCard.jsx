import { Clock, Zap, Info, AlertTriangle, CheckCircle2 } from "lucide-react";

/* --- helpers --- */
const TYPE_CONFIG = {
  CHARGING_COMPLETED: { label: "Sạc xong",  cls: "charging", Icon: Zap },
  SYSTEM:             { label: "Hệ thống", cls: "system",   Icon: Info },
  WARNING:            { label: "Cảnh báo",  cls: "warning",  Icon: AlertTriangle },
};

const getType = (type) => TYPE_CONFIG[type] || { label: "Thông báo", cls: "default", Icon: Info };

const formatDate = (raw) => {
  if (!raw) return "";
  const d = new Date(raw);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function NotificationCard({ notification, onSelect }) {
  const { label, cls, Icon } = getType(notification.type);
  const isUnread = notification.status === "UNREAD" || !notification.isRead;

  const handleMarkAsRead = (e) => {
    e.stopPropagation();
    if (onSelect) onSelect(notification);
  };

  return (
    <div className={`nt-card ${isUnread ? "nt-card--unread" : ""}`}>
      {/* Accent bar */}
      <div className={`nt-card-accent nt-card-accent--${cls}`} />

      {/* Body */}
      <div className="nt-card-body">
        {/* Header: type chip + unread dot */}
        <div className="nt-card-header">
          <span className={`nt-card-type nt-card-type--${cls}`}>
            <Icon size={12} />
            {label}
          </span>
          {isUnread && <span className="nt-card-unread-dot" />}
        </div>

        {/* Title */}
        <div className="nt-card-title">{notification.title}</div>

        {/* Content preview */}
        <div className="nt-card-content">{notification.content}</div>

        {/* Footer: time + mark-read button */}
        <div className="nt-card-footer">
          <span className="nt-card-time">
            <Clock size={13} />
            {formatDate(notification.createdAt)}
          </span>
          {isUnread && (
            <button className="nt-card-read-btn" onClick={handleMarkAsRead}>
              <CheckCircle2 size={13} />
              Đã đọc
            </button>
          )}
        </div>
      </div>
    </div>
  );
}