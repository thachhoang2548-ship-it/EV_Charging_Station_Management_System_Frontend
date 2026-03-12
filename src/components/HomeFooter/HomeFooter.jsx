import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsLoggedIn } from "../../redux/slices/authSlice";
import paths from "../../path/paths";
import "./HomeFooter.css";

const HomeFooter = () => {
  const navigate = useNavigate();
  const isLoggedIn = useSelector(selectIsLoggedIn);

  const handleProtectedNavigate = (targetPath) => {
    if (isLoggedIn) {
      navigate(targetPath);
    } else {
      navigate(paths.login, { state: { from: { pathname: targetPath } } });
    }
  };

  return (
    <footer className="tev-footer">
      {/* Glow line */}
      <div className="tev-footer-glow" />

      <div className="tev-footer-top">
        <div className="tev-footer-grid">

          {/* Cột 1 — Thương hiệu */}
          <div className="tev-footer-brand">
            <div className="tev-footer-logo" onClick={() => navigate(paths.home)}>
              <div className="tev-footer-logo-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="tev-footer-logo-text">Trạm<span>EV</span></span>
            </div>
            <p className="tev-footer-desc">
              Cộng đồng người dùng trạm sạc xe điện công cộng lớn nhất Việt Nam.
              Kết nối, chia sẻ và cùng nhau xây dựng tương lai giao thông xanh.
            </p>
            <div className="tev-footer-socials">
              <a className="tev-social-btn" href="#" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
              <a className="tev-social-btn" href="#" aria-label="Zalo">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <circle cx="12" cy="12" r="10"/>
                  <path fill="#fff" d="M8 9h1.5l1 2.5L11 9h1.5l-2 6H9l-.5-1.5H7l-.5 1.5H5zm8 0v4h1v1.5H14V9zm-4 4.5c-.5 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1z"/>
                </svg>
              </a>
              <a className="tev-social-btn" href="#" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/>
                  <polygon fill="#fff" points="9.75,15.02 15.5,12 9.75,8.98"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Cột 2 — Khám phá */}
          <div className="tev-footer-col">
            <h4>Khám phá</h4>
            <ul className="tev-footer-links">
              <li onClick={() => navigate(paths.stations)}>Bản đồ trạm sạc</li>
              <li onClick={() => navigate(paths.chargingSession)}>Đặt lịch sạc</li>
              <li onClick={() => navigate(paths.profile)}>Hồ sơ lái xe</li>
              <li onClick={() => navigate(paths.booking)}>Lịch đặt của tôi</li>
              <li onClick={() => navigate(paths.transactionHistory)}>Lịch sử giao dịch</li>
            </ul>
          </div>

          {/* Cột 3 — Hỗ trợ */}
          <div className="tev-footer-col">
            <h4>Hỗ trợ</h4>
            <ul className="tev-footer-links">
              <li onClick={() => navigate(paths.rules)}>Quy định & Chính sách</li>
              <li onClick={() => handleProtectedNavigate(paths.guide)}>Hướng dẫn sử dụng</li>
              <li>Câu hỏi thường gặp</li>
            </ul>
          </div>

          {/* Cột 4 — Liên hệ */}
          <div className="tev-footer-col">
            <h4>Liên hệ</h4>
            <div className="tev-footer-contact">
              <div className="tev-contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.99 1.18 2 2 0 013 .01h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 6.91a16 16 0 006 6l.25-.25c.59-.59 1.4-.78 2.11-.45a12.84 12.84 0 002.81.7A2 2 0 0121.99 15z"/>
                </svg>
                <span>0772 882 174</span>
              </div>
              <div className="tev-contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>support@evcharge.vn</span>
              </div>
              <div className="tev-contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                <span>Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="tev-footer-bottom">
        <div className="tev-footer-container tev-footer-bottom-inner">
          <p style={{ color: "#64748b" }}>© 2026 EVCharge. Tất cả quyền được bảo lưu.</p>
          <div className="tev-footer-legal">
            <span>Chính sách bảo mật</span>
            <span className="tev-footer-dot">·</span>
            <span>Điều khoản sử dụng</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
