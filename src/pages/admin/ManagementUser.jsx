import Nav from "react-bootstrap/Nav";
import ActionMenu from "../../components/ActionMenu/ActionMenu.jsx";
import { useEffect, useState, useMemo } from "react";
import {
  getAllUsersApi,
  statusStaffApi,
  unbanDriverApi,
  getStaffs_UserApi,
  getStaffs_StationApi,
} from "../../api/admin.js";
import { getAllStations } from "../../api/stationApi.js";
import Table from "react-bootstrap/Table";
import AddStaffForm from "../../components/admin/AddStaffForm.jsx";
import { useNavigate } from "react-router-dom";
import paths from "../../path/paths.jsx";
import "./ManagementUser.css";
import Header from "../../components/admin/Header.jsx";
import SelectStationForm from "../../components/admin/SelectStationForm.jsx";
import { toast } from "react-toastify";
import { showConfirm, showSuccess, showError } from '../../utils/alertUtils.js';

export default function ManagementUser() {
  const navigator = useNavigate();
  const user = JSON.parse(localStorage.getItem("userDetails"));
  if (!user) {
    navigator(paths.login);
  }

  const [activeTab, setActiveTab] = useState("allUsers");
  const [usersList, setUsersList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);
  const [showSelectStationForm, setShowSelectStationForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffsUserData, setStaffsUserData] = useState([]);
  const [staffsStationData, setStaffsStationData] = useState([]);
  const [stations, setStations] = useState([]);
  const [isLoadingTransfer, setIsLoadingTransfer] = useState(false);
  const [detailUser, setDetailUser] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        console.log("Starting to fetch all data...");

        const [
          usersResponse,
          staffsUserResponse,
          staffsStationResponse,
          stationsResponse,
        ] = await Promise.all([
          getAllUsersApi(),
          getStaffs_UserApi(),
          getStaffs_StationApi(),
          getAllStations(),
        ]);

        if (usersResponse.success) {
          setUsersList(usersResponse.data);
        } else {
          console.error("Failed to fetch users");
        }

        if (staffsUserResponse.success) {
          setStaffsUserData(staffsUserResponse.data);
          console.log("Fetched staffs-user data:", staffsUserResponse.data);
        } else {
          console.error("Failed to fetch staffs-user data");
        }

        if (staffsStationResponse.success) {
          setStaffsStationData(staffsStationResponse.data);
          console.log(
            "Fetched staffs-station data:",
            staffsStationResponse.data,
          );
        } else {
          console.error("Failed to fetch staffs-station data");
        }

        if (stationsResponse.success) {
          setStations(stationsResponse.data);
          console.log("Fetched stations data:", stationsResponse.data);
        } else {
          console.error("Failed to fetch stations");
        }

        console.log("All data fetched and state updated.");
      } catch (error) {
        console.error("Error fetching data with Promise.all:", error);
      }
    };
    fetchAllData();
  }, [loading]);

  const handleSelect = (selectedKey) => {
    setActiveTab(selectedKey);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleAddStaff = () => {
    setShowAddStaffForm(true);
  };

  const handleCloseForm = () => {
    setShowAddStaffForm(false);
    setShowSelectStationForm(false);
    setSelectedStaff(null);
  };

  const handleActionSuccess = () => {
    setShowAddStaffForm(false);
    setShowSelectStationForm(false);
    setSelectedStaff(null);

    setTimeout(() => {
      setLoading((pre) => !pre);
      console.log("Refetching data after success...");
    }, 1000);
  };

  const totalUsers = usersList.length;
  const totalStaff = usersList.filter((u) => u.roleName === "STAFF").length;
  const totalDrivers = usersList.filter((u) => u.roleName === "DRIVER").length;

  const displayedUsers = useMemo(() => {
    let filtered = usersList;

    if (activeTab !== "allUsers") {
      filtered = filtered.filter(
        (user) => user.roleName === activeTab.toUpperCase(),
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm) ||
          user.phoneNumber?.includes(searchTerm),
      );
    }

    return filtered;
  }, [usersList, activeTab, searchTerm]);

  const getStationNameByUserId = (userId) => {
    try {
      const staffUser = staffsUserData.find((su) => su.userId === userId);
      if (!staffUser || !staffUser.staffId) return null;

      const staffStation = staffsStationData.find(
        (ss) => ss.staffId === staffUser.staffId,
      );
      if (!staffStation || !staffStation.stationId) return null;

      const station = stations.find(
        (s) => s.stationId === staffStation.stationId,
      );
      return station ? station.stationName : null;
    } catch (e) {
      console.error("Error finding station name:", e);
      return null;
    }
  };

  const handleStatusStaff = async (staffId, status) => {
    const confirmed = await showConfirm(
      `Bạn có chắc chắn muốn ${status === "BANNED" ? "xóa" : "kích hoạt lại"} nhân viên này?`,
      'Xác nhận'
    );
    if (confirmed) {
      const response = await statusStaffApi(staffId, status);
      if (response.success) {
        await showSuccess(
          `${status === "BANNED" ? "Nghỉ việc" : "Kích hoạt lại"} nhân viên có id ${staffId} thành công`
        );
        setLoading((pre) => !pre);
      } else {
        await showError(
          `${status === "BANNED" ? "Nghỉ việc" : "Kích hoạt lại"} nhân viên có id ${staffId} thất bại`
        );
      }
    }
  };

  const handleTransferStaff = async (staff) => {
    try {
      setIsLoadingTransfer(true);
      toast.info("Đang tải thông tin trạm...");

      const [staffsStationResponse, stationsResponse] = await Promise.all([
        getStaffs_StationApi(),
        getAllStations(),
      ]);

      if (staffsStationResponse.success && stationsResponse.success) {
        setStaffsStationData(staffsStationResponse.data);
        setStations(stationsResponse.data);

        console.log(
          "Refreshed staffs-station data:",
          staffsStationResponse.data,
        );
        console.log("Refreshed stations data:", stationsResponse.data);

        setSelectedStaff(staff);
        setShowSelectStationForm(true);
        toast.success("Sẵn sàng chuyển công tác");
      } else {
        toast.error("Không thể tải thông tin trạm");
      }
    } catch (error) {
      console.error("Error loading station data:", error);
      toast.error("Lỗi khi tải dữ liệu, vui lòng thử lại");
    } finally {
      setIsLoadingTransfer(false);
    }
  };

  const handleDriverUnblock = async (driverId) => {
    const confirmed = await showConfirm(
      "Bạn có chắc chắn muốn gỡ lệnh khóa tài khoản tài xế này?",
      'Xác nhận'
    );
    if (confirmed) {
      const response = await unbanDriverApi(driverId);
      if (response.success) {
        await showSuccess(`Gỡ lệnh khóa tài khoản tài xế có id ${driverId} thành công`);
        setLoading((pre) => !pre);
      } else {
        await showError(`Gỡ lệnh khóa tài khoản tài xế có id ${driverId} thất bại`);
      }
    }
  };

  return (
    <>
      {showSelectStationForm && (
        <SelectStationForm
          onClose={handleCloseForm}
          onAddSuccess={handleActionSuccess}
          staff={selectedStaff}
          stations={stations}
          staffsStationData={staffsStationData}
        />
      )}
      {showAddStaffForm && (
        <AddStaffForm
          onClose={handleCloseForm}
          onAddSuccess={handleActionSuccess}
        />
      )}
      {!showAddStaffForm && !showSelectStationForm && (
        <div className="management-user-container">
          <Header />

          <div className="action-section">
            <h2>Quản lý người dùng</h2>
            <button className="btn-add-staff" onClick={handleAddStaff}>
              + Thêm nhân viên
            </button>
          </div>

          <ul className="statistics-section">
            <li className="stat-card">
              Tổng người dùng
              <strong>{totalUsers}</strong>
            </li>
            <li className="stat-card">
              Tổng nhân viên
              <strong>{totalStaff}</strong>
            </li>
            <li className="stat-card">
              Tổng tài xế
              <strong>{totalDrivers}</strong>
            </li>
          </ul>

          <div className="table-section">
            <div className="table-scroll-container">
              <div className="filter-section">
                <Nav
                  justify
                  variant="tabs"
                  activeKey={activeTab}
                  onSelect={handleSelect}
                >
                  <Nav.Item>
                    <Nav.Link eventKey="allUsers">Tất cả người dùng</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="ADMIN">Quản trị viên</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="STAFF">Nhân viên</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="DRIVER">Tài xế</Nav.Link>
                  </Nav.Item>
                </Nav>

                <div style={{ marginTop: "5px" }}>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="🔍 Tìm kiếm theo tên, email, số điện thoại..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>

              <Table className="custom-table">
                <thead>
                  <tr>
                    <th>NGƯỜI DÙNG</th>
                    <th>SỐ ĐIỆN THOẠI</th>
                    <th>EMAIL</th>
                    <th>THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedUsers.length > 0 ? (
                    displayedUsers.map((user, index) => {
                      const staffRecord =
                        user.roleName === "STAFF"
                          ? staffsUserData.find((s) => s.userId === user.userId)
                          : null;

                      const stationName = staffRecord
                        ? getStationNameByUserId(user.userId)
                        : null;

                      return (
                        <tr key={user.phoneNumber || index}>
                          <td>
                            <div className="user-cell">
                              <span className="user-cell-name">{user.name}</span>
                              <span className={`role-badge ${user.roleName.toLowerCase()}`}>
                                {user.roleName === "STAFF"
                                  ? "Nhân viên"
                                  : user.roleName === "ADMIN"
                                  ? "Quản trị viên"
                                  : "Tài xế"}
                                {stationName && (
                                  <span className="role-station"> · {stationName}</span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td>{user.phoneNumber}</td>
                          <td>{user.email}</td>
                          <td>
                            <ActionMenu
                              actions={[
                                {
                                  label: "Xem chi tiết",
                                  type: "default",
                                  onClick: () => setDetailUser(user),
                                },
                                user.roleName === "STAFF" && user.status === "ACTIVE" && {
                                  label: "Nghỉ việc", type: "danger",
                                  onClick: () => handleStatusStaff(user.userId, "BANNED"),
                                },
                                user.roleName === "STAFF" && user.status === "ACTIVE" && {
                                  label: isLoadingTransfer ? "Đang tải..." : "Chuyển công tác",
                                  type: "warning",
                                  disabled: isLoadingTransfer || !staffRecord,
                                  title: !staffRecord ? "Không tìm thấy dữ liệu staff" : undefined,
                                  onClick: () => handleTransferStaff(staffRecord),
                                },
                                user.roleName === "STAFF" && user.status === "BANNED" && {
                                  label: "Quay lại làm việc", type: "success",
                                  onClick: () => handleStatusStaff(user.userId, "ACTIVE"),
                                },
                                user.roleName === "DRIVER" && user.status === "BANNED" && {
                                  label: "Gỡ lệnh khóa tài khoản", type: "success",
                                  onClick: () => handleDriverUnblock(user.userId),
                                },
                              ].filter(Boolean)}
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        style={{ textAlign: "center", padding: "30px" }}
                      >
                        Không tìm thấy người dùng phù hợp với yêu cầu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      )}
      {detailUser && (
        <div className="user-detail-overlay" onClick={() => setDetailUser(null)}>
          <div className="user-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="user-detail-header">
              <h3>Thông tin người dùng</h3>
              <button onClick={() => setDetailUser(null)}>✕</button>
            </div>
            <div className="user-detail-body">
              <div className="user-detail-row">
                <span>Họ tên</span>
                <strong>{detailUser.name}</strong>
              </div>
              <div className="user-detail-row">
                <span>Vai trò</span>
                <strong>
                  {detailUser.roleName === "STAFF"
                    ? "Nhân viên"
                    : detailUser.roleName === "ADMIN"
                    ? "Quản trị viên"
                    : "Tài xế"}
                </strong>
              </div>
              <div className="user-detail-row">
                <span>Trạng thái</span>
                <strong>{detailUser.status === "ACTIVE" ? "Đang hoạt động" : "Đã bị khóa"}</strong>
              </div>
              <div className="user-detail-row">
                <span>Số điện thoại</span>
                <strong>{detailUser.phoneNumber || "—"}</strong>
              </div>
              <div className="user-detail-row">
                <span>Email</span>
                <strong>{detailUser.email || "—"}</strong>
              </div>
              <div className="user-detail-row">
                <span>Địa chỉ</span>
                <strong>{detailUser.address || "—"}</strong>
              </div>
              <div className="user-detail-row">
                <span>Ngày sinh</span>
                <strong>{detailUser.dateOfBirth || "—"}</strong>
              </div>
              <div className="user-detail-row">
                <span>Giới tính</span>
                <strong>{detailUser.gender === "M" ? "Nam" : detailUser.gender === "F" ? "Nữ" : "—"}</strong>
              </div>
              {detailUser.roleName === "STAFF" && (() => {
                const sName = getStationNameByUserId(detailUser.userId);
                return (
                  <div className="user-detail-row">
                    <span>Trạm làm việc</span>
                    <strong>{sName || "Chưa gán trạm"}</strong>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
