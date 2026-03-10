import Nav from 'react-bootstrap/Nav';
import { useEffect, useState, useMemo } from 'react';
import { getPoliceListApi, deletePoliceApi } from '../../api/policeApi.js';
import Table from 'react-bootstrap/Table';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import paths from '../../path/paths.jsx';
import Header from '../../components/admin/Header.jsx';
import AddPolicyForm from '../../components/admin/AddPolicyForm.jsx';
import './ManagementUser.css';
import { showDeleteConfirm } from '../../utils/alertUtils.js';

export default function Policy() {
  const navigator = useNavigate();
  const user = JSON.parse(localStorage.getItem('userDetails'));
  if (!user) {
    navigator(paths.login);
  }

  const [policies, setPolicies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPolicyForm, setShowAddPolicyForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await getPoliceListApi();
        if (response.success) {
          setPolicies(response.data);
          console.log('Fetched policies:', response.data);
        }
      } catch (error) {
        console.error('Error fetching policies:', error);
        toast.error('Không thể tải danh sách điều khoản');
      }
    };
    fetchPolicies();
  }, [loading]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleAddPolicy = () => {
    setSelectedPolicy(null);
    setShowAddPolicyForm(true);
  };

  const handleCloseForm = () => {
    setShowAddPolicyForm(false);
    setSelectedPolicy(null);
  };

  const handleDeletePolicy = async (policyId) => {
    const confirmDelete = await showDeleteConfirm('điều khoản này');
    if (!confirmDelete) return;
    
    try {
      const response = await deletePoliceApi(policyId);
      if (response.success) {
        setLoading(!loading);
        toast.success('Xóa điều khoản thành công');
      } else {
        toast.error('Xóa điều khoản thất bại');
      }
    } catch (error) {
      toast.error('Xóa điều khoản thất bại');
      console.error('Error deleting policy:', error);
    }
  };

  const handleUpdatePolicy = (policy) => {
    setSelectedPolicy(policy);
    setShowAddPolicyForm(true);
  };

  const handleSetLoading = () => {
    setLoading(pre => !pre);
    setSelectedPolicy(null);
    setShowAddPolicyForm(false);
  };

  const totalPolicies = policies.length;

  const displayedPolicies = useMemo(() => {
    let filtered = policies;

    if (searchTerm) {
      filtered = filtered.filter(policy => 
        policy.policyName?.toLowerCase().includes(searchTerm) ||
        policy.policyDescription?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [policies, searchTerm]);

  return (
    <>
      {showAddPolicyForm && (
        <AddPolicyForm 
          onClose={handleCloseForm} 
          onAddSuccess={handleSetLoading} 
          policy={selectedPolicy} 
        />
      )}
      {!showAddPolicyForm && (
        <div className="management-user-container">
          <Header />

          <div className="action-section">
            <h2>Quản lý điều khoản</h2>
            <button className="btn-add-staff" onClick={handleAddPolicy}>
              + Thêm điều khoản
            </button>
          </div>

          <ul className="statistics-section">
            <li className="stat-card">
              Tổng số điều khoản
              <strong>{totalPolicies}</strong>
            </li>
          </ul>

          <div className="table-section">
            <div className="table-scroll-container">
              
              <div className="filter-section">
                <div style={{ marginTop: '15px' }}>
                  <input 
                    type="text"
                    className="search-input"
                    placeholder="🔍 Tìm kiếm theo mã hoặc nội dung..." 
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>

              <Table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: '150px' }}>MÃ ĐIỀU KHOẢN</th>
                    <th>NỘI DUNG</th>
                    <th style={{ width: '200px' }}>HÀNH ĐỘNG</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedPolicies.length > 0 ? (
                    displayedPolicies.map((policy) => (
                      <tr key={policy.policyId}>
                        <td>{policy.policyName}</td>
                        <td style={{ textAlign: 'left', padding: '15px' }}>
                          {policy.policyDescription}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-edit" 
                              onClick={() => handleUpdatePolicy(policy)}
                            >
                              Sửa
                            </button>
                            <button 
                              className="btn-delete" 
                              onClick={() => handleDeletePolicy(policy.policyId)}
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '30px' }}>
                        Không tìm thấy điều khoản phù hợp với yêu cầu.
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
