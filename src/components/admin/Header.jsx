import { useState } from 'react';
import FormProfile from './FormChangePassword.jsx';
import './Header.css';
import man from '../../assets/icon/man.png';
import girl from '../../assets/icon/girl.png';
import { KeyRound } from 'lucide-react';

// ── Avatar with initial-letter fallback ──
function UserAvatar({ name, gender, avatarUrl, size = 36 }) {
  // If there's a custom avatar URL, use it
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || "Avatar"}
        className="hdr-avatar-img"
        style={{ width: size, height: size }}
      />
    );
  }

  // If we have gender icons, use them
  if (gender) {
    return (
      <img
        src={gender === "M" ? man : girl}
        alt={name || "Avatar"}
        className="hdr-avatar-img"
        style={{ width: size, height: size }}
      />
    );
  }

  // Fallback: first letter of name in a green circle
  const initial = (name || "U").charAt(0).toUpperCase();
  return (
    <div className="hdr-avatar-initial" style={{ width: size, height: size }}>
      {initial}
    </div>
  );
}

export default function Header() {
  const role = localStorage.getItem('role') || '';
  const stored = localStorage.getItem('userDetails');
  const user = stored ? JSON.parse(stored) : null;

  const fullName = user?.name || 'Người dùng';
  const gender = user?.gender || '';
  const avatarUrl = user?.avatarUrl || null;

  const [formProfile, setFormProfile] = useState(false);

  const roleLabel =
    role === 'ADMIN' ? 'Quản trị viên' :
    role === 'STAFF' ? 'Nhân viên trạm' :
    'Tài xế EV';

  return (
    <>
      {formProfile && <FormProfile onClose={() => setFormProfile(false)} />}

      <div className="header-section">
        {/* Left — just a spacer for flex balance */}
        <div className="header-left" />

        {/* Right — User info widget */}
        <div className="header-right">
          <button
            className="hdr-change-pw"
            onClick={() => setFormProfile(true)}
            title="Đổi mật khẩu"
          >
            <KeyRound size={15} />
          </button>

          <div className="hdr-user-widget">
            <UserAvatar name={fullName} gender={gender} avatarUrl={avatarUrl} size={36} />
            <div className="hdr-user-text">
              <span className="hdr-user-name">{fullName}</span>
              <span className="hdr-user-role">{roleLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}