import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import AdminNavigate from "../components/navigate/AdminNavigate";
import StaffNavigate from "../components/navigate/StaffNavigate.jsx";
import PortalBottomNav from "../components/navigate/PortalBottomNav.jsx";
import EVLogoIcon from "../components/logo/EVLogoIcon.jsx";
import "./AdminLayout.css";

export default function AdminLayout() {
  const role = localStorage.getItem("role");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="admin-layout">
      {/* Desktop Sidebar */}
      <aside className="admin-sidebar admin-sidebar-desktop">
        {role === "ADMIN" && <AdminNavigate onNavClick={closeMobileSidebar} />}
        {role === "STAFF" && <StaffNavigate onNavClick={closeMobileSidebar} />}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={closeMobileSidebar}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`admin-sidebar admin-sidebar-mobile ${isMobileSidebarOpen ? "open" : ""}`}
      >
        {role === "ADMIN" && <AdminNavigate onNavClick={closeMobileSidebar} />}
        {role === "STAFF" && <StaffNavigate onNavClick={closeMobileSidebar} />}
      </aside>

      {/* Mobile Top Header - chứa Logo + Hamburger Button */}
      <header className="admin-mobile-header">
        <div 
          className="admin-mobile-header-logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          <div className="admin-mobile-header-icon">
            <EVLogoIcon strokeWidth={2.5} />
          </div>
          <div className="admin-mobile-header-text-group">
            <span className="admin-mobile-header-text">
              EV<strong>Charge</strong>
            </span>
            <span className="admin-mobile-header-role">
              {role === "ADMIN" ? "Admin Portal" : "Staff Portal"}
            </span>
          </div>
        </div>
        <button
          className={`admin-hamburger-btn ${isMobileSidebarOpen ? "active" : ""}`}
          onClick={toggleMobileSidebar}
          aria-label="Toggle Menu"
          aria-expanded={isMobileSidebarOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="admin-main">
        <Outlet />
      </main>

      <PortalBottomNav />
    </div>
  );
}
