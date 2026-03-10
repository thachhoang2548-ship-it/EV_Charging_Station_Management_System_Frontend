import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Alert from "react-bootstrap/Alert";
import { useState, useEffect } from "react";
import "./AddStaffForm.css";
import { toast } from "react-toastify";
import carIcon from "../../assets/icon/admin/model_car.png";

import { uploadImageToCloudinary } from "../../utils/uploadImg.js";
import {
  addVehicleModelApi,
  updateVehicleModelApi,
} from "../../api/modelVehicleApi.js";
import { getConnectorTypes } from "../../api/stationApi.js";

const initialFormData = {
  brand: "",
  model: "",
  year: "",
  imageUrl: "",
  imagePublicId: "",
  connectorTypeId: "",
  batteryCapacityKWh: "",
  status: "", //  'ACTIVE' 'INACTIVE'
};

const initialFormErrors = {
  brand: "",
  model: "",
  year: "",
  imageUrl: "",
  connectorTypeId: "",
  batteryCapacityKWh: "",
  status: "",
};

export default function VehicleModelForm({ onClose, model }) {
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState(initialFormErrors);
  const [apiError, setApiError] = useState("");
  const [connectorTypes, setConnectorTypes] = useState([]);
  const vehicleModelReady = model || null;
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchConnectorTypes = async () => {
      try {
        const types = await getConnectorTypes();
        if (types.success) {
          setConnectorTypes(Array.isArray(types.data) ? types.data : []);
          console.log("Fetched connector types:", types.data);
        }
      } catch (error) {
        console.error("Error fetching connector types:", error);
      }
    };

    fetchConnectorTypes();
  }, []);

  // When editing an existing model, initialize formData so controlled inputs show current values
  useEffect(() => {
    if (model) {
      setFormData({
        brand: model.brand || "",
        model: model.model || "",
        year: model.year != null ? String(model.year) : "",
        imageUrl: "", // file input cannot be prefilled
        imagePublicId: model.imagePublicId || "",
        connectorTypeId: model.connectorTypeId || "",
        batteryCapacityKWh:
          model.batteryCapacityKWh != null
            ? String(model.batteryCapacityKWh)
            : "",
        status: model.status || "",
      });
    }
  }, [model]);

  const validateField = (name, value) => {
    switch (name) {
      case "brand":
        return value.trim() ? "" : "Vui lòng nhập tên hãng.";
      case "model":
        return value.trim() ? "" : "Vui lòng nhập loại xe.";
      case "year":
        if (!value.trim()) return "Vui lòng nhập năm sản xuất.";
        if (value <= 1500) return "Xe không thể sản xuất trước năm 1500.";
        return "";
      case "connectorTypeId":
        return value.trim() ? "" : "Vui lòng chọn loại cổng sạc.";
      case "status":
        return value ? "" : "Vui lòng chọn trạng thái ban đầu.";
      case "batteryCapacityKWh":
        if (!value) return "Vui lòng nhập dung lượng pin (kWh).";
        if (isNaN(value) || value < 30 || value > 120)
          return "Dung lượng pin phải lớn hơn 30 và nhỏ hơn 120.";
        return "";

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

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
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
      const modelData = {
        brand: formData.brand || vehicleModelReady.brand,
        model: formData.model || vehicleModelReady.model,
        year: parseInt(formData.year) || vehicleModelReady.year,
        imageUrl: formData.imageUrl || vehicleModelReady.imageUrl,
        connectorTypeId:
          formData.connectorTypeId || vehicleModelReady.connectorTypeId,
        batteryCapacityKWh:
          parseFloat(formData.batteryCapacityKWh) ||
          vehicleModelReady.batteryCapacityKWh,
        status: formData.status || vehicleModelReady.status,
        imagePublicId:
          formData.imagePublicId || vehicleModelReady.imagePublicId,
      };

      if (file) {
        const uploadData = await uploadImageToCloudinary(file);
        console.log("Image uploaded successfully từ cloudinary:", uploadData);
        modelData.imageUrl = uploadData.data.secure_url;
        modelData.imagePublicId = uploadData.data.public_id;
      }

      const result = await updateVehicleModelApi(
        vehicleModelReady.modelId,
        modelData,
      );
      if (result.success) {
        toast.success("Cập nhật mô hình xe thành công!");
        onClose();
      } else {
        toast.error(result.message || "Cập nhật mô hình xe thất bại.");
        setApiError(result.message || "Cập nhật mô hình xe thất bại.");
      }
    } catch (error) {
      console.error("Lỗi hệ thống khi cập nhật mô hình xe:", error);
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

    const modelData = {
      brand: formData.brand,
      model: formData.model,
      year: formData.year,
      imageUrl: formData.imageUrl,
      connectorTypeId: formData.connectorTypeId,
      batteryCapacityKWh: formData.batteryCapacityKWh,
      status: formData.status,
      imagePublicId: formData.imagePublicId,
    };
    //gửi lên cloudinary
    const uploadData = await uploadImageToCloudinary(file);
    console.log("Image uploaded successfully từ cloudinary:", uploadData);
    modelData.imageUrl = uploadData.data.secure_url;
    modelData.imagePublicId = uploadData.data.public_id;

    console.log("Submitting model data:", modelData);

    try {
      const result = await addVehicleModelApi(modelData);
      if (result.success) {
        toast.success("Thêm mô hình xe thành công!");
        console.log("Thêm mô hình xe thành công:", result.data);
        onClose();
      } else {
        toast.error(result.message || "Thêm mô hình xe thất bại.");
        setApiError(result.message || "Thêm mô hình xe thất bại.");
      }
    } catch (error) {
      console.error("Lỗi hệ thống khi thêm trạm:", error);
      setApiError("Lỗi hệ thống. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <Form
          noValidate
          onSubmit={vehicleModelReady ? handleUpdate : handleSubmit}
          className="add-staff-form"
        >
          {/* Header với icon */}
          <div className="form-header">
            <img src={carIcon} alt="Vehicle Model" className="staff-icon" />
            <h4 className="form-title">
              {vehicleModelReady
                ? "Cập nhật thông tin mẫu xe"
                : "Thêm mẫu xe mới"}
            </h4>
          </div>

          {/* Thông tin xe */}
          <div className="form-section">
            <h6 className="section-title">🚗 Thông tin xe</h6>
            <Row className="mb-3">
              <Form.Group as={Col} md={6} controlId="brand">
                <Form.Label>Tên hãng</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="VD: VinFast, Tesla, BMW"
                  name="brand"
                  value={
                    formData.brand ||
                    (vehicleModelReady ? vehicleModelReady.brand : "")
                  }
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={!!formErrors.brand}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.brand}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md={6} controlId="model">
                <Form.Label>Loại mô hình</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="VD: VF8, Model 3, i4"
                  name="model"
                  value={
                    formData.model ||
                    (vehicleModelReady ? vehicleModelReady.model : "")
                  }
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={!!formErrors.model}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.model}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Form.Group className="mb-3" controlId="year">
              <Form.Label>Năm sản xuất</Form.Label>
              <Form.Control
                type="number"
                placeholder="VD: 2024"
                name="year"
                value={
                  formData.year ||
                  (vehicleModelReady ? vehicleModelReady.year : "")
                }
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!formErrors.year}
                min="1500"
                max="2100"
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.year}
              </Form.Control.Feedback>
            </Form.Group>
          </div>

          {/* Thông số kỹ thuật */}
          <div className="form-section">
            <h6 className="section-title">⚙️ Thông số kỹ thuật</h6>
            <Row className="mb-3">
              <Form.Group as={Col} md={6} controlId="batteryCapacityKWh">
                <Form.Label>Dung tích pin (kWh)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="VD: 87.7"
                  name="batteryCapacityKWh"
                  value={
                    formData.batteryCapacityKWh ||
                    (vehicleModelReady
                      ? vehicleModelReady.batteryCapacityKWh
                      : "")
                  }
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={!!formErrors.batteryCapacityKWh}
                  min="30"
                  max="120"
                  step="0.1"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.batteryCapacityKWh}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md={6} controlId="connectorTypeId">
                <Form.Label>Loại cổng sạc</Form.Label>
                <Form.Select
                  name="connectorTypeId"
                  value={formData.connectorTypeId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={!!formErrors.connectorTypeId}
                  required
                >
                  <option value="">Chọn cổng sạc...</option>
                  {connectorTypes.map(
                    (type) =>
                      !type.isDeprecated && (
                        <option
                          key={type.connectorTypeId}
                          value={type.connectorTypeId}
                        >
                          {type.displayName}
                        </option>
                      ),
                  )}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {formErrors.connectorTypeId}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
          </div>

          {/* Hình ảnh */}
          <div className="form-section">
            <h6 className="section-title">📷 Hình ảnh</h6>
            <Form.Group className="mb-3" controlId="imageUrl">
              <Form.Label>Ảnh đại diện</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                name="imageUrl"
                onChange={handleFileChange}
                onBlur={handleBlur}
                isInvalid={!!formErrors.imageUrl}
                required={!vehicleModelReady}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.imageUrl}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Tải lên ảnh của mẫu xe (JPG, PNG, tối đa 5MB)
              </Form.Text>
            </Form.Group>

            {vehicleModelReady && vehicleModelReady.imageUrl && (
              <div className="mb-3">
                <Form.Label>Ảnh hiện tại:</Form.Label>
                <div
                  style={{
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <img
                    style={{
                      maxHeight: "150px",
                      maxWidth: "100%",
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                    src={vehicleModelReady.imageUrl}
                    alt="Current Vehicle Model"
                  />
                </div>
              </div>
            )}
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
                isInvalid={!!formErrors.status}
                required
              >
                <option value="">Chọn trạng thái...</option>
                <option value="ACTIVE">✅ Hoạt động</option>
                <option value="INACTIVE">❌ Không hoạt động</option>
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
              {vehicleModelReady ? "💾 Cập nhật" : "➕ Tạo mới"}
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
        </Form>
      </div>
    </div>
  );
}
