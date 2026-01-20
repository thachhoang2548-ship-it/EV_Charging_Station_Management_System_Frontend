import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import paths from "../../path/paths";
import Footer from "../../components/Footer/Footer";
import iconPayment from "../../assets/icon/staff/payment-method.png";

// --- IMPORT ẢNH HERO (Đảm bảo đường dẫn ảnh đúng với máy của bạn) ---
import img1 from "../../assets/img/home/test1.png";
import img2 from "../../assets/img/home/test2.png";
import img3 from "../../assets/img/home/test3.png";

// --- IMPORT ICON CHO PHẦN TÍNH NĂNG ---
import iconStation from "../../assets/logo/chargingStation.png";
import iconBooking from "../../assets/logo/booking.png";
import iconUser from "../../assets/logo/user.png";
import iconRule from "../../assets/logo/rule.png";

const heroImages = [img1, img2, img3];

const Home = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Driver";
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Preload ảnh
  useEffect(() => {
    heroImages.forEach((img) => {
      const image = new Image();
      image.src = img;
    });
  }, []);

  // Slider Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="modern-home">
      {/* --- SECTION 1: HERO SLIDER --- */}
      <section className="hero-wrapper">
        <div className="hero-slider">
          {heroImages.map((img, index) => (
            <div
              key={index}
              className={`slide-item ${
                index === currentImageIndex ? "active" : ""
              }`}
              style={{ backgroundImage: `url(${img})` }}
            >
              <div className="slide-overlay"></div>
            </div>
          ))}
        </div>
        <div className="hero-container">
          <div className="hero-content">
            {/* <div className="status-badge">
              <span className="dot pulse"></span> Hệ thống sẵn sàng
            </div> */}
            <h1 className="mega-title">
              Kiến tạo <br />
              <span className="text-gradient">Hành trình Xanh</span>
            </h1>
            <div className="slider-dots">
              {heroImages.map((_, index) => (
                <span
                  key={index}
                  className={`dot-indicator ${
                    index === currentImageIndex ? "active" : ""
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                ></span>
              ))}
            </div>
            <div className="action-group" style={{ marginTop: "30px" }}>
              <button
                className="btn-glow"
                onClick={() => navigate(paths.stations)}
              >
                Khám phá ngay
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        {/* Hiệu ứng nền Aurora mờ ảo phía sau */}
        <div className="aurora-bg"></div>

        <div className="section-header-wrapper">
          {/* Badge trang trí phía trên */}
          <div className="header-badge">
            <span className="badge-icon">❖</span> Các chức năng nổi bật
          </div>

          {/* Tiêu đề chính với hiệu ứng Gradient */}
          <h2 className="section-title">
            Tiện ích <span className="highlight-text">Độc quyền</span>
          </h2>

          {/* Đường kẻ trang trí phong cách Tech */}
          <div className="title-decoration">
            <span className="tech-line left"></span>
            <span className="tech-diamond"></span>
            <span className="tech-line right"></span>
          </div>

          <p className="section-subtitle">
            Trải nghiệm hệ sinh thái sạc xe điện thông minh nhất Việt Nam
          </p>
        </div>

        <div className="bento-grid">
          {/* Card 1: Map/Stations (Main) */}
          <div
            className="bento-card card-station"
            onClick={() => navigate(paths.stations)}
          >
            <div className="card-glass-effect"></div>
            <div className="card-content">
              <div className="icon-box blue-gradient">
                <img src={iconStation} alt="Trạm sạc" />
              </div>
              <div className="text-group">
                <h3>Tìm trạm sạc</h3>
                <p>Bản đồ điểm sạc khả dụng.</p>
              </div>
              <div className="card-stat">
                <span className="stat-num">0.5s</span>
                <span className="stat-desc">Thời gian tìm kiếm</span>
              </div>
              <button className="mini-btn">Mở bản đồ &rarr;</button>
            </div>
            {/* Trang trí nền */}
            <div className="decor-circle"></div>
          </div>

          {/* Card 2: Booking */}
          <div
            className="bento-card card-booking"
            onClick={() => navigate(paths.chargingSession)}
          >
            <div className="card-glass-effect"></div>
            <div className="card-content">
              <div className="icon-box green-gradient">
                <img src={iconBooking} alt="Đặt lịch" />
              </div>
              <h3>Đặt chỗ trước</h3>
              <p>Giữ chỗ sạc trong 30 phút.</p>
            </div>
            <div className="hover-glow green"></div>
          </div>

          {/* Card 3: Profile */}
          <div
            className="bento-card card-profile"
            onClick={() => navigate(paths.profile)}
          >
            <div className="card-glass-effect"></div>
            <div className="card-content">
              <div className="icon-box purple-gradient">
                <img src={iconUser} alt="Hồ sơ" />
              </div>
              <h3>Quản lý cá nhân</h3>
              <p>Ví điện tử & Lịch sử giao dịch.</p>
            </div>
            <div className="hover-glow purple"></div>
          </div>

          {/* Card 4: Rules (Wide) */}
          <div
            className="bento-card card-rules"
            onClick={() => navigate(paths.rules)}
          >
            <div className="card-glass-effect"></div>
            <div className="card-content row-layout">
              <div className="icon-box orange-gradient">
                <img src={iconRule} alt="Quy định" />
              </div>
              <div className="text-wide">
                <h3>Tiêu chuẩn & Hướng dẫn</h3>
                <p>
                  Quy trình an toàn sạc pin và hướng dẫn xử lý sự cố khẩn cấp
                  24/7.
                </p>
              </div>
              <div className="arrow-icon">&rarr;</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 3: HOW IT WORKS (QUY TRÌNH) --- */}
      <section className="steps-section">
        <div className="section-header-wrapper">
          <div className="header-badge">
            <span className="badge-icon">▶</span> Dịch vụ dành cho bạn
          </div>
          <h2 className="section-title">
            Bắt đầu <span className="highlight-text">Dễ dàng</span>
          </h2>
          <div className="title-decoration">
            <span className="tech-line left"></span>
            <span className="tech-diamond"></span>
            <span className="tech-line right"></span>
          </div>
          <p className="section-subtitle">
            Sạc đầy năng lượng cho xế yêu chỉ với 3 thao tác chạm trên ứng dụng
          </p>
        </div>

        <div className="steps-container">
          {/* Đường nối neon chạy ngang (Background Line) */}
          <div className="neon-connector"></div>

          {/* STEP 1 */}
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon-box">
              <img src={iconStation} alt="Tìm trạm" />
            </div>
            <div className="step-content">
              <h3>Tìm & Đặt chỗ</h3>
              <p>
                Mở ứng dụng, định vị trạm sạc gần nhất và đặt chỗ trước để không
                phải chờ đợi.
              </p>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon-box box-glow-green">
              <img src={iconBooking} alt="Cắm sạc" />
            </div>
            <div className="step-content">
              <h3>Kết nối & Sạc</h3>
              <p>
                Quét mã QR tại trụ sạc, cắm súng sạc vào xe. Hệ thống sẽ tự động
                cấp điện an toàn.
              </p>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon-box box-glow-purple">
              <img src={iconPayment} alt="Thanh toán" />
            </div>
            <div className="step-content">
              <h3>Thanh toán & Đi</h3>
              <p>
                Theo dõi tiến trình sạc. Thanh toán tự động qua ví điện tử khi
                hoàn tất.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
