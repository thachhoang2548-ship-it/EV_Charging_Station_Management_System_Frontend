import "./login.css";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPasswordApi } from "../../api/authApi";
import EVLogoIcon from "../../components/logo/EVLogoIcon.jsx";

const ResetPassword = () => {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Get email from navigation state
  const email = location.state?.email;

  // If no email, redirect back to forgot password
  React.useEffect(() => {
    if (!email) {
      toast.error("Phiên làm việc đã hết hạn. Vui lòng thử lại!");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp) {
      toast.error("Vui lòng nhập mã OTP!");
      return;
    }

    if (!newPassword) {
      toast.error("Vui lòng nhập mật khẩu mới!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPasswordApi(otp, email, newPassword);

      if (response.success) {
        toast.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập.");
        // Navigate back to login page
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        toast.error(
          response.message ||
            "Không thể đặt lại mật khẩu. Vui lòng kiểm tra mã OTP!",
        );
      }
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <div className="auth-logo-icon auth-logo-bolt">
            <EVLogoIcon className="auth-logo-bolt-svg" strokeWidth={2.5} />
          </div>
          <h1 className="auth-title">Đặt Lại Mật Khẩu</h1>
          <p className="auth-subtitle">
            Nhập <span className="highlight">mã OTP</span> đã được gửi tới email
            <strong className="auth-subtitle-email"> {email} </strong>
            để xác thực, sau đó tạo{" "}
            <span className="highlight">mật khẩu mới</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🔑</span>
              <input
                type="text"
                name="otp"
                placeholder="Mã OTP (6 chữ số)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="auth-input"
                required
                autoComplete="off"
                maxLength="6"
                pattern="[0-9]{6}"
              />
            </div>
          </div>

          <div className="auth-input-group">
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="auth-input"
                required
                autoComplete="new-password"
                minLength="6"
              />
              <span
                className="auth-toggle-password"
                onClick={togglePasswordVisibility}
                role="button"
                aria-label="Toggle password visibility"
              >
                {showPassword ? "🙈" : "👁"}
              </span>
            </div>
          </div>

          <div className="auth-input-group">
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🔒</span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="auth-input"
                required
                autoComplete="new-password"
                minLength="6"
              />
              <span
                className="auth-toggle-password"
                onClick={toggleConfirmPasswordVisibility}
                role="button"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? "🙈" : "👁"}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
            style={loading ? { opacity: 0.7, cursor: "not-allowed" } : {}}
          >
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>

          <div className="auth-footer" style={{ marginTop: "20px" }}>
            <span>Chưa nhận được mã? </span>
            <span
              className="auth-footer-link"
              onClick={() => navigate("/forgot-password")}
              role="button"
            >
              Gửi lại
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
