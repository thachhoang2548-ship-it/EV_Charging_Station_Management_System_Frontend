import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getChargingPointById,
  updateChargingPoint,
} from "../../api/chargingPointApi.js";
import { getAllStations, getConnectorTypes } from "../../api/stationApi.js";
import chargingPointIcon from "../../assets/icon/admin/charging-building.png";
import { Form, Button, Row, Col } from "react-bootstrap";
import "./AddStaffForm.css";

// Thêm CSS animation cho spinner
const spinnerStyle = document.createElement("style");
spinnerStyle.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }
`;
if (!document.head.querySelector("style[data-update-form-animation]")) {
  spinnerStyle.setAttribute("data-update-form-animation", "true");
  document.head.appendChild(spinnerStyle);
}

export default function UpdateChargingPointForm({ pointId, onClose }) {
  const [formData, setFormData] = useState({
    stationId: "",
    connectorTypeId: "",
    pointNumber: "",
    serialNumber: "",
    maxPowerKW: "",
    status: "AVAILABLE",
  });

  // Lưu thông tin ngày từ database để gửi lại khi update
  const [originalDates, setOriginalDates] = useState({
    installationDate: "",
    lastMaintenanceDate: "",
  });

  const [stations, setStations] = useState([]);
  const [connectorTypes, setConnectorTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Load dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // ✅ Load stations và connector types TRƯỚC
        const [stationsRes, connectorTypesRes] = await Promise.all([
          getAllStations(),
          getConnectorTypes(),
        ]);

        if (stationsRes.success) {
          setStations(stationsRes.data);
        }

        if (connectorTypesRes.success) {
          setConnectorTypes(connectorTypesRes.data);
          console.log("✅ Connector types loaded:", connectorTypesRes.data);
        }

        // ✅ SAU ĐÓ mới load charging point detail
        const pointResponse = await getChargingPointById(pointId);
        if (pointResponse.success) {
          const point = pointResponse.data;
          console.log("✅ Loaded charging point:", point);

          // ✅ Map connectorType name sang connectorTypeId
          const matchedConnectorType = connectorTypesRes.data?.find(
            (ct) =>
              ct.connectorTypeName === point.connectorType ||
              ct.displayName === point.connectorType,
          );

          // Kiểm tra nếu connector hiện tại bị deprecated
          const isCurrentConnectorDeprecated =
            matchedConnectorType?.isDeprecated;

          setFormData({
            stationId: String(point.stationId || ""),
            connectorTypeId: isCurrentConnectorDeprecated
              ? ""
              : String(matchedConnectorType?.connectorTypeId || ""),
            pointNumber: point.pointNumber || "",
            serialNumber: point.serialNumber || "",
            maxPowerKW: String(point.maxPowerKW || ""),
            status: point.status || "AVAILABLE",
          });

          // Lưu thông tin ngày gốc từ database
          setOriginalDates({
            installationDate: point.installationDate,
            lastMaintenanceDate: point.lastMaintenanceDate,
          });

          // Thông báo nếu connector hiện tại không còn hỗ trợ
          if (isCurrentConnectorDeprecated) {
            toast.warning(
              `Loại cổng sạc "${point.connectorType}" không còn được hỗ trợ. Vui lòng chọn loại cổng sạc khác.`,
              { autoClose: 5000 },
            );
          }
        } else {
          toast.error("Không thể tải thông tin trụ sạc");
          onClose();
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Lỗi khi tải dữ liệu");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pointId, onClose]);

  // Debug: Log formData changes
  useEffect(() => {
    console.log("🔍 FormData changed:", formData);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation
    if (!formData.stationId) {
      toast.error("Vui lòng chọn trạm sạc");
      return;
    }
    if (!formData.connectorTypeId) {
      toast.error("Vui lòng chọn loại đầu nối");
      return;
    }
    if (!formData.pointNumber?.trim()) {
      toast.error("Vui lòng nhập mã trụ sạc");
      return;
    }
    if (!formData.serialNumber?.trim()) {
      toast.error("Vui lòng nhập số serial");
      return;
    }
    if (!formData.maxPowerKW || formData.maxPowerKW <= 0) {
      toast.error("Công suất tối đa phải lớn hơn 0");
      return;
    }

    try {
      setSubmitting(true);

      // ✅ Chuẩn bị payload theo đúng format Backend yêu cầu (CreateChargingPointRequest)
      const payload = {
        stationId: Number(formData.stationId),
        connectorTypeId: Number(formData.connectorTypeId),
        pointNumber: formData.pointNumber.trim(),
        serialNumber: formData.serialNumber.trim(),
        installationDate: originalDates.installationDate, // Giữ ngày gốc từ database
        lastMaintenanceDate: originalDates.lastMaintenanceDate, // Giữ ngày gốc từ database
        maxPowerKW: Number(formData.maxPowerKW),
        status: formData.status,
      };

      console.log("Update payload:", payload);

      const response = await updateChargingPoint(pointId, payload);

      if (response.success) {
        toast.success("Cập nhật trụ sạc thành công!");
        onClose(); // Đóng form và refresh danh sách
      } else {
        // Backend trả về lỗi validation
        const errorMsg =
          response.message || "Cập nhật trụ sạc thất bại. Vui lòng thử lại.";
        toast.error(errorMsg);
        console.error("Backend error:", response);
      }
    } catch (error) {
      console.error("Error updating charging point:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Đã xảy ra lỗi khi cập nhật trụ sạc";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="form-overlay">
        <div
          className="form-container"
          style={{ textAlign: "center", padding: "40px" }}
        >
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚡</div>
          <h3 style={{ color: "#666", marginBottom: "10px" }}>
            Đang tải thông tin trụ sạc...
          </h3>
          <div
            className="spinner"
            style={{
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #3498db",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              animation: "spin 1s linear infinite",
              margin: "20px auto",
            }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-overlay">
      <div className="form-container">
        <Form noValidate onSubmit={handleSubmit} className="add-staff-form">
          {/* Header với icon */}
          <div className="form-header">
            <img
              src={chargingPointIcon}
              alt="ChargingPoint"
              className="staff-icon"
            />
            <h4 className="form-title">Cập nhật thông tin trụ sạc</h4>
          </div>

          {/* Thông tin nhận diện */}
          <div className="form-section">
            <h6 className="section-title">📋 Thông tin nhận diện</h6>
            <Row className="mb-3">
              <Form.Group as={Col} md={6} controlId="pointNumber">
                <Form.Label>Mã trụ sạc</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập mã trụ sạc"
                  name="pointNumber"
                  value={formData.pointNumber}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </Form.Group>

              <Form.Group as={Col} md={6} controlId="serialNumber">
                <Form.Label>Mã serial</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập mã serial"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </Form.Group>
            </Row>
          </div>

          {/* Vị trí và thiết bị */}
          <div className="form-section">
            <h6 className="section-title">📍 Vị trí & Thiết bị</h6>
            <Form.Group className="mb-3" controlId="stationId">
              <Form.Label>Chọn trạm</Form.Label>
              <Form.Control
                as="select"
                name="stationId"
                value={formData.stationId}
                onChange={handleChange}
                required
                disabled={submitting}
                style={{
                  color: "#000",
                  backgroundColor: "#fff",
                  border: "1px solid #ced4da",
                  minHeight: "38px",
                }}
              >
                <option value="" style={{ color: "#666" }}>
                  {stations.length === 0 ? "Đang tải..." : "Chọn trạm..."}
                </option>
                {stations && stations.length > 0 ? (
                  stations.map((station) => (
                    <option
                      key={station.stationId}
                      value={String(station.stationId)}
                      style={{ color: "#000" }}
                    >
                      {station.stationName}
                    </option>
                  ))
                ) : (
                  <option value="" disabled style={{ color: "#999" }}>
                    Không có dữ liệu
                  </option>
                )}
              </Form.Control>
            </Form.Group>

            <Row className="mb-3">
              <Form.Group as={Col} md={6} controlId="connectorTypeId">
                <Form.Label>Chọn cổng sạc</Form.Label>
                <Form.Control
                  as="select"
                  name="connectorTypeId"
                  value={formData.connectorTypeId}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  style={{
                    color: "#000",
                    backgroundColor: "#fff",
                    border: "1px solid #ced4da",
                    minHeight: "38px",
                  }}
                >
                  <option value="" style={{ color: "#666" }}>
                    {connectorTypes.length === 0
                      ? "Đang tải..."
                      : "Chọn cổng sạc..."}
                  </option>
                  {connectorTypes && connectorTypes.length > 0 ? (
                    connectorTypes
                      .filter((type) => !type.isDeprecated)
                      .map((type) => (
                        <option
                          key={type.connectorTypeId}
                          value={String(type.connectorTypeId)}
                          style={{ color: "#000" }}
                        >
                          {type.connectorTypeName ||
                            type.displayName ||
                            `Type ${type.connectorTypeId}`}
                        </option>
                      ))
                  ) : (
                    <option value="" disabled style={{ color: "#999" }}>
                      Không có dữ liệu
                    </option>
                  )}
                </Form.Control>
              </Form.Group>

              <Form.Group as={Col} md={6} controlId="maxPowerKW">
                <Form.Label>Năng lượng tối đa (kW)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Nhập năng lượng tối đa"
                  name="maxPowerKW"
                  value={formData.maxPowerKW}
                  onChange={handleChange}
                  step="0.1"
                  min={0}
                  max={350}
                  required
                  disabled={submitting}
                />
              </Form.Group>
            </Row>
          </div>

          {/* Trạng thái */}
          <div className="form-section">
            <h6 className="section-title">⚡ Trạng thái</h6>
            <Form.Group className="mb-3" controlId="status">
              <Form.Label>Trạng thái hoạt động</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                disabled={submitting}
                style={{ color: "#000" }}
              >
                <option value="AVAILABLE" style={{ color: "#000" }}>
                  ✅ Sẵn sàng
                </option>
                <option value="OCCUPIED" style={{ color: "#000" }}>
                  🔌 Đang sử dụng
                </option>
                <option value="MAINTENANCE" style={{ color: "#000" }}>
                  🔧 Bảo trì
                </option>
                <option value="OUT_OF_SERVICE" style={{ color: "#000" }}>
                  ❌ Ngưng hoạt động
                </option>
              </Form.Select>
            </Form.Group>
          </div>

          {/* Action buttons */}
          <div className="form-button-group">
            <Button
              variant="success"
              type="submit"
              className="btn-submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Đang lưu...
                </>
              ) : (
                <>💾 Cập nhật</>
              )}
            </Button>
            <Button
              variant="outline-secondary"
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              ← Trở về
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
