import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfileApi } from '../../api/driverApi.js';
import Header from '../../components/admin/Header.jsx';
import FormProfile from '../../components/admin/FormChangePassword.jsx';
import '../admin/Dashboard.css';
import './Information.css';
import man from '../../assets/icon/man.png';
import girl from '../../assets/icon/girl.png';
import {
  ArrowLeft, Pencil, Lock, Mail, MapPin, Phone,
  CalendarDays, UserCircle, ShieldCheck, Contact, Fingerprint
} from 'lucide-react';

export default function Information() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formProfile, setFormProfile] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            const response = await getProfileApi();
            if (response.success) {
                setProfile(response.data);
            } else {
                setError(response.message || 'Không thể tải thông tin');
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa cập nhật';
        const d = new Date(dateString);
        return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
    };

    /* ── render helpers ── */
    const renderLoading = () => (
        <div className="inf-center-card">
            <div className="inf-loading">
                <div className="inf-spinner" />
                <p>Đang tải thông tin...</p>
            </div>
        </div>
    );

    const renderError = () => (
        <div className="inf-center-card">
            <div className="inf-error">
                <p>Lỗi: {error}</p>
                <button className="inf-retry-btn" onClick={() => window.location.reload()}>
                    Thử lại
                </button>
            </div>
        </div>
    );

    const renderEmpty = () => (
        <div className="inf-center-card">
            <div className="inf-empty"><p>Không có thông tin</p></div>
        </div>
    );

    return (
        <div className="dashboard-container">
            <Header />

            {formProfile && <FormProfile onClose={() => setFormProfile(false)} />}

            {!formProfile && (
                <>
                    {loading ? renderLoading() : error ? renderError() : profile ? (
                        <div className="inf-layout">
                            {/* ══ LEFT SIDEBAR ══ */}
                            <aside className="inf-sidebar">
                                <div className="inf-avatar-wrap">
                                    <img
                                        src={profile.gender === 'M' ? man : girl}
                                        alt={profile.name}
                                        className="inf-avatar"
                                    />
                                </div>
                                <h1 className="inf-name">{profile.name}</h1>
                                <span className="inf-role-tag">Tài xế EV</span>

                                <div className="inf-sidebar-actions">
                                    <button
                                        className="inf-action-btn primary"
                                        onClick={() => navigate('/profile/edit', { state: { profile } })}
                                    >
                                        <Pencil size={15} />
                                        Chỉnh sửa hồ sơ
                                    </button>
                                    <button
                                        className="inf-action-btn outline"
                                        onClick={() => setFormProfile(true)}
                                    >
                                        <Lock size={15} />
                                        Đổi mật khẩu
                                    </button>
                                    <button
                                        className="inf-action-btn outline"
                                        onClick={() => navigate(-1)}
                                    >
                                        <ArrowLeft size={15} />
                                        Quay lại
                                    </button>
                                </div>
                            </aside>

                            {/* ══ RIGHT MAIN ══ */}
                            <div className="inf-main">
                                {/* Section: Contact */}
                                <div className="inf-section">
                                    <div className="inf-section-header">
                                        <span className="inf-section-icon contact">
                                            <Contact size={18} />
                                        </span>
                                        <h3 className="inf-section-title">Thông tin liên hệ</h3>
                                    </div>
                                    <div className="inf-rows">
                                        <div className="inf-row">
                                            <span className="inf-row-icon"><Mail size={16} /></span>
                                            <div className="inf-row-content">
                                                <span className="inf-row-label">Email</span>
                                                <span className="inf-row-value">{profile.email}</span>
                                            </div>
                                        </div>
                                        <div className="inf-row">
                                            <span className="inf-row-icon"><Phone size={16} /></span>
                                            <div className="inf-row-content">
                                                <span className="inf-row-label">Số điện thoại</span>
                                                <span className="inf-row-value">{profile.phoneNumber}</span>
                                            </div>
                                        </div>
                                        <div className="inf-row">
                                            <span className="inf-row-icon"><MapPin size={16} /></span>
                                            <div className="inf-row-content">
                                                <span className="inf-row-label">Địa chỉ</span>
                                                <span className="inf-row-value">{profile.address || 'Chưa cập nhật'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Personal */}
                                <div className="inf-section">
                                    <div className="inf-section-header">
                                        <span className="inf-section-icon personal">
                                            <UserCircle size={18} />
                                        </span>
                                        <h3 className="inf-section-title">Thông tin cá nhân</h3>
                                    </div>
                                    <div className="inf-rows">
                                        <div className="inf-row">
                                            <span className="inf-row-icon"><Fingerprint size={16} /></span>
                                            <div className="inf-row-content">
                                                <span className="inf-row-label">Giới tính</span>
                                                <span className="inf-row-value">
                                                    {profile.gender === 'M' ? 'Nam' : profile.gender === 'F' ? 'Nữ' : 'Chưa cập nhật'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="inf-row">
                                            <span className="inf-row-icon"><CalendarDays size={16} /></span>
                                            <div className="inf-row-content">
                                                <span className="inf-row-label">Ngày sinh</span>
                                                <span className="inf-row-value">{formatDate(profile.dateOfBirth)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Account */}
                                <div className="inf-section">
                                    <div className="inf-section-header">
                                        <span className="inf-section-icon account">
                                            <ShieldCheck size={18} />
                                        </span>
                                        <h3 className="inf-section-title">Tài khoản</h3>
                                    </div>
                                    <div className="inf-rows">
                                        <div className="inf-row">
                                            <span className="inf-row-icon"><CalendarDays size={16} /></span>
                                            <div className="inf-row-content">
                                                <span className="inf-row-label">Ngày đăng ký</span>
                                                <span className="inf-row-value">{formatDate(profile.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div className="inf-row">
                                            <span className="inf-row-icon"><ShieldCheck size={16} /></span>
                                            <div className="inf-row-content">
                                                <span className="inf-row-label">Trạng thái</span>
                                                <span className={`inf-status-badge ${profile.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                                                    <span className="inf-status-dot" />
                                                    {profile.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : renderEmpty()}
                </>
            )}
        </div>
    );
}