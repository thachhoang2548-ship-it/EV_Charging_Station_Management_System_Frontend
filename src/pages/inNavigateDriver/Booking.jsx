// src/pages/inNavigate/Booking.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import paths from "../../path/paths.jsx";
import { isAuthenticated } from "../../utils/authUtils.js";
import { stationAPI } from "../../api/stationApi.js";
import Header from "../../components/admin/Header.jsx";
import "../admin/Dashboard.css";
import "./Booking.css";
import {
  ArrowLeft, MapPin, Zap, PlugZap, Car, Clock,
  CheckCircle2, AlertTriangle, CalendarCheck, Info
} from "lucide-react";

// ===== Utility: chuẩn hóa 1 record slot từ API =====
function normalizeSlotRecord(record, pointId, templateBase, templateMap) {
  // API trả về: {slotId, templateId, status, date, pointId}
  const rawSlotId = record?.slotId;

  // Template ID
  const templateId = record?.templateId;

  // Lấy template object từ map (nếu có)
  const template =
    templateMap && templateId != null
      ? templateMap[String(templateId)]
      : undefined;

  // Xác định slotNumber (1..24)
  let slotNumber = undefined;
  if (template && Number.isFinite(Number(template.slotIndex))) {
    slotNumber = Number(template.slotIndex);
  }

  const rawSlotNum = Number(rawSlotId);
  if (slotNumber == null && rawSlotNum && rawSlotNum >= 1 && rawSlotNum <= 24) {
    slotNumber = rawSlotNum;
  }

  if (
    (slotNumber == null || !Number.isFinite(slotNumber)) &&
    templateId != null &&
    Number.isFinite(templateBase)
  ) {
    slotNumber = Number(templateId) - Number(templateBase) + 1;
  }

  if (!slotNumber || !Number.isFinite(slotNumber)) slotNumber = 1;

  // Hàm định dạng giờ từ slot index
  const getTimeRange = (slotIdx) => {
    if (!slotIdx) return { start: "N/A", end: "N/A" };
    const startHour = slotIdx - 1;
    const endHour = slotIdx;
    const formatHour = (h) => `${(h % 24).toString().padStart(2, "0")}:00`;
    return { start: formatHour(startHour), end: formatHour(endHour) };
  };

  // Mặc định lấy range theo slotNumber
  let timeRange = getTimeRange(slotNumber);

  // Nếu template có startTime/endTime thì ưu tiên dùng chúng (ISO string -> 'HH:MM')
  try {
    if (template && template.startTime && template.endTime) {
      const sStr =
        typeof template.startTime === "string" &&
        template.startTime.length >= 16
          ? template.startTime.slice(11, 16)
          : null;
      const eStr =
        typeof template.endTime === "string" && template.endTime.length >= 16
          ? template.endTime.slice(11, 16)
          : null;
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

export default function Booking() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state;

  const pointId = bookingData?.chargingPoint?.pointId; // trụ sạc đã chọn

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [_submitting, setSubmitting] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]); // Danh sách slot đã chọn

  const MAX_SLOTS = 3; // Tối đa 3 slot

  // Kiểm tra xem slot mới có liền kề với các slot đã chọn không
  const isSlotAdjacent = (newSlotId, selectedSlots) => {
    if (selectedSlots.length === 0) return true; // Slot đầu tiên luôn hợp lệ

    const selectedSlotIds = selectedSlots
      .map((s) => s.SlotID)
      .sort((a, b) => a - b);
    const newSlot = newSlotId;

    // Kiểm tra xem slot mới có nằm liền kề với dãy đã chọn không
    const min = selectedSlotIds[0];
    const max = selectedSlotIds[selectedSlotIds.length - 1];

    // Slot mới phải là min-1 hoặc max+1
    return newSlot === min - 1 || newSlot === max + 1;
  };

  // Kiểm tra xem danh sách slot có liên tiếp không
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

  // Hàm xử lý chọn/bỏ chọn slot
  const handleToggleSlot = (slot) => {
    setSelectedSlots((prev) => {
      const isSelected = prev.some((s) => s.id === slot.id);

      if (isSelected) {
        // Bỏ chọn slot
        const newSelection = prev.filter((s) => s.id !== slot.id);

        // Kiểm tra xem sau khi bỏ chọn, các slot còn lại có còn liên tiếp không
        if (!areSlotsConsecutive(newSelection)) {
          toast.warning("Không thể bỏ chọn slot này vì sẽ tạo khoảng trống!", {
            position: "top-center",
          });
          return prev;
        }

        return newSelection;
      } else {
        // Chọn slot mới
        if (prev.length >= MAX_SLOTS) {
          toast.warning(`Bạn chỉ có thể chọn tối đa ${MAX_SLOTS} khung giờ!`, {
            position: "top-center",
          });
          return prev;
        }

        // Kiểm tra slot mới có liền kề không
        if (!isSlotAdjacent(slot.SlotID, prev)) {
          toast.warning("Bạn chỉ có thể chọn các khung giờ liên tiếp!", {
            position: "top-center",
            autoClose: 2000,
          });
          return prev;
        }

        return [...prev, slot];
      }
    });
  };

  // Kiểm tra slot có được chọn không
  const isSlotSelected = (slotId) => {
    return selectedSlots.some((s) => s.id === slotId);
  };

  // Hàm xác nhận đặt chỗ
  const handleConfirmBooking = () => {
    if (selectedSlots.length === 0) {
      toast.warning("Vui lòng chọn ít nhất 1 khung giờ!", {
        position: "top-center",
      });
      return;
    }

    // Build payload for booking API
    const vehicleId = bookingData?.vehicle?.vehicleId;
    if (!vehicleId) {
      toast.error("Không tìm thấy vehicleId để tạo booking", {
        position: "top-center",
      });
      return;
    }

    // Get slotId from raw record
    const slotIds = selectedSlots
      .map((s) => s.raw?.slotId || s.SlotID)
      .map((v) => Number(v))
      .filter((v) => Number.isFinite(v));

    if (slotIds.length === 0) {
      toast.error("Không có slotId hợp lệ để gửi lên server", {
        position: "top-center",
      });
      return;
    }

    const payload = {
      vehicleId: Number(vehicleId),
      slotIds: slotIds,
    };

    console.log("📅 Booking payload:", payload);

    // Call API
    (async () => {
      try {
        setSubmitting(true);
        const res = await stationAPI.createBooking(payload);
        console.log("✅ Booking response:", res);

        if (!res || res.success === false) {
          console.error("❌ createBooking failed:", res);
          const msg = res?.message || res;
          const text = typeof msg === "string" ? msg : JSON.stringify(msg);
          toast.error(text || "Đặt chỗ thất bại. Vui lòng thử lại.", {
            position: "top-center",
          });
          return;
        }

        // Success
        toast.success("Đặt chỗ thành công!", { position: "top-center" });
        const bookingObj = res.data || res;
        const bookingId = bookingObj?.bookingId;

        // ✅ Lưu maxPowerKW vào sessionStorage để ChargingSession dùng
        const maxPowerKW = bookingData?.chargingPoint?.maxPowerKW || 11.0;

        if (bookingId) {
          try {
            sessionStorage.setItem(
              `booking_${bookingId}_maxPowerKW`,
              JSON.stringify(maxPowerKW)
            );
            console.log(
              `✅ Saved maxPowerKW=${maxPowerKW} for booking #${bookingId}`
            );
          } catch (e) {
            console.warn("Failed to save maxPowerKW to sessionStorage:", e);
          }
        }

        if (bookingId) {
          // Navigate to booking detail/confirmation page and pass booking info
          navigate(`/bookings/${bookingId}`, {
            state: { bookingId, booking: bookingObj },
          });
        } else {
          // Fallback: navigate to bookings list and include booking object in state
          navigate(`/bookings`, { state: { booking: bookingObj } });
        }
      } catch (err) {
        console.error("❌ Lỗi khi tạo booking:", err);
        toast.error("Đặt chỗ thất bại. Vui lòng thử lại.", {
          position: "top-center",
        });
      } finally {
        setSubmitting(false);
      }
    })();
  };

  // ===== Lấy danh sách slot theo PointID và chuẩn hóa =====
  const fetchAvailableSlots = async () => {
    if (!pointId) return;

    try {
      setLoading(true);

      const response = await stationAPI.getAvaila(pointId);
      const rawSlots = Array.isArray(response?.data) ? response.data : [];

      // Lấy unique template IDs
      const uniqueTemplateIds = [...new Set(rawSlots.map((s) => s.templateId))];
      const templateMap = {};

      // Fetch templates song song
      await Promise.all(
        uniqueTemplateIds.map(async (tid) => {
          try {
            const res = await stationAPI.getTemplate(tid);
            if (res?.data) {
              templateMap[String(tid)] = res.data;
            }
          } catch (err) {
            console.warn(`⚠️ Failed to fetch template ${tid}:`, err);
          }
        })
      );

      // Normalize slots
      const normalized = rawSlots.map((record) =>
        normalizeSlotRecord(record, pointId, undefined, templateMap)
      );

      // Filter logic: Lấy slot tương lai của HÔM NAY
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const todayStr = `${year}-${month}-${day}`;
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      const filteredSlots = normalized.filter((slot) => {
        const slotDate = slot.Date;
        if (!slotDate) return false;

        let slotDateStr = String(slotDate);
        if (slotDateStr.includes("T")) slotDateStr = slotDateStr.split("T")[0];
        else if (slotDateStr.includes(" ")) slotDateStr = slotDateStr.split(" ")[0];

        if (slotDateStr !== todayStr) return false;

        const slotEndTimeStr = slot.EndTime;
        if (!slotEndTimeStr || slotEndTimeStr === "N/A") return true;

        const [endH, endM] = slotEndTimeStr.split(":").map(Number);
        return endH > currentHour || (endH === currentHour && endM > currentMinute);
      });

      filteredSlots.sort((a, b) => a.StartTime.localeCompare(b.StartTime));
      setAvailableSlots(filteredSlots);
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách slot:", error);
      toast.error("Không thể lấy danh sách slot sạc!", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===== Kiểm tra điều kiện và gọi API =====
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.warning("Bạn chưa đăng nhập. Vui lòng đăng nhập để có thể đặt chỗ!", {
        position: "top-center",
        autoClose: 3000,
      });
      navigate(paths.login);
      return;
    }

    if (!bookingData || !pointId) {
      toast.error("Không có thông tin đặt chỗ. Vui lòng chọn trụ sạc!", {
        position: "top-center",
        autoClose: 3000,
      });
      navigate(-1);
      return;
    }

    if (bookingData.vehicle?.batteryCapacityKWh != null) {
      sessionStorage.setItem("batteryCapacityKWh", bookingData.vehicle.batteryCapacityKWh);
    }

    fetchAvailableSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, bookingData, pointId]);

  if (!bookingData) return null;

  return (
    <div className="dashboard-container">
      <Header />

      {/* ── Hero ────────────────────────────────────── */}
      <section className="bk-hero">
        <button className="bk-hero-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Quay lại
        </button>
        <h1>Đặt chỗ sạc xe</h1>
        <p>Chọn khung giờ phù hợp để đặt lịch sạc tại trạm</p>
      </section>

      {/* ── Info strip ──────────────────────────────── */}
      <div className="bk-info-strip">
        <div className="bk-info-card">
          <h3><MapPin size={16} /> Trạm sạc</h3>
          <div className="bk-info-row"><span>Tên trạm</span> <strong>{bookingData.station?.name}</strong></div>
          <div className="bk-info-row"><span>Địa chỉ</span> <strong>{bookingData.station?.address}</strong></div>
        </div>

        <div className="bk-info-card">
          <h3><Zap size={16} /> Trụ sạc</h3>
          <div className="bk-info-row"><span>Số trụ</span> <strong>{bookingData.chargingPoint?.pointNumber}</strong></div>
          <div className="bk-info-row"><span>Công suất</span> <strong>{bookingData.chargingPoint?.maxPowerKW} kW</strong></div>
          <div className="bk-info-row"><span>Trạng thái</span> <strong>{bookingData.chargingPoint?.status}</strong></div>
        </div>

        <div className="bk-info-card">
          <h3><PlugZap size={16} /> Cổng sạc</h3>
          <div className="bk-info-row"><span>Loại</span> <strong>{bookingData.connector?.displayName}</strong></div>
          <div className="bk-info-row"><span>Mã</span> <strong>{bookingData.connector?.code}</strong></div>
          <div className="bk-info-row"><span>Chế độ</span> <strong>{bookingData.connector?.mode}</strong></div>
          <div className="bk-info-row"><span>Công suất</span> <strong>{bookingData.connector?.defaultMaxPowerKW} kW</strong></div>
        </div>

        <div className="bk-info-card">
          <h3><Car size={16} /> Xe của bạn</h3>
          <div className="bk-info-row"><span>Tên xe</span> <strong>{bookingData.vehicle?.vehicleName}</strong></div>
          <div className="bk-info-row"><span>Hãng</span> <strong>{bookingData.vehicle?.brand} {bookingData.vehicle?.model}</strong></div>
          <div className="bk-info-row"><span>Biển số</span> <strong>{bookingData.vehicle?.licensePlate}</strong></div>
          <div className="bk-info-row"><span>Cổng sạc</span> <strong>{bookingData.vehicle?.connectorTypeName}</strong></div>
        </div>
      </div>

      {/* ── Body: 2 columns ─────────────────────────── */}
      <div className="bk-body">
        {/* Left: slot selection */}
        <div className="bk-slot-section">
          <h2><Clock size={18} style={{ verticalAlign: "middle", marginRight: 6 }} />Chọn khung giờ sạc</h2>
          <p className="bk-slot-subtitle">Tối đa {MAX_SLOTS} khung giờ liên tiếp</p>

          {/* Notice */}
          <div className="bk-notice">
            <Info size={16} />
            <span><strong>Lưu ý:</strong> Bạn chỉ có thể chọn các khung giờ liên tiếp nhau (không được bỏ trống giữa các khung giờ)</span>
          </div>

          {/* Selected summary */}
          {selectedSlots.length > 0 && (
            <div className="bk-selected-summary">
              <p className="bk-selected-count">
                <CheckCircle2 size={16} /> Đã chọn {selectedSlots.length}/{MAX_SLOTS} khung giờ
              </p>
              <div className="bk-selected-tags">
                {selectedSlots.map((slot) => (
                  <span key={slot.id} className="bk-tag">{slot.StartTime} – {slot.EndTime}</span>
                ))}
              </div>
            </div>
          )}

          {/* Slot grid as Magnetic Timeline */}
          {loading ? (
            <div className="bk-loading">
              <Clock size={28} style={{ marginBottom: 8, opacity: 0.5 }} />
              <p>Đang tải danh sách khung giờ...</p>
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="bk-slots-grid">
              {availableSlots.map((slot) => {
                const isSelected = isSlotSelected(slot.id);
                const isAvailable = String(slot.Status ?? "").toLowerCase() === "available";
                const canSelect = selectedSlots.length === 0 || isSlotAdjacent(slot.SlotID, selectedSlots);
                const isDisabled =
                  !isAvailable ||
                  (!isSelected && selectedSlots.length >= MAX_SLOTS) ||
                  (!isSelected && selectedSlots.length > 0 && !canSelect);

                return (
                  <div
                    key={slot.id || slot.SlotID}
                    className={`bk-slot ${isSelected ? "bk-slot--selected" : ""} ${isDisabled ? "bk-slot--disabled" : ""}`}
                    onClick={() => { if (!isDisabled) handleToggleSlot(slot); }}
                  >
                    <span className="bk-slot-time-text">{slot.StartTime} - {slot.EndTime}</span>
                    {isSelected && <CheckCircle2 size={16} className="bk-slot-check-icon" />}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bk-empty">
              <AlertTriangle size={32} />
              <p>Không có khung giờ nào khả dụng cho trụ này.</p>
            </div>
          )}
        </div>

        {/* Right: sidebar summary */}
        <aside className="bk-sidebar">
          <div className="bk-summary-card">
            <h3><CalendarCheck size={18} /> Tóm tắt đặt chỗ</h3>

            <div className="bk-summary-row"><span>Trạm</span> <span>{bookingData.station?.name || "–"}</span></div>
            <div className="bk-summary-row"><span>Trụ số</span> <span>{bookingData.chargingPoint?.pointNumber || "–"}</span></div>
            <div className="bk-summary-row"><span>Công suất</span> <span>{bookingData.chargingPoint?.maxPowerKW ? `${bookingData.chargingPoint.maxPowerKW} kW` : "–"}</span></div>
            <div className="bk-summary-row"><span>Cổng sạc</span> <span>{bookingData.connector?.displayName || "–"}</span></div>

            {/* Vehicle */}
            <div className="bk-summary-vehicle">
              <div className="bk-summary-vehicle-icon"><Car size={20} /></div>
              <div className="bk-summary-vehicle-info">
                <strong>{bookingData.vehicle?.vehicleName || "–"}</strong>
                <span>{bookingData.vehicle?.licensePlate || ""}</span>
              </div>
            </div>

            {/* Selected time slots */}
            <div className="bk-summary-time">
              <div className="bk-summary-time-label">Khung giờ đã chọn</div>
              {selectedSlots.length > 0 ? (
                <div className="bk-summary-time-tags">
                  {selectedSlots.map((s) => (
                    <span key={s.id} className="bk-summary-time-tag">{s.StartTime} – {s.EndTime}</span>
                  ))}
                </div>
              ) : (
                <p className="bk-summary-empty">Chưa chọn khung giờ nào</p>
              )}
            </div>

            {/* Confirm button inside sidebar */}
            {selectedSlots.length > 0 && (
              <button 
                className="bk-confirm-btn" 
                onClick={handleConfirmBooking}
                disabled={_submitting}
              >
                {_submitting ? (
                  <>Đang xử lý...</>
                ) : (
                  <>Xác nhận đặt {selectedSlots.length} khung</>
                )}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
