import React from "react";
import { Link, useLocation } from "react-router-dom";
import paths from "../../path/paths.jsx";
import "./PortalBottomNav.css";

// STAFF Icons
import dashboardStaff from "../../assets/icon/staff/dashboard.png";
import chargingStaff from "../../assets/icon/staff/charging-station.png";
import accidentStaff from "../../assets/icon/staff/incident-report.png";
import transitionStaff from "../../assets/icon/staff/payment-method.png";
import incidentAdmin from "../../assets/icon/admin/incident.png";

// ADMIN Icons
import userAdmin from "../../assets/icon/admin/manage_user.png";
import modelAdmin from "../../assets/icon/admin/model_car.png";
import dashboardAdmin from "../../assets/icon/admin/ad_dashboard.png";
import accidentAdmin from "../../assets/icon/admin/accident.png";
import stationAdmin from "../../assets/icon/admin/ad_charging-station.png";
import chargerAdmin from "../../assets/icon/admin/charger_ad.png";
import priceAdmin from "../../assets/icon/admin/best-price.png";
import policyAdmin from "../../assets/icon/admin/policy.png";
import chargingPointAdmin from "../../assets/icon/admin/charging-building.png";

export default function PortalBottomNav() {
  const role = localStorage.getItem("role");
  const location = useLocation();

  const staffItems = [
    { path: paths.staffDashboard, icon: dashboardStaff, label: "Dashboard" },
    { path: paths.manageSessionCharging, icon: chargingStaff, label: "Phiên sạc" },
    { path: paths.manageTransaction, icon: transitionStaff, label: "Giao dịch" },
    { path: paths.reportAccidents, icon: accidentStaff, label: "Sự cố" },
  ];

  const adminItems = [
    { path: paths.adminDashboard, icon: dashboardAdmin, label: "Dashboard" },
    { path: paths.userManagement, icon: userAdmin, label: "Người dùng" },
    { path: paths.stationManagement, icon: stationAdmin, label: "Trạm sạc" },
    { path: paths.accidentReports, icon: accidentAdmin, label: "Sự cố" },
  ];

  const navItems = role === "ADMIN" ? adminItems : role === "STAFF" ? staffItems : [];

  if (navItems.length === 0) return null;

  return (
    <nav className="portal-bottom-nav">
      <div className="portal-bn-scroll">
        {navItems.map((item, index) => {
          const isHomeActive = item.path === "/" && location.pathname === "/";
          const isOtherActive = item.path !== "/" && location.pathname === item.path;
          const isActive = isHomeActive || isOtherActive;

          return (
            <Link
              key={index}
              to={item.path}
              className={`portal-bn-item ${isActive ? "active" : ""}`}
            >
              <img src={item.icon} alt={item.label} className="portal-bn-icon" />
              <span className="portal-bn-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
