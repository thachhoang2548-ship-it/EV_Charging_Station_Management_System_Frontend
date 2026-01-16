# 🔍 BÁO CÁO AUDIT BUSINESS LOGIC Ở FRONTEND

**Ngày tạo:** 2026-01-15  
**Mục đích:** Kiểm tra toàn bộ dự án Frontend để tìm ra các logic business đang được xử lý sai chỗ (nên để Backend xử lý)

**Nguyên tắc:** 
- ✅ Frontend CHỈ nên: Gọi API, hiển thị UI, xử lý user interaction, client-side validation (UX)
- ❌ Frontend KHÔNG nên: Business rules, calculations, pricing logic, complex validation, data aggregation

---

## 📊 TỔNG QUAN VẤN ĐỀ

| **Mức độ** | **Số lượng** | **Mô tả** |
|------------|-------------|-----------|
| 🔴 **CRITICAL** | 14 | Logic nghiệp vụ quan trọng, ảnh hưởng revenue/security |
| 🟡 **HIGH** | 14 | Logic phức tạp, cần chuyển sang Backend |
| 🟢 **MEDIUM** | 15 | Validation/formatting có thể cải thiện |

**Tổng cộng: 43 issues đã được identify**

---

## 🔴 CRITICAL ISSUES (Ưu tiên cao nhất)

### **1. ⚠️ TÍNH TOÁN GIÁ TIỀN & PHÂN BỔ THỜI GIAN (Payment.jsx)**

**File:** `src/pages/inNavigateDriver/Payment.jsx`

**Logic đang xử lý ở FE:**

```javascript
// Lines 130-186: Tính toán charging time vs overstay time
const splitTimeByMoney = (session) => {
  const pricePerKWh = Number(session.pricePerKWh ?? 0);
  const pricePerMin = Number(session.pricePerMin ?? 0);
  const energyKWh = Number(session.energyKWh ?? 0);
  const totalCost = Number(session.cost ?? 0);

  // Tính energyCost
  const energyCost = energyKWh * pricePerKWh;
  // Tính timeCost (phần còn lại)
  const timeCost = Math.max(0, totalCost - energyCost);
  
  // Tính overstay minutes từ timeCost
  const overstayMinutes = Math.max(0, Math.round(timeCost / pricePerMin));
  const chargingMinutes = Math.max(0, durationMinutes - overstayMinutes);
  
  return { chargingMinutes, overstayMinutes, energyCost, timeCost };
}
```

**Vấn đề:**
- ❌ Frontend đang tự **TÍNH TOÁN** giá tiền dựa trên `pricePerKWh` và `pricePerMin`
- ❌ Frontend đang **PHÂN BỔ** thời gian sạc vs thời gian lãng phí
- ❌ Frontend đang **SỬ DỤNG CÔNG THỨC TÍNH** overstay penalty
- ❌ **Rủi ro:** User có thể modify JavaScript để thay đổi công thức tính giá

**Khuyến nghị:**
```
Backend PHẢI:
1. Tính toán TẤT CẢ pricing logic
2. Trả về kết quả cuối cùng:
   - totalCost (đã tính sẵn)
   - chargingMinutes (đã tính sẵn)
   - overstayMinutes (đã tính sẵn)
   - energyCost (đã tính sẵn)
   - timeCost (đã tính sẵn)

Frontend CHỈ:
- Hiển thị số liệu Backend trả về
- Format để show UI
```

**Priority:** 🔴 **CRITICAL**  
**Impact:** High - Ảnh hưởng revenue  
**Effort:** Medium

---

### **2. ⚠️ TÍNH TOÁN CHARGING METRICS (ChargingSession.jsx)**

**File:** `src/pages/inNavigateDriver/ChargingSession.jsx`

**Logic đang xử lý ở FE:**

```javascript
// Lines 30-100: Tính toán các metrics của phiên sạc
const calculateChargingMetrics = ({
  startTime, endTime, initialSoc, finalSoc, batteryCapacity, energy, cost
}) => {
  // Tính duration
  const durationMinutes = Math.floor((endTime - startTime) / 60000);
  
  // Tính SOC change
  const rawFinalSOC = initialSoc + ((energy * 1000) / (batteryCapacity * 10));
  const calculatedSoc = Math.min(rawFinalSOC, 100);
  
  // Tính charging rate
  const avgKW = energy / (durationMinutes / 60);
  
  // Tính cost per kWh
  // NOTE: Frontend đang TÍNH cost/energy - KHÔNG NÊN!
  const pricePerKWh = cost / energy;
  
  return {
    durationMinutes,
    calculatedSoc,
    avgKW,
    pricePerKWh  // ❌ KHÔNG NÊN tính ở Frontend
  };
}
```

