import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyVehiclesApi, updateVehicleApi } from "../../api/driverApi.js";
import VehicleCard from "../../components/driver/VehicleCard.jsx";
import { toast } from "react-toastify";
import Header from "../../components/admin/Header.jsx";
import AddVehicle from "./AddVehicle.jsx";
import apiClient from "../../api/apiUrls.js";
import "../admin/Dashboard.css";
import "./Vehicles.css";
import {
  Car, CircleCheck, CirclePause, Plus, ArrowLeft, Zap
} from "lucide-react";
import { showConfirm } from '../../utils/alertUtils.js';

const FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "ACTIVE", label: "Hoạt động" },
  { key: "INACTIVE", label: "Ngưng" },
];

export default function Vehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [filter, setFilter] = useState("all");

  /* ── Loyalty points helper ── */
  const getPointsByVehicleId = async (vehicleId) => {
    try {
      const res = await apiClient.get("/api/loyalty/available-by-vehicle", {
        params: { vehicleId },
      });
      const n = Number(res?.data?.pointsAvailable);
      return Number.isFinite(n) ? n : 0;
    } catch {
      return 0;
    }
  };

  const enrichVehiclesWithPoints = async (list) => {
    if (!Array.isArray(list) || list.length === 0) return list;
    const results = await Promise.allSettled(
      list.map(async (v) => {
        const pointsBalance = await getPointsByVehicleId(v.vehicleId);
        return { ...v, pointsBalance };
      })
    );
    return results.map((r, idx) =>
      r.status === "fulfilled" ? r.value : { ...list[idx], pointsBalance: 0 }
    );
  };

  /* ── Toggle status ── */
  const handleUpdate = async (vehicle) => {
    const newStatus = vehicle.vehicleStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const msg =
      newStatus === "INACTIVE"
        ? "Bạn có chắc chắn muốn ngưng hoạt động xe này?"
        : "Bạn có chắc chắn muốn cho xe này hoạt động trở lại?";

    if (await showConfirm(msg, 'Xác nhận thay đổi trạng thái')) {
      try {
        const response = await updateVehicleApi(vehicle.vehicleId, newStatus);
        if (response.success) {
          setVehicles((prev) =>
            prev.map((v) =>
              v.vehicleId === vehicle.vehicleId
                ? { ...v, vehicleStatus: newStatus }
                : v
            )
          );
          toast.success(
            newStatus === "INACTIVE"
              ? "Ngưng hoạt động xe thành công!"
              : "Xe đã hoạt động trở lại!"
          );
        } else {
          toast.error("Cập nhật trạng thái xe thất bại!");
        }
      } catch {
        toast.error("Cập nhật trạng thái xe thất bại!");
      }
    }
  };

  /* ── Fetch ── */
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await getMyVehiclesApi();
      if (res.success) {
        const enriched = await enrichVehiclesWithPoints(res.data || []);
        setVehicles(enriched);
      }
    } catch {
      toast.error("Không thể tải danh sách xe!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  /* ── Derived counts ── */
  const totalCount = vehicles.length;
  const activeCount = vehicles.filter((v) => v.vehicleStatus === "ACTIVE").length;
  const inactiveCount = vehicles.filter((v) => v.vehicleStatus === "INACTIVE").length;

  const filtered =
    filter === "all" ? vehicles : vehicles.filter((v) => v.vehicleStatus === filter);

  const countFor = (key) =>
    key === "all" ? totalCount : key === "ACTIVE" ? activeCount : inactiveCount;

  return (
    <div className="dashboard-container">
      <Header />

      {/* AddVehicle overlay modal */}
      {showAddVehicle && (
        <AddVehicle
          onClose={() => setShowAddVehicle(false)}
          onSuccess={() => {
            setShowAddVehicle(false);
            fetchVehicles();
          }}
        />
      )}

      {/* Back */}
      <button className="vh-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={15} /> Quay lại
      </button>

          {/* Hero — dark gradient with glass counters */}
          <div className="vh-hero">
            <div className="vh-hero-body">
              <span className="vh-hero-chip"><Zap size={12} /> EV Garage</span>
              <h1 className="vh-hero-title">Phương tiện của tôi</h1>
              <p className="vh-hero-sub">Quản lý & theo dõi xe điện đã đăng ký</p>
              <div className="vh-hero-counters">
                <div className="vh-hero-counter">
                  <span className="vh-hero-counter-num">{totalCount}</span>
                  <span className="vh-hero-counter-label">Tổng xe</span>
                </div>
                <span className="vh-hero-counter-divider" />
                <div className="vh-hero-counter">
                  <span className="vh-hero-counter-num">{activeCount}</span>
                  <span className="vh-hero-counter-label">Hoạt động</span>
                </div>
                <span className="vh-hero-counter-divider" />
                <div className="vh-hero-counter">
                  <span className="vh-hero-counter-num">{inactiveCount}</span>
                  <span className="vh-hero-counter-label">Ngưng</span>
                </div>
              </div>
            </div>
            <button className="vh-hero-btn" onClick={() => setShowAddVehicle(true)}>
              <Plus size={18} /> Thêm xe
            </button>
          </div>

          {loading ? (
            <div className="vh-loading">
              <div className="vh-spinner" />
              <p>Đang tải danh sách xe...</p>
            </div>
          ) : totalCount === 0 ? (
            <div className="vh-empty">
              <div className="vh-empty-icon"><Car size={32} /></div>
              <h3 className="vh-empty-title">Chưa có xe nào</h3>
              <p className="vh-empty-desc">
                Hãy thêm xe điện đầu tiên để bắt đầu sử dụng dịch vụ
              </p>
              <button className="vh-empty-btn" onClick={() => setShowAddVehicle(true)}>
                <Plus size={16} /> Thêm xe mới
              </button>
            </div>
          ) : (
            <>
              {/* Filter tabs */}
              <div className="vh-filter">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    className={`vh-filter-tab ${filter === f.key ? "active" : ""}`}
                    onClick={() => setFilter(f.key)}
                  >
                    {f.label}
                    <span className="vh-filter-count">{countFor(f.key)}</span>
                  </button>
                ))}
              </div>

              {/* Grid */}
              {filtered.length === 0 ? (
                <div className="vh-empty">
                  <div className="vh-empty-icon"><Car size={32} /></div>
                  <h3 className="vh-empty-title">Không có xe phù hợp</h3>
                  <p className="vh-empty-desc">
                    Thay đổi bộ lọc để xem danh sách xe khác
                  </p>
                </div>
              ) : (
                <div className="vh-grid">
                  {filtered.map((vehicle) => (
                    <VehicleCard
                      key={vehicle.vehicleId}
                      vehicle={vehicle}
                      onUpdate={() => handleUpdate(vehicle)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
    </div>
  );
}
