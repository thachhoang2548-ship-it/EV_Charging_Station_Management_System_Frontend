import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import paths from "../../path/paths";

// --- IMPORT ẢNH HERO (Đảm bảo đường dẫn ảnh đúng với máy của bạn) ---
import img1 from "../../assets/img/home/a.jpg";
import img2 from "../../assets/img/home/b.jpg";
import img3 from "../../assets/img/home/c.jpg";
import img4 from "../../assets/img/home/xe3.jpg";

// --- IMPORT ICON CHO PHẦN TÍNH NĂNG ---
import iconStation from "../../assets/logo/chargingStation.png";
import iconBooking from "../../assets/logo/booking.png";
import iconUser from "../../assets/logo/user.png";
import iconRule from "../../assets/logo/rule.png";

const heroImages = [img1, img2, img3, img4];

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
    }, 5000); 

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
              className={`slide-item ${index === currentImageIndex ? "active" : ""}`}
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
                  className={`dot-indicator ${index === currentImageIndex ? "active" : ""}`}
                  onClick={() => setCurrentImageIndex(index)}
                ></span>
              ))}
            </div>
            <div className="action-group" style={{marginTop: '30px'}}>
              <button className="btn-glow" onClick={() => navigate(paths.stations)}>
                Khám phá ngay
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: PREMIUM BENTO GRID (LÀM MỚI) --- */}
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
          <div className="bento-card card-station" onClick={() => navigate(paths.stations)}>
            <div className="card-glass-effect"></div>
            <div className="card-content">
              <div className="icon-box blue-gradient">
                <img src={iconStation} alt="Trạm sạc" />
              </div>
              <div className="text-group">
                <h3>Tìm trạm sạc</h3>
                <p>Bản đồ trực quan với hơn 500+ điểm sạc khả dụng.</p>
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
          <div className="bento-card card-booking" onClick={() => navigate(paths.chargingSession)}>
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
          <div className="bento-card card-profile" onClick={() => navigate(paths.profile)}>
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
          <div className="bento-card card-rules" onClick={() => navigate(paths.rules)}>
            <div className="card-glass-effect"></div>
            <div className="card-content row-layout">
              <div className="icon-box orange-gradient">
                <img src={iconRule} alt="Quy định" />
              </div>
              <div className="text-wide">
                <h3>Tiêu chuẩn & Hướng dẫn</h3>
                <p>Quy trình an toàn sạc pin và hướng dẫn xử lý sự cố khẩn cấp 24/7.</p>
              </div>
              <div className="arrow-icon">&rarr;</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;