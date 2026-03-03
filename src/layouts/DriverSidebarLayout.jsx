import { Outlet } from "react-router-dom";
import DriverSidebarNavigate from "../components/navigate/DriverSidebarNavigate.jsx";
import "./DriverSidebarLayout.css";

export default function DriverSidebarLayout() {
  return (
    <div className="driver-sidebar-layout">
      <aside className="driver-sidebar">
        <DriverSidebarNavigate />
      </aside>
      <main className="driver-sidebar-main">
        <Outlet />
      </main>
    </div>
  );
}
