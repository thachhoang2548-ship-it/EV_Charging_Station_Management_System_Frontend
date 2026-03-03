import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import paths from "../../path/paths";
import "./HomeNavbar.css";

const HomeNavbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="tev-nav">
      <div className="tev-nav-inner">
        <div className="tev-logo" onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); closeMenu(); }}>
          <div className="tev-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="tev-logo-text"><span>EV</span>Charge</span>
        </div>

        <nav className={`tev-nav-links${menuOpen ? " open" : ""}`}>
          <a href="#" className="tev-nav-link active" onClick={closeMenu}>Trang chủ</a>
          <a href="#" className="tev-nav-link" onClick={() => { navigate(paths.stations); closeMenu(); }}>Bản đồ trạm sạc</a>
          <a href="#" className="tev-nav-link" onClick={closeMenu}>Cộng đồng</a>
          <a href="#" className="tev-nav-link" onClick={() => { navigate(paths.rules); closeMenu(); }}>Hỗ trợ</a>
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
