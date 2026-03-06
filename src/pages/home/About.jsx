import React from "react";
import {
  FiCpu,
  FiDatabase,
  FiDownload,
  FiFlag,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiShield,
  FiStar,
  FiTarget,
  FiTool,
  FiUsers,
} from "react-icons/fi";
import MeshBackground from "../../components/MeshBackground/MeshBackground.jsx";
import HomeFooter from "../../components/HomeFooter/HomeFooter.jsx";
import "./About.css";

const CORE_VALUES = [
  {
    title: "Tầm nhìn",
    desc: "Trạm EV là dự án công nghệ phi lợi nhuận, ra đời với sứ mệnh giải quyết bài toán hạ tầng năng lượng cho người dùng xe điện tại Việt Nam.",
    icon: FiTarget,
    tone: "amber",
  },
  {
    title: "Sứ mệnh",
    desc: "Được xây dựng trên triết lý Dữ liệu mở và Trung lập, chúng tôi tin rằng thông tin trạm sạc phải được tiếp cận một cách bình đẳng bởi mọi chủ xe.",
    icon: FiFlag,
    tone: "blue",
  },
  {
    title: "Tính khách quan",
    desc: "Chúng tôi không thuộc về bất cứ nhà vận hành hay nhà sản xuất nào, mọi thông tin đều được kiểm chứng và trình bày minh bạch.",
    icon: FiShield,
    tone: "green",
  },
  {
    title: "Công nghệ tiên phong",
    desc: "Áp dụng các giao thức tiêu chuẩn cùng công nghệ dữ liệu thời gian thực để đảm bảo tính chính xác và khả năng mở rộng lâu dài.",
    icon: FiCpu,
    tone: "purple",
  },
];

const PILLARS = [
  {
    no: "1",
    title: "Dữ liệu đa nguồn",
    desc: "Liên kết từ các API chính thống kết hợp phản hồi từ người dùng theo thời gian thực để tăng độ bao phủ dữ liệu thị trường.",
    icon: FiDatabase,
  },
  {
    no: "2",
    title: "Trải nghiệm cá nhân hóa",
    desc: "Ứng dụng tự động đề xuất trạm sạc theo cung đường, mức pin và thói quen người dùng để giảm thời gian tìm kiếm.",
    icon: FiUsers,
  },
  {
    no: "3",
    title: "Hỗ trợ kỹ thuật chuyên sâu",
    desc: "Không chỉ hiển thị vị trí, chúng tôi còn cung cấp thông số kỹ thuật của trạm từ đầu sạc, thời gian chờ và giá dịch vụ.",
    icon: FiTool,
  },
  {
    no: "4",
    title: "Cộng đồng & chia sẻ",
    desc: "Kết nối mạng lưới cộng đồng tài xế điện, cùng nhau cập nhật trải nghiệm thực tiễn nhằm nâng cao dữ liệu vận hành.",
    icon: FiMessageCircle,
  },
];

const CONTACTS = [
  { label: "Email", value: "contact@ev.vn", icon: FiMail },
  { label: "Điện thoại", value: "+84 93 151 9293", icon: FiPhone },
  { label: "Địa chỉ", value: "Thành phố Hồ Chí Minh, Việt Nam", icon: FiMapPin },
];

export default function About() {
  return (
    <div >
      <MeshBackground variant="mint" floating className="about-hero-wrap">
        <section className="about-hero">
          <h1>Định hình tương lai di chuyển xanh</h1>
          <p className="about-hero-subtitle">Vì một hệ sinh thái xe điện không rào cản</p>
          <p className="about-sub">
            Trạm EV là dự án công nghệ phi lợi nhuận, ra đời với sứ mệnh giải quyết bài toán hạ tầng
            năng lượng cho người dùng xe điện tại Việt Nam. Được xây dựng trên triết lý Dữ liệu mở và
            Trung lập, chúng tôi tin rằng thông tin trạm sạc phải được tiếp cận một cách bình đẳng bởi
            mọi chủ xe, không phân biệt thương hiệu hay nhà cung cấp.
          </p>
        </section>
      </MeshBackground>

      <section className="about-section">
        <div className="about-heading">
          <h2>Tầm nhìn và Sứ mệnh</h2>
          <p>Giá trị cốt lõi định hình cách EV Charge phát triển sản phẩm và phục vụ cộng đồng.</p>
        </div>
        <div className="about-values-grid">
          {CORE_VALUES.map((item) => (
            <article key={item.title} className="about-value-card">
              <span className={`about-value-icon about-tone-${item.tone}`}>
                <item.icon />
              </span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section">
        <div className="about-heading">
          <h2>Các trụ cột phát triển</h2>
          <p>Nền tảng vận hành ổn định và trung lập được xây trên 4 trụ cột chính.</p>
        </div>
        <div className="about-pillars-grid">
          {PILLARS.map((item) => (
            <article key={item.title} className="about-pillar-card">
              <span className="about-pillar-icon">
                <item.icon />
              </span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section about-contact-wrap">
        <div className="about-heading">
          <h2>Liên hệ với chúng tôi</h2>
          <p>Chúng tôi luôn sẵn sàng lắng nghe để cùng xây dựng hạ tầng xe điện tốt hơn.</p>
        </div>
        <div className="about-contact-grid">
          {CONTACTS.map((item) => (
            <article key={item.label} className="about-contact-card">
              <span className="about-contact-icon">
                <item.icon />
              </span>
              <h3>{item.label}</h3>
              <p>{item.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section about-cta-panel">
        <span className="about-cta-icon">
          <FiStar />
        </span>
        <h2>Sẵn sàng bắt đầu?</h2>
        <p>Tải ứng dụng ngay hôm nay và tham gia cộng đồng người dùng xe điện.</p>
        <button type="button" className="about-cta-btn">
          <FiDownload />
          Tải ứng dụng
        </button>
      </section>

      <HomeFooter />
    </div>
  );
}
