import React, { useEffect } from "react";
import { X, Activity } from "lucide-react";
import LiveChargingMonitor from "../shared/LiveChargingMonitor.jsx";
import "./LiveSessionDrawer.css";

/**
 * LiveSessionDrawer — Side drawer that slides in from the right.
 *
 * Props:
 *   isOpen      (boolean)  — controls visibility
 *   sessionId   (number)   — ID of the session to monitor
 *   onClose     (function) — called when close button or overlay is clicked
 */
export default function LiveSessionDrawer({ isOpen, sessionId, onClose }) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleSessionEnd = (data) => {
    // Session completed/stopped — optionally close or show message
    console.log("Session ended in drawer:", data?.sessionId);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`lsd-overlay${isOpen ? " open" : ""}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`lsd-drawer${isOpen ? " open" : ""}`}>
        {/* Header */}
        <div className="lsd-drawer-header">
          <h2 className="lsd-drawer-title">
            <span className="lsd-drawer-title-icon">
              <Activity size={16} />
            </span>
            Theo dõi phiên sạc
          </h2>
          <button className="lsd-drawer-close" onClick={onClose} title="Đóng">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="lsd-drawer-body">
          {isOpen && sessionId ? (
            <LiveChargingMonitor
              sessionId={sessionId}
              onSessionEnd={handleSessionEnd}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
