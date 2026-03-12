# 🎨 UX/UI Review Progress — Driver Portal

> **Dự án:** EV Charging Station Management System — Driver Portal  
> **Ngày bắt đầu review:** 2026-03-11  
> **Người review:** UX/UI Designer & Frontend Developer  
> **Phiên bản:** 1.0

---

## I. BỘ TIÊU CHÍ UX/UI CHUNG

Mỗi trang/component trong Driver Portal cần đạt **10 tiêu chí** sau:

| # | Tiêu chí | Mô tả |
|---|----------|--------|
| C1 | **Đồng bộ màu sắc** | Chỉ dùng brand `#16a34a` (primary), `#15803d` (hover), `#166534` (dark). Không còn `#00BFA6`, `#20b2aa`, `#667eea`. |
| C2 | **Loading State** | Mọi trang gọi API phải có spinner hoặc skeleton trong lúc chờ dữ liệu. |
| C3 | **Empty State** | Khi không có dữ liệu: icon minh họa + thông điệp thân thiện + nút CTA (nếu có). |
| C4 | **Error State** | Lỗi API hiển thị toast hoặc inline message rõ ràng, không fail im lặng. |
| C5 | **Hover & Transition** | Tất cả button/card/link có `transition: 0.2s ease` + hiệu ứng hover nhất quán. |
| C6 | **Responsive** | Media query tại `768px` và `480px`. Grid/flex co giãn hợp lý trên mobile. |
| C7 | **Typography** | Hero `1.6–2rem/800–900`, Section `1.15–1.3rem/700`, Body `0.88–0.95rem/500`, Label `0.72–0.78rem/600`. |
| C8 | **Spacing** | Modular scale `4/8/12/16/24/32px`. Hero padding `28–40px`. Card padding `20–24px`. |
| C9 | **Button** | Primary: solid green gradient. Secondary: outline green. Danger: red. Disabled: `opacity: 0.6 + cursor: not-allowed`. |
| C10 | **Accessibility** | `aria-label` cho icon button. Focus ring visible. Contrast ratio ≥ 4.5:1. |

---

## II. TIẾN ĐỘ REVIEW THEO TRANG

### Trạng thái: `⬜ To Do` · `🔄 In Progress` · `✅ Done` · `⏭️ Skip`

---

### 1. Hướng dẫn sử dụng — `Guide.jsx`

| Hạng mục | Trạng thái | Đề xuất cải thiện | Ghi chú |
|----------|-----------|-------------------|---------|
| C1 — Đồng bộ màu sắc | ✅ Done | Không có màu cũ | Brand green xuyên suốt |
| C2 — Loading State | ⬜ To Do | Thêm spinner khi trang load lần đầu | Hiện tại Guide là static content, không gọi API — có thể skip |
| C3 — Empty State | ✅ Done | — | Nội dung tĩnh, luôn hiển thị |
| C4 — Error State | ⬜ To Do | Không áp dụng (trang tĩnh) | Skip nếu không có API |
| C5 — Hover & Transition | ✅ Done | Các card step có hover effect | — |
| C6 — Responsive | ⬜ To Do | Kiểm tra grid trên mobile 375px | Cần verify trên thiết bị thật |
| C7 — Typography | ✅ Done | Hierarchy rõ ràng, heading + body + label | — |
| C8 — Spacing | ✅ Done | Modular scale chuẩn | — |
| C9 — Button | ✅ Done | Badge/link style phù hợp | — |
| C10 — Accessibility | ⬜ To Do | Thêm `aria-label` cho các icon step | — |

---

### 2. Dashboard Tài xế — `DriverDashboard.jsx`

| Hạng mục | Trạng thái | Đề xuất cải thiện | Ghi chú |
|----------|-----------|-------------------|---------|
| C1 — Đồng bộ màu sắc | ✅ Done | Brand green, không còn màu cũ | — |
| C2 — Loading State | ✅ Done | Shimmer animation 1.4s | Skeleton loading đã có |
| C3 — Empty State | ⬜ To Do | Khi chưa có phiên sạc/giao dịch → hiển thị thông điệp empty | Hiện grid trống không có message |
| C4 — Error State | ⬜ To Do | Thêm toast khi API dashboard lỗi | Hiện `console.log` im lặng |
| C5 — Hover & Transition | ✅ Done | Card lift `translateY(-3px)` + `0.2s ease` | — |
| C6 — Responsive | ✅ Done | Grid `auto-fill, minmax()` co giãn | — |
| C7 — Typography | ✅ Done | Heading 800, body 500 | — |
| C8 — Spacing | ✅ Done | — | — |
| C9 — Button | ✅ Done | Feature card nhất quán | Emoji icon (⚡🚗💳🔔) — chấp nhận cho dashboard |
| C10 — Accessibility | ⬜ To Do | Thêm `aria-label` cho feature cards | — |

