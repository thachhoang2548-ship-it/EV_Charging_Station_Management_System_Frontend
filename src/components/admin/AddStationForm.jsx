import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Alert from "react-bootstrap/Alert";
import stationIcon from "../../assets/icon/staff/charging-station.png";
import { useState } from "react";
import { addStationApi, updateStationApi } from "../../api/stationApi.js";

import "./AddStaffForm.css";
import { toast } from "react-toastify";

const initialFormData = {
  stationName: "",
  address: "",
  latitude: "",
  longitude: "",
  operatingHours: "",
  status: "", //  'ACTIVE', 'MAINTENANCE', 'INACTIVE'
};

const initialFormErrors = {
  stationName: "",
  address: "",
  latitude: "",
  longitude: "",
  operatingHours: "",
  status: "",
};

export default function AddStationForm({ onClose, onAddSuccess, station }) {
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState(initialFormErrors);
  const [apiError, setApiError] = useState("");
  const stationReady = station || null;

  const validateField = (name, value) => {
    switch (name) {
      case "stationName":
        return value.trim() ? "" : "Vui lòng nhập tên trạm.";
      case "address":
        return value.trim() ? "" : "Vui lòng nhập địa chỉ trạm.";
      case "latitude":
        if (!value.trim()) return "Vui lòng nhập vĩ độ.";
        if (!/^-?([0-9]*[.])?[0-9]+$/.test(value))
          return "Vĩ độ phải là một số hợp lệ.";
        return "";
      case "longitude":
        if (!value.trim()) return "Vui lòng nhập kinh độ.";
        if (!/^-?([0-9]*[.])?[0-9]+$/.test(value))
          return "Kinh độ phải là một số hợp lệ.";
        return "";
      case "operatingHours":
        return value.trim() ? "" : "Vui lòng nhập giờ hoạt động (VD: 24/7).";
      case "status":
        return value ? "" : "Vui lòng chọn trạng thái ban đầu.";
      default:
        return "";
    }
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;

    const error = validateField(name, value);
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
    if (apiError) {
      setApiError("");
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    try {
      const stationData = {
        stationName: formData.stationName || stationReady.stationName,
        address: formData.address || stationReady.address,
        latitude: parseFloat(formData.latitude) || stationReady.latitude,
        longitude: parseFloat(formData.longitude) || stationReady.longitude,
        operatingHours: formData.operatingHours || stationReady.operatingHours,
        status: formData.status || stationReady.status,
      };
      const result = await updateStationApi(
        stationReady.stationId,
        stationData,
      );
      if (result.success) {
        toast.success("Cập nhật trạm sạc thành công!");
        onAddSuccess();
        console.log("Cập nhật trạm thành công:", result.data);
        onClose();
      } else {
        toast.error(result.message || "Cập nhật trạm sạc thất bại.");
        setApiError(result.message || "Cập nhật trạm sạc thất bại.");
      }
    } catch (error) {
      console.error("Lỗi hệ thống khi cập nhật trạm:", error);
      setApiError("Lỗi hệ thống. Vui lòng thử lại sau.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError("");

    let newErrors = {};
    let hasError = false;
    for (const key in formData) {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        hasError = true;
      }
    }

    if (hasError) {
      setFormErrors(newErrors);
      return;
    }

    const stationData = {
      stationName: formData.stationName,
      address: formData.address,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      operatingHours: formData.operatingHours,
      status: formData.status,
    };

    console.log("Submitting station data:", stationData);

    try {
      const result = await addStationApi(stationData);
      if (result.success) {
        toast.success("Thêm trạm sạc thành công!");
        onAddSuccess();
        console.log("Thêm trạm thành công:", result.data);
        onClose();
      } else {
        toast.error(result.message || "Thêm trạm sạc thất bại.");
        setApiError(result.message || "Thêm trạm sạc thất bại.");
      }
    } catch (error) {
      console.error("Lỗi hệ thống khi thêm trạm:", error);
      setApiError("Lỗi hệ thống. Vui lòng thử lại sau.");
    }
  };

  const handleBack = () => {
    onClose();
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <Form
          noValidate
          onSubmit={stationReady ? handleUpdate : handleSubmit}
          className="add-staff-form"
        >
          {/* Header với icon */}
          <div className="form-header">
            <img src={stationIcon} alt="Station" className="staff-icon" />
            <h4 className="form-title">
              {stationReady
                ? "Cập nhật thông tin trạm sạc"
                : "Thêm trạm sạc mới"}
            </h4>
          </div>

          {/* Thông tin cơ bản */}
          <div className="form-section">
            <h6 className="section-title">📋 Thông tin cơ bản</h6>
            <Row className="mb-3">
              <Form.Group as={Col} md={6} controlId="stationName">
                <Form.Label>Tên trạm sạc</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập tên trạm sạc"
                  name="stationName"
                  value={
                    formData.stationName ||
                    (stationReady ? stationReady.stationName : "")
                  }
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={!!formErrors.stationName}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.stationName}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md={6} controlId="operatingHours">
                <Form.Label>Giờ hoạt động</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="VD: 24/7 hoặc 8:00 - 22:00"
                  name="operatingHours"
                  value={
                    formData.operatingHours ||
                    (stationReady ? stationReady.operatingHours : "")
                  }
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={!!formErrors.operatingHours}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.operatingHours}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
          </div>

          {/* Vị trí địa lý */}
          <div className="form-section">
            <h6 className="section-title">📍 Vị trí địa lý</h6>
            <Row className="mb-3">
              <Form.Group as={Col} md={6} controlId="latitude">
                <Form.Label>Vĩ độ (Latitude)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="VD: 10.7769"
                  name="latitude"
                  value={
                    formData.latitude ||
                    (stationReady ? stationReady.latitude : "")
                  }
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={!!formErrors.latitude}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.latitude}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md={6} controlId="longitude">
                <Form.Label>Kinh độ (Longitude)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="VD: 106.6953"
                  name="longitude"
                  value={
                    formData.longitude ||
                    (stationReady ? stationReady.longitude : "")
                  }
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={!!formErrors.longitude}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.longitude}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Form.Group className="mb-3" controlId="address">
              <Form.Label>Địa chỉ chi tiết</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Nhập địa chỉ chi tiết của trạm"
                name="address"
                value={
                  formData.address || (stationReady ? stationReady.address : "")
                }
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!formErrors.address}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.address}
              </Form.Control.Feedback>
            </Form.Group>
          </div>

          {/* Trạng thái */}
          <div className="form-section">
            <h6 className="section-title">⚡ Trạng thái</h6>
            <Form.Group className="mb-3" controlId="status">
              <Form.Label>Trạng thái hoạt động</Form.Label>
              <Form.Select
                name="status"
                value={
                  formData.status || (stationReady ? stationReady.status : "")
                }
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!formErrors.status}
                required
              >
                <option value="">Chọn trạng thái...</option>
                <option value="ACTIVE">✅ Hoạt động</option>
                <option value="MAINTENANCE">🔧 Bảo trì</option>
                <option value="INACTIVE">❌ Ngưng hoạt động</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {formErrors.status}
              </Form.Control.Feedback>
            </Form.Group>
          </div>

          {/* Alert for API errors */}
          {apiError && (
            <Alert variant="danger" className="mt-3">
              {apiError}
            </Alert>
          )}

          {/* Action buttons */}
          <div className="form-button-group">
            <Button variant="success" type="submit" className="btn-submit">
              {stationReady ? "💾 Cập nhật" : "➕ Tạo mới"}
            </Button>
            <Button
              variant="outline-secondary"
              type="button"
              className="btn-cancel"
              onClick={handleBack}
            >
              ← Trở về
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
