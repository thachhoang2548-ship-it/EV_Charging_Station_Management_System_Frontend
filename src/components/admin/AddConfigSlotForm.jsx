import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { addSlotConfigApi } from '../../api/stationApi.js';
import {toast} from 'react-toastify';
import './AddStaffForm.css';

export default function AddConfigSlotForm({handleClose, stationId, slotMinutes}) {
    const date = new Date();
    const dateEnd = new Date();
    dateEnd.setFullYear(dateEnd.getFullYear() + 1);
    
    const handleCreateSlotConfig = (e) => {
        e.preventDefault();
        const form = e.target;
        const slotDurationMin = form.configSlot.value;
        const slotValue = parseInt(slotDurationMin) || 15;
        
        // Kiểm tra input phải chia hết cho 5
        if (slotValue % 5 !== 0) {
            toast.error('Thời gian slot phải chia hết cho 5 phút!');
            return;
        }
        
        const dataForm = {
            stationId: stationId,
            slotDurationMin: slotValue,
            activeFrom: date.toISOString(),
            activeExpire: dateEnd.toISOString(),  
            isActive: "ACTIVE",
        };
        console.log("Dữ liệu gửi lên API:", dataForm);
        const createSlotConfig = async () => {
            try {
                const response = await addSlotConfigApi(dataForm);
                if (response.success) {
                    toast.success('Tạo cấu hình slot thành công!');
                    handleClose();
                } else {
                    toast.error('Tạo cấu hình slot thất bại: ' + response.message);
                }
                
            } catch (error) {
                console.error("Lỗi khi tạo cấu hình slot:", error);
            }
        };
        createSlotConfig();
    };
    return (
    <>
      <div className="form-overlay" onClick={handleClose}>
        <div className="form-container" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="form-header">
            <h4>Cấu hình thời gian slot</h4>
          </div>

          <Form onSubmit={handleCreateSlotConfig} className="add-staff-form">
            {/* Section: Cấu hình slot */}
            <div className="form-section">
              <h5 className="section-title">⏱️ Cấu hình thời gian</h5>
              
              <Form.Group className="mb-3" controlId="configSlot">
                <Form.Label>Thời gian slot (phút) <span style={{color: 'red'}}>*</span></Form.Label>
                <Form.Control 
                  type="number" 
                  placeholder="Nhập thời gian slot (ví dụ: 10, 15, 20, 30...)" 
                  min={10} 
                  max={120} 
                  defaultValue={slotMinutes || 15}
                  required
                />
                <Form.Text className="text-muted">
                  ⚠️ Thời gian slot phải chia hết cho 5 phút (ví dụ: 10, 15, 20, 25, 30...). Cấu hình sẽ áp dụng ngay lập tức cho trạm sạc và có hiệu lực trong vòng 1 năm.
                </Form.Text>
              </Form.Group>
            </div>

            {/* Buttons */}
            <div className="form-button-group mt-4">
              <Button variant="success" type="submit" className="btn-submit">
                Cấu hình
              </Button>
              <Button variant="outline-secondary" type="button" className="btn-cancel" onClick={handleClose}>
                Hủy
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}