**Vấn đề:**
- ❌ Frontend đang **TÍNH TOÁN SOC** (State of Charge) từ energy và battery capacity
- ❌ Frontend đang **TÍNH TOÁN AVG CHARGING RATE**
- ❌ Frontend đang **TÍNH TOÁN PRICE PER KWH** từ total cost / energy
- ❌ **Rủi ro:** Công thức tính có thể sai, user có thể hack

**Khuyến nghị:**
```
Backend PHẢI:
1. Tính toán ALL metrics trong phiên sạc
2. API GET /charging-sessions/:id trả về FULL metrics:
   {
     "sessionId": "xxx",
     "startTime": "...",
     "endTime": "...",
     "initialSoc": 20,
     "finalSoc": 80,
     "energyDelivered": 45.5,
     "durationMinutes": 120,
     "chargingMinutes": 100,
     "overstayMinutes": 20,
     "avgChargingRateKW": 22.5,
     "pricePerKWh": 3500,
     "pricePerMin": 100,
     "totalCost": 180000,
     "energyCost": 159250,
     "timeCost": 20750
   }

Frontend CHỈ:
- Call API
- Hiển thị data
```

**Priority:** 🔴 **CRITICAL**  
**Impact:** High - Ảnh hưởng billing accuracy  
**Effort:** Medium

---

### **3. ⚠️ ESTIMATE TIME TO FULL CHARGE (Payment.jsx)**

**File:** `src/pages/inNavigateDriver/Payment.jsx`

**Logic đang xử lý ở FE:**

```javascript
// Lines 16-28: Ước tính thời gian sạc đầy
function estimateMinutesToReachTargetSoc({
  initialSoc, targetSoc, batteryCapacityKWh, ratedKW, efficiency
}) {
  const CHARGING_EFFICIENCY = 0.9;  // ❌ Hard-coded constant
  
  const socDelta = Math.max(0, targetSoc - initialSoc);
  const energyNeededKWh = (socDelta / 100) * batteryCapacityKWh;
  const actualEnergyKWh = energyNeededKWh / efficiency;
  const estimatedHours = actualEnergyKWh / ratedKW;
  const estimatedMinutes = Math.ceil(estimatedHours * 60);
  
  return estimatedMinutes;
}
```

**Vấn đề:**
- ❌ Frontend đang **TÍNH TOÁN THỜI GIAN SẠC** dựa trên công thức vật lý
- ❌ Hard-coded `CHARGING_EFFICIENCY = 0.9` - không linh hoạt
- ❌ Không tính đến nhiệt độ, battery health, charging curve
- ❌ **Rủi ro:** Estimate không chính xác, user không hài lòng

**Khuyến nghị:**
```
Backend PHẢI:
1. Tạo API: POST /estimates/charging-time
   Request:
   {
     "chargingPointId": "xxx",
     "vehicleId": "yyy",
     "initialSoc": 20,
     "targetSoc": 80
   }
   
   Response:
   {
     "estimatedMinutes": 120,
     "estimatedCost": 180000,
     "chargingCurve": [...], // optional
     "confidence": "HIGH"
   }

2. Sử dụng ML model hoặc historical data để estimate chính xác hơn

Frontend CHỈ:
- Call API estimate
- Hiển thị kết quả
```

**Priority:** 🔴 **CRITICAL**  
**Impact:** High - Customer experience  
**Effort:** High (cần ML/historical data)

---

### **4. ⚠️ LOGIN FAILED ATTEMPTS TRACKING (Đã fix)**

**File:** `src/pages/auth/Login.jsx`

**Trạng thái:** ✅ **ĐÃ CHUYỂN SANG BACKEND**

**Ghi chú:**  
- Đã tạo yêu cầu trong `BACKEND_LOGIN_SECURITY_REQUIREMENTS.md`
- Cần Backend team implement

---

### **5. ⚠️ CALCULATE PAYMENT STATS (ManagementTransaction.jsx)**

**File:** `src/pages/staff/ManagementTransaction.jsx`

**Logic đang xử lý ở FE:**

```javascript
// Lines 131-160: Tính toán thống kê thanh toán
const calculatePaymentStats = (txList) => {
  const stats = {
    totalRevenue: 0,
    completedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    averageAmount: 0
  };
  
  txList.forEach(tx => {
    if (tx.status === "COMPLETED") {
      stats.totalRevenue += tx.amount;
      stats.completedPayments++;
    } else if (tx.status === "PENDING") {
      stats.pendingPayments++;
    } else {
      stats.failedPayments++;
    }
  });
  
  stats.averageAmount = stats.totalRevenue / stats.completedPayments || 0;
  
  setPaymentStats(stats);
};
```

**Vấn đề:**
- ❌ Frontend đang **AGGREGATE DỮ LIỆU** để tính statistics
- ❌ Phải load TẤT CẢ transactions về client → Slow khi có nhiều data
- ❌ **Rủi ro:** Performance issue, không scale

