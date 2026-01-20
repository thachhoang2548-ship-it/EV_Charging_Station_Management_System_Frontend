import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Stations.css";
import { stationAPI } from "../../api/stationApi.js";
import stationsHeroMobile from "../../assets/img/home/home.jpg"; 
import stationsHeroDesktop from "../../assets/img/home/background3.avif";

// Chỉ cần import icon Search
import { Search } from "lucide-react";

export default function Stations() {
  const navigate = useNavigate();
  
  // --- STATE DỮ LIỆU ---
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // --- PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 1. Lấy vị trí
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("Lỗi vị trí:", err.message),
        { enableHighAccuracy: true }
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
          ports: item.ports || ["CCS2", "Type 2"] 
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
    return (station.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
           (station.address || "").toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(processedStations.length / itemsPerPage);
  const currentStations = processedStations.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const handleNavigate = (lat, lng) => {
    const url = userLocation
      ? `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lat},${lng}`
      : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, "_blank");
  };

  const getStatusColor = (status) => {
    if (status === "AVAILABLE" || status === "ACTIVE") return "#4ade80";
    if (status === "BUSY") return "#facc15";
    return "#f87171";
  };

  if (loading) return <div className="stations-loading">Đang tải dữ liệu...</div>;

  return (
    <div className="home-page">
      <div className="hero-wrapper-station">
        <img className="hero-img mobile-only" src={stationsHeroMobile} alt="Trạm sạc" />
        <img className="hero-img desktop-only" src={stationsHeroDesktop} alt="Trạm sạc" />
        <div className="hero-text">
          <h1 className="hero-title">MẠNG LƯỚI TRẠM SẠC</h1>
          <p className="hero-subtitle">KẾT NỐI KHÔNG GIỚI HẠN</p>
        </div>
      </div>

      <div className="welcome-card">
        {/* --- THANH TÌM KIẾM ĐƠN GIẢN (NO FILTER) --- */}
        <div className="cyber-search-container">
          <div className="cyber-search-bar">
            <div className="search-icon-box">
              <Search size={20} color="#0ea5e9" />
            </div>
            <input
              type="text"
              className="cyber-input"
              placeholder="Nhập tên trạm, địa chỉ, khu vực..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/* Đã xóa nút bộ lọc và đường kẻ ở đây */}
          </div>
        </div>

        {/* --- DANH SÁCH TRẠM --- */}
        <h2 className="stations-header">
          {processedStations.length} Trạm khả dụng
        </h2>

        <div className="station-list">
          {currentStations.length === 0 ? (
            <div className="no-stations">
              <p>Không tìm thấy trạm nào phù hợp.</p>
            </div>
          ) : (
            currentStations.map((station) => (
              <div key={station.id} className="station-card">
                <div className="station-header">
                  <h3 className="station-name">{station.name}</h3>
                  <span
                    className="status-dot"
                    style={{ background: getStatusColor(station.status) }}
                  ></span>
                </div>
                
                <p className="station-address">{station.address}</p>
                
                <div className="station-tags">
                   {station.ports.map((p, i) => (
                     <span key={i} className="port-tag">{p}</span>
                   ))}
                </div>

                <div className="station-footer-info">
                  <div className="station-distance">
                    ⚡ {station.distance !== null && station.distance !== undefined
                      ? `${parseFloat(station.distance).toFixed(2)} km` 
                      : "Chưa xác định"}
                  </div>
                </div>

                <div className="station-actions">
                  <button
                    className="btn-navigate"
                    onClick={() => handleNavigate(station.lat, station.lng)}
                  >
                    Chỉ đường
                  </button>
                  <button
                    className="btn-detail"
                    onClick={() => navigate(`/stations/${station.id}`)}
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- PHÂN TRANG --- */}
        {processedStations.length > itemsPerPage && (
          <div className="pagination-container">
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >❮</button>
            <div className="page-dots">
              {Array.from({ length: totalPages }, (_, i) => (
                <span
                  key={i}
                  className={`dot ${currentPage === i + 1 ? "active" : ""}`}
                  onClick={() => setCurrentPage(i + 1)}
                ></span>
              ))}
            </div>
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >❯</button>
          </div>
        )}
      </div>
    </div>
  );
}