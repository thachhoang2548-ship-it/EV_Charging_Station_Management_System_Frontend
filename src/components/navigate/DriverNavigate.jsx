import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./DriverNavigate.css";

// Import Icons
import homeIcon from "../../assets/logo/home.png";
import ruleIcon from "../../assets/logo/rule.png";
import stationsIcon from "../../assets/logo/chargingStation.png";
import bookingIcon from "../../assets/logo/booking.png";
import profileIcon from "../../assets/logo/user.png";

import paths from "../../path/paths.jsx";
import { isAuthenticated } from "../../utils/authUtils.js";
import NotificationBell from "../NotificationBell/NotificationBell";

export default function AppNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = useSelector(isAuthenticated);
  
  // State quản lý trạng thái cuộn trang
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Tìm container scroll chính (driver-layout-large hoặc driver-layout-main)
      const scrollContainer = document.querySelector('.driver-layout-large') || 
                             document.querySelector('.driver-layout-mobile') ||
                             document.querySelector('.driver-layout-main');
      
      if (scrollContainer) {
        const scrollTop = scrollContainer.scrollTop;
        setIsScrolled(scrollTop > 50);
      } else {
        // Fallback về window scroll nếu không tìm thấy container
        setIsScrolled(window.scrollY > 50);
      }
    };

    // Lắng nghe scroll từ container chính
    const scrollContainer = document.querySelector('.driver-layout-large') || 
                           document.querySelector('.driver-layout-mobile') ||
                           document.querySelector('.driver-layout-main');
    
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    } else {
      // Fallback về window
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Khi đã đăng nhập: home icon trỏ vào /driver dashboard
  // Khi chưa đăng nhập: home icon trỏ vào / (trang chủ công khai)
  const homeNavPath = isLoggedIn ? paths.driverDashboard : paths.home;

  const navItems = [
    { path: homeNavPath, icon: homeIcon, label: isLoggedIn ? "Dashboard" : "Trang chủ" },
    { path: paths.stations, icon: stationsIcon, label: "Trạm sạc" },
    { path: paths.chargingSession, icon: bookingIcon, label: "Phiên sạc" },
    { path: paths.rules, icon: ruleIcon, label: "Điều khoản" },
    { path: paths.profile, icon: profileIcon, label: "Hồ sơ" },
  ];

  return (
    <header className={`modern-header ${isScrolled ? "scrolled" : ""}`}>
      <div className="header-container">
        {/* 1. LOGO AREA (Chỉ hiện trên Desktop) */}
        <div className="brand-logo" onClick={() => navigate(homeNavPath)}>
          <span className="logo-icon">⚡</span>
          <span className="logo-text">EV<span className="highlight">CHARGE</span></span>
        </div>

        {/* 2. NAVIGATION LINKS */}
        <nav className="nav-links">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={index}
                to={item.path}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                {/* Icon chỉ hiện ở mobile hoặc style nhỏ */}
                <img src={item.icon} alt={item.label} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* 3. UTILITY AREA (Login/Noti) */}
        <div className="header-actions">
          {isLoggedIn ? (
            <div className="notification-wrapper">
              <NotificationBell />
            </div>
          ) : (
            <button className="btn-login" onClick={() => navigate(paths.login)}>
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  );
}