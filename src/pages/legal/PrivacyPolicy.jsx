import React from "react";
import "./policy.css";

const PrivacyPolicy = () => {
  return (
    <div className="policy-container">
      <div className="policy-content">
        <h1 className="policy-title">Chính sách Bảo mật</h1>
        <p className="policy-last-updated">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>

        <section className="policy-section">
          <h2>1. Thu thập thông tin</h2>
          <p>
            Hệ thống Quản lý Trạm Sạc Xe Điện thu thập thông tin cá nhân của bạn để cung cấp dịch vụ quản lý và sạc xe điện an toàn, hiệu quả. Thông tin chúng tôi thu thập bao gồm:
          </p>
          <ul>
            <li><strong>Thông tin nhận dạng cá nhân:</strong> Họ tên, địa chỉ email, số điện thoại, ngày sinh và giới tính khi bạn đăng ký tài khoản.</li>
            <li><strong>Thông tin xe:</strong> Biển số xe, mẫu xe và các thông số cài đặt xe điện để tối ưu hóa việc sạc.</li>
            <li><strong>Dữ liệu vị trí:</strong> Thông tin vị trí GPS tạm thời để hiển thị và dẫn đường đến các trạm sạc gần nhất.</li>
            <li><strong>Dữ liệu giao dịch:</strong> Thông tin thanh toán, chi tiết các lần sạc, chi phí và thời gian sạc để lưu lịch sử và xuất hóa đơn.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>2. Sử dụng thông tin</h2>
          <p>Chúng tôi sử dụng thông tin thu thập được cho các mục đích sau:</p>
          <ul>
            <li>Cung cấp, duy trì và cải thiện hệ thống quản lý trạm sạc.</li>
            <li>Xử lý các giao dịch thanh toán cho dịch vụ sạc xe.</li>
            <li>Gửi mã xác thực (OTP) và các thông báo quan trọng liên quan đến tài khoản và giao dịch của bạn.</li>
            <li>Cung cấp dịch vụ hỗ trợ khách hàng và giải quyết các khiếu nại.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. Chia sẻ thông tin</h2>
          <p>
            Chúng tôi cam kết không bán, trao đổi các thông tin nhận dạng cá nhân của bạn cho bên thứ ba. Tuy nhiên, thông tin có thể được chia sẻ trong các trường hợp:
          </p>
          <ul>
            <li><strong>Bên cung cấp dịch vụ yểm trợ:</strong> Các cổng thanh toán an toàn để xử lý giao dịch.</li>
            <li><strong>Yêu cầu pháp lý:</strong> Khi được yêu cầu bởi cơ quan có thẩm quyền theo quy định của pháp luật.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. Bảo mật dữ liệu</h2>
          <p>
            Chúng tôi áp dụng các biện pháp bảo mật dữ liệu tiêu chuẩn công nghiệp (như mã hóa mật khẩu, sử dụng HTTPS, xác thực OTP) để bảo vệ khỏi việc truy cập trái phép, thay đổi, tiết lộ hoặc phá hủy thông tin cá nhân của bạn cũng như dữ liệu được lưu trữ trên ứng dụng của chúng tôi.
          </p>
        </section>

        <section className="policy-section">
          <h2>5. Quyền lợi của bạn</h2>
          <p>
            Bạn có quyền truy cập, chỉnh sửa hoặc xóa bỏ thông tin cá nhân (Profile) của mình tại bất kỳ thời điểm nào thông qua giao diện quản lý tài khoản trên ứng dụng. Nếu cần hỗ trợ vô hiệu hóa tài khoản, vui lòng liên hệ hệ thống chăm sóc khách hàng của chúng tôi.
          </p>
        </section>

        <section className="policy-section">
          <h2>6. Thay đổi Chính sách Bảo mật</h2>
          <p>
            Hệ thống Quản lý Trạm Sạc Xe Điện có quyền cập nhật chính sách bảo mật này bất cứ lúc nào. Khi thực hiện thay đổi, chúng tôi sẽ thông báo cho bạn trên nền tảng ứng dụng.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
