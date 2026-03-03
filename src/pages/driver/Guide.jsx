import React from "react";
import Header from "../../components/admin/Header.jsx";
import "../admin/Dashboard.css";
import "./Guide.css";

// ═══════════════════════════════════════════════════════════════
//  DATA — 7 bước sử dụng hệ thống
// ═══════════════════════════════════════════════════════════════
const GUIDE_STEPS = [
  {
    step: 1,
    icon: "🗺️",
    title: "Xem trạm sạc trên bản đồ",
    desc: "Sử dụng bản đồ trực quan để tìm các trạm sạc gần vị trí hiện tại của bạn trong thời gian thực.",
    tips: [
      "Cho phép ứng dụng truy cập vị trí để hiển thị trạm gần nhất",
      "Nhấn vào điểm đánh dấu trên bản đồ để xem thông tin chi tiết trạm",
      "Sử dụng nút zoom để phóng to / thu nhỏ khu vực",
      "Phù hợp khi bạn muốn khám phá khu vực xung quanh",
    ],
    color: "#16a34a",
  },
  {
    step: 2,
    icon: "📋",
    title: "Xem danh sách trạm sạc",
    desc: "Sử dụng chế độ danh sách để so sánh khoảng cách, giá cả và đánh giá giữa các trạm sạc.",
    tips: [
      "Hiển thị thông tin chi tiết: giá, đánh giá, khoảng cách",
      "Dễ dàng so sánh nhiều trạm cùng lúc",
      "Tìm kiếm địa điểm cụ thể để xem trạm xung quanh",
      "Sử dụng phân trang để duyệt qua nhiều trạm",
    ],
    color: "#0ea5e9",
  },
  {
    step: 3,
    icon: "📅",
    title: "Đặt lịch sạc xe",
    desc: "Đặt trước khung giờ sạc tại trạm bạn muốn để đảm bảo có chỗ khi đến nơi.",
    tips: [
      "Chọn trạm sạc → Chọn điểm sạc trống → Chọn khung giờ",
      "Xem lại thông tin đặt lịch trước khi xác nhận",
      "Nhận mã QR sau khi đặt thành công để check-in tại trạm",
      "Có thể huỷ lịch trước giờ hẹn nếu thay đổi kế hoạch",
    ],
    color: "#8b5cf6",
  },
  {
    step: 4,
    icon: "⚡",
    title: "Theo dõi phiên sạc",
    desc: "Giám sát phiên sạc đang diễn ra với thông tin cập nhật theo thời gian thực.",
    tips: [
      "Xem trạng thái sạc: mức pin, công suất, thời gian còn lại",
      "Nhận thông báo khi phiên sạc hoàn tất",
      "Dừng phiên sạc bất kỳ lúc nào từ ứng dụng",
      "Xem lịch sử tất cả các phiên sạc đã thực hiện",
    ],
    color: "#f59e0b",
  },
  {
    step: 5,
    icon: "💳",
    title: "Thanh toán & Giao dịch",
    desc: "Thanh toán phiên sạc và quản lý lịch sử giao dịch một cách tiện lợi.",
    tips: [
      "Hỗ trợ nhiều phương thức: VNPay, Momo, chuyển khoản",
      "Xem chi tiết từng hoá đơn và trạng thái thanh toán",
      "Lọc giao dịch theo ngày, trạng thái (đã TT / chờ TT)",
      "Nhận hoá đơn điện tử qua email sau mỗi giao dịch",
    ],
    color: "#ec4899",
  },
  {
    step: 6,
    icon: "🚗",
    title: "Quản lý phương tiện",
    desc: "Thêm và quản lý danh sách xe điện của bạn để hệ thống gợi ý trạm sạc phù hợp.",
    tips: [
      "Thêm xe bằng cách chọn hãng và model từ danh sách",
      "Nhập biển số xe để dễ dàng nhận diện",
      "Hệ thống tự gợi ý cổng sạc tương thích với xe của bạn",
      "Quản lý nhiều xe trên cùng một tài khoản",
    ],
    color: "#06b6d4",
  },
  {
    step: 7,
    icon: "🔔",
    title: "Thông báo & Cập nhật",
    desc: "Nhận thông báo quan trọng từ hệ thống về phiên sạc, khuyến mãi và cập nhật.",
    tips: [
      "Thông báo khi phiên sạc hoàn tất hoặc gặp sự cố",
      "Cập nhật khi có khuyến mãi hoặc trạm mới mở",
      "Nhắc nhở lịch sạc đã đặt trước",
      "Tuỳ chỉnh loại thông báo muốn nhận trong cài đặt",
    ],
    color: "#ef4444",
  },
];

