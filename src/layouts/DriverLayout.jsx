import AppNavigation from "../components/navigate/DriverNavigate.jsx";
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import HomeNavbar from "../components/HomeNavbar/HomeNavbar.jsx";
import ErrorBoundary from "../components/ErrorBoundary.jsx";
import paths from "../path/paths.jsx";
import "./DriverLayout.css";

export default function DriverLayout() {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const authPaths = [
    paths.home,
    paths.about,
    paths.login,
    paths.register,
    paths.verify,
    paths.forgotPassword,
    paths.resetPassword,
    paths.paymentSuccess,
    paths.paymentFailed,
    paths.rules,
    paths.privacyPolicy,
    paths.stations,
  ];
  const isAuthRoute =
    authPaths.includes(location.pathname) ||
    location.pathname.startsWith("/stations/");

  function MainLayoutLarge() {
    return (
      <div className="driver-layout-large">
        <header className="driver-layout-header">
          <AppNavigation />
        </header>

        <main className="driver-layout-main">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    );
  }

  // Layout cho màn hình NHỎ (Mobile) - Navigation ở DƯỚI
  function MainLayout() {
    return (
      <div className="driver-layout-mobile">
        <main className="driver-layout-main">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>

        <footer className="driver-layout-footer">
          <AppNavigation />
        </footer>
      </div>
    );
  }

  // Logic kiểm tra kích thước màn hình
  useEffect(() => {
    const checkScreenSize = () => {
      // 768px là breakpoint phổ biến cho mobile
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (isAuthRoute) {
    return (
      <div className="driver-layout-auth">
        <HomeNavbar />
        <main className="driver-layout-auth-main">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    );
  }

  // Render layout phù hợp
  if (isMobile) {
    return <MainLayout />; // Mobile: Navigation dưới
  } else {
    return <MainLayoutLarge />; // Large: Navigation trên
  }
}