---

### 3. Trạm sạc — `Stations.jsx`

| Hạng mục | Trạng thái | Đề xuất cải thiện | Ghi chú |
|----------|-----------|-------------------|---------|
| C1 — Đồng bộ màu sắc | ✅ Done | Hero gradient `#166534 → #16a34a → #15803d` | — |
| C2 — Loading State | ✅ Done | Spinner `0.7s` | — |
| C3 — Empty State | ⬜ To Do | Khi không tìm thấy trạm → cần icon + "Không tìm thấy trạm" + nút "Xóa bộ lọc" | Hiện grid trống |
| C4 — Error State | ⬜ To Do | Thêm toast cho lỗi API | Hiện `console.error` |
| C5 — Hover & Transition | ✅ Done | Hero + card hover effects | — |
| C6 — Responsive | ⬜ To Do | Thêm media query `@media (max-width: 768px)` cho grid station | Flex-col chưa đủ |
| C7 — Typography | ✅ Done | Title `2rem`, label `0.78rem` | — |
| C8 — Spacing | ✅ Done | — | — |
| C9 — Button | ✅ Done | Status badge + icon button | Lucide icons |
| C10 — Accessibility | ⬜ To Do | Search input cần `aria-label` | — |

---

### 4. Chi tiết trạm — `StationDetail.jsx`

| Hạng mục | Trạng thái | Đề xuất cải thiện | Ghi chú |
|----------|-----------|-------------------|---------|
| C1 — Đồng bộ màu sắc | ✅ Done | `#16a34a` cho status & CTA | — |
| C2 — Loading State | ✅ Done | Spinner `0.8s` | — |
| C3 — Empty State | ✅ Done | `.sd-not-found` khi không tìm thấy | — |
| C4 — Error State | ⬜ To Do | Thêm inline error khi API lỗi | Hiện `console.log` |
| C5 — Hover & Transition | ✅ Done | Button `50px` + glass effect | — |
| C6 — Responsive | ⬜ To Do | **Thiếu media queries** — cần thêm breakpoint `768px` | Grid 2-col sẽ vỡ trên mobile |
| C7 — Typography | ✅ Done | Title `1.75rem` | — |
| C8 — Spacing | ✅ Done | — | — |
| C9 — Button | ✅ Done | Glass button "Đặt lịch" | — |
| C10 — Accessibility | ⬜ To Do | Nút "Đặt lịch" cần `aria-label` | — |

---

### 5. Đặt lịch sạc — `Booking.jsx`

| Hạng mục | Trạng thái | Đề xuất cải thiện | Ghi chú |
|----------|-----------|-------------------|---------|
| C1 — Đồng bộ màu sắc | ✅ Done | Không còn màu cũ | — |
| C2 — Loading State | ⬜ To Do | Cần spinner khi load slot khả dụng | Hiện manage state nhưng chưa có visual |
| C3 — Empty State | ✅ Done | Notice box khi không có slot | — |
| C4 — Error State | ✅ Done | Toast warnings | — |
| C5 — Hover & Transition | ✅ Done | Card `0.2s ease` | — |
| C6 — Responsive | ⬜ To Do | Grid `1024px` — cần thêm breakpoint `768px` + `480px` | — |
| C7 — Typography | ✅ Done | Heading hierarchy rõ | — |
| C8 — Spacing | ✅ Done | — | — |
| C9 — Button | ✅ Done | Multi-color semantic | — |
| C10 — Accessibility | ⬜ To Do | Slot time buttons cần `aria-selected` state | — |

---

### 6. Chi tiết đặt lịch — `BookingDetail.jsx`

| Hạng mục | Trạng thái | Đề xuất cải thiện | Ghi chú |
|----------|-----------|-------------------|---------|
| C1 — Đồng bộ màu sắc | ✅ Done | Green gradient buttons | — |
| C2 — Loading State | ⬜ To Do | Thêm skeleton cho card chi tiết | — |
| C3 — Empty State | ✅ Done | `.bd-empty` state | — |
| C4 — Error State | ✅ Done | Toast errors | — |
| C5 — Hover & Transition | ⬜ To Do | Buttons thiếu `transition` property | Có hover nhưng chưa smooth |
| C6 — Responsive | ⬜ To Do | **Thiếu mobile media queries** | Card sẽ overflow trên 375px |
| C7 — Typography | ✅ Done | All-caps badges | — |
| C8 — Spacing | ✅ Done | — | — |
| C9 — Button | ✅ Done | Gradient + solid | — |
| C10 — Accessibility | ⬜ To Do | Status badge cần `role="status"` | — |

