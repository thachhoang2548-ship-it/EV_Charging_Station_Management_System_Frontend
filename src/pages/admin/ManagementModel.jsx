
import Nav from 'react-bootstrap/Nav';
import ActionMenu from '../../components/ActionMenu/ActionMenu.jsx';
import { useEffect, useState, useMemo } from 'react';
import Table from 'react-bootstrap/Table';
import './ManagementUser.css';
import Header from '../../components/admin/Header.jsx';
import {toast} from 'react-toastify';
import {getAllVehicleModels, changeStatusModelApi } from '../../api/modelVehicleApi.js';
import VehicleModelForm from '../../components/admin/VehicleModelForm.jsx';
import { showConfirm } from '../../utils/alertUtils.js';




export default function ManagementModel() { 
  const [activeTab, setActiveTab] = useState('allModels');
  const [models, setModels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showVehicleModelForm, setShowVehicleModelForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  
  

  useEffect(() => {
    const fetchVehicleModels = async () => {
      try {
        const response = await getAllVehicleModels();
        if (response.success) {
          setModels(response.data);
          console.log('Fetched vehicle models:', response.data);
        }
      } catch (error) {
        console.error('Error fetching vehicle models:', error);
      }
    };

    fetchVehicleModels();
  }, [loading]);

  const handleSelect = (selectedKey) => {
    setActiveTab(selectedKey);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleAddVehicleModel = () => {
    setShowVehicleModelForm(true);
  };


  const handleCloseForm = () => {
    setShowVehicleModelForm(false);
    setLoading(pre => !pre);
    setSelectedModel(null);
  };

  const handleStatusModel = async (modelId, newStatus) => {
    const confirm = await showConfirm('Bạn có chắc chắn muốn thay đổi trạng thái mẫu xe này không?', 'Xác nhận thay đổi trạng thái');
    if (!confirm) return;
    try {
      const response = await changeStatusModelApi(modelId, newStatus);
      if (response.success) {
        toast.success('Cập nhật trạng thái mẫu xe thành công!');
        setLoading(pre => !pre);
      } else {
        toast.error('Cập nhật trạng thái mẫu xe thất bại: ' + response.message);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái mẫu xe:', error);
    }
  };

  const handleEditModel = (model) => {
    setSelectedModel(model);
    setShowVehicleModelForm(true);
  }



// Thống kê
  const totalModels = models.length;
  const totalActive = models.filter(s => s.status === 'ACTIVE' ).length;
  const totalInactive = models.filter(s => s.status === 'INACTIVE').length;


  const displayedModels = useMemo(() => {
    let filtered = models;

    if (activeTab !== 'allModels') {
      filtered = filtered.filter(cp => cp.status === activeTab);
    }

    // Lọc theo Search 
    if (searchTerm) {
      filtered = filtered.filter(model => 
        model.brand?.toLowerCase().includes(searchTerm) ||
        model.model?.toLowerCase().includes(searchTerm) ||
        model.year?.toLowerCase().includes(searchTerm) ||
        model.connectorTypeCode?.toLowerCase().includes(searchTerm) ||
        model.connectorTypeDisplayName?.toLowerCase().includes(searchTerm) ||
        model.batteryCapacityKWh?.toString().toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [models, activeTab, searchTerm]);

  return (
    <>
      {showVehicleModelForm && <VehicleModelForm onClose={handleCloseForm} model={selectedModel} />}
      {!showVehicleModelForm && (
        <div className="management-user-container">
          <Header />

          {/* Action Section */}
          <div className="action-section">
            <h2>Quản lý mẫu xe hệ thống</h2>
            <button className="btn-add-staff" onClick={handleAddVehicleModel}>
              + Thêm mẫu xe
            </button>
          </div>

          {/* Statistics Section */}
          <ul className="statistics-section">
            <li className="stat-card">
              Tổng mẫu xe
              <strong>{totalModels}</strong>
            </li>
            <li className="stat-card">
              Đang hoạt động
              <strong>{totalActive}</strong>
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
                    <Nav.Link eventKey="allModels">Tất cả mẫu xe</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="ACTIVE">Đang hoạt động</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey={'INACTIVE'}>Ngưng hoạt động</Nav.Link>
                  </Nav.Item>
                </Nav>

                <div style={{ marginTop: '15px' }}>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="🔍 Tìm kiếm theo tên, cổng, hãng, năm,..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>

              <Table className="custom-table">
              <thead>
                <tr>
                  <th>ẢNH MÔ TẢ</th>
                  <th>HÃNG</th>
                  <th>PHÂN LOẠI</th>
                  <th>NĂM XUẤT HÀNH</th>
                  <th>CỔNG SẠC</th>
                  <th>DUNG TÍCH</th>
                  <th>TRẠNG THÁI</th>
                  <th style={{ width: '160px' }}>HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody>
                {displayedModels.length > 0 ? (
                  displayedModels.map((model) => (
                    <tr key={model.modelId}>
                      <td>
                        <img 
                          src={model.imageUrl} 
                          alt={model.model} 
                          style={{ width: '100px', height: '60px', objectFit: 'cover', borderRadius: '5px' }} 
                        />
                      </td>
                      <td>{model.brand}</td>
                      <td>{model.model}</td>
                      <td>{model.year}</td>
                      <td>{model.connectorTypeDisplayName}</td>
                      <td>{model.batteryCapacityKWh} kWh</td>
                      <td>
                        {model.status === 'ACTIVE' ? (
                          <span className="status-badge active">
                            <span className="status-dot" />Đang hoạt động
                          </span>
                        ) : (
                          <span className="status-badge inactive">
                            <span className="status-dot" />Ngưng phục vụ
                          </span>
                        )}
                      </td>
                      <td>
                        <ActionMenu
                          actions={[
                            model.status === 'ACTIVE'   && { label: "Ngưng phục vụ", type: "danger",  onClick: () => handleStatusModel(model.modelId, 'INACTIVE') },
                            model.status === 'INACTIVE' && { label: "Kích hoạt",     type: "success", onClick: () => handleStatusModel(model.modelId, 'ACTIVE') },
                            { label: "Sửa thông tin", type: "default", onClick: () => handleEditModel(model) },
                          ].filter(Boolean)}
                        />
                      </td>
                      
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>
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