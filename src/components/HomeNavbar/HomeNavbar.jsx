import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import paths from "../../path/paths";
import EVLogoIcon from "../logo/EVLogoIcon.jsx";
import "./HomeNavbar.css";

const HomeNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const goHome = () => {
    navigate(paths.home);
    window.scrollTo({ top: 0, behavior: "smooth" });
    closeMenu();
  };

  const isHomeActive = location.pathname === paths.home;
  const isAboutActive = location.pathname === paths.about;
  const isStationsActive = location.pathname.startsWith(paths.stations);
  const isRulesActive = location.pathname === paths.rules;

  return (
    <header className="tev-nav">
      <div className="tev-nav-inner">
        <div className="tev-logo" onClick={goHome}>
          <div className="tev-logo-icon">
            <EVLogoIcon />
          </div>
          <span className="tev-logo-text"><span>EV</span>Charge</span>
        </div>

        <nav className={`tev-nav-links${menuOpen ? " open" : ""}`}>
          <a
            href="#"
            className={`tev-nav-link${isHomeActive ? " active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              goHome();
            }}
          >
            Trang chủ
          </a>
          <a
            href="#"
            className={`tev-nav-link${isAboutActive ? " active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(paths.about);
              closeMenu();
            }}
          >
            Giới thiệu
          </a>
          <a
            href="#"
            className={`tev-nav-link${isStationsActive ? " active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(paths.stations);
              closeMenu();
            }}
          >
            Bản đồ trạm sạc
          </a>
          <a
            href="#"
            className={`tev-nav-link${isRulesActive ? " active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(paths.rules);
              closeMenu();
            }}
          >
            Điều khoản
          </a>
          <div className="tev-nav-mobile-actions">
            <button className="tev-btn-ghost" onClick={() => { navigate(paths.login); closeMenu(); }}>Đăng nhập</button>
            <button className="tev-btn-primary" onClick={() => { navigate(paths.register); closeMenu(); }}>Đăng ký miễn phí</button>
          </div>
        </nav>

        <div className="tev-nav-actions">
          <button className="tev-btn-ghost" onClick={() => navigate(paths.login)}>Đăng nhập</button>
          <button className="tev-btn-primary" onClick={() => navigate(paths.register)}>Đăng ký miễn phí</button>
          <button
            className={`tev-hamburger${menuOpen ? " active" : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {menuOpen && <div className="tev-nav-backdrop" onClick={closeMenu} />}
    </header>
  );
};

export default HomeNavbar;