---

### 7. QR Code đặt lịch — `BookingQRCode.jsx`

| Hạng mục | Trạng thái | Đề xuất cải thiện | Ghi chú |
|----------|-----------|-------------------|---------|
| C1 — Đồng bộ màu sắc | ✅ Done | Kế thừa Dashboard.css | — |
| C2 — Loading State | ✅ Done | Loader component | — |
| C3 — Empty State | ✅ Done | — | — |
| C4 — Error State | ✅ Done | — | — |
| C5 — Hover & Transition | ✅ Done | Download button hover | — |
| C6 — Responsive | ✅ Done | Max-width cho QR card | — |
| C7 — Typography | ✅ Done | — | — |
| C8 — Spacing | ✅ Done | — | — |
| C9 — Button | ✅ Done | Download + back | — |
| C10 — Accessibility | ⬜ To Do | QR image cần `alt` text mô tả | — |

---

### 8. Phiên sạc — `ChargingSession.jsx`

| Hạng mục | Trạng thái | Đề xuất cải thiện | Ghi chú |
|----------|-----------|-------------------|---------|
| C1 — Đồng bộ màu sắc | ⬜ To Do | **Còn `#00BFA6`** trong progress circle (2 chỗ) → đổi sang `#16a34a` | Dòng ~130: `const progressColor = isComplete ? "#2196f3" : "#00BFA6"` |
| C2 — Loading State | ✅ Done | Spinner `0.8s` | — |
| C3 — Empty State | ✅ Done | `.cs-empty` icon 88px + CTA "Tìm trạm sạc ngay" | — |
| C4 — Error State | ⬜ To Do | Thêm error boundary cho polling failure | Polling fail im lặng |
| C5 — Hover & Transition | ⬜ To Do | Stat cards + action buttons cần hover effect | — |
| C6 — Responsive | ⬜ To Do | Stats grid 4-col → cần 2-col trên mobile | Chỉ có `max-width`, thiếu breakpoint |
| C7 — Typography | ✅ Done | Empty title `1.2rem` | — |
| C8 — Spacing | ✅ Done | — | — |
| C9 — Button | ✅ Done | Stop/refresh/search buttons | — |
| C10 — Accessibility | ⬜ To Do | Progress bar cần `role="progressbar"` + `aria-valuenow` | — |

---

### 9. Hồ sơ — `Profile.jsx`

| Hạng mục | Trạng thái | Đề xuất cải thiện | Ghi chú |
|----------|-----------|-------------------|---------|
| C1 — Đồng bộ màu sắc | ✅ Done | Hero + icon gradient | — |
| C2 — Loading State | ⬜ To Do | Thêm skeleton cho avatar + tên khi auth đang check | Hiện text "Đang kiểm tra..." |
| C3 — Empty State | ✅ Done | N/A — profile luôn có data | — |
| C4 — Error State | ⬜ To Do | Nếu userDetails null → hiển thị retry | — |
| C5 — Hover & Transition | ⬜ To Do | Menu items cần hover transition rõ ràng hơn | — |
| C6 — Responsive | ⬜ To Do | Grid `280px 1fr` — cần stack trên mobile | — |
| C7 — Typography | ✅ Done | Username `1.35rem` | — |
| C8 — Spacing | ✅ Done | — | — |
| C9 — Button | ✅ Done | Icon + text menu | — |
| C10 — Accessibility | ⬜ To Do | Menu items cần `role="menuitem"` | — |

---

### 10. Lịch sử giao dịch — `TransactionHistory.jsx`

