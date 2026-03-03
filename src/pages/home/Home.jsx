import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import paths from "../../path/paths";
import HomeNavbar from "../../components/HomeNavbar/HomeNavbar";
import HomeFooter from "../../components/HomeFooter/HomeFooter";
import MeshBackground from "../../components/MeshBackground/MeshBackground";

import mapBg from "../../assets/img/home/bando.jpg";
import xe1 from "../../assets/img/home/xe1.jpg";
import xe2 from "../../assets/img/home/xe2.jpg";
import xe3 from "../../assets/img/home/xe3.jpg";
import homeBg from "../../assets/img/home/home.jpg";

const STATIONS = [
  {
    id: 1,
    name: "Trạm sạc VinFast – Landmark 81",
    address: "208 Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM",
    slots: 12,
    available: 5,
    power: "DC 120kW",
    rating: 4.8,
    reviews: 134,
    img: xe1,
    tags: ["CCS2", "CHAdeMO", "24/7"],
  },
  {
    id: 2,
    name: "Trạm sạc EVgo – Vinhomes Grand Park",
    address: "Đường số 1, Long Bình, TP. Thủ Đức",
    slots: 8,
    available: 3,
    power: "AC 22kW",
    rating: 4.5,
    reviews: 89,
    img: xe2,
    tags: ["Type 2", "AC", "Có mái che"],
  },
  {
    id: 3,
    name: "Trạm sạc EVN Charging – Hà Nội",
    address: "17 Láng Hạ, Đống Đa, Hà Nội",
    slots: 6,
    available: 6,
    power: "DC 60kW",
    rating: 4.7,
    reviews: 213,
    img: xe3,
    tags: ["GB/T", "CCS2", "Mở 24h"],
  },
];

