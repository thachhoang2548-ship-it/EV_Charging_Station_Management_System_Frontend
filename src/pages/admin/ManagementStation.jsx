import Nav from "react-bootstrap/Nav";
import ActionMenu from "../../components/ActionMenu/ActionMenu.jsx";
import { useEffect, useState, useMemo } from "react";
import {
  getAllStations,
  updateStationStatus,
  getAllSlotConfigs,
} from "../../api/stationApi.js";
import Table from "react-bootstrap/Table";
import AddConfigSlotForm from "../../components/admin/AddConfigSlotForm.jsx";
import { useNavigate } from "react-router-dom";
import paths from "../../path/paths.jsx";
import "./ManagementUser.css"; // Vẫn dùng file CSS này
import Header from "../../components/admin/Header.jsx";
import { toast } from "react-toastify";
import { showConfirm, showConfirmWarning } from '../../utils/alertUtils.js';
import AddStationForm from "../../components/admin/AddStationForm.jsx";

export default function ManagementStation() {
  const navigator = useNavigate();
  const user = JSON.parse(localStorage.getItem("userDetails"));
  if (!user) {
    navigator(paths.login);
  }

  const [activeTab, setActiveTab] = useState("allStations");
  const [stations, setStations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddStationForm, setShowAddStationForm] = useState(false);
  const [showAddSlotConfigForm, setShowAddSlotConfigForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const status = ["ACTIVE", "MAINTENANCE", "INACTIVE"];
  const [selectedStation, setSelectedStation] = useState(null);
  const [slotConfigs, setSlotConfigs] = useState([]);
  const [selectedStationSlotConfig, setSelectedStationSlotConfig] =
    useState(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await getAllStations();
        if (response.success) {
          setStations(response.data);
          console.log("Fetched stations:", response.data);
        }
      } catch (error) {
        console.error("Error fetching stations:", error);
      }
    };

    const fetchSlotConfigs = async () => {
      try {
        const response = await getAllSlotConfigs();
        if (response.success) {
          setSlotConfigs(response.data);
          console.log("Fetched slot configs:", response.data);
        }
      } catch (error) {
        console.error("Error fetching slot configs:", error);
      }
    };
    fetchStations();
    fetchSlotConfigs();
  }, [loading]);

  const handleSelect = (selectedKey) => {
    setActiveTab(selectedKey);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleAddStation = () => {
    setShowAddStationForm(true);
  };

  const handleCloseForm = () => {
    setShowAddStationForm(false);
  };
  // ============================================================================================
  const handleStatusStation = async (stationId, newStatus) => {
    const confirmChange = await showConfirm(
      'Bạn có chắc chắn muốn thay đổi trạng thái trạm sạc này?',
      'Xác nhận thay đổi trạng thái'
    );
    if (!confirmChange) return;
    try {
      console.log("Updating status for station:", stationId, "to", newStatus);
      const response = await updateStationStatus(stationId, newStatus);
      if (response.success) {
        setLoading(!loading);
        toast.success("Cập nhật trạng thái trạm sạc thành công");
      }
    } catch (error) {
      toast.error("Cập nhật trạng thái trạm sạc thất bại");
      console.error("Error updating station status:", error);
    }
  };

  const handleUpdateStation = (station) => {
    setShowAddStationForm(true);
    setSelectedStation(station);
  };

  const handleConfigSlotTime = async (stationID, slotConfig) => {
    const confirmConfig = await showConfirmWarning(
      'Khi cấu hình lại thời gian thì sẽ áp dụng ngay lập tức thay thế cấu hình hiện có của trạm. Bạn có muốn tiếp tục?',
      'Cảnh báo!'
    );
    if (!confirmConfig) return;
    setShowAddSlotConfigForm(true);
    setSelectedStationSlotConfig({
      stationId: stationID,
      slotConfig: slotConfig,
    });
  };

  const handleSetLoading = () => {
    setLoading((pre) => !pre);
    setSelectedStation(null);
    setShowAddSlotConfigForm(false);
  };

  // =======================================================================================

  // Tính toán thống kê
  const totalStations = stations.length;
  const totalActive = stations.filter((s) => s.status === "ACTIVE").length;
  const totalMaintenance = stations.filter(
    (s) => s.status === "MAINTENANCE",
  ).length;
  const totalInactive = stations.filter((s) => s.status === "INACTIVE").length;

  // Tính toán danh sách hiển thị
  const displayedStations = useMemo(() => {
    let filtered = stations;

    if (activeTab !== "allStations") {
      filtered = filtered.filter(
        (station) => station.status === activeTab.toUpperCase(),
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (station) =>
          station.stationName?.toLowerCase().includes(searchTerm) ||
          station.address?.toLowerCase().includes(searchTerm),
      );
    }

    return filtered;
  }, [stations, activeTab, searchTerm]);

  return (
    <>
      {showAddSlotConfigForm && (
        <AddConfigSlotForm
          handleClose={handleSetLoading}
          stationId={selectedStationSlotConfig.stationId}
          slotMinutes={selectedStationSlotConfig.slotConfig?.slotDurationMin}
        />
      )}
      {showAddStationForm && (
        <AddStationForm
          onClose={handleCloseForm}
          onAddSuccess={handleSetLoading}
          station={selectedStation}
        />
      )}
      {!showAddStationForm && !showAddSlotConfigForm && (
        <div className="management-user-container">
          {/* Header Section */}
          <Header />

          {/* Action Section */}
          <div className="action-section">
            <h2>Quản lý trạm sạc</h2>
            <button className="btn-add-staff" onClick={handleAddStation}>
              + Thêm trạm sạc
            </button>
          </div>

          {/* Statistics Section */}
          <ul className="statistics-section">
            <li className="stat-card">
              Tổng trạm sạc
              <strong>{totalStations}</strong>
            </li>
            <li className="stat-card">
              Đang hoạt động
              <strong>{totalActive}</strong>
            </li>
            <li className="stat-card">
              Đang bảo trì
              <strong>{totalMaintenance}</strong>
            </li>
            <li className="stat-card">
              Ngưng hoạt động
              <strong>{totalInactive}</strong>
            </li>
          </ul>

          {/* Table Section */}
          <div className="table-section">
            {/* ✅ BỌC TOÀN BỘ BẢNG VÀ FILTER TRONG KHUNG CUỘN NÀY */}
            <div className="table-scroll-container">
              {/* ✅ FILTER SECTION ĐÃ ĐƯỢC CHUYỂN VÀO ĐÂY */}
              <div className="filter-section">
                <Nav
                  justify
                  variant="tabs"
                  activeKey={activeTab}
                  onSelect={handleSelect}
                >
                  <Nav.Item>
                    <Nav.Link eventKey="allStations">Tất cả trạm sạc</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="ACTIVE">Đang hoạt động</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="MAINTENANCE">Đang bảo trì</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="INACTIVE">Ngưng hoạt động</Nav.Link>
                  </Nav.Item>
                </Nav>

                <div style={{ marginTop: "15px" }}>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="🔍 Tìm kiếm theo tên, vị trí..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              {/* (Hết filter section) */}

              {/* Bảng nằm ngay bên dưới filter */}
              <Table className="custom-table">
                <thead>
                  <tr>
                    <th>TÊN</th>
                    <th>ĐỊA CHỈ</th>
                    <th>GIỜ HOẠT ĐỘNG</th>
                    <th>TRẠNG THÁI</th>
                    <th>THỜI LƯỢNG MỖI SLOT</th>
                    <th>NGÀY THÀNH LẬP</th>
                    <th style={{ width: "80px" }}>THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedStations.length > 0 ? (
                    displayedStations.map((station) => (
                      <tr key={station.stationId}>
                        <td>{station.stationName}</td>
                        <td>
                          <a
                            className="address-map-link"
                            href={`https://www.google.com/maps?q=${station.latitude},${station.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Xem chỉ đường trên bản đồ"
                          >
                            {station.address}
                          </a>
                        </td>
                        <td>{station.operatingHours}</td>
                        <td>
                          <span className={`status-badge ${station.status === "ACTIVE" ? "active" : station.status === "MAINTENANCE" ? "maintenance" : "inactive"}`}>
                            <span className="status-dot" />
                            {station.status === "ACTIVE"
                              ? "Đang hoạt động"
                              : station.status === "MAINTENANCE"
                                ? "Đang bảo trì"
                                : "Ngưng hoạt động"}
                          </span>
                        </td>
                        <td>
                          {(() => {
                            const min = slotConfigs.find(
                              (c) => c.stationId === station.stationId && c.isActive === "ACTIVE"
                            )?.slotDurationMin;
                            return min != null ? `${min} phút` : "Không xác định";
                          })()}
                        </td>
                        <td>{station.createdAt.split("T")[0]}</td>
                        <td>
                          <ActionMenu
                            actions={[
                              station.status !== "ACTIVE" && { label: "Kích hoạt", type: "success", onClick: () => handleStatusStation(station.stationId, "ACTIVE") },
                              station.status !== "MAINTENANCE" && { label: "Bảo trì", type: "warning", onClick: () => handleStatusStation(station.stationId, "MAINTENANCE") },
                              station.status !== "INACTIVE" && { label: "Ngưng hoạt động", type: "danger", onClick: () => handleStatusStation(station.stationId, "INACTIVE") },
                              { label: "Sửa thông tin", type: "default", onClick: () => handleUpdateStation(station) },
                              { label: "Cấu hình slot", type: "default", onClick: () => handleConfigSlotTime(station.stationId, slotConfigs.find((config) => config.stationId === station.stationId && config.isActive === "ACTIVE")) },
                            ].filter(Boolean)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        style={{ textAlign: "center", padding: "30px" }}
                      >
                        Không tìm thấy trạm sạc phù hợp với yêu cầu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
            {/* (Hết table-scroll-container) */}
          </div>
        </div>
      )}
    </>
  );
}
