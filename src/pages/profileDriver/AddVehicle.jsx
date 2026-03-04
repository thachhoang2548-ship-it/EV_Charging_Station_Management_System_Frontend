import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getAllVehicleBrandsApi,
  getModelsByBrandApi,
  addVehicleApi,
} from "../../api/driverApi.js";
import ModelVehicle from "../../components/driver/ModelVehicle.jsx";
import {
  Car,
  X,
  ChevronLeft,
  Plus,
  Hash,
  Check,
} from "lucide-react";
import "./AddVehicle.css";

export default function AddVehicle({ onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [brand, setBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState(null);
  const [vehicle, setVehicle] = useState({ modelId: "", licensePlate: "" });

  /* ── Fetch brands on mount ── */
  useEffect(() => {
    const fetchBrands = async () => {
      const res = await getAllVehicleBrandsApi();
      if (res.success) setBrands(res.data);
    };
    fetchBrands();
  }, []);

  /* ── Fetch models when brand changes ── */
  useEffect(() => {
    if (!brand) return;
    const fetchModels = async () => {
      const res = await getModelsByBrandApi(brand);
      if (res.success) setModels(res.data);
    };
    fetchModels();
  }, [brand]);

  /* ── Select a model → go to step 2 ── */
  const handleSelectModel = (model) => {
    setSelectedModel(model);
    setVehicle((v) => ({ ...v, modelId: model.modelId }));
    setStep(2);
  };

  /* ── Submit ── */
  const handleAddVehicle = async () => {
    if (!vehicle.licensePlate || !vehicle.modelId) {
      toast.warn("Vui lòng nhập đầy đủ thông tin xe!");
      return;
    }
    try {
      const res = await addVehicleApi(vehicle);
      if (res.success) {
        toast.success("Thêm xe thành công!");
        setVehicle({ modelId: "", licensePlate: "" });
        setBrand("");
        setStep(1);
        onSuccess?.();
        onClose?.();
      } else {
        toast.error(res.message || "Thêm xe thất bại!");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống: " + (error.response?.data || error.message));
    }
  };

  return (
    <div className="av-overlay" onClick={onClose}>
      <div className="av-modal" onClick={(e) => e.stopPropagation()}>
        {/* ── Header ── */}
        <div className="av-header">
          <div className="av-header-left">
            <span className="av-header-icon"><Car size={20} /></span>
            <h3 className="av-header-title">Thêm xe mới</h3>
          </div>
          <button className="av-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* ── Step indicator ── */}
        <div className="av-progress">
          <div className={`av-step ${step >= 1 ? "active" : ""} ${step > 1 ? "done" : ""}`}>
            <span className="av-step-num">{step > 1 ? <Check size={14} /> : "1"}</span>
            <span className="av-step-label">Chọn xe</span>
          </div>
          <div className={`av-step-line ${step > 1 ? "done" : ""}`} />
          <div className={`av-step ${step >= 2 ? "active" : ""}`}>
            <span className="av-step-num">2</span>
            <span className="av-step-label">Xác nhận</span>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="av-body">
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <label className="av-select-label">Thương hiệu</label>
              <select
                className="av-select"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="">-- Chọn thương hiệu --</option>
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              {models.length > 0 && (
                <>
                  <p className="av-model-section-title">Chọn mẫu xe</p>
                  <div className="av-model-grid">
                    {models
                      .filter((m) => m.status === "ACTIVE")
                      .map((model) => (
                        <div
                          key={model.id}
                          onClick={() => handleSelectModel(model)}
                        >
                          <ModelVehicle model={model} />
                        </div>
                      ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              {/* Selected model summary */}
              {selectedModel && (
                <div className="av-confirm-card">
                  {selectedModel.imageUrl ? (
                    <img
                      src={selectedModel.imageUrl}
                      alt={selectedModel.model}
                      className="av-confirm-img"
                    />
                  ) : (
                    <span className="av-confirm-icon"><Car size={24} /></span>
                  )}
                  <div className="av-confirm-info">
                    <p className="av-confirm-name">{selectedModel.model}</p>
                    <p className="av-confirm-detail">
                      {selectedModel.year} · {selectedModel.connectorTypeDisplayName} · {selectedModel.connectorDefaultMaxPowerKW} kW
                    </p>
                  </div>
                </div>
              )}

              {/* License plate */}
              <div className="av-input-group">
                <label className="av-input-label">
                  <Hash size={13} /> Biển số xe
                </label>
                <input
                  className="av-input"
                  type="text"
                  value={vehicle.licensePlate}
                  onChange={(e) =>
                    setVehicle({ ...vehicle, licensePlate: e.target.value })
                  }
                  placeholder="Ví dụ: 51A-123.45"
                />
              </div>

              {/* Actions */}
              <div className="av-btn-row">
                <button className="av-btn-back" onClick={() => setStep(1)}>
                  <ChevronLeft size={16} /> Quay lại
                </button>
                <button className="av-btn-submit" onClick={handleAddVehicle}>
                  <Plus size={16} /> Thêm xe
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}