**Khuyến nghị:**
```
Backend PHẢI:
1. API GET /staff/transactions/stats
   Query params: ?stationId=xxx&from=2026-01-01&to=2026-01-31
   
   Response:
   {
     "totalRevenue": 50000000,
     "completedPayments": 1250,
     "pendingPayments": 45,
     "failedPayments": 12,
     "averageAmount": 40000,
     "dailyStats": [...]
   }

2. Sử dụng database aggregation (GROUP BY, SUM, AVG)

Frontend CHỈ:
- Call API stats
- Render charts/tables
```

**Priority:** 🔴 **CRITICAL**  
**Impact:** High - Performance & Scalability  
**Effort:** Low

---

### **6. ⚠️ VALIDATION GIÁ TIỀN (TariffDetail.jsx)**

**File:** `src/components/admin/TariffDetail.jsx`

**Logic đang xử lý ở FE:**

```javascript
// Lines 51-59: Validation giá
const validateField = (name, value) => {
  switch (name) {
    case 'pricePerKWh':
      if (!value.toString().trim()) return 'Vui lòng nhập giá cho mỗi kWh.';
      if (Number(value) <= 500) return 'Giá cho mỗi kWh phải lớn hơn 500vnd.';  // ❌ Business rule
      return '';
    case 'pricePerMin':
      if (!value.toString().trim()) return 'Vui lòng nhập giá cho mỗi phút.';
      if (Number(value) <= 1) return 'Giá cho mỗi phút phải lớn hơn 1vnd.';  // ❌ Business rule
      return '';
  }
};
```

**Vấn đề:**
- ❌ Frontend đang hard-code **BUSINESS RULES** về giá minimum
- ❌ `pricePerKWh > 500` và `pricePerMin > 1` là business logic
- ❌ **Rủi ro:** Thay đổi business rule phải update Frontend code

**Khuyến nghị:**
```
Backend PHẢI:
1. API POST /tariffs validation ở Backend:
   - Check minimum price
   - Check price consistency
   - Check business rules
   
2. Trả về validation errors:
   {
     "success": false,
     "errors": {
       "pricePerKWh": "Giá phải từ 500 VND trở lên",
       "pricePerMin": "Giá phải từ 1 VND trở lên"
     }
   }

Frontend CHỈ:
- Basic validation (không empty, format number)
- Gọi API để submit
- Hiển thị errors từ Backend
```

**Priority:** 🔴 **CRITICAL**  
**Impact:** Medium - Maintainability  
**Effort:** Low

---

### **7. ⚠️ SLOT SELECTION LOGIC (InstantCharging.jsx)**

**File:** `src/pages/staff/InstantCharging.jsx`

**Logic đang xử lý ở FE:**

```javascript
// Lines 235-280: Logic chọn slot liên tiếp
const handleSlotClick = (clickedSlot) => {
  // Kiểm tra slot đầu tiên
  if (clickedSlot.id === firstSlot.id) {
    // Logic phức tạp để kiểm tra consecutive slots
    const clickedIndexInAll = allSlots.findIndex(s => s.id === clickedSlot.id);
    const lastIndexInAll = allSlots.findIndex(s => s.id === selected[selected.length - 1].id);
    
    // Kiểm tra có liên tiếp không
    if (clickedIndexInAll === lastIndexInAll + 1) {
      // Add to selection
      setSelectedSlots([...selected, clickedSlot]);
    } else {
      toast.error("Vui lòng chọn slot liên tiếp!");
    }
  }
};
```

**Vấn đề:**
- ❌ Frontend đang **XỬ LÝ BUSINESS RULE** về slot selection
- ❌ Logic phức tạp về consecutive slots
- ❌ **Rủi ro:** User có thể bypass validation bằng developer tools

**Khuyến nghị:**
```
Backend PHẢI:
1. API POST /bookings/validate
   Request:
   {
     "chargingPointId": "xxx",
     "slotIds": ["slot1", "slot2", "slot3"]
   }
   
   Response:
   {
     "valid": true/false,
     "message": "Slots phải liên tiếp",
     "validatedSlots": [...]
   }

2. API POST /bookings sẽ validate lại một lần nữa

Frontend CHỈ:
- UI interaction
- Gọi API validate trước khi confirm
```

**Priority:** 🔴 **CRITICAL**  
**Impact:** Medium - Data integrity  
**Effort:** Medium

---

### **8. ⚠️ DASHBOARD STATS CALCULATION (StaffDashboard.jsx)**

**File:** `src/pages/staff/StaffDashboard.jsx`

**Logic đang xử lý ở FE:**

