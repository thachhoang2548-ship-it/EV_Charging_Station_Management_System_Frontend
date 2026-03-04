import "./login.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { forgotPasswordApi } from "../../api/authApi";

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
        toast.error(
          response.message || "Không thể gửi mã OTP. Vui lòng thử lại!",
        );
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
          <div className="auth-logo-icon auth-logo-car">
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="20"
                y="45"
                width="60"
                height="25"
                rx="8"
                fill="white"
                fillOpacity="0.9"
              />
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
              <circle cx="32" cy="72" r="8" fill="white" />
              <circle cx="68" cy="72" r="8" fill="white" />
              <path
                d="M50 50 L45 60 L52 60 L47 70 L55 58 L50 58 Z"
                fill="#FFD700"
              />
            </svg>
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
