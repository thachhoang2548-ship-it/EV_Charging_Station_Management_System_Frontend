import Form from "react-bootstrap/Form";
import { transferStaffApi } from "../../api/admin.js";
import "./AddStaffForm.css";
import Button from "react-bootstrap/Button";
import staffIcon from "../../assets/icon/admin/staff.png";
import { toast } from "react-toastify";

export default function SelectStationForm({
  onClose,
  onAddSuccess,
  staff,
  staffsStationData,
  stations,
}) {
  if (!staff) return null;

  const currentStationEntry = staffsStationData.find(
    (s) =>
      (staff.staffId && s.staffId === staff.staffId) ||
      (staff.userId && s.userId === staff.userId)
  );

  const currentStationId = currentStationEntry?.stationId;

  const currentStationName = stations.find(
    (station) => station.stationId === currentStationId
  )?.stationName;

  const handleTransferStaff = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const selectedStation = formData.get("station");

    if (!selectedStation) {
      toast.error("Vui lòng chọn một trạm sạc.");
      return;
    }

    const staffIdToSend =
      staff.staffId ||
      staffsStationData.find((s) => s.userId === staff.userId)?.staffId;

    if (!staffIdToSend) {
      toast.error("Không xác định được ID nhân viên để chuyển công tác.");
      return;
    }

    console.log("Staff ID to send:", staffIdToSend);
    console.log("Selected Station ID:", selectedStation);

    const response = await transferStaffApi(staffIdToSend, selectedStation);
    if (response.success) {
      toast.success("Chuyển công tác thành công!");
      handleClose();
    } else {
      toast.error("Chuyển công tác thất bại. Vui lòng thử lại.");
    }
  };

  const handleClose = () => {
    onClose();
    onAddSuccess();
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <Form onSubmit={handleTransferStaff} className="add-staff-form">
          {/* Header với icon */}
          <div className="form-header">
            <img src={staffIcon} alt="Transfer Staff" className="staff-icon" />
            <h4 className="form-title">Chuyển công tác nhân viên</h4>
          </div>

          {/* Thông tin nhân viên */}
          <div className="form-section">
            <h6 className="section-title">👤 Thông tin nhân viên</h6>
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Tên nhân viên:</strong> <span style={{ color: '#16a34a' }}>{staff.name}</span>
              </div>
              {currentStationName && (
                <div>
                  <strong>Trạm hiện tại:</strong> <span style={{ color: '#dc2626' }}>{currentStationName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Chọn trạm mới */}
          <div className="form-section">
            <h6 className="section-title">🏢 Chọn trạm sạc mới</h6>
            <Form.Group className="mb-3" controlId="station">
              <Form.Label>Trạm sạc</Form.Label>
              <Form.Select aria-label="select station" name="station" required>
                <option value="">Chọn trạm sạc mới...</option>
                {stations
                  .filter(
                    (station) =>
                      station.stationId != currentStationId &&
                      station.status !== "INACTIVE"
                  )
                  .map((station) => (
                    <option key={station.stationId} value={station.stationId}>
                      {station.stationName}
                    </option>
                  ))}
              </Form.Select>
              <Form.Text className="text-muted">
                ⚠️ Thay đổi trạm làm việc sẽ áp dụng cho nhân viên này ngay lập tức
              </Form.Text>
            </Form.Group>
          </div>

          {/* Action buttons */}
          <div className="form-button-group">
            <Button variant="success" type="submit" className="btn-submit">
              ✅ XÁC NHẬN CHUYỂN CÔNG TÁC
            </Button>
            <Button
              variant="outline-secondary"
              type="button"
              className="btn-cancel"
              onClick={handleClose}
            >
              ← Trở về
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