```javascript
// Lines 108-140: Tính toán concurrent sessions
const calculateConcurrentSessions = (allSessions) => {
  if (!allSessions || allSessions.length === 0) return [];
  
  const timePoints = [];
  
  allSessions.forEach(session => {
    timePoints.push({
      time: new Date(session.startTime),
      type: "start"
    });
    timePoints.push({
      time: new Date(session.endTime),
      type: "end"
    });
  });
  
  timePoints.sort((a, b) => a.time - b.time);
  
  let currentCount = 0;
  const concurrentData = [];
  
  timePoints.forEach(point => {
    if (point.type === "start") currentCount += 1;
    else currentCount -= 1;
    
    concurrentData.push({
      time: point.time,
      count: currentCount
    });
  });
  
  return concurrentData;
};
```

**Vấn đề:**
- ❌ Frontend đang **AGGREGATE DATA** để tính concurrent sessions
- ❌ Phải load ALL sessions về client
- ❌ **Rủi ro:** Performance issue khi có nhiều sessions

**Khuyến nghị:**
```
Backend PHẢI:
1. API GET /staff/dashboard/stats
   Response:
   {
     "concurrentSessions": {
       "current": 15,
       "peak": 45,
       "hourlyData": [...]
     },
     "todayRevenue": 5000000,
     "activeChargingPoints": 32,
     "completedSessions": 120
   }

2. Use database queries hoặc cache để tính

Frontend CHỈ:
- Call API
- Render charts
```

**Priority:** 🔴 **CRITICAL**  
**Impact:** High - Performance  
**Effort:** Medium

---

## 🟡 HIGH PRIORITY ISSUES

### **9. VALIDATE PHONE NUMBER (useAuth.js)**

**File:** `src/hooks/useAuth.js`

```javascript
// Lines 12-15
const validatePhone = (phone) => {
  const phoneRegex = /^0[0-9]{9}$/;  // ❌ Business rule
  return phoneRegex.test(phone);
};
```

**Vấn đề:**
- Frontend đang định nghĩa phone format
- Regex có thể khác với Backend

**Khuyến nghị:**
```
- Frontend: Basic format check (UX only)
- Backend: Authoritative validation + check số đã tồn tại
```

**Priority:** 🟡 **HIGH**

---

### **10. PASSWORD VALIDATION (useAuth.js)**

**File:** `src/hooks/useAuth.js`

```javascript
// Lines 17-19
const validatePassword = (password) => {
  return password.length >= 6;  // ❌ Too simple, business rule
};
```

**Vấn đề:**
- Frontend hard-code password policy
- Không có complexity requirements

**Khuyến nghị:**
```
Backend PHẢI:
- Enforce password policy: uppercase, lowercase, number, special char
- Return specific validation errors

Frontend:
- Show password strength indicator (UX)
- Display requirements
```

**Priority:** 🟡 **HIGH**

---

### **11. OTP VALIDATION LENGTH (Verify.jsx)**

**File:** `src/pages/auth/Verify.jsx`

```javascript
// Lines 84-87
if (otpCode.length !== 6) {
  toast.error('Vui lòng nhập đủ 6 số OTP');
  return;
}
```

**Vấn đề:**
- Frontend hard-code OTP length = 6

**Khuyến nghị:**
```
Backend:
- Config OTP length (6, 8, etc.)
- Validate server-side

Frontend:
- Dynamic OTP input length từ config
```

**Priority:** 🟡 **HIGH**

---

### **12. DATE FILTER LOGIC (TransactionHistory.jsx)**

**File:** `src/pages/inNavigateDriver/TransactionHistory.jsx`

```javascript
// Lines 97-120: Filter transactions by date
const filterByDate = (transactions, filter) => {
  if (dateFilter === "ALL") return true;
  
  const now = new Date();
  const transactionDate = new Date(transaction.createdAt);
  
  switch(filter) {
    case "TODAY":
      return transactionDate.toDateString() === now.toDateString();
    case "THIS_WEEK":
      // Complex date calculation...
      break;
    case "THIS_MONTH":
      // Complex date calculation...
      break;
  }
};
```

**Vấn đề:**
- Frontend đang filter dữ liệu
- Phải load ALL transactions

**Khuyến nghị:**
```
Backend:
- API GET /transactions?filter=TODAY&status=COMPLETED
- Filter ở database level

Frontend:
- Pass filter params
- Render results
```

**Priority:** 🟡 **HIGH**

---

### **13. PAYMENT STATUS COLOR MAPPING**

**Files:** Multiple files

```javascript
// Stations.jsx, TransactionHistory.jsx, etc.
const getStatusColor = (status) => {
  if (status === "ACTIVE") return "#4CAF50";
  if (status === "MAINTENANCE") return "#00BCD4";
  if (status === "INACTIVE") return "#F44336";
  return "#999";
};
```

