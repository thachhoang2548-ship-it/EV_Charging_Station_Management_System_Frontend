import Nav from 'react-bootstrap/Nav';
import ActionMenu from '../../components/ActionMenu/ActionMenu.jsx';
import { useEffect, useState, useMemo } from 'react';
import Table from 'react-bootstrap/Table';
import './ManagementUser.css';
import Header from '../../components/admin/Header.jsx';
import {toast} from 'react-toastify';
import {getAllChargingPoints} from '../../api/chargingPointApi.js';
import { updateChargingPointStatus} from '../../api/chargingPointApi.js';
import AddChargingPointForm from '../../components/admin/AddChargingPointForm.jsx';
import UpdateChargingPointForm from '../../components/admin/UpdateChargingPointForm.jsx';

const statusChargingPoint = {
    available: 'AVAILABLE', 
    occupied: 'OCCUPIED', 
    maintenance: 'MAINTENANCE'
  };

export default function ManagementChargingPoint() { 
  const status = statusChargingPoint;
  const [activeTab, setActiveTab] = useState('allChargingPoints');
  const [chargingPoints, setChargingPoints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddChargingPointForm, setShowAddChargingPointForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedPointId, setSelectedPointId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  

  useEffect(() => {
    const fetchChargingPoints = async () => {
      try {
        const response = await getAllChargingPoints();
        if (response.success) {
          setChargingPoints(response.data);
          console.log('Fetched charging points:', response.data);
        }
      } catch (error) {
        console.error('Error fetching charging points:', error);
      }
    };

    fetchChargingPoints();
  }, [loading]); 

  const handleSelect = (selectedKey) => {
    setActiveTab(selectedKey);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleAddChargingPoint = () => {
    setShowAddChargingPointForm(true);
  };

  const handleSetLoading = () => {
    setLoading(pre => !pre);
  };

  const handleCloseForm = () => {
    setShowAddChargingPointForm(false);
    handleSetLoading(); 
  };

  // ✅ Mở form cập nhật trụ sạc
  const handleUpdateChargingPoint = (pointId) => {
    setSelectedPointId(pointId);
    setShowUpdateForm(true);
  };

  // ✅ Đóng form cập nhật
  const handleCloseUpdateForm = () => {
    setShowUpdateForm(false);
    setSelectedPointId(null);
    handleSetLoading(); // Refresh danh sách sau khi update
  };

  const handleStatusChargingPoint = async (chargingPointId, newStatus) => {
    const confirmChange = window.confirm(`Bạn có chắc chắn muốn thay đổi trạng thái trụ sạc này ?`);
    if (!confirmChange) return;

    try {
      console.log('Updating status for charging point:', chargingPointId, 'to', newStatus);
      const response = await updateChargingPointStatus(chargingPointId, newStatus);
      if (response.success) {
        setLoading(!loading); 
        toast.success('Cập nhật trạng thái trụ sạc thành công');
      }
    } catch (error) {
      toast.error('Cập nhật trạng thái trụ sạc thất bại');
      console.error('Error updating station status:', error);
    }
  };


  const totalChargingPoints = chargingPoints.length;
  const totalActive = chargingPoints.filter(s => s.status === status.available).length;
  const totalMaintenance = chargingPoints.filter(s => s.status === status.maintenance).length;
  const totalInactive = chargingPoints.filter(s => s.status === status.occupied).length;


  const displayedChargingPoints = useMemo(() => {
    let filtered = chargingPoints;

    // Lọc theo Tab
    if (activeTab === 'active') {
      // Logic cho tab "Đang hoạt động" (chỉ AVAILABLE)
      filtered = filtered.filter(cp => 
        cp.status === status.available
      );
    } else if (activeTab !== 'allChargingPoints') {
      // Logic cho các tab còn lại (MAINTENANCE, OUT_OF_SERVICE)
      filtered = filtered.filter(cp => cp.status === activeTab);
    }

    // Lọc theo Search (giữ nguyên)
    if (searchTerm) {
      filtered = filtered.filter(chargingPoint => 
        chargingPoint.pointNumber?.toLowerCase().includes(searchTerm) ||
        chargingPoint.stationName?.toLowerCase().includes(searchTerm) ||
        (
          (typeof chargingPoint.connectorType === 'string' && chargingPoint.connectorType.toLowerCase().includes(searchTerm)) ||
          (chargingPoint.connectorType?.name?.toLowerCase().includes(searchTerm))
        )
      );
    }

    return filtered;
  }, [chargingPoints, activeTab, searchTerm, status]);

  return (
    <>
      {showAddChargingPointForm && <AddChargingPointForm onClose={handleCloseForm} />}
      {showUpdateForm && (
        <UpdateChargingPointForm 
          pointId={selectedPointId} 
          onClose={handleCloseUpdateForm} 
        />
      )}
      {!showAddChargingPointForm && !showUpdateForm && (
        <div className="management-user-container">
          <Header />

          {/* Action Section */}
          <div className="action-section">
            <h2>Quản lý trụ sạc</h2>
            <button className="btn-add-staff" onClick={handleAddChargingPoint}>
              + Thêm trụ sạc
            </button>
          </div>

          {/* Statistics Section */}
          <ul className="statistics-section">
            <li className="stat-card">
              Tổng trụ sạc
              <strong>{totalChargingPoints}</strong>
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
            <div className="table-scroll-container">
              {/* Filter Section */}
              <div className="filter-section">
                <Nav justify variant="tabs" activeKey={activeTab} onSelect={handleSelect}>
                  <Nav.Item>
                    <Nav.Link eventKey="allChargingPoints">Tất cả trụ sạc</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="active">Đang hoạt động</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey={status.maintenance}>Đang bảo trì</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey={status.occupied}>Ngưng hoạt động</Nav.Link>
                  </Nav.Item>
                </Nav>

                <div style={{ marginTop: '15px' }}>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="🔍 Tìm kiếm theo tên, cổng, mã trụ sạc..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>

              <Table className="custom-table">
              <thead>
                <tr>
                  <th>MÃ TRỤ</th>
                  <th>TÊN TRẠM</th>
                  <th>TRẠNG THÁI</th>
                  <th>SỐ SERIAL</th>
                  <th>TÊN CỔNG SẠC</th>
                  <th>NĂNG LƯỢNG TỐI ĐA</th>
                  <th style={{ width: '160px', whiteSpace: 'nowrap' }}>NGÀY TẠO</th>
                  <th style={{ width: '220px' }}>HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody>
                {displayedChargingPoints.length > 0 ? (
                  displayedChargingPoints.map((point) => (
                    <tr key={point.pointId}>
                      <td>{point.pointNumber}</td>
                      <td>{point.stationName}</td>
                      <td>
                        {point.status === status.available ? (
                          <span className="status-badge active">
                            <span className="status-dot" />Đang hoạt động
                          </span>
                        ) : point.status === status.occupied ? (
                          <span className="status-badge inactive">
                            <span className="status-dot" />Ngưng hoạt động
                          </span>
                        ) : point.status === status.maintenance ? (
                          <span className="status-badge maintenance">
                            <span className="status-dot" />Đang bảo trì
                          </span>
                        ) : (
                          <span className="status-badge inactive">
                            <span className="status-dot" />Không xác định
                          </span>
                        )}
                      </td>
                      <td>{point.serialNumber}</td>
                      <td>{point.connectorType}</td>
                      <td>{point.maxPowerKW}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{point.createdAt?.split('T')[0]}</td>
                      <td>
                        <ActionMenu
                          actions={[
                            { label: "Cập nhật", type: "default", onClick: () => handleUpdateChargingPoint(point.pointId) },
                            point.status !== status.available    && { label: "Kích hoạt",       type: "success", onClick: () => handleStatusChargingPoint(point.pointId, status.available) },
                            point.status !== status.occupied     && { label: "Ngưng hoạt động", type: "danger",  onClick: () => handleStatusChargingPoint(point.pointId, status.occupied) },
                            point.status !== status.maintenance  && { label: "Bảo trì",         type: "warning", onClick: () => handleStatusChargingPoint(point.pointId, status.maintenance) },
                          ].filter(Boolean)}
                        />
                      </td>
                      
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '30px' }}>
                      Không tìm thấy trụ sạc phù hợp với yêu cầu.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}