import React, { useEffect, useState } from "react";
import {
  FaChevronLeft,
  FaPlug,
  FaBolt,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaArrowRight,
  FaTimesCircle,
  FaSpinner,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // ✅ Mới
import { toast } from "react-toastify"; // ✅ Mới
import paths from "../../path/paths.jsx"; // ✅ Mới (để chuyển hướng)
import { showWarning, showConfirm } from "../../utils/alertUtils.js";

import {
  getConnectorTypes,
  getChargingPointsByStationId,
  getStationStaffMe,
  getAvaila,
  getTemplate,
  // ✅ THÊM CÁC API CẦN THIẾT
  createBooking,
  confirmBooking,
  startChargingSession,
} from "../../api/stationApi";
import { getAllTariffs } from "../../api/tariffApi.js";

// =============================================================================
// UTILS: Chuẩn hóa dữ liệu Slot
// =============================================================================
function normalizeSlotRecord(record, pointId, templateMap) {
  const slotId = record.slotId;
  const templateId = record.templateId;
  const status = record.status;
  const dateStr = record.date;

  const template =
    templateMap && templateId ? templateMap[String(templateId)] : null;

  let startTimeDisplay = "N/A";
  let endTimeDisplay = "N/A";

  if (template) {
    if (template.startTime) {
      startTimeDisplay = template.startTime.substring(11, 16);
    }
    if (template.endTime) {
      endTimeDisplay = template.endTime.substring(11, 16);
    }
  }

  return {
    id: `${templateId}-${slotId}`,
    slotId: slotId,
    templateId: templateId,
    pointId: pointId,
    status: status,
    date: dateStr,
    startTime: startTimeDisplay,
    endTime: endTimeDisplay,
    raw: record,
  };
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export default function InstantCharging() {
  const navigate = useNavigate(); // ✅ Hook điều hướng

  // --- State Quản lý Luồng ---
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // ✅ State loading khi bấm nút sạc

  // --- State Dữ liệu ---
  const [connectorTypes, setConnectorTypes] = useState([]);
  const [chargingPoints, setChargingPoints] = useState([]);
  const [filteredPoints, setFilteredPoints] = useState([]);
  const [tariffs, setTariffs] = useState([]);

  const [selectedConnectorName, setSelectedConnectorName] = useState(null);
  const [stationId, setStationId] = useState(null);

  // --- State cho Slot ---
  const [pointSlots, setPointSlots] = useState({});
  const [loadingSlots, setLoadingSlots] = useState({});

  // --- State MỚI: Quản lý các slot đang được chọn cho từng trụ ---
  // Format: { pointId: [slotObject1, slotObject2] }
  const [selections, setSelections] = useState({});

  // -------------------------------------------------------------------------
  // 1. FETCH INITIAL DATA
  // -------------------------------------------------------------------------
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const staffRes = await getStationStaffMe();
        if (!staffRes.data || staffRes.data.length === 0) {
          showWarning("Không tìm thấy thông tin trạm của nhân viên!");
          return;
        }
        const myStationId = staffRes.data[0].stationId;
        setStationId(myStationId);

        const connectorRes = await getConnectorTypes();
        setConnectorTypes(connectorRes.data || []);

        const pointsRes = await getChargingPointsByStationId(myStationId);
        setChargingPoints(pointsRes.data || []);

        const tariffsRes = await getAllTariffs();
        setTariffs(tariffsRes.data || []);
      } catch (error) {
        console.error("🔥 Lỗi khởi tạo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // -------------------------------------------------------------------------
  // 2. LOGIC LẤY & XỬ LÝ SLOT
  // -------------------------------------------------------------------------
  const fetchSlotsForPoint = async (pointId) => {
    if (pointSlots[pointId]) return;

    try {
      setLoadingSlots((prev) => ({ ...prev, [pointId]: true }));

      const res = await getAvaila(pointId);
      const rawSlots = Array.isArray(res.data) ? res.data : [];

      const uniqueTemplateIds = [...new Set(rawSlots.map((s) => s.templateId))];
      const templateMap = {};

      await Promise.all(
        uniqueTemplateIds.map(async (tid) => {
          try {
            const tRes = await getTemplate(tid);
            if (tRes.data) templateMap[String(tid)] = tRes.data;
          } catch (e) {
            console.warn(`⚠️ Error template ${tid}`);
          }
        }),
      );

      const normalizedSlots = rawSlots.map((record) =>
        normalizeSlotRecord(record, pointId, templateMap),
      );

      // Filter logic: Lấy slot tương lai của HÔM NAY (Local Time)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const todayStr = `${year}-${month}-${day}`;

      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      const validSlots = normalizedSlots.filter((slot) => {
        if (!slot.date || !slot.date.startsWith(todayStr)) return false;
        if (slot.startTime === "N/A" || slot.endTime === "N/A") return false;

        const [endH, endM] = slot.endTime.split(":").map(Number);
        // Hiển thị nếu slot chưa kết thúc
        return (
          endH > currentHour || (endH === currentHour && endM > currentMinute)
        );
      });

      validSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
      const top4Slots = validSlots.slice(0, 4);

      setPointSlots((prev) => ({ ...prev, [pointId]: top4Slots }));

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
    } catch (error) {
      console.error(`❌ Lỗi fetch slot point ${pointId}`, error);
      setPointSlots((prev) => ({ ...prev, [pointId]: [] }));
    } finally {
      setLoadingSlots((prev) => ({ ...prev, [pointId]: false }));
    }
  };

  // -------------------------------------------------------------------------
  // 3. HANDLERS (LOGIC CHỌN SLOT THÔNG MINH)
  // -------------------------------------------------------------------------
  const handleConnectorSelect = (connectorName) => {
    setSelectedConnectorName(connectorName);
    const filtered = chargingPoints.filter(
      (p) => p.connectorType === connectorName,
    );
    setFilteredPoints(filtered);

    // Reset selections khi đổi cổng
    setSelections({});

    filtered
      .filter((p) => p.status === "AVAILABLE")
      .forEach((p) => fetchSlotsForPoint(p.pointId));

    setStep(2);
  };

  const handleSlotClick = (pointId, clickedSlot, allSlots) => {
    const isAvail = String(clickedSlot.status).toLowerCase() === "available";

    // RULE 1: Check Available. Nếu không available thì chặn luôn.
    if (!isAvail) {
      showWarning("Khung giờ này đã kín hoặc không khả dụng.");
      return;
    }

    const currentSelected = selections[pointId] || [];
    const isSelected = currentSelected.some((s) => s.id === clickedSlot.id);
    const firstSlot = allSlots[0]; // Slot gần nhất luôn là mỏ neo

    // Nếu click vào slot đầu tiên (slot gốc) -> Không cho bỏ chọn (theo yêu cầu mặc định sạc từ slot gần nhất)
    if (clickedSlot.id === firstSlot.id) {
      return;
    }

    if (isSelected) {
      // Nếu bỏ chọn 1 slot -> Xóa nó và các slot sau nó để đảm bảo tính liền kề
      const clickedIndexInSelection = currentSelected.findIndex(
        (s) => s.id === clickedSlot.id,
      );
      const newSelection = currentSelected.slice(0, clickedIndexInSelection);
      setSelections((prev) => ({ ...prev, [pointId]: newSelection }));
    } else {
      // RULE 2: Check số lượng tối đa (3 slot)
      if (currentSelected.length >= 3) {
        showWarning("Bạn chỉ có thể chọn tối đa 3 khung giờ.");
        return;
      }

      // RULE 3: Check tính liên tục (Consecutive)
      // Slot mới phải nằm ngay sau slot cuối cùng đang được chọn
      const lastSelected = currentSelected[currentSelected.length - 1];
      const lastIndexInAll = allSlots.findIndex(
        (s) => s.id === lastSelected.id,
      );
      const clickedIndexInAll = allSlots.findIndex(
        (s) => s.id === clickedSlot.id,
      );

      if (clickedIndexInAll === lastIndexInAll + 1) {
        // Hợp lệ: Chọn tiếp slot liền kề
        setSelections((prev) => ({
          ...prev,
          [pointId]: [...currentSelected, clickedSlot],
        }));
      } else {
        showWarning("Vui lòng chọn các khung giờ liên tiếp nhau.");
      }
    }
  };

  // =========================================================================
  // ✅ NEW LOGIC: GỘP 3 BƯỚC (CREATE -> CONFIRM -> START)
  // =========================================================================
  const handleConfirmCharging = async (point) => {
    const selected = selections[point.pointId] || [];
    if (selected.length === 0) return;

    // Chuẩn bị dữ liệu
    const slotIds = selected.map((s) => Number(s.slotId)); // Đảm bảo là số
    const startTime = selected[0].startTime;
    const endTime = selected[selected.length - 1].endTime;

    // Payload tạo booking với vehicleId = null
    const bookingPayload = {
      vehicleId: null, // ✅ NULL như yêu cầu
      slotIds: slotIds,
      bookingTime: new Date().toISOString(),
      description: `Khách vãng lai - Trụ ${point?.pointNumber}`,
    };

    if (
      !(await showConfirm(
        `Xác nhận kích hoạt sạc tại Trụ ${point?.pointNumber}?\nThời gian: ${startTime} - ${endTime}`,
        "Xác nhận kích hoạt sạc",
      ))
    ) {
      return;
    }

    setSubmitting(true); // Bật loading UI

    try {
      // 🚀 BƯỚC 1: TẠO BOOKING
      const createRes = await createBooking(bookingPayload);
      if (!createRes?.success) {
        throw new Error(createRes?.message || "Tạo booking thất bại");
      }
      // Lấy ID booking vừa tạo (check cả data object hoặc trả về trực tiếp)
      const newBookingId =
        createRes.data?.bookingId ||
        createRes.data?.bookingID ||
        createRes.data?.id;

      if (!newBookingId) throw new Error("Không lấy được Booking ID từ server");

      // 🚀 BƯỚC 2: TỰ ĐỘNG XÁC NHẬN (CONFIRM)
      const confirmRes = await confirmBooking(newBookingId);
      // Lưu ý: confirmBooking có thể trả về blob (ảnh QR) hoặc success json.
      // Nếu backend trả về lỗi, nó thường throw hoặc success=false.
      if (confirmRes?.success === false) {
        throw new Error(confirmRes?.message || "Xác nhận booking thất bại");
      }

      // 🚀 BƯỚC 3: KÍCH HOẠT PHIÊN SẠC (START SESSION)
      const startPayload = { bookingId: String(newBookingId) };
      const startRes = await startChargingSession(startPayload);

      if (!startRes?.success) {
        throw new Error(startRes?.message || "Không thể kích hoạt điện vào xe");
      }

      // ✅ Lưu pointNumber từ response vào sessionStorage (cho SessionCharging.jsx dùng)
      try {
        const sessionData = startRes.data || startRes;
        const sessionId = sessionData?.sessionId;
        const pointNumber = sessionData?.pointNumber;

        if (sessionId && pointNumber) {
          // Lưu pointNumber riêng để dễ truy xuất
          sessionStorage.setItem(
            `session_${sessionId}_pointNumber`,
            pointNumber,
          );
          console.log(
            `✅ Saved pointNumber=${pointNumber} for session #${sessionId}`,
          );

          // Lưu cả full session data nếu cần
          sessionStorage.setItem(
            `session_${sessionId}_data`,
            JSON.stringify(sessionData),
          );
        }
      } catch (err) {
        console.debug("Failed to cache session data:", err);
      }

      // ✅ HOÀN TẤT
      toast.success("🚀 Đã kích hoạt phiên sạc thành công!");

      // Chuyển hướng về trang quản lý phiên sạc
      navigate(paths.manageSessionCharging);
    } catch (error) {
      console.error("❌ Instant Charging Error:", error);
      toast.error(error.message || "Có lỗi xảy ra trong quá trình kích hoạt");
    } finally {
      setSubmitting(false); // Tắt loading UI
    }
  };

  // -------------------------------------------------------------------------
  // 4. RENDER UI
  // -------------------------------------------------------------------------
  if (loading)
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
        <div className="spinner"></div>
        <p>⏳ Đang tải dữ liệu trạm...</p>
      </div>
    );

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1000px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* --- HEADER --- */}
      <div
        style={{
          marginBottom: "20px",
          borderBottom: "1px solid #eee",
          paddingBottom: "10px",
        }}
      >
        <h1
          style={{
            margin: 0,
            color: "#16a34a",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <FaBolt /> Sạc Ngay (Instant Charging)
        </h1>
      </div>

      {/* --- STEP 1: CHỌN LOẠI CỔNG --- */}
      {step === 1 && (
        <div>
          <h3 style={{ color: "#333" }}>🔌 Bước 1: Chọn loại cổng sạc</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "15px",
            }}
          >
            {connectorTypes.map((type) => {
              const tariff = tariffs.find(
                (t) => t.connectorTypeId === type.connectorTypeId,
              );
              return (
                <div
                  key={type.connectorTypeId}
                  onClick={() => handleConnectorSelect(type.displayName)}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "20px",
                    cursor: "pointer",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    textAlign: "center",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#16a34a";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#ddd";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <FaPlug
                    size={30}
                    color="#16a34a"
                    style={{ marginBottom: "10px" }}
                  />
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                    {type.displayName}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      marginTop: "5px",
                    }}
                  >
                    Max: {type.defaultMaxPowerKW} kW
                  </div>
                  {tariff && (
                    <>
                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "12px",
                          color: "#555",
                          background: "#f9f9f9",
                          padding: "5px",
                          borderRadius: "5px",
                        }}
                      >
                        <div>
                          Gía theo kWh: {tariff.pricePerKWh?.toLocaleString()}{" "}
                          đ/kWh
                        </div>
                      </div>
                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "12px",
                          color: "#555",
                          background: "#f9f9f9",
                          padding: "5px",
                          borderRadius: "5px",
                        }}
                      >
                        <div>
                          Gía theo phút: {tariff.pricePerMin?.toLocaleString()}{" "}
                          đ/phút
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- STEP 2: CHỌN TRỤ & SLOT --- */}
      {step === 2 && (
        <div>
          <button
            onClick={() => setStep(1)}
            style={{
              marginBottom: "20px",
              padding: "8px 18px",
              border: "2px solid #16a34a",
              background: "#f0fdf4",
              color: "#15803d",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: "bold",
              fontSize: "14px",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 6px rgba(22,163,74,0.12)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#16a34a";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(22,163,74,0.35)";
              e.currentTarget.style.transform = "translateX(-3px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f0fdf4";
              e.currentTarget.style.color = "#15803d";
              e.currentTarget.style.boxShadow =
                "0 2px 6px rgba(22,163,74,0.12)";
              e.currentTarget.style.transform = "translateX(0)";
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "translateX(-1px) scale(0.97)";
              e.currentTarget.style.boxShadow = "0 1px 4px rgba(22,163,74,0.2)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "translateX(-3px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(22,163,74,0.35)";
            }}
          >
            <FaChevronLeft /> Chọn loại cổng khác
          </button>

          <h3 style={{ color: "#333" }}>
            🔋 Các trụ {selectedConnectorName} khả dụng
          </h3>

          {filteredPoints.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "30px",
                background: "#fff3cd",
                borderRadius: "8px",
                color: "#856404",
              }}
            >
              <FaExclamationCircle /> Không có trụ nào hỗ trợ loại cổng này tại
              trạm.
            </div>
          ) : (
            <div>
              {filteredPoints.map((point) => {
                const pId = point.pointId;
                const slots = pointSlots[pId] || [];
                const isLoadingSlots = loadingSlots[pId];
                const isPointAvailable = point.status === "AVAILABLE";

                const currentSelection = selections[pId] || [];
                const isSelectionValid = currentSelection.length > 0;

                return (
                  <div
                    key={pId}
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "20px",
                      marginBottom: "20px",
                      border: "1px solid #e0e0e0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  >
                    {/* Header Trụ */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "15px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            background: "#f0fdf4",
                            padding: "10px",
                            borderRadius: "50%",
                          }}
                        >
                          <FaBolt size={20} color="#16a34a" />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, color: "#2c3e50" }}>
                            {point.pointNumber}
                          </h3>
                          <span style={{ fontSize: "13px", color: "#7f8c8d" }}>
                            {point.maxPowerKW} kW
                          </span>
                        </div>
                      </div>
                      <span
                        style={{
                          padding: "5px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          backgroundColor: isPointAvailable
                            ? "#d4edda"
                            : "#fff3cd",
                          color: isPointAvailable ? "#155724" : "#856404",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        {isPointAvailable ? (
                          <FaCheckCircle />
                        ) : (
                          <FaExclamationCircle />
                        )}
                        {point.status}
                      </span>
                    </div>

                    {/* Khu vực Slots */}
                    {isPointAvailable ? (
                      <div
                        style={{
                          background: "#f8f9fa",
                          padding: "15px",
                          borderRadius: "8px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            marginBottom: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            color: "#555",
                          }}
                        >
                          <FaClock /> Chọn thời gian sạc (Tối đa 3 slot):
                        </div>

                        {isLoadingSlots ? (
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#999",
                              fontStyle: "italic",
                              padding: "10px",
                            }}
                          >
                            ⏳ Đang tải lịch trình...
                          </div>
                        ) : slots.length === 0 ? (
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#999",
                              padding: "10px",
                            }}
                          >
                            🚫 Không còn slot trống trong hôm nay
                          </div>
                        ) : (
                          <div>
                            {/* GRID SLOTS */}
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fill, minmax(140px, 1fr))",
                                gap: "10px",
                                marginBottom: "15px",
                              }}
                            >
                              {slots.map((slot, idx) => {
                                const isAvail =
                                  String(slot.status).toLowerCase() ===
                                  "available";
                                const isSelected = currentSelection.some(
                                  (s) => s.id === slot.id,
                                );
                                const isFirst = idx === 0; // Slot gần nhất

                                return (
                                  <div
                                    key={slot.id}
                                    onClick={() =>
                                      handleSlotClick(pId, slot, slots)
                                    }
                                    style={{
                                      border: isSelected
                                        ? "2px solid #16a34a"
                                        : "1px solid #ddd",
                                      borderRadius: "8px",
                                      padding: "10px",
                                      background: isSelected
                                        ? "#f0fdf4"
                                        : isAvail
                                          ? "white"
                                          : "#fcfcfc",
                                      position: "relative",
                                      cursor: isAvail
                                        ? "pointer"
                                        : "not-allowed",
                                      opacity: isAvail ? 1 : 0.6,
                                      transition: "all 0.2s",
                                    }}
                                  >
                                    {isFirst && (
                                      <div
                                        style={{
                                          position: "absolute",
                                          top: "-8px",
                                          right: "-5px",
                                          background: "#ff9800",
                                          color: "white",
                                          fontSize: "9px",
                                          padding: "2px 6px",
                                          borderRadius: "4px",
                                          fontWeight: "bold",
                                          zIndex: 2,
                                        }}
                                      >
                                        Gần nhất
                                      </div>
                                    )}

                                    <div
                                      style={{
                                        fontWeight: "bold",
                                        fontSize: "14px",
                                        color: isSelected
                                          ? "#15803d"
                                          : isAvail
                                            ? "#333"
                                            : "#999",
                                        textAlign: "center",
                                      }}
                                    >
                                      {slot.startTime}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "11px",
                                        color: isAvail ? "#666" : "#999",
                                        textAlign: "center",
                                      }}
                                    >
                                      đến {slot.endTime}
                                    </div>

                                    {/* STATUS TEXT AREA */}
                                    <div
                                      style={{
                                        marginTop: "5px",
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        textAlign: "center",
                                        color: isAvail ? "#28a745" : "#dc3545",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: "3px",
                                      }}
                                    >
                                      {isAvail ? (
                                        <>
                                          {isSelected && (
                                            <FaCheckCircle size={10} />
                                          )}
                                          {isSelected
                                            ? "Đã chọn"
                                            : "Đang trống"}
                                        </>
                                      ) : (
                                        <>
                                          <FaTimesCircle size={10} />
                                          Đã kín
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* ACTION BUTTON AREA */}
                            {isSelectionValid && (
                              <div
                                style={{
                                  borderTop: "1px solid #eee",
                                  paddingTop: "15px",
                                  marginTop: "10px",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                  gap: "10px",
                                }}
                              >
                                <div style={{ fontSize: "14px" }}>
                                  <span style={{ color: "#666" }}>
                                    Thời gian sạc:{" "}
                                  </span>
                                  <span
                                    style={{
                                      fontWeight: "bold",
                                      color: "#16a34a",
                                    }}
                                  >
                                    {currentSelection[0].startTime} ➜{" "}
                                    {
                                      currentSelection[
                                        currentSelection.length - 1
                                      ].endTime
                                    }
                                  </span>
                                  <div
                                    style={{ fontSize: "12px", color: "#999" }}
                                  >
                                    (Tổng {currentSelection.length} tiếng)
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleConfirmCharging(point)}
                                  disabled={submitting} // ✅ Disable khi đang submit
                                  style={{
                                    background: submitting
                                      ? "#ccc"
                                      : "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "10px 25px",
                                    fontSize: "15px",
                                    fontWeight: "bold",
                                    cursor: submitting
                                      ? "not-allowed"
                                      : "pointer",
                                    boxShadow: submitting
                                      ? "none"
                                      : "0 4px 6px rgba(22,163,74,0.3)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    transition: "all 0.2s",
                                    opacity: submitting ? 0.8 : 1,
                                  }}
                                  onMouseDown={(e) =>
                                    !submitting &&
                                    (e.currentTarget.style.transform =
                                      "scale(0.98)")
                                  }
                                  onMouseUp={(e) =>
                                    !submitting &&
                                    (e.currentTarget.style.transform =
                                      "scale(1)")
                                  }
                                >
                                  {submitting ? (
                                    <>
                                      <div
                                        className="spinner-small"
                                        style={{
                                          width: 15,
                                          height: 15,
                                          border: "2px solid white",
                                          borderTopColor: "transparent",
                                          borderRadius: "50%",
                                          animation: "spin 1s linear infinite",
                                        }}
                                      ></div>
                                      Đang xử lý...
                                    </>
                                  ) : (
                                    <>
                                      Bắt đầu sạc <FaArrowRight />
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        style={{
                          background: "#fff3cd",
                          padding: "12px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "#856404",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <FaExclamationCircle />
                        Trụ này hiện không khả dụng.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
    </div>
  );
}
