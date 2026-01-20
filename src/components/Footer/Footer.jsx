import React from "react";
import { useNavigate } from "react-router-dom";
import "./Footer.css";
import paths from "../../path/paths";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="cyber-footer">
      {/* Đường kẻ Neon phát sáng ngăn cách */}
      <div className="footer-glow-line"></div>

      <div className="footer-container">
        <div className="footer-grid">
          
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <span className="logo-icon">⚡</span>
              <span className="logo-text">EV<span className="highlight">CHARGE</span></span>
            </div>
            <p className="footer-desc">
              Hệ thống quản lý và vận hành trạm sạc xe điện thông minh hàng đầu Việt Nam. 
              Đồng hành cùng bạn trên mọi nẻo đường xanh.
            </p>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div className="footer-col">
            <h4 className="col-title">Khám phá</h4>
            <ul className="footer-links">
              <li onClick={() => navigate(paths.stations)}>Tìm trạm sạc</li>
              <li onClick={() => navigate(paths.chargingSession)}>Đặt lịch sạc</li>
              <li onClick={() => navigate(paths.profile)}>Hồ sơ lái xe</li>
              <li onClick={() => navigate(paths.stations)}>Bản đồ phủ sóng</li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div className="footer-col">
            <h4 className="col-title">Hỗ trợ</h4>
            <ul className="footer-links">
              <li onClick={() => navigate(paths.rules)}>Quy định & Chính sách</li>
              <li>Trung tâm trợ giúp</li>
              <li>Báo cáo sự cố</li>
              <li>Liên hệ hợp tác</li>
            </ul>
          </div>

          {/* Cột 4: Newsletter / Social */}
          <div className="footer-col">
            <h4 className="col-title">Kết nối</h4>
            <p className="contact-info">Hotline: 01233455678</p>
            <p className="contact-info">Email: Phamvanminh@gmail.com</p>
            {/* <div className="social-icons">
              <span className="social-btn">FB</span>
              <span className="social-btn">IN</span>
              <span className="social-btn">YT</span>
            </div> */}
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 EV Charge System. All rights reserved.</p>
          <div className="legal-links">
            <span>Bảo mật</span>
            <span>Điều khoản</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;