| Hạng mục | Trạng thái | Đề xuất cải thiện | Ghi chú |
|----------|-----------|-------------------|---------|
| C1 — Đồng bộ màu sắc | ✅ Done | Status badges semantic | — |
| C2 — Loading State | ✅ Done | Managed state | — |
| C3 — Empty State | ⬜ To Do | **Thiếu** — grid trống không có message "Chưa có giao dịch nào" | Cần thêm icon + text + CTA |
| C4 — Error State | ✅ Done | Catch errors | — |
| C5 — Hover & Transition | ⬜ To Do | Transaction card thiếu hover effect | — |
| C6 — Responsive | ⬜ To Do | Stats grid 4-col overflow trên mobile | Cần `grid-template-columns: repeat(2, 1fr)` |
| C7 — Typography | ✅ Done | Title `1.75rem`, counter `1.6rem` | — |
| C8 — Spacing | ✅ Done | — | — |
| C9 — Button | ✅ Done | Glass UI filter | — |
| C10 — Accessibility | ⬜ To Do | Filter buttons cần `aria-pressed` | — |

---

### 11. Chi tiết giao dịch — `TransactionDetail.jsx`

| Hạng mục | Trạng thái | Đề xuất cải thiện | Ghi chú |
|----------|-----------|-------------------|---------|
| C1 — Đồng bộ màu sắc | ✅ Done | Semantic colors chuẩn | — |
| C2 — Loading State | ✅ Done | Spinner `.td-spinner` | — |
| C3 — Empty State | ✅ Done | AlertTriangle icon | — |
| C4 — Error State | ✅ Done | Multi-level error handling | — |
| C5 — Hover & Transition | ✅ Done | Green border hover | — |
| C6 — Responsive | ⬜ To Do | **Thiếu media queries** — info grid sẽ chật trên mobile | — |
| C7 — Typography | ✅ Done | Status text `1.5rem` | — |
| C8 — Spacing | ✅ Done | — | — |
| C9 — Button | ✅ Done | Back button green | — |
| C10 — Accessibility | ⬜ To Do | Status cần `role="status"` | — |

---

### 12. Thông tin cá nhân — `Information.jsx`

| Hạng mục | Trạng thái | Đề xuất cải thiện | Ghi chú |
|----------|-----------|-------------------|---------|
| C1 — Đồng bộ màu sắc | ✅ Done | Avatar gradient + role tag | — |
| C2 — Loading State | ✅ Done | Spinner `.inf-spinner` | — |
| C3 — Empty State | ✅ Done | Retry button | — |
| C4 — Error State | ✅ Done | Error display | — |
| C5 — Hover & Transition | ✅ Done | `0.25s` transitions | — |
| C6 — Responsive | ⬜ To Do | `280px + 1fr` grid không stack trên mobile | — |
| C7 — Typography | ✅ Done | Name `1.15rem` | — |
| C8 — Spacing | ✅ Done | — | — |
| C9 — Button | ✅ Done | Gradient primary | — |
| C10 — Accessibility | ⬜ To Do | Edit/password buttons cần `aria-label` | — |

---

### 13. Chỉnh sửa hồ sơ — `EditProfile.jsx`

| Hạng mục | Trạng thái | Đề xuất cải thiện | Ghi chú |
|----------|-----------|-------------------|---------|
| C1 — Đồng bộ màu sắc | ⬜ To Do | **CSS còn màu cũ** — contact icon dùng gradient xanh dương thay vì xanh lá | Kiểm tra EditProfile.css |
| C2 — Loading State | ⬜ To Do | Thêm spinner khi submit form | Hiện chỉ disable button |
| C3 — Empty State | ✅ Done | N/A — form luôn có data prefilled | — |
| C4 — Error State | ✅ Done | Toast validation | — |
| C5 — Hover & Transition | ✅ Done | `0.2s` outline hover | — |
| C6 — Responsive | ⬜ To Do | Fixed sidebar column không responsive | — |
| C7 — Typography | ✅ Done | Field label `16px` | — |
| C8 — Spacing | ✅ Done | — | — |
| C9 — Button | ✅ Done | Outline style | — |
| C10 — Accessibility | ⬜ To Do | Form inputs cần `aria-required` + `aria-invalid` | — |

---

### 14. Thông báo — `Notification.jsx`

| Hạng mục | Trạng thái | Đề xuất cải thiện | Ghi chú |
|----------|-----------|-------------------|---------|
| C1 — Đồng bộ màu sắc | ✅ Done | Hero + badge green | — |
| C2 — Loading State | ⬜ To Do | Cần spinner visual khi đang load | Manage state nhưng thiếu UI |
| C3 — Empty State | ⬜ To Do | **Thiếu** — không có message khi 0 thông báo | Cần icon Bell + "Chưa có thông báo mới" |
| C4 — Error State | ✅ Done | Toast errors | — |
| C5 — Hover & Transition | ⬜ To Do | Notification card cần hover highlight | — |
| C6 — Responsive | ⬜ To Do | Grid 3-col → 1-col trên mobile | — |
| C7 — Typography | ✅ Done | Title `1.75rem`, counter `1.6rem` | — |
| C8 — Spacing | ✅ Done | — | — |
| C9 — Button | ✅ Done | Glass filter buttons | — |
| C10 — Accessibility | ⬜ To Do | Card cần `aria-label` + `role="article"` | — |

