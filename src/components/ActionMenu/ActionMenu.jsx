import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./ActionMenu.css";

/**
 * ActionMenu — Kebab menu (⋮) dùng chung cho các bảng quản lý.
 *
 * Props:
 *   actions: Array<{ label: string, type: "success"|"danger"|"warning"|"default", onClick: Function }>
 */
export default function ActionMenu({ actions = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const btnRef = useRef(null);
  const dropdownRef = useRef(null);

  // Tính vị trí dropdown khi mở
  const openMenu = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownHeight = actions.length * 38 + 8; // ước tính chiều cao

    let top, transformOrigin;
    if (spaceBelow >= dropdownHeight) {
      // Hiện bên dưới nút
      top = rect.bottom + 4;
      transformOrigin = "top left";
    } else {
      // Hiện bên trên nút nếu không đủ chỗ dưới
      top = rect.top - dropdownHeight - 4;
      transformOrigin = "bottom left";
    }

    setDropdownStyle({
      top: `${top}px`,
      left: `${rect.left}px`,
      transformOrigin,
    });
    setIsOpen(true);
  };

  const closeMenu = () => setIsOpen(false);

  const handleBtnClick = (e) => {
    e.stopPropagation();
    isOpen ? closeMenu() : openMenu();
  };

  // Click ngoài → đóng menu
  useEffect(() => {
    if (!isOpen) return;
    const onOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [isOpen]);

  // Đóng khi scroll
  useEffect(() => {
    if (!isOpen) return;
    const onScroll = () => closeMenu();
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [isOpen]);

  const handleItemClick = (e, onClick) => {
    e.stopPropagation();
    closeMenu();
    onClick(e);
  };

  if (actions.length === 0)
    return <span style={{ color: "#cbd5e1", fontSize: "16px" }}>—</span>;

  return (
    <div className="action-menu">
      <button
        ref={btnRef}
        className={`action-menu-btn${isOpen ? " open" : ""}`}
        onClick={handleBtnClick}
        title="Thao tác"
      >
        ☰
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="action-menu-dropdown"
            style={dropdownStyle}
          >
            <ul className="action-menu-list">
              {actions.map((action, idx) => (
                <li key={idx}>
                  <button
                    className={`action-menu-item ${action.type ?? "default"}${action.disabled ? " disabled" : ""}`}
                    onClick={(e) =>
                      !action.disabled && handleItemClick(e, action.onClick)
                    }
                    disabled={action.disabled}
                    title={action.title}
                  >
                    {action.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}
