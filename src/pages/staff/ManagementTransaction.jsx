import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Nav from "react-bootstrap/Nav";
import Table from "react-bootstrap/Table";
import {
  getStationTransactionsApi,
  getStationTransactionStatsApi,
  getStationInvoicesApi,
  getMyStationApi,
  getInvoiceDetailApi,
  payInvoiceApi,
} from "../../api/staffApi.js";
import Header from "../../components/admin/Header.jsx";
import "../admin/ManagementUser.css";
import "../../components/admin/AddStaffForm.css";
import { showConfirm } from "../../utils/alertUtils.js";

export default function ManagementTransaction() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState({
    cashRevenue: 0,
    vnpayRevenue: 0,
    cashCount: 0,
    vnpayCount: 0,
  }); // ✅ Thống kê theo phương thức thanh toán
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null); // null = ALL, COMPLETED, PENDING, FAILED
  const [searchTerm, setSearchTerm] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [myStation, setMyStation] = useState(null);
  const [payingInvoiceId, setPayingInvoiceId] = useState(null);

  useEffect(() => {
    const initData = async () => {
      await fetchMyStation();
      await fetchStats();
    };
    initData();
  }, []);

  const fetchMyStation = async () => {
    try {
      const response = await getMyStationApi();
      console.log("✅ Full API response:", response);
      console.log("✅ Response.data:", response.data);

      // API trả về array, lấy phần tử đầu tiên
      const stationData = Array.isArray(response.data)
        ? response.data[0]
        : response.data;
      console.log("✅ StationData:", stationData);

      if (stationData?.station) {
        console.log("✅ Station object:", stationData.station);
        console.log("✅ Station ID:", stationData.station.stationId);
        setMyStation(stationData.station);
      } else if (stationData?.stationId) {
        // Trường hợp data trực tiếp là station object
        console.log("✅ Direct station data:", stationData);
        setMyStation(stationData);
      } else {
        console.error("❌ Không tìm thấy thông tin station trong response");
        console.error(
          "❌ Response structure:",
          JSON.stringify(response.data, null, 2),
        );
        toast.error("Không tìm thấy trạm được phân công");
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy thông tin trạm:", error);
      console.error("❌ Error details:", error.response?.data);
      toast.error("Không thể tải thông tin trạm");
    }
  };

  // ✅ Auto-refresh stats mỗi 15s
  useEffect(() => {
    const statsInterval = setInterval(() => {
      console.log("🔄 Auto-refreshing stats...");
      fetchStats();
    }, 15000); // 15 seconds

    return () => clearInterval(statsInterval);
  }, []);

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchStats = async () => {
    try {
      const response = await getStationTransactionStatsApi();
      setStats(response.data);
      console.log("✅ Thống kê giao dịch:", response.data);
    } catch (error) {
      console.error("Lỗi khi tải thống kê:", error);
      toast.error("Không thể tải thống kê giao dịch");
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      console.log("📡 Fetching transactions with filter:", filter);

      const response = await getStationTransactionsApi({
        status: filter,
      });

      console.log("✅ Transactions response:", response);
      console.log("✅ Response.data:", response.data);

      const txList = response.data.content || response.data || response || [];
      console.log("✅ Parsed txList:", txList);
      console.log("✅ Total transactions:", txList.length);

      setTransactions(txList);

      // ✅ Tính toán thống kê theo payment method (Cash vs VNPay)
      calculatePaymentStats(txList);
    } catch (error) {
      console.error("❌ Lỗi khi tải giao dịch:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error message:", error.message);
      toast.error("Không thể tải danh sách giao dịch");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Tính toán doanh thu theo phương thức thanh toán
  const calculatePaymentStats = (txList) => {
    let cashRevenue = 0;
    let vnpayRevenue = 0;
    let cashCount = 0;
    let vnpayCount = 0;

    txList.forEach((tx) => {
      // Chỉ tính các giao dịch COMPLETED
      console.log(tx);
      if (tx.status === "COMPLETED") {
        // Backend có thể trả về paymentMethodName hoặc description chứa thông tin
        // Giả định: nếu description chứa "VNPay" hoặc "VNPAY" → VNPay, còn lại → Cash
        const isVNPay =
          tx.description?.toUpperCase().includes("VNPAY") ||
          tx.description?.toUpperCase().includes("VN PAY");

        if (isVNPay) {
          vnpayRevenue += tx.amount || 0;
          vnpayCount++;
        } else {
          // Mặc định coi là Cash (EVM)
          cashRevenue += tx.amount || 0;
          cashCount++;
        }
      }
    });

    setPaymentStats({
      cashRevenue,
      vnpayRevenue,
      cashCount,
      vnpayCount,
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case "COMPLETED":
        return "Hoàn tất";
      case "FAILED":
        return "Thất bại";
      case "PENDING":
        return "Đang xử lý";
      default:
        return status;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const fetchInvoices = async () => {
    console.log("🔍 Checking myStation:", myStation);
    console.log("🔍 myStation.stationId:", myStation?.stationId);

    if (!myStation?.stationId) {
      console.error("⚠️ myStation is null or missing stationId");
      console.error("⚠️ myStation value:", myStation);
      toast.warning("Đang tải thông tin trạm, vui lòng thử lại sau ít giây...");
      return;
    }

    try {
      setLoadingInvoices(true);
      const stationId = myStation.stationId;
      console.log("📡 Fetching invoices for stationId:", stationId);
      console.log(
        "📡 API URL will be: /api/invoice/station/" + stationId + "/details",
      );

      const response = await getStationInvoicesApi(stationId);
      console.log("✅ Invoices response:", response);
      console.log("✅ Invoices data:", response.data);

      // Chỉ hiển thị hóa đơn chưa thanh toán
      const unpaidInvoices = (response.data || []).filter(
        (inv) => inv.status === "UNPAID",
      );
      console.log("✅ Unpaid invoices:", unpaidInvoices);

      setInvoices(unpaidInvoices);
      setShowInvoiceModal(true);
    } catch (error) {
      console.error("❌ Lỗi khi tải hóa đơn:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error message:", error.message);
      toast.error(
        "Không thể tải danh sách hóa đơn: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setLoadingInvoices(false);
    }
  };

  const getInvoiceStatusText = (status) => {
    return status === "PAID" ? "Đã thanh toán" : "Chưa thanh toán";
  };

  const getInvoiceStatusStyle = (status) => {
    return {
      padding: "5px 10px",
      borderRadius: "5px",
      backgroundColor: status === "PAID" ? "#d4edda" : "#f8d7da",
      color: status === "PAID" ? "#155724" : "#721c24",
      fontWeight: "500",
    };
  };

  const handlePayInvoice = async (invoiceId) => {
    if (
      !(await showConfirm(
        `Xác nhận thanh toán hóa đơn #${invoiceId}?`,
        "Xác nhận thanh toán",
      ))
    ) {
      return;
    }

    try {
      setPayingInvoiceId(invoiceId);
      console.log("💳 Bắt đầu thanh toán hóa đơn #", invoiceId);

      // Bước 1: Lấy chi tiết hóa đơn
      console.log("📡 Lấy chi tiết hóa đơn...");
      const detailResponse = await getInvoiceDetailApi(invoiceId);
      console.log("✅ Chi tiết hóa đơn:", detailResponse.data);

      // Bước 2: Thanh toán hóa đơn
      console.log("📡 Gọi API thanh toán...");
      const payResponse = await payInvoiceApi(invoiceId);
      console.log("✅ Kết quả thanh toán:", payResponse.data);

      toast.success(`Thanh toán hóa đơn #${invoiceId} thành công!`);

      // Bước 3: Cập nhật lại danh sách hóa đơn
      console.log("🔄 Cập nhật lại danh sách hóa đơn...");
      await fetchInvoices();
    } catch (error) {
      console.error("❌ Lỗi khi thanh toán hóa đơn:", error);
      console.error("❌ Error response:", error.response?.data);
      toast.error(
        "Thanh toán thất bại: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setPayingInvoiceId(null);
    }
  };

  // Filter by search term (client-side for current page)
  const filteredTransactions = transactions.filter(
    (t) =>
      searchTerm === "" ||
      t.transactionId.toString().includes(searchTerm) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.vehiclePlate?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="management-user-container">
      <Header />
      {/* Action Section */}
      <div className="action-section">
        <h2>Quản lý giao dịch</h2>
      </div>

      {/* Statistics Section */}
      {stats && (
        <ul className="statistics-section">
          <li className="stat-card">
            Tổng giao dịch
            <strong>{stats.totalTransactions}</strong>
          </li>
          <li className="stat-card">
            Hoàn tất
            <strong>{stats.completedTransactions}</strong>
          </li>
          <li className="stat-card">
            Đang xử lý
            <strong>{stats.pendingTransactions}</strong>
          </li>
          <li className="stat-card">
            Thất bại
            <strong>{stats.failedTransactions}</strong>
          </li>
          <li className="stat-card">
            Doanh thu
            <strong>{formatCurrency(stats.totalRevenue)}</strong>
          </li>

          {/* ✅ Phân loại theo phương thức thanh toán */}
          <li className="stat-card" style={{ backgroundColor: "#e8f5e9" }}>
            💵 Tiền mặt (Cash)
            <strong>{formatCurrency(paymentStats.cashRevenue)}</strong>
            <small style={{ fontSize: "0.85em", color: "#666" }}>
              {paymentStats.cashCount} giao dịch
            </small>
          </li>
          <li className="stat-card" style={{ backgroundColor: "#e3f2fd" }}>
            💳 VNPay
            <strong>{formatCurrency(paymentStats.vnpayRevenue)}</strong>
            <small style={{ fontSize: "0.85em", color: "#666" }}>
              {paymentStats.vnpayCount} giao dịch
            </small>
          </li>
        </ul>
      )}

      {/* Table Section */}
      <div className="table-section">
        <div className="table-scroll-container">
          {/* Filter Section */}
          <div className="filter-section">
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Nav
                justify
                variant="tabs"
                activeKey={filter || "all"}
                onSelect={(k) => handleFilterChange(k === "all" ? null : k)}
                style={{ flex: 1 }}
              >
                <Nav.Item>
                  <Nav.Link eventKey="all">Tất cả giao dịch</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="COMPLETED">Hoàn tất</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="PENDING">Đang xử lý</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="FAILED">Thất bại</Nav.Link>
                </Nav.Item>
              </Nav>

              <button
                onClick={fetchInvoices}
                className="btn"
                style={{
                  backgroundColor: "#fff3e0",
                  color: "#e65100",
                  border: "1px solid #e65100",
                  padding: "8px 20px",
                  borderRadius: "5px",
                  fontWeight: "500",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#e65100";
                  e.target.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#fff3e0";
                  e.target.style.color = "#e65100";
                }}
              >
                📄 Chưa thanh toán
              </button>
            </div>

            <div style={{ marginTop: "15px" }}>
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Tìm kiếm theo mã GD, biển số, mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Bảng */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "30px" }}>
              Đang tải...
            </div>
          ) : (
            <Table className="custom-table">
              <thead>
                <tr>
                  <th>MÃ GIAO DỊCH</th>
                  <th>THỜI GIAN</th>
                  <th>BIỂN SỐ XE</th>
                  <th>SỐ TIỀN</th>
                  <th>TRẠNG THÁI</th>
                  <th>MÔ TẢ</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.transactionId}>
                      <td>#{tx.transactionId}</td>
                      <td>{formatDateTime(tx.createdAt)}</td>
                      <td>{tx.vehiclePlate}</td>
                      <td>{formatCurrency(tx.amount)}</td>
                      <td>{getStatusText(tx.status)}</td>
                      <td>{tx.description || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ textAlign: "center", padding: "30px" }}
                    >
                      Không tìm thấy giao dịch phù hợp với yêu cầu.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </div>
      </div>

      {/* Modal hiển thị hóa đơn */}
      {showInvoiceModal && (
        <div className="form-overlay">
          <div className="form-container" style={{ maxWidth: "1100px" }}>
            <div className="add-staff-form">
              {/* Header */}
              <div className="form-header">
                <h4 className="form-title">📄 Hóa đơn chưa thanh toán</h4>
              </div>

              {/* Thống kê nhanh */}
              {invoices.length > 0 && (
                <div className="form-section">
                  <h6 className="section-title">📊 Thống kê</h6>
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <label className="form-label">Tổng số hóa đơn</label>
                      <div
                        className="form-control"
                        style={{
                          backgroundColor: "#f9fafb",
                          cursor: "default",
                          fontWeight: 600,
                        }}
                      >
                        {invoices.length}
                      </div>
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="form-label">
                        Tổng tiền cần thanh toán
                      </label>
                      <div
                        className="form-control"
                        style={{
                          backgroundColor: "#fef2f2",
                          cursor: "default",
                          fontWeight: 600,
                          color: "#d32f2f",
                        }}
                      >
                        {formatCurrency(
                          invoices.reduce((sum, i) => sum + (i.amount || 0), 0),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bảng hóa đơn */}
              <div className="form-section">
                <h6 className="section-title">🧾 Danh sách hóa đơn</h6>
                {loadingInvoices ? (
                  <div style={{ textAlign: "center", padding: "30px" }}>
                    Đang tải hóa đơn...
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <Table className="custom-table">
                      <thead>
                        <tr>
                          <th>Mã HĐ</th>
                          <th>Biển số xe</th>
                          <th>Trạm</th>
                          <th>Điểm sạc</th>
                          <th>Năng lượng (kWh)</th>
                          <th>Thời gian (phút)</th>
                          <th>Số tiền</th>
                          <th>Trạng thái</th>
                          <th>Ngày phát hành</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.length > 0 ? (
                          invoices.map((inv) => (
                            <tr key={inv.invoiceId}>
                              <td>#{inv.invoiceId}</td>
                              <td>{inv.vehiclePlate || "N/A"}</td>
                              <td>{inv.stationName || "N/A"}</td>
                              <td>{inv.pointNumber || "N/A"}</td>
                              <td>{inv.energyKWh?.toFixed(2) || "0.00"}</td>
                              <td>{inv.durationMinutes || 0}</td>
                              <td>{formatCurrency(inv.amount)}</td>
                              <td>
                                <span style={getInvoiceStatusStyle(inv.status)}>
                                  {inv.status === "PAID" ? "✅ " : "❌ "}
                                  {getInvoiceStatusText(inv.status)}
                                </span>
                              </td>
                              <td>{formatDateTime(inv.issuedAt)}</td>
                              <td>
                                {inv.status === "UNPAID" ? (
                                  <button
                                    onClick={() =>
                                      handlePayInvoice(inv.invoiceId)
                                    }
                                    disabled={payingInvoiceId === inv.invoiceId}
                                    className="btn-edit"
                                    style={{
                                      opacity:
                                        payingInvoiceId === inv.invoiceId
                                          ? 0.6
                                          : 1,
                                      cursor:
                                        payingInvoiceId === inv.invoiceId
                                          ? "not-allowed"
                                          : "pointer",
                                    }}
                                  >
                                    {payingInvoiceId === inv.invoiceId
                                      ? "Đang xử lý..."
                                      : "💳 Thanh toán"}
                                  </button>
                                ) : (
                                  <span
                                    style={{
                                      color: "#16a34a",
                                      fontWeight: "600",
                                    }}
                                  >
                                    ✓ Đã thanh toán
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="10"
                              style={{ textAlign: "center", padding: "30px" }}
                            >
                              Không có hóa đơn nào chưa thanh toán.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Nút đóng */}
              <div className="form-button-group">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowInvoiceModal(false)}
                >
                  ← Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
