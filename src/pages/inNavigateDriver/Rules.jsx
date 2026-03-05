import React, { useEffect, useState } from "react";
import { getPoliceListApi } from "../../api/policeApi.js";
import "./Rules.css";

export default function Rules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const data = await getPoliceListApi();
        setRules(Array.isArray(data?.data) ? data.data : []);
      } catch (error) {
        console.error("Failed to fetch rules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, []);

  return (
    <section className="rules-page">
      <div className="rules-header">
        <h1 className="rules-title">Quy định sử dụng hệ thống sạc EV</h1>
      </div>

      <div className="rules-table-wrap">
        <table className="rules-table">
          <thead>
            <tr>
              <th className="rules-cell rules-th rules-code-col">Mã quy định</th>
              <th className="rules-cell rules-th">Quy định</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="rules-cell" colSpan={2}>Đang tải danh sách quy định...</td>
              </tr>
            ) : rules.length === 0 ? (
              <tr>
                <td className="rules-cell" colSpan={2}>Chưa có quy định nào.</td>
              </tr>
            ) : (
              rules.map((rule) => (
                <tr key={rule.policyId || rule.policyName}>
                  <td className="rules-cell rules-code-cell">{rule.policyName}</td>
                  <td className="rules-cell">{rule.policyDescription}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="rules-note">
        <strong>Lưu ý:</strong> Mức phí phạt và thời lượng mỗi slot có thể khác nhau theo loại cổng sạc và cấu hình của từng trạm.
      </div>
    </section>
  );
}