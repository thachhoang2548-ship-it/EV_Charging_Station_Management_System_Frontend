import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import paths from "../../path/paths";
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
          HERO — MAP SEARCH
      ================================================ */}
      <section className="tev-hero">
        <div
          className="tev-hero-map"
          style={{ backgroundImage: `url(${mapBg})` }}
        >
          <div className="tev-hero-overlay" />
        </div>

        <div className="tev-hero-body">
          <div className="tev-hero-label">
            <span className="tev-dot-live" /> Hơn 100 trạm đang hoạt động trực
            tuyến
          </div>

          <h1 className="tev-hero-title">
            Tìm trạm sạc xe điện
            <br />
            <span className="tev-green">gần bạn ngay bây giờ</span>
          </h1>

          <p className="tev-hero-sub">
            Cộng đồng người dùng trạm sạc công cộng lớn nhất Việt Nam.
            <br />
            Tìm kiếm, đánh giá và chia sẻ trải nghiệm sạc xe của bạn.
          </p>

          <div className="tev-search-bar">
            <div className="tev-search-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
            </div>
            <input
              className="tev-search-input"
              placeholder="Nhập tên trạm, địa chỉ, khu vực..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  navigate(
                    search.trim()
                      ? `${paths.stations}?q=${encodeURIComponent(search.trim())}`
                      : paths.stations,
                  );
              }}
            />
            <button
              className="tev-search-btn"
              onClick={() =>
                navigate(
                  search.trim()
                    ? `${paths.stations}?q=${encodeURIComponent(search.trim())}`
                    : paths.stations,
                )
              }
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      {/* ================================================
          ABOUT — BUILT FROM REALITY
      ================================================ */}
      <section className="tev-about-section">
        <div className="tev-container">
          <h2 className="tev-about-title">
            EV Charge - Được xây dựng từ thực tế,
            <br />
            dành cho cộng đồng
          </h2>
          <div className="tev-about-body">
            <p>
              Chúng tôi bắt đầu từ một câu hỏi đơn giản của những người sở hữu
              xe điện đầu tiên: "Làm sao để hành trình xuyên Việt không bị gián
              đoạn?". Trạm EV không ra đời từ một phòng thí nghiệm, mà từ những
              trải nghiệm thực tế trên các cung đường cao tốc, những lần chờ đợi
              tại trạm sạc và sự hỗ trợ lẫn nhau của các tài xế.
            </p>
            <p>
              <strong>
                Khi bạn sử dụng Trạm EV, bạn không chỉ xem một bản đồ - bạn đang
                kết nối với sức mạnh trí tuệ của hàng ngàn người dùng khác. Mỗi
                lượt đánh giá, mỗi lần cập nhật trạng thái là một đóng góp quý
                giá giúp người đi sau an tâm hơn.
              </strong>
            </p>
          </div>
          <blockquote className="tev-quote">
            <p>
              Tôi còn nhớ cảm giác lo âu khi lần đầu cầm lái chiếc xe điện từ
              TP. Hồ Chí Minh về Đà Lạt. Những câu hỏi về trạm sạc, độ tương
              thích của đầu sạc hay liệu trạm đó có đang hoạt động hay không
              luôn thường trực. Nhưng khi mở Trạm EV, tôi nhận ra mình không đơn
              độc. Nhờ những cập nhật thực tế từ Cộng đồng người dùng trạm sạc
              công cộng, tôi biết chính xác trạm sạc tại trạm dừng chân tiếp
              theo đang trống và có công suất thực tế bao nhiêu. Chính những
              thông tin nhỏ bé nhưng kịp thời đó đã biến một hành trình đầy áp
              lực thành một trải nghiệm khám phá thú vị.
            </p>
            <cite>— Anh Minh, thành viên đời đầu của Trạm EV</cite>
          </blockquote>
        </div>
      </section>

      {/* ================================================
          FEATURES — WHY TRAM EV?
      ================================================ */}
      <section className="tev-feat-new-section">
        <div className="tev-container">
          <div className="tev-section-hd">
            <h2>Tại sao Trạm EV là lựa chọn hàng đầu?</h2>
            <p>
              Nền tảng thông tin xe điện toàn diện nhất Việt Nam - được xây dựng
              bởi cộng đồng, dành cho cộng đồng.
            </p>
          </div>
          <div className="tev-feat-grid">
            <div className="tev-feat-card">
              <div className="tev-feat-ic tev-feat-ic--orange">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="22"
                  height="22"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3>Dữ liệu đa tầng</h3>
              <p>
                Tích hợp mọi nhà cung cấp sạc trên một giao diện duy nhất, đảm
                bảo tính trung lập và không giới hạn thương hiệu xe.
              </p>
            </div>
            <div className="tev-feat-card">
              <div className="tev-feat-ic tev-feat-ic--green">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="22"
                  height="22"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3>Tối ưu hóa thời gian</h3>
              <p>
                Hệ thống phân tích thông minh giúp bạn tìm thấy trạm sạc phù hợp
                nhất dựa trên công suất, trạng thái thực tế và tiện ích xung
                quanh.
              </p>
            </div>
            <div className="tev-feat-card">
              <div className="tev-feat-ic tev-feat-ic--blue">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="22"
                  height="22"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <h3>Cộng đồng dẫn dắt</h3>
              <p>
                Mỗi lượt đánh giá, mỗi lần cập nhật trạng thái là một đóng góp
                quý giá giúp người đi sau an tâm hơn trên mọi hành trình.
              </p>
            </div>
            <div className="tev-feat-card">
              <div className="tev-feat-ic tev-feat-ic--purple">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="22"
                  height="22"
                >
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>
              <h3>Kết nối CarPlay/Android Auto</h3>
              <p>
                Đưa thông tin trực tiếp lên màn hình xe, giúp việc tìm trạm sạc
                an toàn và thuận tiện khi đang lái xe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================
          HOW IT WORKS
      ================================================ */}
      <MeshBackground
        variant="mint"
        intensity="low"
        blur={70}
        tag="section"
        className="tev-section"
      >
        <div className="tev-container">
          <div className="tev-section-head">
            <div className="tev-section-badge white">
              Đơn giản & Nhanh chóng
            </div>
            <h2 className="tev-section-title">
              Sử dụng EV Charge
              <br />
              <span className="tev-green">chỉ với 3 bước</span>
            </h2>
          </div>

          <div className="tev-steps">
            <div className="tev-step-conn" />

            <div className="tev-step">
              <div className="tev-step-num">01</div>
              <div className="tev-step-icon-circle">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="28"
                  height="28"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Tìm trạm sạc</h3>
              <p>
                Mở bản đồ, xem tất cả trạm sạc gần bạn với thông tin thời gian
                thực: số cổng còn trống, giá điện, đánh giá cộng đồng.
              </p>
            </div>

            <div className="tev-step">
              <div className="tev-step-num">02</div>
              <div className="tev-step-icon-circle">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="28"
                  height="28"
                >
                  <path
                    d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>Sạc xe của bạn</h3>
              <p>
                Chọn cổng sạc phù hợp, bắt đầu phiên sạc bằng QR hoặc đặt lịch
                trước. Theo dõi trạng thái công suất và thời gian sạc theo thời
                gian thực.
              </p>
            </div>

            <div className="tev-step">
              <div className="tev-step-num">03</div>
              <div className="tev-step-icon-circle">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="28"
                  height="28"
                >
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                  <line x1="6" y1="15" x2="10" y2="15" />
                </svg>
              </div>
              <h3>Thanh toán & giao dịch</h3>
              <p>
                Thanh toán nhanh ngay trên ứng dụng, xem hóa đơn và theo dõi
                lịch sử giao dịch minh bạch cho từng phiên sạc.
              </p>
            </div>
          </div>
        </div>
      </MeshBackground>

      {/* ================================================
          CTA BANNER
      ================================================ */}
      <section className="tev-cta-section">
        <div className="tev-cta-content">
          <div className="tev-cta-text">
            <h2>
              Tham gia cộng đồng xe điện
              <br />
              <span>Việt Nam ngay hôm nay</span>
            </h2>
            <p>Đăng ký miễn phí – Không ràng buộc – Hỗ trợ 24/7</p>
          </div>
          <div className="tev-cta-actions">
            <button
              className="tev-btn-white"
              onClick={() => navigate(paths.register)}
            >
              Đăng ký miễn phí
            </button>
            <button
              className="tev-btn-outline-white"
              onClick={() => navigate(paths.stations)}
            >
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
