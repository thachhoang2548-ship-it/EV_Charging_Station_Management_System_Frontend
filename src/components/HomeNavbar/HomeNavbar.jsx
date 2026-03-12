import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLogout } from "../../hooks/useAuth.js";
import paths from "../../path/paths";
import EVLogoIcon from "../logo/EVLogoIcon.jsx";
import { selectIsLoggedIn } from "../../redux/slices/authSlice.js";
import {
  User, LayoutDashboard, CreditCard, LogOut, ChevronDown,
  Menu, X
} from "lucide-react";
import man from "../../assets/icon/man.png";
import girl from "../../assets/icon/girl.png";
import "./HomeNavbar.css";

const NAV_LINKS = [
  { label: "Trang chủ",      path: paths.home,     exact: true },
  { label: "Giới thiệu",     path: paths.about,    exact: true },
  { label: "Bản đồ trạm sạc", path: paths.stations, exact: false },
  { label: "Điều khoản",     path: paths.rules,    exact: true },
];

const HomeNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const { logout, loading: logoutLoading } = useLogout();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ── User info from localStorage ──
  const stored = localStorage.getItem("userDetails");
  const user = stored ? JSON.parse(stored) : null;
  const userName = user?.name || "Người dùng";
  const userGender = user?.gender || "";
  const role = localStorage.getItem("role") || "";

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Close mobile menu on route change ──
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const closeMenu = () => setMenuOpen(false);

  const goHome = () => {
    navigate(paths.home);
    window.scrollTo({ top: 0, behavior: "smooth" });
    closeMenu();
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    const result = await logout();
    if (result.success) navigate(paths.login);
  };

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <header className="tev-nav">
      <div className="tev-nav-inner">
        {/* ══ LEFT: Logo ══ */}
        <div className="tev-logo" onClick={goHome}>
          <div className="tev-logo-icon"><EVLogoIcon /></div>
          <span className="tev-logo-text"><span>EV</span>Charge</span>
        </div>

        {/* ══ CENTER: Nav links ══ */}
        <nav className={`tev-nav-links${menuOpen ? " open" : ""}`}>
          {NAV_LINKS.map((item) => (
            <a
              key={item.path}
              href="#"
              className={`tev-nav-link${isActive(item) ? " active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                if (item.exact && item.path === paths.home) goHome();
                else { navigate(item.path); closeMenu(); }
              }}
            >
              {item.label}
            </a>
          ))}

          {/* Mobile-only actions at bottom of dropdown */}
          <div className="tev-nav-mobile-actions">
            {isLoggedIn ? (
              <>
                <button className="tev-btn-primary" onClick={() => { navigate(paths.guide); closeMenu(); }}>
                  <LayoutDashboard size={16} /> Vào Driver Portal
                </button>
                <button className="tev-btn-ghost" onClick={() => { navigate(paths.profile); closeMenu(); }}>
                  <User size={16} /> Hồ sơ của tôi
                </button>
                <button className="tev-btn-ghost" onClick={() => { navigate(paths.transactionHistory); closeMenu(); }}>
                  <CreditCard size={16} /> Lịch sử giao dịch
                </button>
                <button className="tev-mobile-logout" onClick={handleLogout} disabled={logoutLoading}>
                  <LogOut size={16} /> {logoutLoading ? "Đang đăng xuất..." : "Đăng xuất"}
                </button>
              </>
            ) : (
              <>
                <button className="tev-btn-ghost" onClick={() => { navigate(paths.login); closeMenu(); }}>
                  Đăng nhập
                </button>
                <button className="tev-btn-primary" onClick={() => { navigate(paths.register); closeMenu(); }}>
                  Đăng ký miễn phí
                </button>
              </>
            )}
          </div>
        </nav>

        {/* ══ RIGHT: Auth / User ══ */}
        <div className="tev-nav-actions">
          {isLoggedIn ? (
            /* ── Logged-in: Avatar dropdown ── */
            <div className="tev-user-menu" ref={dropdownRef}>
              <button
                className={`tev-user-trigger${dropdownOpen ? " open" : ""}`}
                onClick={() => setDropdownOpen(v => !v)}
              >
                <img
                  src={userGender === "M" ? man : girl}
                  alt="Avatar"
                  className="tev-user-avatar"
                />
                <span className="tev-user-name">{userName}</span>
                <ChevronDown size={14} className={`tev-chevron${dropdownOpen ? " rotated" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="tev-dropdown">
                  <div className="tev-dropdown-header">
                    <img
                      src={userGender === "M" ? man : girl}
                      alt="Avatar"
                      className="tev-dropdown-avatar"
                    />
                    <div>
                      <div className="tev-dropdown-name">{userName}</div>
                      <div className="tev-dropdown-role">
                        {role === "DRIVER" ? "Tài xế EV" : role || "Người dùng"}
                      </div>
                    </div>
                  </div>

                  <div className="tev-dropdown-divider" />

                  <button className="tev-dropdown-item highlight" onClick={() => { navigate(paths.guide); setDropdownOpen(false); }}>
                    <LayoutDashboard size={16} /> Vào Driver Portal
                  </button>
                  <button className="tev-dropdown-item" onClick={() => { navigate(paths.profile); setDropdownOpen(false); }}>
                    <User size={16} /> Hồ sơ của tôi
                  </button>
                  <button className="tev-dropdown-item" onClick={() => { navigate(paths.transactionHistory); setDropdownOpen(false); }}>
                    <CreditCard size={16} /> Lịch sử giao dịch
                  </button>

                  <div className="tev-dropdown-divider" />

                  <button className="tev-dropdown-item logout" onClick={handleLogout} disabled={logoutLoading}>
                    <LogOut size={16} /> {logoutLoading ? "Đang đăng xuất..." : "Đăng xuất"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Guest: Login + Register ── */
            <>
              <button className="tev-btn-ghost" onClick={() => navigate(paths.login)}>
                Đăng nhập
              </button>
              <button className="tev-btn-primary" onClick={() => navigate(paths.register)}>
                Đăng ký miễn phí
              </button>
            </>
          )}

          {/* Hamburger — mobile only */}
          <button
            className={`tev-hamburger${menuOpen ? " active" : ""}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && <div className="tev-nav-backdrop" onClick={closeMenu} />}
    </header>
  );
};

export default HomeNavbar;
