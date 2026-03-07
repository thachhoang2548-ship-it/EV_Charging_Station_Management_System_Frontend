import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import "./Stations.css";
import "../admin/Dashboard.css";
import Header from "../../components/admin/Header.jsx";
import HomeNavbar from "../../components/HomeNavbar/HomeNavbar.jsx";
import { selectIsLoggedIn } from "../../redux/slices/authSlice.js";
import { stationAPI } from "../../api/stationApi.js";
import {
  Search,
  MapPin,
  Zap,
  Navigation,
  Info,
  CheckCircle2,
  Clock,
  Wrench,
  PlugZap,
} from "lucide-react";

export default function Stations() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isLoggedIn = useSelector(selectIsLoggedIn);

  // --- STATE DỮ LIỆU ---
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  // --- PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 1. Lấy vị trí
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        (err) => console.warn("Lỗi vị trí:", err.message),
        { enableHighAccuracy: true },
      );
    }
  }, []);

  // 2. Gọi API (reload khi userLocation thay đổi)
  useEffect(() => {
    const fetchStations = async () => {
      try {
        // Truyền userLocation để BE tính khoảng cách
        const response = await stationAPI.getAllStations(userLocation);
        const data = response.data || [];
        const normalized = data.map((item) => ({
          id: item.id || item.stationId,
          name: item.stationName || item.name || "Trạm sạc EcoCharge",
          address: item.address || "Đang cập nhật địa chỉ của bạn...",
          status: item.status ? item.status.toUpperCase() : "AVAILABLE",
          lat: parseFloat(item.latitude || item.lat || 0),
          lng: parseFloat(item.longitude || item.lng || 0),
          distance: item.distanceKm, // BE đã tính sẵn
          ports: item.ports || ["CCS2", "Type 2"],
        }));
        setStations(normalized);
      } catch (error) {
        console.error("Lỗi tải trạm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, [userLocation]); // Dependency: reload khi vị trí thay đổi

  // 3. Logic Lọc (chỉ search, không tính khoảng cách)
  const processedStations = stations.filter((station) => {
    return (
      (station.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (station.address || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalPages = Math.ceil(processedStations.length / itemsPerPage);
  const currentStations = processedStations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleNavigate = (lat, lng) => {
    const url = userLocation
      ? `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lat},${lng}`
      : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, "_blank");
  };

  const getStatusInfo = (status) => {
    if (status === "AVAILABLE" || status === "ACTIVE")
      return {
        label: "Khả dụng",
        color: "#16a34a",
        bg: "#f0fdf4",
        border: "#bbf7d0",
      };
    if (status === "BUSY")
      return {
        label: "Đang bận",
        color: "#d97706",
        bg: "#fffbeb",
        border: "#fde68a",
      };
    return {
      label: "Bảo trì",
      color: "#dc2626",
      bg: "#fef2f2",
      border: "#fecaca",
    };
  };

  if (loading)
    return (
      <div className="dashboard-container">
        {isLoggedIn ? <Header /> : <HomeNavbar />}
        <div className="stations-loading-state">
          <div className="stations-spinner" />
          <p>Đang tải danh sách trạm sạc...</p>
        </div>
      </div>
    );

  const availableCount = stations.filter(
    (s) => s.status === "AVAILABLE" || s.status === "ACTIVE",
  ).length;
  const busyCount = stations.filter((s) => s.status === "BUSY").length;
  const maintenanceCount = stations.filter(
    (s) =>
      s.status !== "AVAILABLE" && s.status !== "ACTIVE" && s.status !== "BUSY",
  ).length;

  return (
    <div className="dashboard-container">
      {isLoggedIn ? <Header /> : <HomeNavbar />}
      {/* ── HERO BANNER ── */}
      <div className="stations-hero">
        {/* decorative blobs */}
        <div className="stations-hero-blob blob-1" />
        <div className="stations-hero-blob blob-2" />

        <div className="stations-hero-content">
          <div className="stations-hero-eyebrow">
            <PlugZap size={14} />
            Mạng lưới trạm sạc EV
          </div>
          <h1 className="stations-hero-title">Tìm trạm sạc gần bạn</h1>
          <p className="stations-hero-sub">
            {stations.length} trạm trên toàn hệ thống &mdash; cập nhật theo thời
            gian thực
          </p>

          {/* Search bar inside hero */}
          <div className="stations-hero-search">
            <Search size={18} className="stations-hero-search-icon" />
            <input
              type="text"
              className="stations-hero-search-input"
              placeholder="Nhập tên trạm, địa chỉ, khu vực..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchQuery && (
              <button
                className="stations-hero-search-clear"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="stations-stats">
          <div className="station-stat-item">
            <div
              className="station-stat-icon"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <MapPin size={16} color="#fff" />
            </div>
            <div>
              <div className="station-stat-value">{stations.length}</div>
              <div className="station-stat-label">Tổng trạm</div>
            </div>
          </div>
          <div className="station-stat-divider" />
          <div className="station-stat-item">
            <div
              className="station-stat-icon"
              style={{ background: "rgba(74,222,128,0.25)" }}
            >
              <CheckCircle2 size={16} color="#4ade80" />
            </div>
            <div>
              <div className="station-stat-value">{availableCount}</div>
              <div className="station-stat-label">Khả dụng</div>
            </div>
          </div>
          <div className="station-stat-divider" />
          <div className="station-stat-item">
            <div
              className="station-stat-icon"
              style={{ background: "rgba(251,191,36,0.25)" }}
            >
              <Clock size={16} color="#fbbf24" />
            </div>
            <div>
              <div className="station-stat-value">{busyCount}</div>
              <div className="station-stat-label">Đang bận</div>
            </div>
          </div>
          <div className="station-stat-divider" />
          <div className="station-stat-item">
            <div
              className="station-stat-icon"
              style={{ background: "rgba(248,113,113,0.25)" }}
            >
              <Wrench size={16} color="#f87171" />
            </div>
            <div>
              <div className="station-stat-value">{maintenanceCount}</div>
              <div className="station-stat-label">Bảo trì</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RESULTS SECTION HEADER ── */}
      <div className="stations-results-bar">
        <span className="stations-results-count">
          {searchQuery ? (
            <>
              {processedStations.length} kết quả cho{" "}
              <strong>&ldquo;{searchQuery}&rdquo;</strong>
            </>
          ) : (
            <>{processedStations.length} trạm sạc</>
          )}
        </span>
      </div>

      {/* ── STATION GRID ── */}
      {currentStations.length === 0 ? (
        <div className="stations-empty">
          <MapPin size={40} color="#cbd5e1" />
          <p>Không tìm thấy trạm nào phù hợp.</p>
        </div>
      ) : (
        <div className="stations-grid">
          {currentStations.map((station) => {
            const statusInfo = getStatusInfo(station.status);
            return (
              <div key={station.id} className="station-card">
                {/* Card top: status badge + distance */}
                <div className="station-card-top">
                  <span
                    className="station-status-badge"
                    style={{
                      color: statusInfo.color,
                      background: statusInfo.bg,
                      border: `1px solid ${statusInfo.border}`,
                    }}
                  >
                    <span
                      className="station-status-dot"
                      style={{ background: statusInfo.color }}
                    />
                    {statusInfo.label}
                  </span>
                  {station.distance != null && (
                    <span className="station-distance-chip">
                      <MapPin size={12} />
                      {parseFloat(station.distance).toFixed(1)} km
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="station-name">{station.name}</h3>
                <p className="station-address">{station.address}</p>

                {/* Port tags */}
                <div className="station-ports">
                  {station.ports.map((p, i) => (
                    <span key={i} className="port-tag">
                      <Zap size={10} /> {p}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="station-actions">
                  <button
                    className="btn-navigate"
                    onClick={() => handleNavigate(station.lat, station.lng)}
                  >
                    <Navigation size={14} /> Chỉ đường
                  </button>
                  <button
                    className="btn-detail"
                    onClick={() => navigate(`/stations/${station.id}`)}
                  >
                    <Info size={14} /> Chi tiết
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="stations-pagination">
          <button
            className="page-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            &#10094;
          </button>
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`page-number ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            className="page-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            &#10095;
          </button>
        </div>
      )}
    </div>
  );
}
