import accidentImg from "../../assets/icon/admin/accident.png";
import "./AddStaffForm.css";

const SEVERITY_LABEL = {
  low: "🟢 Thấp",
  medium: "🟡 Trung bình",
  high: "🔴 Cao",
};

const STATUS_LABEL = {
  REPORTED: "⏳ Chưa xử lý",
  RESOLVED: "✅ Đã xử lý",
};

export default function AccidentDetail({ accident, handleClose }) {
  return (
    <div className="form-overlay">
      <div className="form-container">
        <div className="add-staff-form">
          {/* Header */}
          <div className="form-header">
            <img src={accidentImg} alt="Accident" className="staff-icon" />
            <h4 className="form-title">Chi tiết báo cáo sự cố</h4>
          </div>

          {/* Thông tin chung */}
          <div className="form-section">
            <h6 className="section-title">📋 Thông tin chung</h6>
            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label className="form-label">Tiêu đề</label>
                <div
                  className="form-control"
                  style={{ backgroundColor: "#f9fafb", cursor: "default" }}
                >
                  {accident?.title || "—"}
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Mức độ nghiêm trọng</label>
                <div
                  className="form-control"
                  style={{ backgroundColor: "#f9fafb", cursor: "default" }}
                >
                  {SEVERITY_LABEL[accident?.severity] ||
                    accident?.severity ||
                    "—"}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Trạng thái</label>
                <div
                  className="form-control"
                  style={{ backgroundColor: "#f9fafb", cursor: "default" }}
                >
                  {STATUS_LABEL[accident?.status] || accident?.status || "—"}
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Ngày báo cáo</label>
                <div
                  className="form-control"
                  style={{ backgroundColor: "#f9fafb", cursor: "default" }}
                >
                  {accident?.reportedAt
                    ? accident.reportedAt.split("T")[0]
                    : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin trạm & nhân viên */}
          <div className="form-section">
            <h6 className="section-title">🏢 Trạm &amp; Nhân viên</h6>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Trạm sạc</label>
                <div
                  className="form-control"
                  style={{ backgroundColor: "#f9fafb", cursor: "default" }}
                >
                  {accident?.stationName || "—"}
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Nhân viên báo cáo</label>
                <div
                  className="form-control"
                  style={{ backgroundColor: "#f9fafb", cursor: "default" }}
                >
                  {accident?.staffName || "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Mô tả chi tiết */}
          <div className="form-section">
            <h6 className="section-title">📝 Mô tả chi tiết</h6>
            <label className="form-label">Nội dung báo cáo</label>
            <div
              className="form-control"
              style={{
                backgroundColor: "#f9fafb",
                cursor: "default",
                minHeight: "100px",
                whiteSpace: "pre-wrap",
              }}
            >
              {accident?.description || "—"}
            </div>
          </div>

          {/* Action buttons */}
          <div className="form-button-group">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              ← Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