---

### 15. Xe của tôi — `Vehicles.jsx`

| Hạng mục | Trạng thái | Đề xuất cải thiện | Ghi chú |
|----------|-----------|-------------------|---------|
| C1 — Đồng bộ màu sắc | ✅ Done | Hero gradient green | — |
| C2 — Loading State | ⬜ To Do | Cần skeleton cards trong lúc load | — |
| C3 — Empty State | ⬜ To Do | **Thiếu** — grid trống khi chưa có xe | Cần icon Car + "Thêm xe đầu tiên" + CTA |
| C4 — Error State | ✅ Done | Toast errors | — |
| C5 — Hover & Transition | ✅ Done | Back button `0.2s` | — |
| C6 — Responsive | ⬜ To Do | Flex layout cần wrap trên mobile | — |
| C7 — Typography | ✅ Done | Title `1.8rem` | — |
| C8 — Spacing | ✅ Done | — | — |
| C9 — Button | ✅ Done | Green gradient CTA | — |
| C10 — Accessibility | ⬜ To Do | "Thêm xe" button cần `aria-label` | — |

---

### 16. Thêm xe — `AddVehicle.jsx`

| Hạng mục | Trạng thái | Đề xuất cải thiện | Ghi chú |
|----------|-----------|-------------------|---------|
| C1 — Đồng bộ màu sắc | ✅ Done | Green theme | — |
| C2 — Loading State | ⬜ To Do | Thêm spinner khi submit | — |
| C3 — Empty State | ✅ Done | N/A — form | — |
| C4 — Error State | ✅ Done | Toast validation | — |
| C5 — Hover & Transition | ✅ Done | `0.2s` close button | — |
| C6 — Responsive | ✅ Done | `640px` modal max-width | — |
| C7 — Typography | ✅ Done | Header `1.15rem` | — |
| C8 — Spacing | ✅ Done | — | — |
| C9 — Button | ✅ Done | Multi-color semantic | — |
| C10 — Accessibility | ⬜ To Do | Modal cần `role="dialog"` + `aria-modal="true"` | — |

---

### 17. Đổi mật khẩu — `FormChangePassword.jsx`

| Hạng mục | Trạng thái | Đề xuất cải thiện | Ghi chú |
|----------|-----------|-------------------|---------|
| C1 — Đồng bộ màu sắc | ✅ Done | Green gradient header | — |
| C2 — Loading State | ⬜ To Do | Thêm spinner trên nút "Lưu thay đổi" khi submitting | — |
| C3 — Empty State | ✅ Done | N/A — form | — |
| C4 — Error State | ✅ Done | Inline + toast | — |
| C5 — Hover & Transition | ✅ Done | `0.2s` eye hover | — |
| C6 — Responsive | ✅ Done | `460px` modal | — |
| C7 — Typography | ✅ Done | Title `1.15rem` | — |
| C8 — Spacing | ✅ Done | — | — |
| C9 — Button | ✅ Done | Semantic red danger | — |
| C10 — Accessibility | ⬜ To Do | Inputs cần `aria-invalid` khi lỗi | — |

---

### 18. Thanh toán — `Payment.jsx` ⏭️ SKIP

| Hạng mục | Trạng thái | Đề xuất cải thiện | Ghi chú |
|----------|-----------|-------------------|---------|
| Toàn bộ | ⏭️ Skip | Đã quyết định skip — giữ nguyên giao diện hiện tại | Trang standalone, flow thanh toán riêng |

---

## III. TỔNG HỢP VẤN ĐỀ THEO ĐỘ ƯU TIÊN

### 🔴 Ưu tiên CAO (Ảnh hưởng trải nghiệm trực tiếp)

| # | Vấn đề | Trang liên quan | Trạng thái |
|---|--------|----------------|-----------|
| H1 | Sửa `#00BFA6` → `#16a34a` trong progress circle | ChargingSession | ⬜ To Do |
| H2 | Sửa gradient xanh dương → xanh lá trong contact icon | EditProfile.css | ⬜ To Do |
| H3 | Thêm Empty State cho danh sách giao dịch | TransactionHistory | ⬜ To Do |
| H4 | Thêm Empty State cho danh sách xe | Vehicles | ⬜ To Do |
| H5 | Thêm Empty State cho thông báo | Notification | ⬜ To Do |
| H6 | Thêm Empty State khi search trạm không có kết quả | Stations | ⬜ To Do |

