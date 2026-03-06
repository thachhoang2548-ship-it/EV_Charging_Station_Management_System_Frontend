import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { updateProfileApi } from "../../api/driverApi.js";
import { toast } from "react-toastify";
import { Form } from "react-bootstrap";
import Header from "../../components/admin/Header.jsx";
import "../admin/Dashboard.css";
import "./EditProfile.css";
import man from "../../assets/icon/man.png";
import girl from "../../assets/icon/girl.png";
import {
  ArrowLeft, Save, User, Phone, Mail, MapPin,
  Fingerprint, Info, Contact, X
} from "lucide-react";

export default function EditProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(
    location.state?.profile
      ? location.state.profile
      : { email: "", phoneNumber: "", name: "", address: "", gender: "" }
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateProfileApi(form);
      if (response.success) {
        localStorage.setItem("userDetails", JSON.stringify(form));
        toast.success("Cập nhật thông tin cá nhân thành công!");
        navigate("/profile/information");
      } else {
        toast.error("Cập nhật thông tin cá nhân thất bại: " + response.message);
      }
    } catch (error) {
      toast.error(
        error.message || "Đã xảy ra lỗi trong quá trình cập nhật thông tin cá nhân"
      );
    }
  };

  return (
    <div className="dashboard-container">
      <Header />

      <Form onSubmit={handleSubmit}>
        <div className="ep-layout">
          {/* ══ LEFT SIDEBAR ══ */}
          <aside className="ep-sidebar">
            <div className="ep-avatar-wrap">
              <img
                src={form.gender === "M" ? man : girl}
                alt={form.name || "Avatar"}
                className="ep-avatar"
              />
            </div>
            <h2 className="ep-sidebar-name">{form.name || "Chưa có tên"}</h2>
            <span className="ep-sidebar-tag">Tài xế EV</span>

            <div className="ep-sidebar-nav">
              <button
                type="button"
                className="ep-nav-btn outline"
                onClick={() => navigate("/profile/information")}
              >
                <ArrowLeft size={15} />
                Quay lại
              </button>
            </div>
          </aside>

          {/* ══ RIGHT MAIN ══ */}
          <div className="ep-main">
            {/* Section: Identity */}
            <div className="ep-section">
              <div className="ep-section-header">
                <span className="ep-section-icon identity">
                  <User size={18} />
                </span>
                <h3 className="ep-section-title">Thông tin cá nhân</h3>
              </div>

              <div className="ep-field-grid">
                <div className="ep-field ep-field-full">
                  <label className="ep-field-label">
                    <User size={14} /> Họ và tên
                  </label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập họ và tên"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="ep-field">
                  <label className="ep-field-label">
                    <Fingerprint size={14} /> Giới tính
                  </label>
                  <Form.Select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="M">Nam</option>
                    <option value="F">Nữ</option>
                  </Form.Select>
                </div>

                <div className="ep-field">
                  <label className="ep-field-label">
                    <MapPin size={14} /> Địa chỉ
                  </label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập địa chỉ"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Section: Contact */}
            <div className="ep-section">
              <div className="ep-section-header">
                <span className="ep-section-icon contact">
                  <Contact size={18} />
                </span>
                <h3 className="ep-section-title">Thông tin liên hệ</h3>
              </div>

              <div className="ep-field-grid">
                <div className="ep-field">
                  <label className="ep-field-label">
                    <Mail size={14} /> Email
                  </label>
                  <Form.Control
                    type="email"
                    placeholder="Nhập email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="ep-field">
                  <label className="ep-field-label">
                    <Phone size={14} /> Số điện thoại
                  </label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập số điện thoại"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>


            </div>

            {/* Submit row */}
            <div className="ep-btn-row">
              <button type="submit" className="ep-btn-submit">
                <Save size={16} />
                Lưu thay đổi
              </button>
              <button
                type="button"
                className="ep-btn-cancel"
                onClick={() => navigate("/profile/information")}
              >
                <X size={16} />
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}
