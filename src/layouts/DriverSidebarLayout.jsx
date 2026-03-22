import { useState, useEffect } from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import DriverSidebarNavigate from "../components/navigate/DriverSidebarNavigate.jsx";
import paths from "../path/paths.jsx";
import EVLogoIcon from "../components/logo/EVLogoIcon.jsx";
import { Menu, X, Home, MapPin, Zap, User } from "lucide-react";
import "./DriverSidebarLayout.css";

// Bottom Nav: 4 tab chính cho mobile
const BOTTOM_TABS = [
  { path: paths.guide,           icon: Home,   label: "Trang chủ" },
  { path: paths.stations,        icon: MapPin, label: "Trạm sạc"  },
  { path: paths.chargingSession, icon: Zap,    label: "Phiên sạc"  },
  { path: paths.profile,         icon: User,   label: "Hồ sơ"      },
];

export default function DriverSidebarLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Tự đóng drawer khi chuyển trang
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Chặn scroll body khi drawer mở
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <div className="driver-sidebar-layout">
      {/* ══════════ MOBILE HEADER (< 1024px) ══════════ */}
      <header className="mobile-header">
        <button
          className="mobile-header-hamburger"
          onClick={() => setDrawerOpen(true)}
          aria-label="Mở menu"
        >
          <Menu size={22} />
        </button>

        <Link to={paths.home} className="mobile-header-brand">
          <EVLogoIcon className="mobile-header-logo-svg" strokeWidth={2.5} />
          <span className="mobile-header-title">EV<span>Charge</span></span>
        </Link>

        {/* Home icon — quick access to landing page */}
        <Link to={paths.home} className="mobile-header-home" aria-label="Về trang chủ">
          <Home size={20} />
        </Link>
      </header>

      {/* ══════════ DRAWER OVERLAY ══════════ */}
      <div
        className={`drawer-overlay ${drawerOpen ? "drawer-overlay--visible" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ══════════ SIDEBAR / DRAWER ══════════ */}
      <aside className={`driver-sidebar ${drawerOpen ? "driver-sidebar--open" : ""}`}>
        {/* Nút đóng drawer (chỉ hiển thị trên mobile) */}
        <button
          className="drawer-close-btn"
          onClick={() => setDrawerOpen(false)}
          aria-label="Đóng menu"
        >
          <X size={20} />
        </button>
        <DriverSidebarNavigate onClose={() => setDrawerOpen(false)} />
      </aside>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <main className="driver-sidebar-main">
        <Outlet />
      </main>

      {/* ══════════ BOTTOM NAV BAR (< 1024px) ══════════ */}
      <nav className="bottom-nav">
        {BOTTOM_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={`bottom-nav-item ${isActive ? "bottom-nav-item--active" : ""}`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="bottom-nav-label">{tab.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
