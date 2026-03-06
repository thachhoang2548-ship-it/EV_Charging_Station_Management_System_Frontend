import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../utils/authUtils.js";
import { toast } from "react-toastify";
import { useLogout } from "../../hooks/useAuth.js";
import paths from "../../path/paths.jsx";
import girl from "../../assets/icon/girl.png";
import man from "../../assets/icon/man.png";
import Header from "../../components/admin/Header.jsx";
import "../admin/Dashboard.css";
import "./Profile.css";
import { User, Car, CreditCard, LogOut, ChevronRight, Shield, Zap } from "lucide-react";

const MENU_ITEMS = [
  {
    label: "Thông tin chi tiết",
    desc: "Xem và chỉnh sửa hồ sơ cá nhân",
    icon: User,
    color: "green",
    path: "information",
  },
  {
    label: "Phương tiện của tôi",
    desc: "Quản lý xe điện đã đăng ký",
    icon: Car,
    color: "blue",
    path: "myVehicle",
  },
  {
    label: "Lịch sử thanh toán",
    desc: "Tra cứu giao dịch và hóa đơn",
    icon: CreditCard,
    color: "amber",
    path: "transactionHistory",
  },
];

export default function Profile() {
  const navigate = useNavigate();
  const stored = localStorage.getItem("userDetails");
  const { name, email, phoneNumber, gender, createdAt } = stored
    ? JSON.parse(stored)
    : {};
  const { logout, loading } = useLogout();

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.warning("Bạn chưa đăng nhập. Vui lòng đăng nhập để có thể đặt chỗ!", {
        position: "top-center",
        autoClose: 3000,
      });
      navigate(paths.login);
    }
  }, [navigate]);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) navigate(paths.login);
  };

  /* helper: membership year */
  const memberYear = createdAt
    ? new Date(createdAt).getFullYear()
    : new Date().getFullYear();

  if (!isAuthenticated()) {
    return <p className="pf-auth-check">Đang kiểm tra trạng thái đăng nhập...</p>;
  }

  return (
    <div className="dashboard-container">
      <Header />

      {/* ── HERO BANNER ── */}
      <div className="pf-hero">
        <p className="pf-hero-title">
          <Zap size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
          Tài khoản EVCharge
        </p>
      </div>

      {/* ── MAIN CARD ── */}
      <div className="pf-card">
        {/* Identity */}
        <div className="pf-identity">
          <div className="pf-avatar-ring">
            <img
              src={gender === "M" ? man : girl}
              alt="Profile"
              className="pf-avatar"
            />
          </div>
          <h2 className="pf-user-name">{name}</h2>
          {email && phoneNumber && (
            <p className="pf-user-contact">
              {email} &middot; {phoneNumber}
            </p>
          )}
          <span className="pf-badge">
            <Shield size={12} />
            Thành viên từ {memberYear}
          </span>
        </div>

        {/* Menu */}
        <div className="pf-menu">
          {MENU_ITEMS.map((item, i) => (
            <div
              key={i}
              className="pf-menu-item"
              onClick={() => navigate(paths[item.path])}
            >
              <span className={`pf-menu-icon ${item.color}`}>
                <item.icon size={20} />
              </span>
              <div className="pf-menu-text">
                <span className="pf-menu-label">{item.label}</span>
                <span className="pf-menu-desc">{item.desc}</span>
              </div>
              <ChevronRight size={18} className="pf-menu-arrow" />
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="pf-logout-wrap">
          <button className="pf-logout-btn" onClick={handleLogout} disabled={loading}>
            <LogOut size={16} />
            {loading ? "Đang đăng xuất..." : "Đăng xuất"}
          </button>
        </div>
      </div>
    </div>
  );
}
