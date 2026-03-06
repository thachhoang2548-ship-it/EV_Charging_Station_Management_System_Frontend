# Driver Pages — Tiến Độ Redesign

> Cập nhật lần cuối: <!-- UPDATE_DATE -->
> Tổng quan: Redesign toàn bộ trang Driver theo design system mới — brand `#16a34a`, soft green hero, glassmorphism, lucide-react icons.

---

## Mục Lục

1. [Design System](#design-system)
2. [Quy Tắc Chung](#quy-tắc-chung)
3. [Tiến Độ Tổng Quan](#tiến-độ-tổng-quan)
4. [Chi Tiết Từng Trang](#chi-tiết-từng-trang)
5. [Công Việc Còn Lại](#công-việc-còn-lại)
6. [Lưu Ý Kỹ Thuật](#lưu-ý-kỹ-thuật)

---

## Design System

### Brand Colors

| Token       | Hex       | Sử dụng                    |
|-------------|-----------|-----------------------------|
| Primary     | `#16a34a` | Button, hero, accent        |
| Hover       | `#15803d` | Button hover, gradient mid  |
| Dark        | `#166534` | Gradient end, text emphasis |
| Light BG    | `#f0fdf4` | Card bg, section bg         |
| Border      | `#bbf7d0` | Card border, divider        |
| Accent      | `#22c55e` | Badge, shimmer, glow        |
| Accent Lite | `#4ade80` | Gradient accent, chip       |

### Hero Banner

```css
background: linear-gradient(135deg, #16a34a 0%, #15803d 40%, #166534 100%);
```
- Decorative circles: `background: rgba(255,255,255,0.08)`, border-radius 50%
- **KHÔNG dùng dark gradient** (user đã reject)
- **KHÔNG dùng neon orbs** — chỉ white semitransparent circles

### Layout Pattern (Bắt buộc)

Mỗi trang driver phải follow:

```jsx
import Header from "../../components/admin/Header.jsx";
import "../admin/Dashboard.css";
import "./TenTrang.css";

export default function TenTrang() {
  return (
    <div className="dashboard-container">
      <Header />
      {/* ... content ... */}
    </div>
  );
}
```

### CSS Prefix Convention

Mỗi feature có prefix riêng cho CSS class để tránh xung đột:

| Feature            | Prefix | Ví dụ                   |
|--------------------|--------|--------------------------|
| Profile            | `pf-`  | `.pf-hero`, `.pf-card`   |
| Information        | `inf-` | `.inf-layout`, `.inf-sidebar` |
| EditProfile        | `ep-`  | `.ep-layout`, `.ep-form`  |
| Vehicles           | `vh-`  | `.vh-hero`, `.vh-card`    |
| AddVehicle         | `av-`  | `.av-overlay`, `.av-step` |
| Booking            | `bk-`  | `.bk-hero`, `.bk-step`   |
| TransactionHistory | `tx-`  | `.tx-hero`, `.tx-card`    |
| TransactionDetail  | `td-`  | `.td-hero`, `.td-amount`  |

### Icon Library

- **lucide-react** cho tất cả icon
- **KHÔNG dùng emoji** (📍, ⚡, 🚗, etc.) — thay bằng lucide-react components
- **KHÔNG dùng Hash (#) icon** cho biển số xe — dùng VN plate badge

### Visual Elements Chuẩn

- **Glass panels**: `background: rgba(255,255,255,0.15); backdrop-filter: blur(10px)`
- **Accent bar**: thanh dọc bên trái card + shimmer animation
- **Status badges**: dot pulse animation + colored text
- **Spec chips**: colored pill với icon + text
- **Bold typography**: font-weight 800, large sizes cho heading

---

## Quy Tắc Chung

1. **`theme.css` là READ-ONLY** — không bao giờ sửa file này
2. **Loại bỏ hoàn toàn** các màu cũ: `#00bfa6`, `#20b2aa`, `#667eea`, `#764ba2`
3. **Giữ nguyên 100% business logic** — chỉ thay đổi UI/styling
4. **Import grouping**: external libs → internal modules → local styles
5. **Toast feedback** cho mọi async operation (react-toastify)
6. **Responsive**: mobile-first, breakpoint chính 768px

---

## Tiến Độ Tổng Quan

| #  | Feature              | Files | Status | Prefix | Bước |
|----|----------------------|-------|--------|--------|------|
| 1  | Layout / Navigation  | 8     | ✅ Done | —      | —    |
| 2  | Guide                | 2     | ✅ Done | —      | —    |
| 3  | Stations             | 2     | ✅ Done | —      | —    |
| 4  | StationDetail        | 2     | ✅ Done | —      | —    |
| 5  | Booking              | 5     | ✅ Done | `bk-`  | —    |
| 6  | Profile              | 2     | ✅ Done | `pf-`  | Bước 1 |
| 7  | Information          | 2     | ✅ Done | `inf-` | Bước 1 |
| 8  | EditProfile          | 2     | ✅ Done | `ep-`  | Bước 1 |
| 9  | Vehicles             | 2     | ✅ Done | `vh-`  | Bước 2 |
| 10 | VehicleCard          | 1     | ✅ Done | `vh-`  | Bước 2 |
| 11 | AddVehicle           | 2     | ✅ Done | `av-`  | Bước 2 |
| 12 | ModelVehicle         | 1     | ✅ Done | `av-`  | Bước 2 |
| 13 | TransactionHistory   | 2     | ✅ Done | `tx-`  | Bước 3 |
| 14 | TransactionDetail    | 2     | ✅ Done | `td-`  | Bước 3 |
| 15 | DriverDashboard      | 2     | ❌ Chưa | —      | —    |
| 16 | Payment              | 2     | ❌ Chưa | —      | —    |
| 17 | PaymentSuccess       | 2     | ❌ Chưa | —      | —    |
| 18 | Notification         | ?     | ❌ Chưa | —      | —    |

**Tổng hoàn thành: 14/18 features — ~31 files**

---

## Chi Tiết Từng Trang

### ✅ 1. Layout & Navigation (Đã hoàn thành)

| File | Đường dẫn |
|------|-----------|
| DriverLayout.jsx/css | `src/layouts/` |
| DriverSidebarLayout.jsx/css | `src/layouts/` |
| DriverSidebarNavigate.jsx/css | `src/components/navigate/` |
| DriverNavigate.jsx/css | `src/components/navigate/` |

- **DriverLayout**: Public layout — desktop top nav, mobile bottom nav, responsive 768px
- **DriverSidebarLayout**: Protected layout — sidebar + main area với `<Outlet />`
- **DriverSidebarNavigate**: Sidebar navigation cho trang protected
- **DriverNavigate**: Top/bottom nav bar
- **Bug fix**: Đã sửa lỗi duplicate `homeNavPath` declaration trong DriverNavigate.jsx

---

### ✅ 2. Guide (Đã hoàn thành)

| File | Đường dẫn |
|------|-----------|
| Guide.jsx | `src/pages/driver/Guide.jsx` |
| Guide.css | `src/pages/driver/Guide.css` |

- `dashboard-container` + `<Header />`
- `GUIDE_STEPS` array với `#16a34a` color
- Step cards với color accent

---

### ✅ 3. Stations (Đã hoàn thành)

| File | Đường dẫn |
|------|-----------|
| Stations.jsx | `src/pages/inNavigateDriver/Stations.jsx` |
| Stations.css | `src/pages/inNavigateDriver/Stations.css` |

- `dashboard-container` + `<Header />`
- lucide-react: `Search`, `MapPin`, `Zap`, `Navigation`, `PlugZap`, etc.
- Geolocation + distance calculation
- Pagination
- Status indicators: AVAILABLE/BUSY/MAINTENANCE

---

### ✅ 4. StationDetail (Đã hoàn thành)

| File | Đường dẫn |
|------|-----------|
| StationDetail.jsx | `src/pages/inNavigateDriver/StationDetail.jsx` |
| StationDetail.css | `src/pages/inNavigateDriver/StationDetail.css` |

- `dashboard-container` + `<Header />`
- lucide-react: `MapPin`, `Navigation`, `Zap`, `ChevronDown`, `ChevronUp`, `CheckCircle2`, `Clock`, `Wrench`, `Car`, `AlertTriangle`, `LogIn`
- AWS Location Map integration
- Charging point expansion panels
- Connector type display
- Vehicle selection for booking

---

### ✅ 5. Booking (Đã hoàn thành — 5 files)

| File | Đường dẫn |
|------|-----------|
| Booking.jsx | `src/pages/inNavigateDriver/Booking.jsx` |
| Booking.css | `src/pages/inNavigateDriver/Booking.css` |
| BookingConfirmation.jsx | `src/pages/inNavigateDriver/BookingConfirmation.jsx` |
| BookingConfirmation.css | `src/pages/inNavigateDriver/BookingConfirmation.css` |
| BookingSuccess.jsx | `src/pages/inNavigateDriver/BookingSuccess.jsx` |

- Prefix: `bk-`
- lucide-react: `ArrowLeft`, `MapPin`, `Zap`, `PlugZap`, `Car`, `Clock`, `CheckCircle2`, `AlertTriangle`, `CalendarCheck`, `Info`
- Wizard steps UI
- Slot normalization (normalizeSlotRecord utility)
- Template-based time range calculation

---

### ✅ 6. Profile (Bước 1 — Đã hoàn thành)

| File | Đường dẫn |
|------|-----------|
| Profile.jsx | `src/pages/inNavigateDriver/Profile.jsx` |
| Profile.css | `src/pages/inNavigateDriver/Profile.css` |

- Prefix: `pf-`
- lucide-react: `User`, `Car`, `CreditCard`, `LogOut`, `ChevronRight`, `Shield`, `Zap`
- Hero banner gradient
- Glassmorphism card (`.pf-card` overflow: visible — fix cho avatar overlap)
- Gradient avatar ring
- 3-column stats strip
- Rich menu cards với hover effects
- Logout button

---

### ✅ 7. Information (Bước 1 — Đã hoàn thành)

| File | Đường dẫn |
|------|-----------|
| Information.jsx | `src/pages/profileDriver/Information.jsx` |
| Information.css | `src/pages/profileDriver/Information.css` |

- Prefix: `inf-`
- lucide-react: `ArrowLeft`, `Pencil`, `Lock`, `Mail`, `MapPin`, `Phone`, `CalendarDays`, `UserCircle`, `ShieldCheck`, `Contact`, `Fingerprint`
- Two-column layout: `.inf-layout` grid (280px sidebar + 1fr content)
- Sidebar với green decorative arc
- 3 grouped info section cards (Thông tin cá nhân, Liên hệ, Tài khoản)
- Colored icon wraps per section
- Change password modal (FormProfile)

---

### ✅ 8. EditProfile (Bước 1 — Đã hoàn thành)

| File | Đường dẫn |
|------|-----------|
| EditProfile.jsx | `src/pages/profileDriver/EditProfile.jsx` |
| EditProfile.css | `src/pages/profileDriver/EditProfile.css` |

- Prefix: `ep-`
- Two-column layout: `.ep-layout`
- Sidebar với avatar preview
- 2 section cards (form groups)
- Toast feedback thay vì alert()

---

### ✅ 9–12. Vehicles (Bước 2 — Đã hoàn thành, 6 files)

| File | Đường dẫn |
|------|-----------|
| Vehicles.jsx | `src/pages/profileDriver/Vehicles.jsx` |
| Vehicles.css | `src/pages/profileDriver/Vehicles.css` |
| VehicleCard.jsx | `src/components/driver/VehicleCard.jsx` |
| AddVehicle.jsx | `src/pages/profileDriver/AddVehicle.jsx` |
| AddVehicle.css | `src/pages/profileDriver/AddVehicle.css` |
| ModelVehicle.jsx | `src/components/driver/ModelVehicle.jsx` |

**Vehicles.jsx/css** (prefix: `vh-`):
- `dashboard-container` + `<Header />`
- Zap chip "EV Garage"
- Soft green hero với glass counters panel
- Gradient filter tabs (Tất cả / Active / Inactive)
- Auto-fill grid cho vehicle cards
- AddVehicle hiển thị overlay modal

**VehicleCard.jsx** (prefix: `vh-`):
- Accent bar với shimmer animation
- Brand chip + pulse status badge
- Large vehicle name
- **VN plate badge** (`<span className="vh-card-plate-flag">VN</span>`) — KHÔNG dùng Hash icon
- Colored spec chips (battery, power, connector)
- Green reward bar ở bottom

**AddVehicle.jsx/css** (prefix: `av-`):
- Overlay modal
- Wizard steps UI
- Toast thay vì alert()

**ModelVehicle.jsx**:
- `av-model-card` class
- lucide-react icons

> **Lưu ý**: Trải qua 3 lần iteration — ban đầu bold dark → softened để match Profile aesthetic → thêm VN plate thay Hash icon

---

### ✅ 13–14. Transactions (Bước 3 — Đã hoàn thành, 4 files)

| File | Đường dẫn |
|------|-----------|
| TransactionHistory.jsx | `src/pages/inNavigateDriver/TransactionHistory.jsx` |
| TransactionHistory.css | `src/pages/inNavigateDriver/TransactionHistory.css` |
| TransactionDetail.jsx | `src/pages/inNavigateDriver/TransactionDetail.jsx` |
| TransactionDetail.css | `src/pages/inNavigateDriver/TransactionDetail.css` |

**TransactionHistory** (prefix: `tx-`):
- `dashboard-container` + `<Header />`
- lucide-react: `Wallet`, `Search`, `RefreshCw`, `MapPin`, `Car`, `CreditCard`, `AlertTriangle`, `Inbox`, `Zap`
- Soft green hero với 4 glass counters (Tổng GD, Thành công, Đang chờ, Thất bại)
- Alert notice cho unpaid invoices
- Search bar với lucide Search icon
- Filter tabs (gradient active state): Tất cả / Thành công / Chờ thanh toán / Thất bại
- Transaction cards với shimmer accent bars (màu theo status)
- Status badges với animated pulse dots
- Pay button trên unpaid items
- Refresh button trong hero
- `TAB_CONFIG` array for filter tabs
- Business logic 100% preserved: fetchTransactions, fetchUnpaidInvoices, handleItemClick, handlePaymentNavigation, data merge/filter/sort

**TransactionDetail** (prefix: `td-`):
- `dashboard-container` + `<Header />`
- lucide-react: `ArrowLeft`, `CircleCheck`, `CircleX`, `Clock`, `FileText`, `MapPin`, `Car`, `List`, `AlertTriangle`
- Status hero card với dynamic gradient (green cho success, red cho failed, amber cho pending)
- Dynamic `StatusIcon` component
- Amount card với gradient top border
- Info sections với colored icon wraps (green/blue/purple)
- Grid layout
- Monospace styled IDs
- Business logic 100% preserved

---

## Công Việc Còn Lại

### ❌ 15. DriverDashboard

| File | Đường dẫn |
|------|-----------|
| DriverDashboard.jsx | `src/pages/driver/DriverDashboard.jsx` |
| Dashboard.css | `src/pages/driver/Dashboard.css` *(shared)* |

**Hiện trạng**: Đã dùng `<Header />` + `Dashboard.css` nhưng vẫn còn **emoji icons** trong FEATURES config:
```js
FEATURES = [
  { icon: "📍", ... },
  { icon: "📅", ... },
  { icon: "⚡", ... },
  { icon: "🚗", ... },
  { icon: "💳", ... },
  { icon: "🔔", ... },
]
```
**Cần làm**: Thay emoji → lucide-react components, review styling cho consistent

---

### ❌ 16. Payment

| File | Đường dẫn |
|------|-----------|
| Payment.jsx | `src/pages/inNavigateDriver/Payment.jsx` |
| Payment.css | `src/pages/inNavigateDriver/Payment.css` |

**Hiện trạng**: Dùng gradient cũ `#667eea` / `#764ba2`, KHÔNG có `dashboard-container` / `<Header />`

**Cần làm**: Full redesign — layout pattern, brand colors, lucide-react icons

---

### ❌ 17. PaymentSuccess

| File | Đường dẫn |
|------|-----------|
| PaymentSuccess.jsx | `src/pages/inNavigateDriver/PaymentSuccess.jsx` |
| PaymentSuccess.css | `src/pages/inNavigateDriver/PaymentSuccess.css` |

**Hiện trạng**: Gradient cũ `#667eea` / `#764ba2`, màu `#2ecc71`, centered card layout

**Cần làm**: Full redesign — layout pattern, brand colors, lucide-react icons

---

### ❌ 18. Notification

| File | Đường dẫn |
|------|-----------|
| *Cần xác định* | *Cần khảo sát* |

**Hiện trạng**: Được ghi nhận là trang có độ phức tạp cao nhất (150+ inline styles)

**Cần làm**: Full audit → redesign

---

## Lưu Ý Kỹ Thuật

### File Writing (PowerShell)

Khi viết file chứa tiếng Việt qua PowerShell:
```powershell
# ĐÚNG — UTF-8 no BOM
$utf8 = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText($path, $content, $utf8)

# SAI — gây lỗi encoding
Set-Content -Path $path -Value $content  # ← KHÔNG dùng
```

### Unicode Fix Pipeline

Nếu PowerShell escape Vietnamese chars thành `\uXXXX`:
```js
// Node.js script để convert lại
const fs = require('fs');
let c = fs.readFileSync(filePath, 'utf8');
c = c.replace(/\\u([0-9a-fA-F]{4})/g, (m, hex) => String.fromCharCode(parseInt(hex, 16)));
fs.writeFileSync(filePath, c, 'utf8');
```

### Các Màu Cũ Cần Loại Bỏ

| Màu cũ    | Nơi từng dùng                      |
|-----------|-------------------------------------|
| `#00bfa6` | TransactionDetail (cũ), nhiều trang |
| `#20b2aa` | TransactionHistory (cũ)            |
| `#667eea` | Payment, PaymentSuccess             |
| `#764ba2` | Payment, PaymentSuccess             |
| `#2ecc71` | PaymentSuccess                      |

### Build Verification

Sau mỗi redesign, luôn chạy:
```bash
npm run build
```
Đảm bảo **0 errors** trước khi tiếp tục feature tiếp theo.

---

## Changelog

| Ngày | Thay đổi |
|------|----------|
| — | Layout + Navigation: DriverLayout, DriverSidebarLayout, DriverSidebarNavigate, DriverNavigate |
| — | Guide page redesign |
| — | Stations + StationDetail redesign |
| — | Booking feature redesign (5 files, prefix `bk-`) |
| — | **Bước 1** — Profile/Information/EditProfile redesign (6 files, prefix `pf-`/`inf-`/`ep-`) |
| — | Avatar overlap bug fix: `.pf-card` overflow visible |
| — | **Bước 2** — Vehicles/VehicleCard/AddVehicle/ModelVehicle redesign (6 files, prefix `vh-`/`av-`) |
| — | 3 iterations: bold dark → softened → VN plate badge |
| — | **Bước 3** — TransactionHistory/TransactionDetail redesign (4 files, prefix `tx-`/`td-`) |
| — | Unicode fix pipeline cho Vietnamese chars |
| — | Bug fix: DriverNavigate.jsx duplicate `homeNavPath` declaration |
| — | Tạo file DRIVER_PAGES_PROGRESS.md |
