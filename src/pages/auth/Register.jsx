import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerApi } from "../../api/authApi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import EVLogoIcon from "../../components/logo/EVLogoIcon.jsx";
import "./login.css";
import "./Register-mobile.css";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    phoneNumber: "",
    name: "",
    dateOfBirth: null,
    gender: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateAll = () => {
    const newErrors = {};

    if (!form.email) {
      newErrors.email = "Vui lòng nhập email";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        newErrors.email = "Email không đúng định dạng";
      }
    }

    if (!form.phoneNumber) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
    } else {
      const phoneRegex = /^0[0-9]{9}$/;
      if (!phoneRegex.test(form.phoneNumber)) {
        newErrors.phoneNumber =
          "Số điện thoại phải có 10 chữ số, bắt đầu bằng 0";
      }
    }

    if (!form.name) newErrors.name = "Vui lòng nhập họ tên";

    if (!form.dateOfBirth) {
      newErrors.dateOfBirth = "Vui lòng chọn ngày sinh";
    } else {
      const today = new Date();
      let age = today.getFullYear() - form.dateOfBirth.getFullYear();
      const m = today.getMonth() - form.dateOfBirth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < form.dateOfBirth.getDate()))
        age--;
      if (age < 18) newErrors.dateOfBirth = "Bạn phải từ 18 tuổi trở lên";
    }

    if (!form.gender) newErrors.gender = "Vui lòng chọn giới tính";
    if (!form.address) newErrors.address = "Vui lòng nhập địa chỉ";

    if (!form.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (form.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    if (!acceptTerms) {
      toast.error("Bạn cần đồng ý điều khoản trước khi đăng ký!");
      return;
    }

    const genderMap = { Nam: "M", Nữ: "F" };
    const formatDate = (date) => {
      if (!date) return "";
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };

    const registerData = {
      email: form.email,
      phoneNumber: form.phoneNumber,
      passwordHash: form.password,
      name: form.name,
      dateOfBirth: formatDate(form.dateOfBirth),
      gender: genderMap[form.gender] || form.gender,
      address: form.address,
    };

    setLoading(true);
    try {
      const response = await registerApi(registerData);
      if (response.success) {
        const message = response.data?.message || response.message || "";
        if (message.toLowerCase().includes("otp")) {
          toast.success("OTP đã được gửi về email của bạn!");
          toast.info("Vui lòng kiểm tra email để lấy mã OTP", {
            autoClose: 5000,
          });
          setTimeout(
            () => navigate("/verify-otp", { state: { registerData } }),
            2000,
          );
        } else {
          toast.success(message || "Đăng ký thành công!");
          setTimeout(() => navigate("/login"), 2000);
        }
      } else {
        const errorMessage = response.message || "Đăng ký thất bại!";
        if (response.status === 408) {
          toast.info(
            "He thong dang xu ly cham. OTP co the da duoc gui, vui long kiem tra email.",
            { autoClose: 5000 },
          );
          setTimeout(
            () => navigate("/verify-otp", { state: { registerData } }),
            1200,
          );
        } else if (errorMessage.toLowerCase().includes("phone")) {
          setErrors((prev) => ({
            ...prev,
            phoneNumber: "Số điện thoại đã được sử dụng!",
          }));
        } else if (errorMessage.toLowerCase().includes("email")) {
          setErrors((prev) => ({ ...prev, email: "Email đã được sử dụng!" }));
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi đăng ký!";
      if (errorMessage.toLowerCase().includes("phone")) {
        setErrors((prev) => ({
          ...prev,
          phoneNumber: "Số điện thoại đã được sử dụng!",
        }));
      } else if (errorMessage.toLowerCase().includes("email")) {
        setErrors((prev) => ({ ...prev, email: "Email đã được sử dụng!" }));
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-page">
      <ToastContainer position="top-center" autoClose={2500} theme="colored" />
      <div className="auth-container register-container">
        <div className="auth-logo">
          <div className="auth-logo-icon auth-logo-bolt">
            <EVLogoIcon className="auth-logo-bolt-svg" strokeWidth={2.5} />
          </div>
          <h1 className="auth-title">Đăng Ký</h1>
        </div>

        <form onSubmit={handleSubmit} className="auth-form register-form">
          {/* Email */}
          <div className="auth-input-group">
            <label className="register-field-label">Email</label>
            <div
              className={`auth-input-wrapper ${errors.email ? "error" : ""}`}
            >
              <span className="auth-input-icon">📧</span>
              <input
                type="email"
                name="email"
                placeholder="Nhập email của bạn"
                value={form.email}
                onChange={handleChange}
                className="auth-input"
              />
            </div>
            {errors.email && (
              <span className="auth-error-message">{errors.email}</span>
            )}
          </div>

          {/* Số điện thoại */}
          <div className="auth-input-group">
            <label className="register-field-label">Số điện thoại</label>
            <div
              className={`auth-input-wrapper ${errors.phoneNumber ? "error" : ""}`}
            >
              <span className="auth-input-icon">📱</span>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Nhập số điện thoại"
                value={form.phoneNumber}
                onChange={handleChange}
                className="auth-input"
              />
            </div>
            {errors.phoneNumber && (
              <span className="auth-error-message">{errors.phoneNumber}</span>
            )}
          </div>

          {/* Họ và tên */}
          <div className="auth-input-group">
            <label className="register-field-label">Họ và tên</label>
            <div className={`auth-input-wrapper ${errors.name ? "error" : ""}`}>
              <span className="auth-input-icon">👤</span>
              <input
                type="text"
                name="name"
                placeholder="Nhập họ và tên"
                value={form.name}
                onChange={handleChange}
                className="auth-input"
              />
            </div>
            {errors.name && (
              <span className="auth-error-message">{errors.name}</span>
            )}
          </div>

          {/* Ngày sinh */}
          <div className="auth-input-group">
            <label className="register-field-label">Ngày sinh</label>
            <div
              className={`auth-input-wrapper date-picker-wrapper ${errors.dateOfBirth ? "error" : ""}`}
            >
              <span className="auth-input-icon">📅</span>
              <DatePicker
                selected={form.dateOfBirth}
                onChange={(date) => {
                  setForm({ ...form, dateOfBirth: date });
                  if (errors.dateOfBirth)
                    setErrors({ ...errors, dateOfBirth: "" });
                }}
                dateFormat="dd/MM/yyyy"
                placeholderText="Chọn ngày sinh"
                className="auth-input"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                maxDate={
                  new Date(
                    new Date().getFullYear() - 18,
                    new Date().getMonth(),
                    new Date().getDate(),
                  )
                }
                yearDropdownItemNumber={100}
                scrollableYearDropdown
                popperPlacement="bottom-start"
              />
            </div>
            {errors.dateOfBirth && (
              <span className="auth-error-message">{errors.dateOfBirth}</span>
            )}
          </div>

          {/* Giới tính */}
          <div className="auth-input-group">
            <label className="register-field-label">Giới tính</label>
            <div
              className={`auth-gender-options ${errors.gender ? "error" : ""}`}
            >
              <div className="auth-gender-option">
                <input
                  type="radio"
                  id="gender-male"
                  name="gender"
                  value="Nam"
                  checked={form.gender === "Nam"}
                  onChange={handleChange}
                />
                <label htmlFor="gender-male" className="auth-gender-label">
                  Nam
                </label>
              </div>
              <div className="auth-gender-option">
                <input
                  type="radio"
                  id="gender-female"
                  name="gender"
                  value="Nữ"
                  checked={form.gender === "Nữ"}
                  onChange={handleChange}
                />
                <label htmlFor="gender-female" className="auth-gender-label">
                  Nữ
                </label>
              </div>
            </div>
            {errors.gender && (
              <span className="auth-error-message">{errors.gender}</span>
            )}
          </div>

          {/* Địa chỉ */}
          <div className="auth-input-group">
            <label className="register-field-label">Địa chỉ</label>
            <div
              className={`auth-input-wrapper ${errors.address ? "error" : ""}`}
            >
              <span className="auth-input-icon">📍</span>
              <input
                type="text"
                name="address"
                placeholder="Nhập địa chỉ"
                value={form.address}
                onChange={handleChange}
                className="auth-input"
              />
            </div>
            {errors.address && (
              <span className="auth-error-message">{errors.address}</span>
            )}
          </div>

          {/* Mật khẩu */}
          <div className="auth-input-group">
            <label className="register-field-label">Mật khẩu</label>
            <div
              className={`auth-input-wrapper ${errors.password ? "error" : ""}`}
            >
              <span className="auth-input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                value={form.password}
                onChange={handleChange}
                className="auth-input"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.password && (
              <span className="auth-error-message">{errors.password}</span>
            )}
          </div>

          {/* Xác nhận mật khẩu */}
          <div className="auth-input-group">
            <label className="register-field-label">Xác nhận mật khẩu</label>
            <div
              className={`auth-input-wrapper ${errors.confirmPassword ? "error" : ""}`}
            >
              <span className="auth-input-icon">🔒</span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword}
                onChange={handleChange}
                className="auth-input"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label="Toggle confirm password"
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="auth-error-message">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Terms */}
          <div className="auth-checkbox-group">
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="auth-checkbox"
              />
              <span className="auth-checkbox-text">
                Tôi đồng ý với{" "}
                <a href="#terms" className="auth-link">
                  Điều khoản Dịch vụ
                </a>{" "}
                và{" "}
                <a href="#privacy" className="auth-link">
                  Chính sách Bảo mật
                </a>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="auth-submit-full-btn"
            disabled={loading || !acceptTerms}
          >
            {loading ? "Đang xử lý..." : "Đăng Ký"}
          </button>

          <div className="auth-footer">
            Đã có tài khoản?{" "}
            <span
              className="auth-footer-link"
              onClick={() => navigate("/login")}
            >
              Đăng nhập ngay
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
