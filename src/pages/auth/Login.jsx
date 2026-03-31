import "./login.css";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLogin } from "../../hooks/useAuth";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/slices/authSlice.js";
import EVLogoIcon from "../../components/logo/EVLogoIcon.jsx";

const Login = () => {
  const [form, setForm] = useState({
    phone: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading } = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Xử lý token từ Google OAuth redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const needPhone = urlParams.get("needPhone");

    if (token) {
      console.log(
        "🔑 Token received from Google OAuth:",
        token.substring(0, 20) + "...",
      );
      console.log("📱 Need phone:", needPhone);

      try {
        // Decode JWT để lấy thông tin user
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("📦 Token payload:", payload);

        // Lấy role từ token (thử nhiều field có thể)
        // Backend JWT có claim "role" chứ không phải "scope"
        let role = null;
        if (payload.role) {
          // JWT từ backend có claim "role" - check đầu tiên
          role = payload.role;
        } else if (payload.scope) {
          role = payload.scope;
        } else if (payload.authorities && payload.authorities.length > 0) {
          role = payload.authorities[0].authority || payload.authorities[0];
        } else {
          // Fallback: nếu không có role, mặc định là DRIVER
          console.warn("⚠️ No role found in token, defaulting to DRIVER");
          role = "DRIVER";
        }

        // Remove ROLE_ prefix nếu có
        if (role && typeof role === "string") {
          role = role.replace("ROLE_", "");
        }

        console.log("👤 User role:", role);

        // Lưu token và role vào localStorage
        localStorage.setItem("accessToken", token);
        if (role) {
          localStorage.setItem("role", role);
        }

        // Lấy thông tin user từ token
        const userDetails = {
          name: payload.name || payload.sub || "User",
          email: payload.email || payload.sub,
          phone: null, // Google không trả về phone
          gender: null,
        };

        // Lưu user details
        localStorage.setItem("userDetails", JSON.stringify(userDetails));

        // 🔥 QUAN TRỌNG: Dispatch Redux action để update store
        dispatch(
          loginSuccess({
            accessToken: token,
            role: role,
            userDetails: userDetails,
          }),
        );

        console.log("✅ Redux state updated");
        console.log("🔍 Redux state check:", {
          isLoggedIn: true,
          role,
          accessToken: token.substring(0, 20),
        });

        // Show success message
        toast.dismiss(); // Xóa toast cũ
        toast.success("Đăng nhập Google thành công!", {
          toastId: "oauth-success",
        });

        // Xóa token khỏi URL SAU KHI đã lưu và dispatch
        window.history.replaceState({}, document.title, "/");

        // Redirect dựa vào role sau khi Redux đã update (tăng delay)
        const oauthRedirect = sessionStorage.getItem("oauth_redirect");
        sessionStorage.removeItem("oauth_redirect");
        setTimeout(() => {
          console.log("🚀 Navigating to role-based page:", role);
          if (role?.toUpperCase().includes("ADMIN")) {
            window.location.href = "/admin";
          } else if (role?.toUpperCase().includes("STAFF")) {
            window.location.href = "/staff";
          } else if (role?.toUpperCase().includes("DRIVER")) {
            window.location.href = oauthRedirect || "/guide";
          } else {
            window.location.href = "/";
          }
        }, 1000);
      } catch (error) {
        console.error("❌ Error parsing token:", error);
        toast.dismiss(); // Xóa toast cũ
        toast.error("Lỗi xử lý token đăng nhập", {
          toastId: "oauth-error",
        });
        // Xóa token lỗi khỏi URL
        window.history.replaceState({}, document.title, "/");
      }
    }
  }, [dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { success, message } = await login(form.phone.trim(), form.password);

    // Backend sẽ xử lý tất cả logic khóa tài khoản và trả về message phù hợp
    if (!success && message) {
      // Xóa tất cả toast cũ trước khi hiển thị toast mới
      toast.dismiss();
      // Hiển thị toast mới với toastId để tránh duplicate
      toast.error(message, {
        toastId: "login-error",
      });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <div className="auth-logo-icon auth-logo-bolt">
            <EVLogoIcon className="auth-logo-bolt-svg" strokeWidth={2.5} />
          </div>
          <h1 className="auth-title">Đăng Nhập</h1>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">👤</span>
              <input
                type="tel"
                name="phone"
                placeholder="Số điện thoại"
                onChange={handleChange}
                className="auth-input"
                required
                autoComplete="off"
                value={form.phone}
              />
            </div>
          </div>
          <div className="auth-input-group">
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mật khẩu"
                onChange={handleChange}
                className="auth-input"
                required
                autoComplete="off"
                value={form.password}
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
          <div className="auth-options">
            <span
              className="auth-link"
              onClick={() => navigate("/forgot-password")}
              role="button"
              style={{ cursor: "pointer" }}
            >
              Forget password?
            </span>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <div className="auth-social-section">
            <div className="auth-divider">
              <span>hoặc</span>
            </div>
            <div className="auth-social-buttons">
              <button
                type="button"
                className="auth-social-btn google"
                onClick={() => {
                  const from = location.state?.from?.pathname;
                  if (from) {
                    sessionStorage.setItem("oauth_redirect", from);
                  }
                  window.location.href =
                    "https://api.evcsystem.online/oauth2/authorization/google";
                }}
              >
                G
              </button>
            </div>
          </div>
          <div className="auth-footer">
            <span>Chưa có tài khoản? </span>
            <span
              className="auth-footer-link"
              onClick={() => navigate("/register")}
              role="button"
            >
              Đăng ký tài khoản
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
