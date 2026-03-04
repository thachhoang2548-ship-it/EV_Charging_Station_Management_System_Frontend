import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useLogout } from "../../hooks/useAuth.js";
import paths from "../../path/paths.jsx";
import "./AdminNavigate.css"; // Dùng lại CSS giống Admin/Staff

// Icons — dùng lại từ admin/staff
import dashboardIcon from "../../assets/icon/admin/ad_dashboard.png";
import stationIcon   from "../../assets/icon/admin/ad_charging-station.png";
import chargingIcon  from "../../assets/icon/admin/charger_ad.png";
import vehicleIcon   from "../../assets/icon/admin/model_car.png";
import transactionIcon from "../../assets/icon/staff/payment-method.png";
import notifIcon     from "../../assets/icon/admin/statistic.png";
import profileIcon   from "../../assets/icon/admin/manage_user.png";
import bookingIcon   from "../../assets/icon/admin/charging-building.png";
import EVLogoIcon from "../logo/EVLogoIcon.jsx";

const NAV_ITEMS = [
  { path: paths.guide,           icon: dashboardIcon,   label: "Hướng dẫn sử dụng" },
  { path: paths.stations,        icon: stationIcon,     label: "Tìm trạm sạc"    },
  { path: paths.booking,         icon: bookingIcon,     label: "Đặt lịch sạc"    },
  { path: paths.chargingSession, icon: chargingIcon,    label: "Phiên sạc"        },
  { path: paths.transactionHistory, icon: transactionIcon, label: "Giao dịch"    },
  { path: paths.myVehicle,       icon: vehicleIcon,     label: "Xe của tôi"       },
  { path: paths.notifications,   icon: notifIcon,       label: "Thông báo"        },
  { path: paths.profile,         icon: profileIcon,     label: "Hồ sơ"            },
];

export default function DriverSidebarNavigate() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { logout, loading } = useLogout();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) navigate(paths.login);
  };

  return (
    <div className="navContainer">
      {/* ── Brand Header ── */}
      <div className="navBrand">
        <div className="navBrandIcon"><EVLogoIcon className="navBrandIconSvg" strokeWidth={2.5} /></div>
        <div className="navBrandText">
          <span className="navBrandName">EV<span>Charge</span></span>
          <span className="navBrandRole">Driver Portal</span>
        </div>
      </div>

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
            >
              <span className="navIcon">
                <img src={item.icon} alt={item.label} />
              </span>
              <span className="navLabel">{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* ── Footer / Logout ── */}
      <div className="navFooter">
        <button
          className="navLogoutBtn"
          onClick={handleLogout}
          disabled={loading}
        >
          {loading ? "Đang đăng xuất..." : "🚪 Đăng xuất"}
        </button>
      </div>
    </div>
  );
}
