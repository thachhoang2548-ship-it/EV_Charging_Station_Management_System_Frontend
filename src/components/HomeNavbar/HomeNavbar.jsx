import React from "react";
import { useNavigate } from "react-router-dom";
import paths from "../../path/paths";
import "./HomeNavbar.css";

const HomeNavbar = () => {
  const navigate = useNavigate();

  return (
    <header className="tev-nav">
      <div className="tev-nav-inner">
        <div className="tev-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="tev-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="tev-logo-text">Trạm<span>EV</span></span>
        </div>

        <nav className="tev-nav-links">
          <a href="#" className="tev-nav-link active">Trang chủ</a>
          <a href="#" className="tev-nav-link" onClick={() => navigate(paths.stations)}>Bản đồ trạm sạc</a>
          <a href="#" className="tev-nav-link">Cộng đồng</a>
          <a href="#" className="tev-nav-link" onClick={() => navigate(paths.rules)}>Hỗ trợ</a>
        </nav>

        <div className="tev-nav-actions">
          <button className="tev-btn-ghost" onClick={() => navigate(paths.login)}>Đăng nhập</button>
          <button className="tev-btn-primary" onClick={() => navigate(paths.register)}>Đăng ký miễn phí</button>
        </div>
      </div>
    </header>
  );
};

export default HomeNavbar;
