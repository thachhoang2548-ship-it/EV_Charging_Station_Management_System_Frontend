import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Alert from 'react-bootstrap/Alert';
import { useState } from 'react';
import { createPoliceApi, updatePoliceApi } from '../../api/policeApi.js';
import './AddStaffForm.css';
import { toast } from 'react-toastify';
import policyIcon from '../../assets/icon/admin/policy.png';

const initialFormData = {
  policyName: '',
  policyDescription: '',
};

const initialFormErrors = {
  policyName: '',
  policyDescription: '',
};

export default function AddPolicyForm({ onClose, onAddSuccess, policy }) {
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState(initialFormErrors);
  const [apiError, setApiError] = useState('');
  const policyReady = policy || null;

  const validateField = (name, value) => {
    switch (name) {
      case 'policyName':
        return value.trim() ? '' : 'Vui lòng nhập mã điều khoản.';
      case 'policyDescription':
        return value.trim() ? '' : 'Vui lòng nhập nội dung điều khoản.';
      default:
        return '';
    }
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    const error = validateField(name, value);
    setFormErrors(prevErrors => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [name]: '',
      }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    try {
      const policyData = {
        policyName: formData.policyName || policyReady.policyName,
        policyDescription: formData.policyDescription || policyReady.policyDescription,
      };
      const result = await updatePoliceApi(policyReady.policyId, policyData);
      if (result.success) {
        toast.success('Cập nhật điều khoản thành công!');
        onAddSuccess();
        onClose();
      } else {
        toast.error(result.message || 'Cập nhật điều khoản thất bại.');
        setApiError(result.message || 'Cập nhật điều khoản thất bại.');
      }
    } catch (error) {
      console.error('Lỗi hệ thống khi cập nhật điều khoản:', error);
      setApiError('Lỗi hệ thống. Vui lòng thử lại sau.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError('');

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

    const policyData = {
      policyName: formData.policyName,
      policyDescription: formData.policyDescription,
    };

    try {
      const result = await createPoliceApi(policyData);
      if (result.success) {
        toast.success('Thêm điều khoản thành công!');
        onAddSuccess();
        onClose();
      } else {
        toast.error(result.message || 'Thêm điều khoản thất bại.');
        setApiError(result.message || 'Thêm điều khoản thất bại.');
      }
    } catch (error) {
      console.error('Lỗi hệ thống khi thêm điều khoản:', error);
      setApiError('Lỗi hệ thống. Vui lòng thử lại sau.');
    }
  };

  const handleBack = () => {
    onClose();
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <Form noValidate onSubmit={policyReady ? handleUpdate : handleSubmit} className="add-staff-form">
          {/* Header với icon */}
          <div className="form-header">
            <img src={policyIcon} alt="Policy" className="staff-icon" />
            <h4 className="form-title">
              {policyReady ? 'Cập nhật điều khoản' : 'Thêm điều khoản mới'}
            </h4>
          </div>

          {/* Thông tin điều khoản */}
          <div className="form-section">
            <h6 className="section-title">📋 Thông tin điều khoản</h6>
            <Form.Group className="mb-3" controlId="policyName">
              <Form.Label>Mã điều khoản</Form.Label>
              <Form.Control
                type="text"
                placeholder="VD: BR-01, BR-02, TC-01"
                name="policyName"
                value={formData.policyName || (policyReady ? policyReady.policyName : '')}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!formErrors.policyName}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.policyName}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Mã định danh duy nhất cho điều khoản (BR: Business Rules, TC: Terms & Conditions)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="policyDescription">
              <Form.Label>Nội dung điều khoản</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                placeholder="Nhập nội dung chi tiết của điều khoản..."
                name="policyDescription"
                value={formData.policyDescription || (policyReady ? policyReady.policyDescription : '')}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!formErrors.policyDescription}
                required
                style={{ resize: 'vertical' }}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.policyDescription}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Mô tả đầy đủ và chi tiết nội dung điều khoản, quy định hoặc chính sách
              </Form.Text>
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
              {policyReady ? '💾 Cập nhật' : '➕ Tạo mới'}
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