### 🟡 Ưu tiên TRUNG BÌNH (UX tốt hơn)

| # | Vấn đề | Trang liên quan | Trạng thái |
|---|--------|----------------|-----------|
| M1 | Responsive — thêm `@media (max-width: 768px)` | StationDetail, BookingDetail, TransactionDetail | ⬜ To Do |
| M2 | Responsive — stats grid 4→2 col trên mobile | ChargingSession, TransactionHistory | ⬜ To Do |
| M3 | Responsive — sidebar + content stack trên mobile | Profile, Information, EditProfile | ⬜ To Do |
| M4 | Responsive — notification grid 3→1 col | Notification | ⬜ To Do |
| M5 | Error State — toast thay vì console.log | Stations, StationDetail, DriverDashboard | ⬜ To Do |
| M6 | Loading spinner cho form submit | EditProfile, AddVehicle, FormChangePassword | ⬜ To Do |
| M7 | Hover transition cho notification card | NotifiationCard | ⬜ To Do |
| M8 | Hover transition cho transaction card | TransactionHistory | ⬜ To Do |
| M9 | Hover transition cho stat cards | ChargingSession | ⬜ To Do |
| M10 | Hover transition cho menu items | Profile | ⬜ To Do |

### 🟢 Ưu tiên THẤP (Polish & Accessibility)

| # | Vấn đề | Trang liên quan | Trạng thái |
|---|--------|----------------|-----------|
| L1 | `aria-label` cho icon buttons | Tất cả trang | ⬜ To Do |
| L2 | `role="progressbar"` + `aria-valuenow` | ChargingSession | ⬜ To Do |
| L3 | `role="dialog"` + `aria-modal` cho modals | AddVehicle, FormChangePassword | ⬜ To Do |
| L4 | `aria-pressed` cho filter buttons | TransactionHistory, Notification | ⬜ To Do |
| L5 | `aria-selected` cho booking time slots | Booking | ⬜ To Do |
| L6 | `role="status"` cho status badges | BookingDetail, TransactionDetail | ⬜ To Do |
| L7 | `role="menuitem"` cho Profile menu | Profile | ⬜ To Do |
| L8 | `alt` text mô tả cho QR image | BookingQRCode | ⬜ To Do |
| L9 | `aria-required` + `aria-invalid` cho form inputs | EditProfile, AddVehicle, FormChangePassword | ⬜ To Do |
| L10 | Focus ring visible trên tất cả interactive elements | Toàn hệ thống | ⬜ To Do |

---

## IV. THỐNG KÊ TỔNG QUAN

| Metric | Giá trị |
|--------|---------|
| Tổng số trang Driver | 18 (+ 1 skip) |
| Trang đã redesign hoàn chỉnh | 16 |
| Trang skip (Payment) | 1 |
| Trang cần fix nhỏ (color) | 2 |
| Tổng hạng mục kiểm tra | 170 |
| ✅ Done | ~98 |
| ⬜ To Do | ~62 |
| ⏭️ Skip | ~10 |
| **Tỷ lệ hoàn thành** | **~58%** |

### Phân bổ công việc còn lại:

| Nhóm | Số lượng | Độ khó |
|------|---------|--------|
| 🔴 Ưu tiên CAO | 6 items | Dễ — chủ yếu CSS + JSX nhỏ |
| 🟡 Ưu tiên TRUNG BÌNH | 10 items | Trung bình — responsive + error handling |
| 🟢 Ưu tiên THẤP | 10 items | Dễ — thêm attributes ARIA |

---

## V. GHI CHÚ CHUNG

- **`theme.css`** là file READ-ONLY — không chỉnh sửa.
- **`Payment.jsx`** đã skip theo quyết định — không nằm trong scope review.
- **Emoji icons** trên Guide.jsx và DriverDashboard.jsx được chấp nhận (display purpose).
- **Brand palette chuẩn:**
  - Primary: `#16a34a`
  - Hover: `#15803d`
  - Dark: `#166534`
  - Light BG: `#f0fdf4`
  - Light border: `#bbf7d0`
  - Hero gradient: `linear-gradient(135deg, #16a34a 0%, #15803d 40%, #166534 100%)`
