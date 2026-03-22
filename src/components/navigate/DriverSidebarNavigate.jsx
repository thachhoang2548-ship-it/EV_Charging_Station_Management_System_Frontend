import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useLogout } from "../../hooks/useAuth.js";
import paths from "../../path/paths.jsx";
import "./AdminNavigate.css";

// Icons
import dashboardIcon from "../../assets/icon/admin/ad_dashboard.png";
import stationIcon   from "../../assets/icon/admin/ad_charging-station.png";
import chargingIcon  from "../../assets/icon/admin/charger_ad.png";
import vehicleIcon   from "../../assets/icon/admin/model_car.png";
import transactionIcon from "../../assets/icon/staff/payment-method.png";
import notifIcon     from "../../assets/icon/admin/statistic.png";
import profileIcon   from "../../assets/icon/admin/manage_user.png";
import EVLogoIcon from "../logo/EVLogoIcon.jsx";
import { LogOut, Globe } from "lucide-react";

const NAV_ITEMS = [
  { path: paths.guide,           icon: dashboardIcon,   label: "Hướng dẫn sử dụng" },
  { path: paths.stations,        icon: stationIcon,     label: "Trạm sạc & Đặt lịch" },
  { path: paths.chargingSession, icon: chargingIcon,    label: "Phiên sạc"        },
  { path: paths.transactionHistory, icon: transactionIcon, label: "Giao dịch"    },
  { path: paths.myVehicle,       icon: vehicleIcon,     label: "Xe của tôi"       },
  { path: paths.notifications,   icon: notifIcon,       label: "Thông báo"        },
  { path: paths.profile,         icon: profileIcon,     label: "Hồ sơ"            },
];

export default function DriverSidebarNavigate({ onClose }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const { logout, loading } = useLogout();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) navigate(paths.login);
  };

  return (
    <div className="navContainer">
      {/* ── Brand Header — clickable, links to Home ── */}
      <Link to={paths.home} className="navBrand" title="Về trang chủ" onClick={onClose}>
        <div className="navBrandIcon"><EVLogoIcon className="navBrandIconSvg" strokeWidth={2.5} /></div>
        <div className="navBrandText">
          <span className="navBrandName">EV<span>Charge</span></span>
          <span className="navBrandRole">Driver Portal</span>
        </div>
      </Link>

      <div className="navDivider" />

      {/* ── Nav Items ── */}
      <div className="navItems">
        {NAV_ITEMS.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={i}
              to={item.path}
              className={`navItem ${isActive ? "navItemActive" : ""}`}
              title={item.label}
              onClick={onClose}
            >
              <span className="navIcon">
                <img src={item.icon} alt={item.label} />
              </span>
              <span className="navLabel">{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div className="navFooter">
        {/* Về trang chủ — Secondary action */}
        <Link
          to={paths.home}
          className="navBackHomeBtn"
          title="Về trang chủ"
          onClick={onClose}
        >
          <span className="navFooterIcon navFooterIconHome">
            <Globe size={16} />
          </span>
          <span className="navLabel">Về trang chủ</span>
        </Link>

        <div className="navDivider" style={{ margin: "4px 0" }} />

        {/* Đăng xuất */}
        <button
          className="navLogoutBtn"
          onClick={handleLogout}
          disabled={loading}
          title="Đăng xuất"
        >
          <span className="navFooterIcon navFooterIconRed">
            <LogOut size={16} />
          </span>
          <span className="navLabel">{loading ? "Đang đăng xuất..." : "Đăng xuất"}</span>
        </button>
      </div>
    </div>
  );
}
