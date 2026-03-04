import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerApi } from "../../api/authApi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./login.css"; // Reuse Login.css for shared styles
import "./Register-mobile.css"; // Additional styles for Register page

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({}); // State để lưu lỗi
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

  // Handle input change - Clear error when user types
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error khi user bắt đầu nhập
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // === Per-step validation ===
  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      // Email validation
      if (!form.email) {
        newErrors.email = "Vui lòng nhập email";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
          newErrors.email = "Email không đúng định dạng";
        }
      }

      // Phone validation
      if (!form.phoneNumber) {
        newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
      } else {
        const phoneRegex = /^0[0-9]{9}$/;
        if (!phoneRegex.test(form.phoneNumber)) {
          newErrors.phoneNumber =
            "Số điện thoại phải có 10 chữ số, bắt đầu bằng 0";
        }
      }
    }

    if (step === 2) {
      if (!form.name) {
        newErrors.name = "Vui lòng nhập họ tên";
      }
      if (!form.dateOfBirth) {
        newErrors.dateOfBirth = "Vui lòng chọn ngày sinh";
      } else {
        // Kiểm tra tuổi >= 18
        const birthDate = form.dateOfBirth;
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }

        if (age < 18) {
          newErrors.dateOfBirth = "Bạn phải từ 18 tuổi trở lên";
        }
      }
      if (!form.gender) {
        newErrors.gender = "Vui lòng chọn giới tính";
      }
    }

    if (step === 3) {
      if (!form.address) {
        newErrors.address = "Vui lòng nhập địa chỉ";
      }
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Next step handler
  const handleNextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  // Final Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptTerms) {
      toast.error("Bạn cần đồng ý điều khoản trước khi đăng ký!");
      return;
    }

    // Map gender: "Nam" → "M", "Nữ" → "F"
    const genderMap = {
      Nam: "M",
      Nữ: "F",
    };

    // Format date to yyyy-MM-dd
    const formatDate = (date) => {
      if (!date) return "";
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
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

    console.log("📤 Sending register data:", registerData); // Debug log

    setLoading(true);
    try {
      const response = await registerApi(registerData);
      console.log("📥 Register response:", response); // Debug log

      // Kiểm tra success flag
      if (response.success) {
        const message = response.data?.message || response.message || "";

        // Trường hợp 1: Backend gửi OTP về email (cần xác thực)
        if (message.toLowerCase().includes("otp")) {
          toast.success("OTP đã được gửi về email của bạn!");
          toast.info("Vui lòng kiểm tra email để lấy mã OTP", {
            autoClose: 5000,
          });
          setTimeout(() => {
            navigate("/verify-otp", {
              state: {
                registerData: registerData,
              },
            });
          }, 2000);
        }
        // Trường hợp 2: Đăng ký thành công trực tiếp (không cần OTP)
        else if (message.toLowerCase().includes("thành công")) {
          toast.success("Đăng ký thành công!");
          setTimeout(() => navigate("/login"), 2000);
        }
        // Trường hợp 3: Có message khác
        else {
          toast.success(message || "Đăng ký thành công!");
          setTimeout(() => navigate("/login"), 2000);
        }
      } else {
        const errorMessage = response.message || "Đăng ký thất bại!";

        // Kiểm tra lỗi email hoặc phone đã tồn tại
        if (errorMessage.toLowerCase().includes("phone")) {
          toast.error("Số điện thoại đã được sử dụng. Vui lòng nhập số khác!");
          setStep(1); // Tự động nhảy về step 1, dữ liệu vẫn giữ nguyên
        } else if (errorMessage.toLowerCase().includes("email")) {
          toast.error("Email đã được sử dụng. Vui lòng nhập email khác!");
          setStep(1); // Tự động nhảy về step 1, dữ liệu vẫn giữ nguyên
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error("❌ Register error:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi đăng ký!";

      // Kiểm tra lỗi trong catch block
      if (errorMessage.toLowerCase().includes("phone")) {
        toast.error("Số điện thoại đã được sử dụng. Vui lòng nhập số khác!");
        setStep(1);
      } else if (errorMessage.toLowerCase().includes("email")) {
        toast.error("Email đã được sử dụng. Vui lòng nhập email khác!");
        setStep(1);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Step indicator with numbers - clickable
  const StepDots = () => (
    <div className="auth-step-indicator">
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className={`auth-step-circle ${
            step === n ? "active" : step > n ? "completed" : ""
          }`}
          onClick={() => {
            // Chỉ cho phép quay lại các step đã hoàn thành hoặc step hiện tại
            if (n <= step) {
              setStep(n);
            }
          }}
          style={{
            cursor: n <= step ? "pointer" : "not-allowed",
            opacity: n > step ? 0.5 : 1,
          }}
        >
          {n}
        </div>
      ))}
    </div>
  );

  return (
    <div className="auth-page register-page">
      <ToastContainer position="top-center" autoClose={2500} theme="colored" />

      <div className="auth-container register-container">
        {/* Logo - Electric Car Icon */}
        <div className="auth-logo">
          <div className="auth-logo-icon auth-logo-car">
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Car body */}
              <rect
                x="20"
                y="45"
                width="60"
                height="25"
                rx="8"
                fill="white"
                fillOpacity="0.9"
              />
              {/* Windows */}
              <rect
                x="30"
                y="35"
                width="18"
                height="15"
                rx="3"
                fill="white"
                fillOpacity="0.7"
              />
              <rect
                x="52"
                y="35"
                width="18"
                height="15"
                rx="3"
                fill="white"
                fillOpacity="0.7"
              />
              {/* Wheels */}
              <circle cx="32" cy="72" r="8" fill="white" />
              <circle cx="68" cy="72" r="8" fill="white" />
              {/* Lightning bolt */}
              <path
                d="M50 50 L45 60 L52 60 L47 70 L55 58 L50 58 Z"
                fill="#FFD700"
              />
            </svg>
          </div>
          <h1 className="auth-title">Đăng Ký</h1>
        </div>

        {/* Step Indicator with Numbers */}
        <StepDots />

        <form onSubmit={handleSubmit}>
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <h3 className="auth-step-title">Thông tin cơ bản</h3>

              <div className="auth-input-group">
                <div
                  className={`auth-input-wrapper ${
                    errors.email ? "error" : ""
                  }`}
                >
                  <span className="auth-input-icon">📧</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Nhập email của bạn"
                    value={form.email}
                    onChange={handleChange}
                    className="auth-input"
                    required
                  />
                </div>
                {errors.email && (
                  <span className="auth-error-message">{errors.email}</span>
                )}
              </div>

              <div className="auth-input-group">
                <div
                  className={`auth-input-wrapper ${
                    errors.phoneNumber ? "error" : ""
                  }`}
                >
                  <span className="auth-input-icon">📱</span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Số điện thoại"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    className="auth-input"
                    required
                  />
                </div>
                {errors.phoneNumber && (
                  <span className="auth-error-message">
                    {errors.phoneNumber}
                  </span>
                )}
              </div>

              <button
                type="button"
                className="auth-next-btn"
                onClick={handleNextStep}
                aria-label="Next step"
              >
                ❯
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <h3 className="auth-step-title">Thông tin cá nhân</h3>

              <div className="auth-input-group">
                <div
                  className={`auth-input-wrapper ${errors.name ? "error" : ""}`}
                >
                  <span className="auth-input-icon">👤</span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Họ và tên"
                    value={form.name}
                    onChange={handleChange}
                    className="auth-input"
                  />
                </div>
                {errors.name && (
                  <span className="auth-error-message">{errors.name}</span>
                )}
              </div>

              <div className="auth-input-group">
                <div
                  className={`auth-input-wrapper date-picker-wrapper ${
                    errors.dateOfBirth ? "error" : ""
                  }`}
                  style={{ overflow: "visible", zIndex: 1 }}
                >
                  <span className="auth-input-icon">📅</span>
                  <DatePicker
                    selected={form.dateOfBirth}
                    onChange={(date) => {
                      setForm({ ...form, dateOfBirth: date });
                      if (errors.dateOfBirth) {
                        setErrors({ ...errors, dateOfBirth: "" });
                      }
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
                    portalId="root"
                    popperClassName="date-picker-popper"
                    popperPlacement="bottom-start"
                    popperModifiers={[
                      {
                        name: "offset",
                        options: {
                          offset: [0, 8],
                        },
                      },
                      {
                        name: "preventOverflow",
                        options: {
                          rootBoundary: "viewport",
                          tether: false,
                          altAxis: true,
                        },
                      },
                    ]}
                  />
                </div>
                {errors.dateOfBirth && (
                  <span className="auth-error-message">
                    {errors.dateOfBirth}
                  </span>
                )}
              </div>

              <div className="auth-input-group">
                <div
                  className={`auth-gender-options ${
                    errors.gender ? "error" : ""
                  }`}
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
                    <label
                      htmlFor="gender-female"
                      className="auth-gender-label"
                    >
                      Nữ
                    </label>
                  </div>
                </div>
                {errors.gender && (
                  <span className="auth-error-message">{errors.gender}</span>
                )}
              </div>

              <div className="auth-button-group">
                <button
                  type="button"
                  className="auth-next-btn"
                  onClick={() => setStep(step - 1)}
                  aria-label="Go back"
                >
                  ❮
                </button>
                <button
                  type="button"
                  className="auth-next-btn"
                  onClick={handleNextStep}
                  aria-label="Next step"
                >
                  ❯
                </button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <h3 className="auth-step-title">Thông tin tài khoản</h3>

              <div className="auth-input-group">
                <div
                  className={`auth-input-wrapper ${
                    errors.address ? "error" : ""
                  }`}
                >
                  <span className="auth-input-icon">📍</span>
                  <input
                    type="text"
                    name="address"
                    placeholder="Địa chỉ"
                    value={form.address}
                    onChange={handleChange}
                    className="auth-input"
                  />
                </div>
                {errors.address && (
                  <span className="auth-error-message">{errors.address}</span>
                )}
              </div>

              <div className="auth-input-group">
                <div
                  className={`auth-input-wrapper ${
                    errors.password ? "error" : ""
                  }`}
                >
                  <span className="auth-input-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Mật khẩu"
                    value={form.password}
                    onChange={handleChange}
                    className="auth-input"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.password && (
                  <span className="auth-error-message">{errors.password}</span>
                )}
              </div>

              <div className="auth-input-group">
                <div
                  className={`auth-input-wrapper ${
                    errors.confirmPassword ? "error" : ""
                  }`}
                >
                  <span className="auth-input-icon">🔒</span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Xác nhận mật khẩu"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="auth-input"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle confirm password visibility"
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

              <div className="auth-button-group">
                <button
                  type="button"
                  className="auth-next-btn"
                  onClick={() => setStep(step - 1)}
                  aria-label="Go back"
                >
                  ❮
                </button>
                <button
                  type="button"
                  className="auth-next-btn"
                  onClick={handleNextStep}
                  aria-label="Next step"
                >
                  ❯
                </button>
              </div>
            </>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <>
              <h3 className="auth-step-title">Xác nhận đăng ký</h3>

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

              <div className="auth-button-group">
                <button
                  type="button"
                  className="auth-next-btn"
                  onClick={() => setStep(step - 1)}
                  aria-label="Go back"
                >
                  ❮
                </button>
                <button
                  type="submit"
                  className="auth-next-btn auth-submit-btn"
                  disabled={loading || !acceptTerms}
                >
                  {loading ? "Đang xử lý..." : "Đăng ký"}
                </button>
              </div>
            </>
          )}

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