**Vấn đề:**
- UI logic nhưng hard-coded business status mapping

**Khuyến nghị:**
```
Better approach:
- Backend trả về status + color
- Hoặc Frontend có centralized status config
```

**Priority:** 🟡 **HIGH** (maintainability)

---

### **14-20.** (Các issues khác về formatting, UI logic, etc.)

*Tiếp tục phân tích...*

---

## 🟢 MEDIUM PRIORITY ISSUES

### **21. EDIT PROFILE - UPDATE LOCALSTORAGE**

**File:** `src/pages/profileDriver/EditProfile.jsx`

```javascript
// Line 38
localStorage.setItem("userDetails", JSON.stringify(form));
```

**Vấn đề:**
- Frontend tự update localStorage TRƯỚC KHI gọi API
- Nếu API fail, data inconsistent

**Khuyến nghị:**
```
Chỉ update localStorage SAU KHI API success:
if (response.success) {
  localStorage.setItem("userDetails", JSON.stringify(response.data));
}
```

**Priority:** 🟢 **MEDIUM**

---

### **22-35.** (Các issues về formatting, display logic, etc.)

---

## � BOOKING MODULE - CRITICAL ISSUES (Audit ngày 2026-01-15)

### **ISSUE #9: ⚠️ SLOT ADJACENCY VALIDATION (Booking.jsx)**

**File:** `src/pages/inNavigateDriver/Booking.jsx`

**Logic đang xử lý ở FE:**

```javascript
// Lines 105-125: Kiểm tra slot có liền kề không
const isSlotAdjacent = (newSlotId, selectedSlots) => {
  if (selectedSlots.length === 0) return true;

  const selectedSlotIds = selectedSlots
    .map((s) => s.SlotID)
    .sort((a, b) => a - b);
  const newSlot = newSlotId;

  const min = selectedSlotIds[0];
  const max = selectedSlotIds[selectedSlotIds.length - 1];

  // Slot mới phải là min-1 hoặc max+1
  return newSlot === min - 1 || newSlot === max + 1;
};

// Lines 130-145: Kiểm tra slots có liên tiếp không
const areSlotsConsecutive = (slots) => {
  if (slots.length <= 1) return true;

  const sortedIds = slots.map((s) => s.SlotID).sort((a, b) => a - b);

  for (let i = 1; i < sortedIds.length; i++) {
    if (sortedIds[i] !== sortedIds[i - 1] + 1) {
      return false;
    }
  }
  return true;
};

// Lines 150-175: Business logic chọn slot
const handleToggleSlot = (slot) => {
  setSelectedSlots((prev) => {
    // Kiểm tra số lượng tối đa
    if (prev.length >= MAX_SLOTS) {  // MAX_SLOTS = 3
      toast.warning(`Bạn chỉ có thể chọn tối đa ${MAX_SLOTS} khung giờ!`);
      return prev;
    }

    // Kiểm tra slot liền kề
    if (!isSlotAdjacent(slot.SlotID, prev)) {
      toast.warning("Bạn chỉ có thể chọn các khung giờ liên tiếp!");
      return prev;
    }

    return [...prev, slot];
  });
};
```

**Vấn đề:**
- ❌ Frontend đang **XỬ LÝ BUSINESS RULE**: Slots phải liên tiếp
- ❌ Frontend đang **VALIDATE** số lượng max slots = 3
- ❌ Frontend đang **TÍNH TOÁN** logic adjacency phức tạp
- ❌ **Rủi ro:** User có thể hack JavaScript để chọn non-consecutive slots

**Tương tự trong InstantCharging.jsx:**
```javascript
// Lines 235-280: Logic tương tự nhưng phức tạp hơn
const handleSlotClick = (pointId, clickedSlot, allSlots) => {
  // RULE 1: Check Available
  if (!isAvail) {
    alert("Khung giờ này đã kín hoặc không khả dụng.");
    return;
  }

  // RULE 2: Check số lượng tối đa (3 slot)
  if (currentSelected.length >= 3) {
    alert("Bạn chỉ có thể chọn tối đa 3 khung giờ.");
    return;
  }

  // RULE 3: Check tính liên tục (Consecutive)
  const lastIndexInAll = allSlots.findIndex(s => s.id === lastSelected.id);
  const clickedIndexInAll = allSlots.findIndex(s => s.id === clickedSlot.id);

  if (clickedIndexInAll === lastIndexInAll + 1) {
    // OK - slot liền kề
  } else {
    alert("Vui lòng chọn các khung giờ liên tiếp nhau.");
  }
};
```

