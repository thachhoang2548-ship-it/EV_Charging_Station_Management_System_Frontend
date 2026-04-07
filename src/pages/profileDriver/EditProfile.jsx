import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { updateProfileApi } from "../../api/driverApi.js";
import { toast } from "react-toastify";
import "./EditProfile.css";
import man from "../../assets/icon/man.png";
import girl from "../../assets/icon/girl.png";
import {
  ArrowLeft, Save, User, Phone, Mail, MapPin,
  Camera, Contact, X
} from "lucide-react";

export default function EditProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [saving, setSaving] = useState(false);
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
    if (saving) return;
    setSaving(true);
    try {
      const response = await updateProfileApi(form);
      if (response.success) {
        localStorage.setItem("userDetails", JSON.stringify(form));
        toast.success("Cập nhật thông tin cá nhân thành công!");
        navigate("/profile/information", { replace: true });
      } else {
        toast.error("Cập nhật thông tin cá nhân thất bại: " + response.message);
      }
    } catch (error) {
      toast.error(
        error.message || "Đã xảy ra lỗi trong quá trình cập nhật thông tin cá nhân"
      );
    } finally {
      setSaving(false);
    }
  };

  // ✅ FIX: dùng navigate(-1) để quay lại đúng trang trước đó
  // Nếu không có history (truy cập trực tiếp URL), fallback về profile với replace
  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/profile/information", { replace: true });
    }
  };

  return (
    <div className="ep-page">
      {/* ══ TOPBAR ══ */}
      <div className="ep-topbar">
        <button type="button" className="ep-back-btn" onClick={goBack}>
          <ArrowLeft size={16} />
          <span>Quay lại</span>
        </button>
        <h1 className="ep-topbar-title">Chỉnh sửa thông tin</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="ep-content">
          {/* ══ AVATAR ══ */}
          <div className="ep-avatar-section">
            <div className="ep-avatar-container">
              <img
                src={form.gender === "M" ? man : girl}
                alt={form.name || "Avatar"}
                className="ep-avatar-img"
              />
              <button type="button" className="ep-avatar-edit-btn" title="Thay đổi ảnh đại diện">
                <Camera size={14} />
              </button>
            </div>
            <h2 className="ep-avatar-name">{form.name || "Chưa có tên"}</h2>
            <span className="ep-avatar-role">Tài xế EV</span>
          </div>

          {/* ══ CARD 1: Thông tin cá nhân ══ */}
          <div className="ep-form-card">
            <div className="ep-card-header">
              <span className="ep-card-icon green"><User size={16} /></span>
              <h3 className="ep-card-title">Thông tin cá nhân</h3>
            </div>

            <div className="ep-grid">
              {/* Họ và tên — full width */}
              <div className="ep-field ep-grid-full">
                <label className="ep-label">
                  <User size={13} /> Họ và tên <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="ep-input"
                  placeholder="Nhập họ và tên"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Giới tính */}
              <div className="ep-field">
                <label className="ep-label">
                  <User size={13} /> Giới tính
                </label>
                <select
                  className="ep-select"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="M">Nam</option>
                  <option value="F">Nữ</option>
                </select>
              </div>

              {/* Địa chỉ */}
              <div className="ep-field">
                <label className="ep-label">
                  <MapPin size={13} /> Địa chỉ
                </label>
                <input
                  type="text"
                  className="ep-input"
                  placeholder="Nhập địa chỉ"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* ══ CARD 2: Thông tin liên hệ ══ */}
          <div className="ep-form-card">
            <div className="ep-card-header">
              <span className="ep-card-icon blue"><Contact size={16} /></span>
              <h3 className="ep-card-title">Thông tin liên hệ</h3>
            </div>

            <div className="ep-grid">
              {/* Email */}
              <div className="ep-field">
                <label className="ep-label">
                  <Mail size={13} /> Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  className="ep-input"
                  placeholder="Nhập email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Số điện thoại */}
              <div className="ep-field">
                <label className="ep-label">
                  <Phone size={13} /> Số điện thoại <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="ep-input"
                  placeholder="Nhập số điện thoại"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  required
                />
                {form.phoneNumber !== (location.state?.profile?.phoneNumber || "") && (
                  <span className="ep-field-hint ep-field-hint--warning">
                    ⚠️ Thay đổi SĐT sẽ thay đổi tài khoản đăng nhập của bạn
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ══ BUTTONS ══ */}
          <div className="ep-btn-row">
            <button type="submit" className="ep-btn-save" disabled={saving}>
              {saving ? (
                <>
                  <span className="ep-btn-spinner" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Lưu thay đổi
                </>
              )}
            </button>
            <button type="button" className="ep-btn-cancel" onClick={goBack}>
              <X size={16} />
              Hủy bỏ
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
