import { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getMyVehiclesApi } from "../../api/driverApi.js";
import VehicleCard from "../../components/driver/VehicleCard.jsx";
import { toast } from "react-toastify";
import { updateVehicleApi } from "../../api/driverApi.js";
import "./Vehicles.css";
import AddVehicle from "./AddVehicle.jsx";
import classCss from "../../assets/css/Main.module.css";
import apiClient from "../../api/apiUrls.js"; // ✅ ADD

export default function Vehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddVehicle, setShowAddVehicle] = useState(false);

  // ✅ ADD: fetch points by vehicleId
  const getPointsByVehicleId = async (vehicleId) => {
    try {
      const res = await apiClient.get("/api/loyalty/available-by-vehicle", {
        params: { vehicleId },
      });
      const points = res?.data?.pointsAvailable;
      const n = Number(points);
      return Number.isFinite(n) ? n : 0;
    } catch (e) {
      console.debug("[LOYALTY] available-by-vehicle failed vehicleId=", vehicleId, e);
      return 0;
    }
  };

  // ✅ ADD: attach pointsBalance to vehicles array (without changing structure)
  const enrichVehiclesWithPoints = async (list) => {
    if (!Array.isArray(list) || list.length === 0) return list;

    // call all in parallel
    const results = await Promise.allSettled(
        list.map(async (v) => {
          const pointsBalance = await getPointsByVehicleId(v.vehicleId);
          return { ...v, pointsBalance }; // ✅ attach field
        })
    );

    return results.map((r, idx) => (r.status === "fulfilled" ? r.value : { ...list[idx], pointsBalance: 0 }));
  };

  const handleUpdate = async (vehicle) => {
    const newStatus =
        vehicle.vehicleStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const confirmMessage =
        newStatus === "INACTIVE"
            ? "Bạn có chắc chắn muốn ngưng hoạt động xe này?"
            : "Bạn có chắc chắn muốn cho xe này hoạt động trở lại?";

    if (window.confirm(confirmMessage)) {
      try {
        const response = await updateVehicleApi(vehicle.vehicleId, newStatus);
        if (response.success) {
          // Cập nhật lại trạng thái xe trong danh sách
          setVehicles((prevVehicles) =>
              prevVehicles.map((v) =>
                  v.vehicleId === vehicle.vehicleId
                      ? { ...v, vehicleStatus: newStatus }
                      : v
              )
          );
          const successMessage =
              newStatus === "INACTIVE"
                  ? "Ngưng hoạt động xe thành công!"
                  : "Xe đã hoạt động trở lại!";
          toast.success(successMessage);
        } else {
          toast.error("Cập nhật trạng thái xe thất bại!");
        }
      } catch (error) {
        console.error("Error updating vehicle status:", error);
        toast.error("Cập nhật trạng thái xe thất bại!");
      }
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const vehiclesRes = await getMyVehiclesApi();
      if (vehiclesRes.success) {
        const rawList = vehiclesRes.data || [];

        // ✅ ADD: enrich with pointsBalance
        const enriched = await enrichVehiclesWithPoints(rawList);

        setVehicles(enriched);
        console.log("My vehicles:", enriched);
      }
    } catch (error) {
      console.error("Failed to fetch my vehicles:", error);
      toast.error("Không thể tải danh sách xe!");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    fetchVehicles();
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
      <div className="my-vehicles-container">
        <Container>
          <div className="my-vehicles-header">
            {showAddVehicle ? "Thêm Xe" : "DANH SÁCH XE CỦA TÔI"}
          </div>
          {showAddVehicle ? (
              <AddVehicle
                  onClose={() => setShowAddVehicle(false)}
                  onSuccess={handleAddSuccess}
              />
          ) : (
              <div className="vehicle-list">
                <button
                    onClick={() => navigate(-1)}
                    style={{
                      background: "#20b2aa",
                      border: "none",
                      fontSize: "1rem",
                      cursor: "pointer",
                      marginRight: "1rem",
                      borderRadius: "15px",
                    }}
                >
                  ← Quay lại
                </button>
                {loading ? (
                    <p>Đang tải...</p>
                ) : vehicles.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">🚗</div>
                      <p>Không có xe nào trong danh sách. Hãy thêm xe mới!</p>
                      <button
                          className="btn btn-primary"
                          style={{ width: "200px", marginRight: "10px" }}
                          onClick={() => setShowAddVehicle(true)}
                      >
                        Thêm xe mới
                      </button>
                    </div>
                ) : (
                    <>
                      <div style={{ marginBottom: "1.5rem" }}>
                        <button
                            className={classCss.button}
                            onClick={() => setShowAddVehicle(true)}
                            style={{ width: "auto", padding: "0.5rem 1.5rem" }}
                        >
                          Thêm xe mới
                        </button>
                      </div>

                      {/* Xe đang hoạt động */}
                      <div className="vehicle-section">
                        <h3 className="section-title">Xe đang hoạt động</h3>
                        <Row className="g-4">
                          {vehicles.filter((v) => v.vehicleStatus === "ACTIVE")
                              .length === 0 ? (
                              <p className="text-muted">
                                Không có xe nào đang hoạt động
                              </p>
                          ) : (
                              vehicles
                                  .filter((v) => v.vehicleStatus === "ACTIVE")
                                  .map((vehicle) => (
                                      <Col
                                          xs={12}
                                          sm={6}
                                          md={4}
                                          lg={3}
                                          key={vehicle.vehicleId}
                                      >
                                        <VehicleCard
                                            vehicle={vehicle} // ✅ now has vehicle.pointsBalance
                                            onUpdate={() => handleUpdate(vehicle)}
                                        />
                                      </Col>
                                  ))
                          )}
                        </Row>
                      </div>

                      {/* Xe ngưng hoạt động */}
                      <div className="vehicle-section mt-5">
                        <h3 className="section-title">Xe ngưng hoạt động</h3>
                        <Row className="g-4">
                          {vehicles.filter((v) => v.vehicleStatus === "INACTIVE")
                              .length === 0 ? (
                              <p className="text-muted">
                                Không có xe nào ngưng hoạt động
                              </p>
                          ) : (
                              vehicles
                                  .filter((v) => v.vehicleStatus === "INACTIVE")
                                  .map((vehicle) => (
                                      <Col
                                          xs={12}
                                          sm={6}
                                          md={4}
                                          lg={3}
                                          key={vehicle.vehicleId}
                                      >
                                        <VehicleCard
                                            vehicle={vehicle} // ✅ now has vehicle.pointsBalance
                                            onUpdate={() => handleUpdate(vehicle)}
                                        />
                                      </Col>
                                  ))
                          )}
                        </Row>
                      </div>
                    </>
                )}
              </div>
          )}
        </Container>
      </div>
  );
}