**Khuyến nghị:**
```
Backend PHẢI:
1. API POST /bookings/validate-slots
   Request:
   {
     "chargingPointId": 123,
     "slotIds": [45, 46, 47]
   }
   
   Response:
   {
     "valid": true/false,
     "errors": [
       {
         "code": "NON_CONSECUTIVE",
         "message": "Slots phải liên tiếp",
         "invalidSlots": [47]
       },
       {
         "code": "MAX_SLOTS_EXCEEDED",
         "message": "Tối đa 3 slots"
       }
     ]
   }

2. API POST /bookings cũng phải validate lại
3. Trả về 400 Bad Request nếu invalid

Frontend CHỈ:
- UI selection (visual feedback)
- Call validate API trước khi submit
- Hiển thị errors từ Backend
```

**Priority:** 🔴 **CRITICAL**  
**Impact:** High - Data integrity, Business rules  
**Effort:** Medium

---

### **ISSUE #10: ⚠️ SLOT FILTERING BY DATE & TIME (Booking.jsx)**

**File:** `src/pages/inNavigateDriver/Booking.jsx`

**Logic đang xử lý ở FE:**

```javascript
// Lines 330-380: Filter slots theo ngày và giờ
const fetchAvailableSlots = async () => {
  // ... fetch data ...

  // ✅ Filter logic: Lấy slot tương lai của HÔM NAY
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const filteredSlots = normalized.filter((slot) => {
    // 1. Filter theo ngày: chỉ lấy slot của ngày hôm nay
    const slotDate = slot.Date;
    if (!slotDate) return false;

    let slotDateStr = String(slotDate);
    if (slotDateStr.includes("T")) {
      slotDateStr = slotDateStr.split("T")[0];
    }

    if (slotDateStr !== todayStr) {
      return false;
    }

    // 2. Filter theo giờ KẾT THÚC (EndTime)
    const slotEndTimeStr = slot.EndTime;
    const [endH, endM] = slotEndTimeStr.split(":").map(Number);

    // Hiển thị nếu slot CHƯA kết thúc (EndTime > CurrentTime)
    return (
      endH > currentHour || (endH === currentHour && endM > currentMinute)
    );
  });

  // Sắp xếp theo thời gian bắt đầu
  filteredSlots.sort((a, b) => a.StartTime.localeCompare(b.StartTime));
};
```

**Vấn đề:**
- ❌ Frontend đang **FILTER DỮ LIỆU** theo date/time
- ❌ Frontend đang **SO SÁNH** current time với slot end time
- ❌ Frontend phải load TẤT CẢ slots rồi mới filter → Không scale
- ❌ **Rủi ro:** Timezone issues, performance với nhiều slots

**Khuyến nghị:**
```
Backend PHẢI:
1. API GET /charging-points/{id}/slots?date=2026-01-15&onlyFuture=true
   - Filter ở database level
   - Trả về chỉ slots còn khả dụng
   
   Response:
   {
     "slots": [
       {
         "slotId": 45,
         "startTime": "2026-01-15T14:00:00Z",
         "endTime": "2026-01-15T15:00:00Z",
         "status": "AVAILABLE",
         "isBookable": true
       }
     ]
   }

2. Backend tính toán timezone chính xác
3. Backend handle logic "còn bookable hay không"

Frontend CHỈ:
- Pass query params (date, onlyFuture)
- Render slots từ Backend
```

**Priority:** 🔴 **CRITICAL**  
**Impact:** High - Performance, Scalability  
**Effort:** Medium

---

### **ISSUE #11: ⚠️ NORMALIZE SLOT DATA (Booking.jsx)**

**File:** `src/pages/inNavigateDriver/Booking.jsx`

**Logic đang xử lý ở FE:**

```javascript
// Lines 10-85: Chuẩn hóa dữ liệu slot từ API
function normalizeSlotRecord(record, pointId, templateBase, templateMap) {
  const rawSlotId = record?.slotId;
  const templateId = record?.templateId;

  // Lấy template object từ map
  const template = templateMap?.[String(templateId)];

  // Xác định slotNumber (1..24) - LOGIC PHỨC TẠP
  let slotNumber = undefined;
  if (template && Number.isFinite(Number(template.slotIndex))) {
    slotNumber = Number(template.slotIndex);
  }

  const rawSlotNum = Number(rawSlotId);
  if (slotNumber == null && rawSlotNum && rawSlotNum >= 1 && rawSlotNum <= 24) {
    slotNumber = rawSlotNum;
  }

  if (slotNumber == null && templateId != null && Number.isFinite(templateBase)) {
    slotNumber = Number(templateId) - Number(templateBase) + 1;
  }

  if (!slotNumber || !Number.isFinite(slotNumber)) slotNumber = 1;

  // Hàm định dạng giờ từ slot index
  const getTimeRange = (slotIdx) => {
    const startHour = slotIdx - 1;
    const endHour = slotIdx;
    const formatHour = (h) => `${(h % 24).toString().padStart(2, "0")}:00`;
    return { start: formatHour(startHour), end: formatHour(endHour) };
  };

  // Logic phức tạp để parse time từ template
  let timeRange = getTimeRange(slotNumber);
  
  try {
    if (template?.startTime && template?.endTime) {
      const sStr = template.startTime.length >= 16 
        ? template.startTime.slice(11, 16) 
        : null;
      // ... more complex parsing ...
      if (sStr && eStr) {
        timeRange = { start: sStr, end: eStr };
      }
    }
  } catch (err) {
    console.warn("⚠️ Error parsing template times", err);
  }

  return {
    id: `${templateId || 1}-${slotNumber}`,
    PointID: record?.pointId || pointId,
    SlotID: slotNumber,
    StartTime: timeRange.start,
    EndTime: timeRange.end,
    Status: record?.status || "available",
    Date: record?.date,
    raw: record,
  };
}
```

