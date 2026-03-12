import "./login.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { forgotPasswordApi } from "../../api/authApi";
import EVLogoIcon from "../../components/logo/EVLogoIcon.jsx";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Vui lòng nhập địa chỉ email!");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Địa chỉ email không hợp lệ!");
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPasswordApi(email);

      if (response.success) {
        toast.success("Mã OTP đã được gửi đến email của bạn!");
        // Navigate to reset password page with email as state
        navigate("/reset-password", { state: { email } });
      } else {
        if (response.status === 408) {
          toast.info(
            "He thong dang xu ly cham. OTP co the da duoc gui, vui long kiem tra email.",
          );
          navigate("/reset-password", { state: { email } });
        } else {
          toast.error(
            response.message || "Không thể gửi mã OTP. Vui lòng thử lại!",
          );
        }
      }
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <div className="auth-logo-icon auth-logo-bolt">
            <EVLogoIcon className="auth-logo-bolt-svg" strokeWidth={2.5} />
          </div>
          <h1 className="auth-title">Quên Mật Khẩu</h1>
          <p className="auth-subtitle">
            Nhập email để nhận <span className="highlight">mã OTP</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">📧</span>
              <input
                type="email"
                name="email"
                placeholder="Địa chỉ email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
            style={loading ? { opacity: 0.7, cursor: "not-allowed" } : {}}
          >
            {loading ? "Đang gửi..." : "Gửi mã OTP"}
          </button>

          <div className="auth-footer" style={{ marginTop: "20px" }}>
            <span>Nhớ mật khẩu? </span>
            <span
              className="auth-footer-link"
              onClick={() => navigate("/login")}
              role="button"
            >
              Đăng nhập
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
