import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./StationDetail.css";
import "../admin/Dashboard.css";
import Header from "../../components/admin/Header.jsx";
import { stationAPI } from "../../api/stationApi.js";
import { getMyVehiclesApi } from "../../api/driverApi.js";
import { isAuthenticated } from "../../utils/authUtils.js";
import { getAllTariffs } from "../../api/tariffApi.js";
import {
  MapPin, Navigation, Zap, ChevronDown, ChevronUp,
  CheckCircle2, Clock, Wrench, Car, AlertTriangle, LogIn
} from "lucide-react";

// AWS Map
import AwsLocationMap from "../../components/maps/StationRouteMap.jsx";
import { AWS_LOCATION } from "../../utils/awsLocationConfig.js";

const StationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated();

  const [station, setStation]               = useState(null);
  const [chargingPoints, setChargingPoints] = useState([]);
  const [myVehicles, setMyVehicles]         = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [connectorTypes, setConnectorTypes] = useState([]);
  const [expandedPoint, setExpandedPoint]   = useState(null);
  const [loading, setLoading]               = useState(true);
  const [price, setPrice]                   = useState(null);
  const [userLocation, setUserLocation]     = useState(null);

  // Lấy vị trí người dùng
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => { console.warn("Không lấy được vị trí:", err?.message); setUserLocation(null); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Normalize tọa độ station
  const stationCoord = useMemo(() => {
    if (!station) return null;
    const latRaw = station.latitude ?? station.Latitude ?? station.lat ?? station.Lat ?? station.stationLatitude ?? station.stationLat ?? null;
    const lngRaw = station.longitude ?? station.Longitude ?? station.lng ?? station.Lng ?? station.stationLongitude ?? station.stationLng ?? null;
    const lat = parseFloat(latRaw);
    const lng = parseFloat(lngRaw);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }, [station]);

  // Fetch dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const stationRes = await stationAPI.getStationById(id);
        const st = Array.isArray(stationRes.data) ? stationRes.data[0] : stationRes.data;
        setStation(st);

        const [pointsRes, connectorsRes] = await Promise.all([
          stationAPI.getChargingPointsByStationId(id),
          stationAPI.getConnectorTypes(),
        ]);
        setChargingPoints(pointsRes.data);

        const normalizedConnectors = (connectorsRes.data || []).map((c) => ({
          connectorTypeId: c.connectorTypeId ?? c.id ?? c.ConnectorTypeID ?? c.code ?? null,
          code: c.code ?? c.Code ?? (c.connectorTypeId ? String(c.connectorTypeId) : null),
          displayName: c.displayName ?? c.DisplayName ?? c.name ?? c.TypeName ?? "",
          mode: c.mode ?? c.Mode ?? "",
          defaultMaxPowerKW: c.defaultMaxPowerKW ?? c.defaultPower ?? c.default_max_power ?? null,
          raw: c,
        }));
        setConnectorTypes(normalizedConnectors);

        if (isLoggedIn) {
          try {
            const myVehiclesRes = await getMyVehiclesApi();
            const active = myVehiclesRes.data.filter((v) => v.vehicleStatus === "ACTIVE");
            setMyVehicles(active);
            if (active?.length > 0) setSelectedVehicle(active[0]);
          } catch {
            console.warn("Không thể tải danh sách xe");
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isLoggedIn]);

  // Lấy giá tiền
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const priceRes = await getAllTariffs();
        setPrice(priceRes.data);
      } catch (error) {
        console.error("Lỗi khi tải giá:", error);
      }
    };
    fetchPrice();
  }, []);

  // Helper: connector lookup
  const getConnectorDetail = (connectorTypeId) => {
    if (!connectorTypes?.length) return null;
    const searchRaw = connectorTypeId;
    const search = String(connectorTypeId ?? "").toLowerCase().trim();

    let result = connectorTypes.find(
      (c) => String(c.connectorTypeId) === String(searchRaw) ||
             String(c.ConnectorTypeID) === String(searchRaw) ||
             String(c.id) === String(searchRaw)
    );
    if (result) return result;

    result = connectorTypes.find((c) => {
      const code    = String(c.code ?? c.Code ?? "").toLowerCase().trim();
      const display = String(c.displayName ?? c.DisplayName ?? "").toLowerCase().trim();
      return (code && code === search) || (display && display === search) ||
             (display && display.includes(search)) || (code && code.includes(search));
    });
    if (result) return result;

    result = connectorTypes.find((c) => {
      try { return String(c.connectorTypeId) === search || String(c.ConnectorTypeID) === search; }
      catch { return false; }
    });
    return result || null;
  };

  // Helper: compatibility check
  const isPointCompatible = (point) => {
    if (!selectedVehicle) return false;
    const connector = getConnectorDetail(point.connectorType || point.connectorTypeId || point.ConnectorTypeID);
    if (!connector) return false;
    const vehicleConnectorName = selectedVehicle.connectorTypeName || selectedVehicle.connectorType;
    if (!vehicleConnectorName) return false;
    const vehicleType   = vehicleConnectorName.toLowerCase().trim();
    const connectorName = (connector.displayName || "").toLowerCase().trim();
    const connectorCode = (connector.code || "").toLowerCase().trim();
    return connectorName.includes(vehicleType) || connectorCode.includes(vehicleType) ||
           connectorName === vehicleType || connectorCode === vehicleType ||
           vehicleType.includes(connectorName) || vehicleType.includes(connectorCode);
  };

  const groupChargingPoints = () => {
    if (!selectedVehicle) return { compatible: chargingPoints, others: [] };
    return {
      compatible: chargingPoints.filter((p) => isPointCompatible(p)),
      others:     chargingPoints.filter((p) => !isPointCompatible(p)),
    };
  };
  const { compatible, others } = groupChargingPoints();

  const toggleExpand = (pointId) => setExpandedPoint(expandedPoint === pointId ? null : pointId);

  const handleBooking = (pointId, connectorId) => {
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập để đặt chỗ sạc!");
      navigate("/login", { state: { from: `/stations/${id}` } });
      return;
    }
    if (!selectedVehicle) { alert("Vui lòng chọn xe trước khi đặt chỗ!"); return; }

    const point     = chargingPoints.find((p) => (p.pointId || p.PointID) === pointId);
    const connector = getConnectorDetail(connectorId);

    navigate(`/bookings`, {
      state: {
        station: {
          id:      station?.StationID || station?.stationID,
          name:    station?.StationName || station?.stationName,
          address: station?.Address || station?.address,
        },
        chargingPoint: {
          pointId:     point?.pointId || point?.PointID,
          pointNumber: point?.pointNumber || point?.PointNumber,
          maxPowerKW:  point?.maxPowerKW || point?.MaxPowerKW,
          status:      point?.status || point?.Status,
        },
        connector: {
          connectorTypeId:   connector?.connectorTypeId,
          displayName:       connector?.displayName,
          code:              connector?.code,
          mode:              connector?.mode,
          defaultMaxPowerKW: connector?.defaultMaxPowerKW,
        },
        vehicle: {
          vehicleId:         selectedVehicle?.vehicleId,
          vehicleName:       selectedVehicle?.vehicleName,
          brand:             selectedVehicle?.brand,
          model:             selectedVehicle?.model,
          connectorTypeName: selectedVehicle?.connectorTypeName,
          licensePlate:      selectedVehicle?.licensePlate,
          batteryCapacityKWh: selectedVehicle?.batteryCapacityKWh,
        },
      },
    });
  };

  const handleVehicleChange = (e) => {
    const vehicleId = parseInt(e.target.value);
    if (!vehicleId) { setSelectedVehicle(null); return; }
    setSelectedVehicle(myVehicles.find((v) => v.vehicleId === vehicleId) || null);
  };

  const handleNavigate = () => {
    if (!stationCoord) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${stationCoord.lat},${stationCoord.lng}`,
      "_blank"
    );
  };

  // Stats từ charging points
  const totalPoints     = chargingPoints.length;
  const availablePoints = chargingPoints.filter((p) => (p.status || p.Status)?.toLowerCase() === "available").length;
  const busyPoints      = chargingPoints.filter((p) => { const s = (p.status || p.Status)?.toLowerCase(); return s === "in-use" || s === "busy" || s === "charging"; }).length;
  const maintenPoints   = chargingPoints.filter((p) => { const s = (p.status || p.Status)?.toLowerCase(); return s === "maintenance" || s === "offline" || s === "out_of_service"; }).length;

  // Station status
  const stationStatus = (station?.status || station?.Status || "UNKNOWN").toUpperCase();
  const getStationStatusInfo = (s) => {
    if (s === "ACTIVE" || s === "AVAILABLE") return { label: "Hoạt động", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" };
    if (s === "BUSY")                         return { label: "Đang bận",  color: "#d97706", bg: "#fffbeb", border: "#fde68a" };
    if (s === "MAINTENANCE")                  return { label: "Bảo trì",   color: "#dc2626", bg: "#fef2f2", border: "#fecaca" };
    return { label: s, color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" };
  };
  const statusInfo = getStationStatusInfo(stationStatus);

  // Render một charging point card
  const renderPointCard = (point, isCompatible) => {
    const pointId         = point.pointId || point.PointID;
    const pointNumber     = point.pointNumber || point.PointNumber;
    const status          = (point.status || point.Status || "").toLowerCase();
    const maxPowerKW      = point.maxPowerKW || point.MaxPowerKW;
    const connectorTypeId = point.connectorType || point.connectorTypeId || point.ConnectorTypeID;
    const expanded        = expandedPoint === pointId;
    const connector       = getConnectorDetail(connectorTypeId);

    const statusLabel = status === "available" ? "Sẵn sàng"
      : status === "in-use" || status === "charging" ? "Đang sạc"
      : status === "maintenance" ? "Bảo trì" : status;
    const statusClass = status === "available" ? "available"
      : status === "in-use" || status === "charging" ? "busy" : "maintenance";

    const tariff = price?.find((t) => t.connectorTypeName === point.connectorType);

    return (
      <div
        key={pointId}
        className={`sd-point-card ${isCompatible ? "sd-point-compatible" : "sd-point-other"} ${expanded ? "sd-point-expanded" : ""}`}
        onClick={() => toggleExpand(pointId)}
      >
        {/* Card Header */}
        <div className="sd-point-header">
          <div className="sd-point-header-left">
            <div className={`sd-point-dot ${statusClass}`} />
            <div>
              <div className="sd-point-number">Trụ {pointNumber}</div>
              <div className={`sd-point-status-label ${statusClass}`}>{statusLabel}</div>
            </div>
          </div>
          <div className="sd-point-header-right">
            <div className="sd-point-power">
              <Zap size={14} />
              {maxPowerKW} kW
            </div>
            {isCompatible && selectedVehicle && (
              <span className="sd-compat-badge">Tương thích</span>
            )}
            <span className="sd-expand-icon">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </div>
        </div>

        {/* Price row */}
        {tariff && (
          <div className="sd-point-price-row">
            <span>💰 {tariff.pricePerKWh ? `${Number(tariff.pricePerKWh).toLocaleString("vi-VN")} đ/kWh` : "—"}</span>
            <span>⏱ {tariff.pricePerMin ? `${Number(tariff.pricePerMin).toLocaleString("vi-VN")} đ/phút` : "—"}</span>
          </div>
        )}

        {/* Expanded connector panel */}
        {expanded && (
          <div className="sd-connector-panel" onClick={(e) => e.stopPropagation()}>
            {connector ? (
              <div className="sd-connector-body">
                <div className="sd-connector-info">
                  <div className="sd-connector-name">{connector.displayName}</div>
                  <div className="sd-connector-meta">
                    <span>Mã: <strong>{connector.code}</strong></span>
                    <span>Chế độ: <strong>{connector.mode?.toUpperCase()}</strong></span>
                    <span>Công suất tối đa: <strong>{connector.defaultMaxPowerKW} kW</strong></span>
                  </div>
                </div>
                <div className="sd-connector-actions">
                  <span className={`sd-mode-tag ${connector.mode?.toLowerCase()}`}>
                    {connector.mode?.toUpperCase()}
                  </span>
                  {status === "available" && isLoggedIn && selectedVehicle && (
                    <button
                      className="sd-btn-book"
                      onClick={(e) => { e.stopPropagation(); handleBooking(pointId, connector.connectorTypeId); }}
                    >
                      📅 Đặt lịch sạc
                    </button>
                  )}
                  {status === "available" && isLoggedIn && !selectedVehicle && (
                    <span className="sd-warning-hint">⚠ Chọn xe để đặt chỗ</span>
                  )}
                  {status === "available" && !isLoggedIn && (
                    <span className="sd-login-hint">🔐 Đăng nhập để đặt chỗ</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="sd-no-connector">Không có thông tin cổng sạc</p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-container">
        <Header />
        <div className="sd-loading">
          <div className="sd-loading-spinner" />
          <p>Đang tải thông tin trạm sạc...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!station) {
    return (
      <div className="dashboard-container">
        <Header />
        <div className="sd-not-found">
          <MapPin size={48} color="#cbd5e1" />
          <h3>Không tìm thấy trạm sạc</h3>
          <button className="sd-back-btn" onClick={() => navigate(-1)}>← Quay lại danh sách</button>
        </div>
      </div>
    );
  }

  const stationName    = station?.StationName || station?.stationName || "Trạm sạc";
  const stationAddress = station?.Address || station?.address || "Đang cập nhật địa chỉ";

  return (
    <div className="dashboard-container">
      <Header />

      {/* ── HERO ── */}
      <div className="sd-hero">
        <div className="sd-hero-blob blob-1" />
        <div className="sd-hero-blob blob-2" />

        <div className="sd-hero-content">
          <button className="sd-back-btn" onClick={() => navigate(-1)}>
            ← Danh sách trạm
          </button>

          <span
            className="sd-station-status"
            style={{ color: statusInfo.color, background: statusInfo.bg, border: `1px solid ${statusInfo.border}` }}
          >
            <span className="sd-station-status-dot" style={{ background: statusInfo.color }} />
            {statusInfo.label}
          </span>

          <h1 className="sd-hero-title">{stationName}</h1>
          <p className="sd-hero-address">
            <MapPin size={16} />
            {stationAddress}
          </p>
        </div>

        {/* Stats strip */}
        <div className="sd-stats">
          <div className="sd-stat-item">
            <div className="sd-stat-icon" style={{ background: "rgba(255,255,255,0.15)" }}>
              <Zap size={16} color="#fff" />
            </div>
            <div>
              <div className="sd-stat-value">{totalPoints}</div>
              <div className="sd-stat-label">Tổng trụ</div>
            </div>
          </div>
          <div className="sd-stat-divider" />
          <div className="sd-stat-item">
            <div className="sd-stat-icon" style={{ background: "rgba(74,222,128,0.25)" }}>
              <CheckCircle2 size={16} color="#4ade80" />
            </div>
            <div>
              <div className="sd-stat-value">{availablePoints}</div>
              <div className="sd-stat-label">Khả dụng</div>
            </div>
          </div>
          <div className="sd-stat-divider" />
          <div className="sd-stat-item">
            <div className="sd-stat-icon" style={{ background: "rgba(251,191,36,0.25)" }}>
              <Clock size={16} color="#fbbf24" />
            </div>
            <div>
              <div className="sd-stat-value">{busyPoints}</div>
              <div className="sd-stat-label">Đang bận</div>
            </div>
          </div>
          <div className="sd-stat-divider" />
          <div className="sd-stat-item">
            <div className="sd-stat-icon" style={{ background: "rgba(248,113,113,0.25)" }}>
              <Wrench size={16} color="#f87171" />
            </div>
            <div>
              <div className="sd-stat-value">{maintenPoints}</div>
              <div className="sd-stat-label">Bảo trì</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY — 2 CỘT ── */}
      <div className="sd-body">

        {/* CỘT TRÁI: Vehicle selector + Charging Points */}
        <div className="sd-main-col">

          {/* Vehicle Selector / CTA */}
          {!isLoggedIn ? (
            <div className="sd-cta-card sd-cta-login">
              <div className="sd-cta-icon"><LogIn size={28} /></div>
              <div className="sd-cta-text">
                <strong>Đăng nhập để đặt chỗ sạc</strong>
                <p>Bạn có thể xem thông tin trạm, nhưng cần đăng nhập để đặt chỗ.</p>
              </div>
              <button
                className="sd-cta-btn"
                onClick={() => navigate("/login", { state: { from: `/stations/${id}` } })}
              >
                Đăng nhập ngay →
              </button>
            </div>
          ) : myVehicles.length > 0 ? (
            <div className="sd-vehicle-selector">
              <div className="sd-vehicle-selector-header">
                <Car size={18} />
                <span>Chọn xe để xem trụ tương thích</span>
              </div>
              <select
                className="sd-vehicle-dropdown"
                value={selectedVehicle?.vehicleId || ""}
                onChange={handleVehicleChange}
              >
                <option value="">— Hiển thị tất cả trụ —</option>
                {myVehicles.map((v) => (
                  <option key={v.vehicleId} value={v.vehicleId}>
                    {v.vehicleName} ({v.brand} {v.model}) · 🔌 {v.connectorTypeName || "N/A"}
                  </option>
                ))}
              </select>
              {!selectedVehicle && (
                <p className="sd-vehicle-hint">⚡ Chọn xe để lọc trụ phù hợp và đặt lịch sạc</p>
              )}
            </div>
          ) : (
            <div className="sd-cta-card sd-cta-vehicle">
              <div className="sd-cta-icon"><Car size={28} /></div>
              <div className="sd-cta-text">
                <strong>Bạn chưa có xe nào</strong>
                <p>Thêm xe của bạn để xem trụ sạc tương thích và đặt chỗ.</p>
              </div>
              <button
                className="sd-cta-btn sd-cta-btn-orange"
                onClick={() => navigate("/profile/my-vehicle")}
              >
                ➕ Thêm xe của tôi
              </button>
            </div>
          )}

          {/* Compatible section header */}
          {selectedVehicle && compatible.length > 0 && (
            <div className="sd-section-header sd-section-compat">
              <CheckCircle2 size={18} />
              Phù hợp với xe của bạn
              <span className="sd-section-count">{compatible.length}</span>
            </div>
          )}

          {/* Compatible or all points */}
          {compatible.length > 0 ? (
            <div className="sd-points-list">{compatible.map((p) => renderPointCard(p, true))}</div>
          ) : selectedVehicle ? (
            <div className="sd-empty-points">
              <AlertTriangle size={32} color="#f59e0b" />
              <p>Không có trụ nào tương thích với xe của bạn.</p>
            </div>
          ) : (
            <div className="sd-points-list">{chargingPoints.map((p) => renderPointCard(p, false))}</div>
          )}

          {/* Incompatible section */}
          {selectedVehicle && others.length > 0 && (
            <>
              <div className="sd-section-header sd-section-other">
                <AlertTriangle size={18} />
                Không phù hợp với xe bạn
                <span className="sd-section-count">{others.length}</span>
              </div>
              <div className="sd-points-list sd-points-faded">
                {others.map((p) => renderPointCard(p, false))}
              </div>
            </>
          )}

          {chargingPoints.length === 0 && (
            <div className="sd-empty-points">
              <Zap size={36} color="#cbd5e1" />
              <p>Trạm này chưa có trụ sạc nào.</p>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: AWS Map */}
        <div className="sd-side-col">
          <div className="sd-map-card">
            <div className="sd-map-card-header">
              <MapPin size={16} />
              Vị trí trạm &amp; Chỉ đường
            </div>

            <div className="sd-map-wrapper">
              {stationCoord ? (
                <AwsLocationMap
                  identityPoolId={AWS_LOCATION.identityPoolId}
                  region={AWS_LOCATION.region}
                  mapName={AWS_LOCATION.mapName}
                  routeCalculator={AWS_LOCATION.routeCalculator}
                  userLocation={userLocation}
                  station={stationCoord}
                />
              ) : (
                <div className="sd-map-placeholder">
                  <MapPin size={36} color="#cbd5e1" />
                  <p>Trạm chưa có tọa độ để hiển thị bản đồ</p>
                </div>
              )}
            </div>

            {stationCoord && (
              <button className="sd-navigate-btn" onClick={handleNavigate}>
                <Navigation size={16} />
                Mở chỉ đường Google Maps
              </button>
            )}

            <div className="sd-map-address">
              <MapPin size={14} color="#16a34a" />
              <span>{stationAddress}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationDetail;