const REVIEWS = [
  {
    id: 1,
    avatar: "N",
    name: "Nguyễn Văn Minh",
    time: "2 giờ trước",
    station: "Trạm VinFast Landmark 81",
    text: "Trạm sạc rất sạch sẽ, nhân viên hỗ trợ nhiệt tình. Sạc từ 20% lên 80% chỉ mất khoảng 35 phút với cổng DC 120kW. Sẽ quay lại!",
    rating: 5,
    likes: 12,
    color: "#16a34a",
  },
  {
    id: 2,
    avatar: "T",
    name: "Trần Thị Lan",
    time: "5 giờ trước",
    station: "Trạm EVgo Vinhomes Grand Park",
    text: "Bãi đậu xe rộng rãi, có mái che thoáng mát. Thanh toán qua app rất tiện. Giá điện hợp lý so với chất lượng dịch vụ.",
    rating: 4,
    likes: 8,
    color: "#2563eb",
  },
  {
    id: 3,
    avatar: "P",
    name: "Phạm Quốc Hùng",
    time: "1 ngày trước",
    station: "Trạm EVN Charging Hà Nội",
    text: "Vị trí đẹp, dễ tìm. App hiển thị đúng số slot còn trống, không phải chờ đợi khi đến. Trải nghiệm tuyệt vời!",
    rating: 5,
    likes: 24,
    color: "#7c3aed",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="tev-root">

      {/* ================================================
          NAVBAR
      ================================================ */}
      <HomeNavbar />

      {/* ================================================
          HERO — MAP SEARCH
      ================================================ */}
      <section className="tev-hero">
        <div className="tev-hero-map" style={{ backgroundImage: `url(${mapBg})` }}>
          <div className="tev-hero-overlay" />
        </div>

        <div className="tev-hero-body">
          <div className="tev-hero-label">
            <span className="tev-dot-live" /> Hơn 200 trạm đang hoạt động trực tuyến
          </div>

          <h1 className="tev-hero-title">
            Tìm trạm sạc xe điện<br />
            <span className="tev-green">gần bạn ngay bây giờ</span>
          </h1>

          <p className="tev-hero-sub">
            Cộng đồng người dùng trạm sạc công cộng lớn nhất Việt Nam.<br />
            Tìm kiếm, đánh giá và chia sẻ trải nghiệm sạc xe của bạn.
          </p>

          <div className="tev-search-bar">
            <div className="tev-search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
            </div>
            <input
              className="tev-search-input"
              placeholder="Nhập địa chỉ, quận, thành phố..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="tev-search-btn" onClick={() => navigate(paths.stations)}>
              Tìm kiếm
            </button>
          </div>

          <div className="tev-hero-tags">
            <span className="tev-tag" onClick={() => navigate(paths.stations)}>📍 Gần tôi</span>
            <span className="tev-tag" onClick={() => navigate(paths.stations)}>⚡ DC nhanh</span>
            <span className="tev-tag" onClick={() => navigate(paths.stations)}>🅿️ Có chỗ đậu</span>
            <span className="tev-tag" onClick={() => navigate(paths.stations)}>🕐 Mở 24/7</span>
          </div>
        </div>

        {/* Floating stats bar */}
        <div className="tev-stats-bar">
          <div className="tev-stat-item">
            <span className="tev-stat-n">200+</span>
            <span className="tev-stat-l">Trạm sạc</span>
          </div>
          <div className="tev-stat-div" />
          <div className="tev-stat-item">
            <span className="tev-stat-n">63</span>
            <span className="tev-stat-l">Tỉnh thành</span>
          </div>
          <div className="tev-stat-div" />
          <div className="tev-stat-item">
            <span className="tev-stat-n">50K+</span>
            <span className="tev-stat-l">Thành viên</span>
          </div>
          <div className="tev-stat-div" />
          <div className="tev-stat-item">
            <span className="tev-stat-n">120K+</span>
            <span className="tev-stat-l">Lượt sạc</span>
          </div>
        </div>
      </section>

      {/* ================================================
          HOT STATIONS
      ================================================ */}
      <section className="tev-section tev-section-white">
        <div className="tev-container">
          <div className="tev-section-head">
            <div className="tev-section-badge green">Nổi bật hôm nay</div>
            <h2 className="tev-section-title">Trạm sạc được <span className="tev-green">đánh giá cao</span></h2>
            <p className="tev-section-sub">Dựa trên đánh giá của cộng đồng trong 7 ngày gần nhất</p>
          </div>

          <div className="tev-station-tabs">
            {["all", "dc", "ac", "hanoi", "hcm"].map((t) => (
              <button
                key={t}
                className={`tev-tab ${activeTab === t ? "active" : ""}`}
                onClick={() => setActiveTab(t)}
              >
                {t === "all" ? "Tất cả" : t === "dc" ? "Sạc nhanh DC" : t === "ac" ? "Sạc AC" : t === "hanoi" ? "Hà Nội" : "TP.HCM"}
              </button>
            ))}
          </div>

          <div className="tev-station-grid">
            {STATIONS.map((st) => (
              <div className="tev-station-card" key={st.id} onClick={() => navigate(paths.stations)}>
                <div className="tev-station-img-wrap">
                  <img src={st.img} alt={st.name} className="tev-station-img" />
                  <div className="tev-station-badge-power">{st.power}</div>
                  <div className={`tev-station-avail ${st.available === 0 ? "full" : "open"}`}>
                    {st.available === 0 ? "Hết chỗ" : `${st.available}/${st.slots} trống`}
                  </div>
                </div>

                <div className="tev-station-body">
                  <h3 className="tev-station-name">{st.name}</h3>
                  <p className="tev-station-addr">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {st.address}
                  </p>

                  <div className="tev-station-tags">
                    {st.tags.map((tag) => (
                      <span className="tev-pill" key={tag}>{tag}</span>
                    ))}
                  </div>

                  <div className="tev-station-footer">
                    <div className="tev-rating">
                      <span className="tev-star">★</span>
                      <strong>{st.rating}</strong>
                      <span className="tev-rev-count">({st.reviews} đánh giá)</span>
                    </div>
                    <button className="tev-btn-sm">Xem chi tiết</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="tev-center-btn">
            <button className="tev-btn-outline-green" onClick={() => navigate(paths.stations)}>
              Xem tất cả trạm sạc &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* ================================================
          HOW IT WORKS
      ================================================ */}
      <MeshBackground variant="green" intensity="low" blur={70} tag="section" className="tev-section">
        <div className="tev-container">
          <div className="tev-section-head">
            <div className="tev-section-badge white">Đơn giản & Nhanh chóng</div>
            <h2 className="tev-section-title">Sử dụng Trạm EV<br /><span className="tev-green">chỉ với 3 bước</span></h2>
          </div>

          <div className="tev-steps">
            <div className="tev-step-conn" />

            <div className="tev-step">
              <div className="tev-step-num">01</div>
              <div className="tev-step-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Tìm trạm sạc</h3>
              <p>Mở bản đồ, xem tất cả trạm sạc gần bạn với thông tin thời gian thực: số cổng còn trống, giá điện, đánh giá cộng đồng.</p>
            </div>

            <div className="tev-step">
              <div className="tev-step-num">02</div>
              <div className="tev-step-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>Sạc xe của bạn</h3>
              <p>Quét mã QR tại trụ sạc hoặc đặt chỗ trước qua app. Theo dõi tiến trình sạc theo thời gian thực ngay trên điện thoại.</p>
            </div>

            <div className="tev-step">
              <div className="tev-step-num">03</div>
              <div className="tev-step-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <h3>Chia sẻ cộng đồng</h3>
              <p>Đánh giá trạm sạc, chia sẻ trải nghiệm và giúp đỡ các thành viên khác trong cộng đồng xe điện Việt Nam.</p>
            </div>
          </div>
        </div>
      </MeshBackground>

      {/* ================================================
          COMMUNITY REVIEWS
      ================================================ */}
      <section className="tev-section tev-section-white">
        <div className="tev-container">
          <div className="tev-section-head">
            <div className="tev-section-badge green">Cộng đồng</div>
            <h2 className="tev-section-title">Chia sẻ từ <span className="tev-green">thành viên</span></h2>
            <p className="tev-section-sub">Hàng nghìn đánh giá thực từ cộng đồng người dùng xe điện</p>
          </div>

          <div className="tev-review-grid">
            {REVIEWS.map((r) => (
              <div className="tev-review-card" key={r.id}>
                <div className="tev-review-header">
                  <div className="tev-avatar" style={{ background: r.color }}>{r.avatar}</div>
                  <div className="tev-review-meta">
                    <strong>{r.name}</strong>
                    <span>{r.time}</span>
                  </div>
                  <div className="tev-review-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} style={{ color: i < r.rating ? "#f59e0b" : "#d1d5db" }}>★</span>
                    ))}
                  </div>
                </div>

                <div className="tev-review-station">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {r.station}
                </div>

                <p className="tev-review-text">{r.text}</p>

                <div className="tev-review-actions">
                  <button className="tev-like-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
                      <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
                    </svg>
                    Hữu ích ({r.likes})
                  </button>
                  <button className="tev-reply-btn">Trả lời</button>
                </div>
              </div>
            ))}
          </div>

          <div className="tev-center-btn">
            <button className="tev-btn-outline-green">Xem tất cả đánh giá &rarr;</button>
          </div>
        </div>
      </section>

      {/* ================================================
          FEATURES HIGHLIGHT
      ================================================ */}
      <section className="tev-features-section">
        <div className="tev-container tev-features-layout">
          <div className="tev-features-img">
            <img src={homeBg} alt="EV Charging" />
            <div className="tev-features-stat-float">
              <span className="tev-fsf-num">99.9%</span>
              <span className="tev-fsf-label">Uptime hệ thống</span>
            </div>
            <div className="tev-features-badge-float">
              <span>⚡</span> Sạc nhanh DC lên đến 120kW
            </div>
          </div>

          <div className="tev-features-content">
            <div className="tev-section-badge green" style={{ display: "inline-flex", marginBottom: 16 }}>Tính năng nổi bật</div>
            <h2 className="tev-section-title" style={{ textAlign: "left", marginBottom: 16 }}>
              Ứng dụng quản lý<br /><span className="tev-green">trạm sạc thông minh</span>
            </h2>
            <p style={{ color: "#64748b", marginBottom: 32, lineHeight: 1.7 }}>
              Trạm EV cung cấp đầy đủ công cụ để bạn tìm kiếm, đặt chỗ và thanh toán tại mọi trạm sạc công cộng trên toàn quốc.
            </p>

            <div className="tev-feat-list">
              {[
                { icon: "🗺️", title: "Bản đồ thời gian thực", desc: "Xem slot còn trống, giá điện và tình trạng hoạt động của tất cả trạm." },
                { icon: "📅", title: "Đặt trước & Quản lý lịch", desc: "Đặt chỗ trước tối đa 2 tiếng, nhận thông báo nhắc nhở tự động." },
                { icon: "💳", title: "Ví điện tử tích hợp", desc: "Nạp tiền và thanh toán liền mạch qua ví điện tử an toàn." },
                { icon: "⭐", title: "Đánh giá & Nhận xét", desc: "Chia sẻ trải nghiệm thực tế để giúp đỡ cộng đồng." },
              ].map((f, i) => (
                <div className="tev-feat-item" key={i}>
                  <div className="tev-feat-icon">{f.icon}</div>
                  <div>
                    <strong>{f.title}</strong>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="tev-btn-primary tev-btn-lg" onClick={() => navigate(paths.stations)}>
              Khám phá ngay &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* ================================================
          CTA BANNER
      ================================================ */}
      <section className="tev-cta-section">
        <div className="tev-cta-content">
          <div className="tev-cta-text">
            <h2>Tham gia cộng đồng xe điện<br /><span>Việt Nam ngay hôm nay</span></h2>
            <p>Đăng ký miễn phí – Không ràng buộc – Hỗ trợ 24/7</p>
          </div>
          <div className="tev-cta-actions">
            <button className="tev-btn-white" onClick={() => navigate(paths.register)}>
              Đăng ký miễn phí
            </button>
            <button className="tev-btn-outline-white" onClick={() => navigate(paths.stations)}>
              Xem bản đồ trạm sạc
            </button>
          </div>
        </div>
      </section>

      <HomeFooter />
    </div>
  );
};

export default Home;
