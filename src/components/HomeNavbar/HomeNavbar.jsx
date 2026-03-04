import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import paths from "../../path/paths";
import EVLogoIcon from "../logo/EVLogoIcon.jsx";
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
            <EVLogoIcon />
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