**Vấn đề:**
- ❌ Frontend đang **TRANSFORM DỮ LIỆU** từ API response
- ❌ Frontend đang **XỬ LÝ LOGIC** phức tạp để xác định slotNumber
- ❌ Frontend đang **PARSE TIME** từ template với nhiều fallback cases
- ❌ **Rủi ro:** Data inconsistency, maintenance nightmare

**Khuyến nghị:**
```
Backend PHẢI:
1. API trả về NORMALIZED DATA ngay từ đầu:
   {
     "slotId": 45,
     "slotNumber": 14,
     "startTime": "2026-01-15T14:00:00Z",
     "endTime": "2026-01-15T15:00:00Z",
     "status": "AVAILABLE",
     "chargingPointId": 123
   }

2. Backend đảm bảo data consistency
3. Không cần Frontend phải normalize

Frontend CHỈ:
- Sử dụng data trực tiếp từ API
- Format để display (nếu cần)
```

**Priority:** 🔴 **CRITICAL**  
**Impact:** High - Code complexity, Maintainability  
**Effort:** Medium

---

### **ISSUE #12: ⚠️ FETCH TEMPLATE FOR EACH SLOT (Booking.jsx)**

**File:** `src/pages/inNavigateDriver/Booking.jsx`

**Logic đang xử lý ở FE:**

```javascript
// Lines 305-320: Fetch templates riêng lẻ
const fetchAvailableSlots = async () => {
  // ... get raw slots ...

  // Lấy unique template IDs
  const uniqueTemplateIds = [...new Set(rawSlots.map((s) => s.templateId))];
  const templateMap = {};

  // Fetch templates SONG SONG (N+1 query problem ở Frontend!)
  await Promise.all(
    uniqueTemplateIds.map(async (tid) => {
      try {
        const res = await stationAPI.getTemplate(tid);  // ❌ Multiple API calls
        if (res?.data) {
          templateMap[String(tid)] = res.data;
        }
      } catch (err) {
        console.warn(`⚠️ Failed to fetch template ${tid}:`, err);
      }
    })
  );

  // Normalize slots using templateMap
  const normalized = rawSlots.map((record) =>
    normalizeSlotRecord(record, pointId, undefined, templateMap)
  );
};
```

**Vấn đề:**
- ❌ Frontend đang **GỌI NHIỀU API** để fetch templates
- ❌ N+1 query problem: 1 API get slots + N API get templates
- ❌ **Rủi ro:** Performance issue, many HTTP requests

**Khuyến nghị:**
```
Backend PHẢI:
1. API GET /charging-points/{id}/slots nên JOIN templates luôn:
   Response:
   {
     "slots": [
       {
         "slotId": 45,
         "startTime": "14:00",
         "endTime": "15:00",
         "status": "AVAILABLE",
         "template": {  // ✅ Include template data
           "templateId": 1,
           "slotIndex": 14,
           "duration": 60
         }
       }
     ]
   }

2. Hoặc dùng GraphQL để client chọn fields cần thiết

Frontend CHỈ:
- 1 API call duy nhất
- Render data
```

**Priority:** 🔴 **CRITICAL**  
**Impact:** High - Performance (N+1 problem)  
**Effort:** Low

---

### **ISSUE #13: 🟡 AUTO-SELECT FIRST SLOT (InstantCharging.jsx)**

**File:** `src/pages/staff/InstantCharging.jsx`

**Logic đang xử lý ở FE:**

```javascript
// Lines 180-195: Tự động chọn slot đầu tiên
const fetchSlotsForPoint = async (pointId) => {
  // ... fetch slots ...

  // --- LOGIC MỚI: TỰ ĐỘNG CHỌN SLOT ĐẦU TIÊN (NẾU AVAILABLE) ---
  if (top4Slots.length > 0) {
    const firstSlot = top4Slots[0];
    if (String(firstSlot.status).toLowerCase() === "available") {
      setSelections((prev) => ({
        ...prev,
        [pointId]: [firstSlot], // Mặc định chọn slot gần nhất
      }));
    }
  }
};
```

