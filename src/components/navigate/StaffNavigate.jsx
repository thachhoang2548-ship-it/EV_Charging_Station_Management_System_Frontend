import dashboard from "../../assets/icon/staff/dashboard.png";
import charging from "../../assets/icon/staff/charging-station.png";
import accident from "../../assets/icon/staff/incident-report.png";
import transition from "../../assets/icon/staff/payment-method.png";
import incident from "../../assets/icon/admin/incident.png";
import { NavLink, useLocation } from "react-router-dom";
import "./AdminNavigate.css";
import { useNavigate } from "react-router-dom";
import paths from "../../path/paths.jsx";
import { useLogout } from '../../hooks/useAuth.js';

export default function StaffNavigate() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, loading } = useLogout();

    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
          navigate(paths.login);
        }
      };

    const navItems = [
    {
      path: paths.staffDashboard,
      icon: dashboard,
      label: "Bảng điều khiển",
    },
    {
      path: paths.manageSessionCharging,
      icon: charging,
      label: "Quản lý phiên sạc",
    },
    {
      path: paths.manageTransaction,
      icon: transition,
      label: "Quản lý giao dịch",
    },
    {
      path: paths.reportAccidents,
      icon: accident,
      label: "Báo cáo sự cố",
    },
    {
      path: paths.incidents,
      icon: incident,
      label: "Xử lý phạt",
    },
  ];

  return (
      <div className="navContainer">
        {/* Brand Header */}
        <div className="navBrand">
          <div className="navBrandIcon">⚡</div>
          <div className="navBrandText">
            <span className="navBrandName">EV<span>Charge</span></span>
            <span className="navBrandRole">Staff Portal</span>
          </div>
        </div>

        <div className="navDivider" />

        {/* Nav Items */}
        <div className="navItems">
          {navItems.map((item, index) => {
            const isHomeActive = item.path === "/" && location.pathname === "/";
            const isOtherActive =
              item.path !== "/" && location.pathname === item.path;
            const isActive = isHomeActive || isOtherActive;

            return (
              <NavLink
                key={index}
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

        {/* Footer / Logout */}
        <div className="navFooter">
          <button
            className="navLogoutBtn"
            onClick={handleLogout}
            disabled={loading}
          >
            {loading ? '⏳ Đang đăng xuất...' : '↩ Đăng xuất'}
          </button>
        </div>
      </div>
  );
}
