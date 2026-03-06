import { useEffect, useState } from "react";
import { addChargingPointApi } from "../../api/chargingPointApi.js";
import { getAllStations } from "../../api/stationApi.js";
import { getConnectorTypes } from "../../api/stationApi.js";
import chargingPointIcon from "../../assets/icon/admin/charging-building.png";
import { Form, Button, Row, Col } from "react-bootstrap";

const statusChargingPoint = {
  available: "AVAILABLE",
  out_of_service: "OUT_OF_SERVICE",
  maintenance: "MAINTENANCE",
};

export default function AddChargingPointForm({ onClose }) {
  const [stations, setStations] = useState([]);
  const [connectors, setConnectors] = useState([]);

  const [formData, setFormData] = useState({
    stationId: "",
    connectorTypeId: "",
    pointNumber: "",
    serialNumber: "",
    maxPowerKW: 1,
    status: statusChargingPoint.available,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await getAllStations();
        if (response.success) {
          setStations(response.data);
          console.log("Fetched stations:", response.data);
        }
      } catch (error) {
        console.error("Error fetching stations:", error);
      }
    };
    const fetchConnectors = async () => {
      try {
        const response = await getConnectorTypes();
        if (response.success) {
          setConnectors(response.data);
          console.log("Fetched connectors:", response.data);
        }
      } catch (error) {
        console.error("Error fetching connectors:", error);
      }
    };

    fetchStations();
    fetchConnectors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!value) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "Trường này là bắt buộc.",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.pointNumber)
      newErrors.pointNumber = "Mã trụ sạc là bắt buộc.";
    if (!formData.serialNumber)
      newErrors.serialNumber = "Mã serial là bắt buộc.";
    if (!formData.stationId) newErrors.stationId = "Vui lòng chọn trạm.";
    if (!formData.connectorTypeId)
      newErrors.connectorTypeId = "Vui lòng chọn cổng sạc.";
    if (formData.maxPowerKW <= 0)
      newErrors.maxPowerKW = "Năng lượng phải lớn hơn 0.";
    if (formData.maxPowerKW > 350)
      newErrors.maxPowerKW = "Năng lượng phải nhỏ hơn hoặc bằng 350.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      stationId: parseInt(formData.stationId, 10),
      connectorTypeId: parseInt(formData.connectorTypeId, 10),
      pointNumber: formData.pointNumber,
      serialNumber: formData.serialNumber,
      maxPowerKW: parseFloat(formData.maxPowerKW),
      status: formData.status,
    };

    console.log("Sending payload:", payload);

    try {
      const response = await addChargingPointApi(payload);
      if (response.success) {
        toast.success("Thêm trụ sạc thành công!");
        onClose();
      } else {
        toast.error("Thêm thất bại: " + (response.message || "Lỗi không xác định"));
        setErrors({ api: response.message || "Lỗi không xác định" });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Đã xảy ra lỗi khi gửi form.");
      setErrors({ api: "Đã xảy ra lỗi, vui lòng thử lại." });
    }
  };

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
            <h4 className="form-title">Thêm trụ sạc mới</h4>
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
                  onBlur={handleBlur}
                  required
                  isInvalid={!!errors.pointNumber}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.pointNumber}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md={6} controlId="serialNumber">
                <Form.Label>Mã serial</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập mã serial"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  isInvalid={!!errors.serialNumber}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.serialNumber}
                </Form.Control.Feedback>
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
                onBlur={handleBlur}
                required
                isInvalid={!!errors.stationId}
              >
                <option value="">Chọn trạm...</option>
                {stations.map((station) => (
                  <option key={station.stationId} value={station.stationId}>
                    {station.stationName}
                  </option>
                ))}
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                {errors.stationId}
              </Form.Control.Feedback>
            </Form.Group>

            <Row className="mb-3">
              <Form.Group as={Col} md={6} controlId="connectorTypeId">
                <Form.Label>Chọn cổng sạc</Form.Label>
                <Form.Control
                  as="select"
                  name="connectorTypeId"
                  value={formData.connectorTypeId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  isInvalid={!!errors.connectorTypeId}
                >
                  <option value="">Chọn cổng sạc...</option>
                  {connectors.map((connector) => (
                    <option
                      key={connector.connectorTypeId}
                      value={connector.connectorTypeId}
                    >
                      {connector.displayName}
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.connectorTypeId}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md={6} controlId="maxPowerKW">
                <Form.Label>Năng lượng tối đa (kW)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Nhập năng lượng tối đa"
                  name="maxPowerKW"
                  value={formData.maxPowerKW}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min={1}
                  max={350}
                  required
                  isInvalid={!!errors.maxPowerKW}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.maxPowerKW}
                </Form.Control.Feedback>
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
                onBlur={handleBlur}
                required
              >
                <option value="AVAILABLE">✅ Sẵn sàng</option>
                <option value="MAINTENANCE">🔧 Bảo trì</option>
                <option value="OUT_OF_SERVICE">❌ Ngưng hoạt động</option>
              </Form.Select>
            </Form.Group>
          </div>

          {/* Action buttons */}
          <div className="form-button-group">
            <Button variant="success" type="submit" className="btn-submit">
              ➕ Tạo mới
            </Button>
            <Button
              variant="outline-secondary"
              type="button"
              className="btn-cancel"
              onClick={onClose}
            >
              ← Trở về
            </Button>
          </div>

          {errors.api && (
            <div className="alert alert-danger mt-3" role="alert">
              {errors.api}
            </div>
          )}
        </Form>
      </div>
    </div>
  );
}