// ═══════════════════════════════════════════════════════════════
//  DATA — So sánh Bản đồ vs Danh sách
// ═══════════════════════════════════════════════════════════════
const COMPARE = [
  {
    title: "Trang Bản đồ",
    icon: "🗺️",
    desc: "Phù hợp khi:",
    points: [
      "Bạn muốn khám phá khu vực xung quanh",
      "Cần xem vị trí trực quan và khoảng cách",
      "Lập kế hoạch tuyến đường di chuyển",
      "Tìm trạm gần các địa điểm cụ thể",
    ],
  },
  {
    title: "Trang Danh sách",
    icon: "📋",
    desc: "Phù hợp khi:",
    points: [
      "Cần so sánh thông tin chi tiết nhiều trạm",
      "Quan tâm đến giá cả và đánh giá",
      "Muốn lọc và sắp xếp theo tiêu chí",
      "Tiết kiệm pin và dữ liệu di động",
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
//  DATA — Mẹo sử dụng
// ═══════════════════════════════════════════════════════════════
const TIPS = [
  {
    icon: "✅",
    title: "Kiểm tra trạng thái trước khi đi",
    desc: "Kiểm tra trạng thái trạm sạc ít nhất 15 phút trước khi đến nơi để tránh chờ đợi.",
    accent: "#16a34a",
  },
  {
    icon: "🔍",
    title: "Sử dụng bộ lọc hiệu quả",
    desc: "Lọc theo loại đầu sạc và công suất phù hợp với xe của bạn để tiết kiệm thời gian.",
    accent: "#0ea5e9",
  },
  {
    icon: "⭐",
    title: "Đặt lịch trước giờ cao điểm",
    desc: "Đặt lịch sạc trước vào buổi sáng sớm hoặc tối muộn để tránh tình trạng hết chỗ.",
    accent: "#8b5cf6",
  },
  {
    icon: "🔄",
    title: "Chuyển đổi Bản đồ & Danh sách",
    desc: "Dùng Bản đồ để khám phá vị trí, sau đó chuyển sang Danh sách để so sánh chi tiết.",
    accent: "#f59e0b",
  },
  {
    icon: "🚗",
    title: "Thêm xe trước khi đặt lịch",
    desc: "Thêm thông tin xe vào hồ sơ để hệ thống gợi ý trạm sạc tương thích tự động.",
    accent: "#ec4899",
  },
  {
    icon: "📱",
    title: "Bật thông báo đẩy",
    desc: "Bật thông báo để nhận cập nhật real-time về phiên sạc và khuyến mãi mới.",
    accent: "#06b6d4",
  },
];

// ═══════════════════════════════════════════════════════════════
//  COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function Guide() {
  return (
    <div className="dashboard-container">
      <Header />

      {/* ── HERO ── */}
      <div className="guide-hero">
        <div className="guide-hero-badge">📖 Hướng dẫn sử dụng</div>
        <h1 className="guide-hero-title">
          Cẩm nang sử dụng ứng dụng hiệu quả
        </h1>
        <p className="guide-hero-sub">
          Hãy để <strong>EVCharge</strong> trở thành "người hoa tiêu" kỹ thuật số
          của bạn. Tìm hiểu cách tận dụng tối đa mọi tính năng của hệ thống.
        </p>
      </div>

      {/* ── SECTION: CÁC BƯỚC SỬ DỤNG ── */}
      <div className="guide-section">
        <h2 className="guide-section-title">
          <span className="guide-section-icon">📌</span>
          Các bước sử dụng
        </h2>

        <div className="guide-timeline">
          {GUIDE_STEPS.map((item, idx) => (
            <div
              className="guide-timeline-item"
              key={item.step}
              style={{ "--step-color": item.color }}
            >
              {/* Timeline rail: node + connector line */}
              <div className="guide-timeline-rail">
                <div className="guide-timeline-node">{item.step}</div>
                {idx < GUIDE_STEPS.length - 1 && (
                  <div className="guide-timeline-line" />
                )}
              </div>

              {/* Content card */}
              <div className="guide-timeline-card">
                <div className="guide-timeline-header">
                  <div className="guide-timeline-icon">{item.icon}</div>
                  <div>
                    <h3 className="guide-timeline-title">{item.title}</h3>
                    <p className="guide-timeline-desc">{item.desc}</p>
                  </div>
                </div>

                <ul className="guide-timeline-tips">
                  {item.tips.map((tip, i) => (
                    <li key={i}>
                      <span className="guide-timeline-check">&#10003;</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION: SO SÁNH BẢN ĐỒ vs DANH SÁCH ── */}
      <div className="guide-section">
        <h2 className="guide-section-title">
          <span className="guide-section-icon">⚖️</span>
          Bản đồ vs Danh sách — Khi nào nên dùng?
        </h2>

        <div className="guide-compare-grid">
          {COMPARE.map((card, i) => (
            <div className="guide-compare-card" key={i}>
              <div className="guide-compare-icon">{card.icon}</div>
              <h3 className="guide-compare-title">{card.title}</h3>
              <p className="guide-compare-desc">{card.desc}</p>
              <ul className="guide-compare-list">
                {card.points.map((pt, j) => (
                  <li key={j}>{pt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION: MẸO SỬ DỤNG ── */}
      <div className="guide-section">
        <h2 className="guide-section-title">
          <span className="guide-section-icon">💡</span>
          Mẹo sử dụng hiệu quả
        </h2>

        <div className="guide-tips-grid">
          {TIPS.map((tip, i) => (
            <div className="guide-tip-card" key={i} style={{ "--tip-accent": tip.accent }}>
              <div className="guide-tip-left">
                <div className="guide-tip-badge">{String(i + 1).padStart(2, "0")}</div>
              </div>
              <div className="guide-tip-right">
                <h4 className="guide-tip-title">{tip.title}</h4>
                <p className="guide-tip-desc">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