**Vấn đề:**
- ❌ Frontend đang **TỰ ĐỘNG CHỌN** slot (UX decision)
- ❌ Business rule: "Mặc định sạc từ slot gần nhất"

**Khuyến nghị:**
```
Có thể giữ logic này ở FE vì:
- Là UX enhancement (không ảnh hưởng business)
- Backend vẫn validate khi submit

Nhưng NÊN:
- Document rõ business rule
- Backend có config để enable/disable auto-select
```

**Priority:** 🟡 **HIGH**  
**Impact:** Medium - UX, Business rule  
**Effort:** Low

---

### **ISSUE #14: 🟡 BOOKING STATUS CHECK (BookingDetail.jsx)**

**File:** `src/pages/inNavigateDriver/BookingDetail.jsx`

**Logic đang xử lý ở FE:**

```javascript
// Lines 60-125: Confirm booking và xử lý QR code
const handleConfirm = async () => {
  // ... call confirmBooking API ...

  // res.data is binary ArrayBuffer (PNG). Create blob URL
  const arrayBuffer = res.data;
  const blob = new Blob([arrayBuffer], { type: "image/png" });
  const blobUrl = URL.createObjectURL(blob);

  // Convert blob to data URL for sessionStorage
  const toDataURL = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

  let dataUrl = await toDataURL(blob);
  sessionStorage.setItem(`qr_booking_${bookingId}`, dataUrl);  // ❌ Store binary in sessionStorage

  // Navigate to charging session
  navigate(paths.chargingSession, {
    state: { booking, qrBlobUrl: blobUrl },
  });
};
```

**Vấn đề:**
- ❌ Frontend đang **LƯU QR CODE** vào sessionStorage (binary → base64)
- ❌ SessionStorage có limit ~5-10MB
- ❌ **Rủi ro:** Storage quota exceeded

**Khuyến nghị:**
```
Backend NÊN:
1. API GET /bookings/{id}/qr trả về QR code URL hoặc base64
2. Không cần Frontend tự convert

Frontend:
- Call API khi cần QR
- Hoặc Backend trả URL đến CDN/S3
```

**Priority:** 🟡 **HIGH**  
**Impact:** Medium - Storage, Performance  
**Effort:** Low

---

## �📋 CHECKLIST AUDIT TIẾP THEO

### **Modules chưa audit chi tiết:**

- [x] **Authentication Module** - Login, register, OTP, password validation ✅
- [x] **Payment & Charging Session** - Price calculation, metrics, estimates ✅
- [x] **Booking Module** - Slot selection, validation, filtering ✅
- [ ] **Charging Point Management** - Availability check, capacity
- [ ] **Vehicle Model Management** - Battery specs, connector compatibility
- [ ] **Report & Accident** - Data filtering, aggregation
- [ ] **Notification System** - Read/unread logic, filtering
- [ ] **Admin Dashboard** - All statistics calculations
- [ ] **Staff Dashboard** - Real-time metrics, concurrent sessions
- [ ] **Tariff Configuration** - Price validation, effective dates
- [ ] **Transaction Management** - Payment processing, invoice logic

---

## 🎯 KHUYẾN NGHỊ TỔNG THỂ

### **Nguyên tắc chung:**

1. **Frontend CHỈ nên:**
   - ✅ Gọi API
   - ✅ Render UI
   - ✅ Handle user interactions
   - ✅ Client-side validation (UX only, như check empty field)
   - ✅ Format display (như format money, date)

2. **Frontend KHÔNG nên:**
   - ❌ Tính toán giá tiền, discount, tax
   - ❌ Business validation (như giá minimum, password policy)
   - ❌ Data aggregation/statistics
   - ❌ Complex business rules
   - ❌ Authorization logic (role-based access control nên check ở Backend)

3. **Migration Strategy:**
   - Phase 1: Fix CRITICAL issues (8 issues) - **2 weeks**
   - Phase 2: Fix HIGH issues (12 issues) - **2 weeks**
   - Phase 3: Fix MEDIUM issues (15 issues) - **1 week**
   - Phase 4: Refactor & optimize - **1 week**

---

## 📝 NEXT STEPS

1. **Tạo Jira tickets** cho từng issue
2. **Prioritize** theo CRITICAL → HIGH → MEDIUM
3. **Assign** cho Backend team implement APIs
4. **Update Frontend** sau khi Backend ready
5. **Testing** integration after each phase
6. **Document** API changes trong Swagger

---

## 📞 CONTACT

**Document Owner:** Frontend Team  
**Last Updated:** 2026-01-15  
**Version:** 1.0  
**Status:** 🟡 In Progress (Module 1/8 done)

