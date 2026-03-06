import { useState } from "react";
import { updateAdminPasswordApi } from "../../api/admin.js";
import { updateStaffPasswordApi } from "../../api/staffApi.js";
import { changePasswordDriverApi } from "../../api/driverApi.js";
import { toast } from "react-toastify";
import { Lock, Eye, EyeOff, ShieldCheck, KeyRound, X } from "lucide-react";
import "./FormChangePassword.css";

const FIELDS = [
  { name: "oldPassword", label: "Mật khẩu hiện tại", icon: Lock, autoComplete: "current-password" },
  { name: "newPassword", label: "Mật khẩu mới", icon: KeyRound, autoComplete: "new-password", hint: "Tối thiểu 6 ký tự" },
  { name: "confirmPassword", label: "Xác nhận mật khẩu mới", icon: ShieldCheck, autoComplete: "new-password" },
];

export default function FormProfile({ onClose }) {
  const role = localStorage.getItem("role") || null;
  const [data, setData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [visibility, setVisibility] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const toggleVisibility = (name) => setVisibility((v) => ({ ...v, [name]: !v[name] }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((d) => ({ ...d, [name]: value }));
    if (errors[name]) setErrors((err) => ({ ...err, [name]: null }));
  };

  const validate = () => {
    const e = {};
    if (!data.oldPassword) e.oldPassword = "Vui lòng nhập mật khẩu hiện tại.";
    if (!data.newPassword) e.newPassword = "Vui lòng nhập mật khẩu mới.";
    else if (data.newPassword.length < 6) e.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự.";
    if (!data.confirmPassword) e.confirmPassword = "Vui lòng xác nhận mật khẩu mới.";
    else if (data.newPassword && data.newPassword !== data.confirmPassword) e.confirmPassword = "Mật khẩu xác nhận không khớp.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const apiToCall =
      role === "ADMIN" ? updateAdminPasswordApi
      : role === "STAFF" ? updateStaffPasswordApi
      : changePasswordDriverApi;
    try {
      const result = await apiToCall(data);
      if (result.success) { toast.success("Cập nhật mật khẩu thành công!"); onClose(); }
      else toast.error(result.message || "Cập nhật mật khẩu thất bại!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật mật khẩu thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cpw-overlay" onClick={onClose}>
      <div className="cpw-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cpw-header">
          <div className="cpw-header-icon"><Lock size={20} /></div>
          <div>
            <h2 className="cpw-header-title">Đổi mật khẩu</h2>
            <p className="cpw-header-desc">Cập nhật mật khẩu để bảo vệ tài khoản</p>
          </div>
          <button className="cpw-close" onClick={onClose} aria-label="Đóng"><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="cpw-body">
          {FIELDS.map((field) => {
            const Icon = field.icon;
            const hasError = !!errors[field.name];
            return (
              <div key={field.name} className={`cpw-field ${hasError ? "cpw-field-error" : ""}`}>
                <label className="cpw-label" htmlFor={field.name}>
                  <Icon size={14} className="cpw-label-icon" />
                  {field.label}
                </label>
                <div className="cpw-input-wrap">
                  <input
                    id={field.name}
                    type={visibility[field.name] ? "text" : "password"}
                    name={field.name}
                    value={data[field.name]}
                    onChange={handleChange}
                    autoComplete={field.autoComplete}
                    placeholder={field.hint || field.label}
                    className={`cpw-input ${hasError ? "cpw-input-invalid" : ""}`}
                  />
                  <button
                    type="button"
                    className="cpw-eye"
                    onClick={() => toggleVisibility(field.name)}
                    tabIndex={-1}
                    aria-label={visibility[field.name] ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {visibility[field.name] ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {field.hint && !hasError && (
                  <span className="cpw-hint">{field.hint}</span>
                )}
                {hasError && <span className="cpw-error">{errors[field.name]}</span>}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="cpw-footer">
          <button className="cpw-btn cpw-btn-cancel" onClick={onClose} disabled={submitting}>
            Hủy
          </button>
          <button className="cpw-btn cpw-btn-save" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
