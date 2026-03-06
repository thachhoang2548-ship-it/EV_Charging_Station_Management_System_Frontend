/**
 * MeshBackground — Gradient Circle Orb Background
 *
 * Tạo nền với các hình tròn gradient loang mờ, kiểu Stripe / Linear / Vercel.
 *
 * Props:
 *   variant   : "green" | "purple" | "sunset" | "ocean" | "dark" | "mint"  (default: "green")
 *   animated  : boolean                                            (default: true)
 *   className : string
 *   style     : object
 *   tag       : HTML tag wrapper                                   (default: "div")
 *   children  : ReactNode
 *
 * Ví dụ dùng ở trang khác:
 *   import MeshBackground from "@/components/MeshBackground/MeshBackground";
 *
 *   <MeshBackground variant="purple" tag="section">
 *     <AuthForm />
 *   </MeshBackground>
 */

import React from "react";
import "./MeshBackground.css";

/* ----------------------------------------------------------------
   Mỗi variant = base color + mảng orbs
   Mỗi orb: { color: string, top, left, width - tính theo % }
   animation: tên keyframe để orb di chuyển theo quỹ đạo riêng
---------------------------------------------------------------- */
const VARIANTS = {
  green: {
    base: "#f6fef9",
    gradient: "linear-gradient(135deg, rgba(22, 163, 74, 0.14) 0%, rgba(22, 101, 52, 0.08) 100%)",
    orbs: [
      {
        color: "rgba(74, 222, 128, 0.45)",   /* xanh lá non     */
        top: "-10%", left: "-8%",
        width: "65%",
        animation: "orb-drift-a",
      },
      {
        color: "rgba(34, 211, 238, 0.35)",   /* teal             */
        top: "30%", left: "60%",
        width: "55%",
        animation: "orb-drift-b",
      },
      {
        color: "rgba(163, 230, 53, 0.30)",   /* yellow-green     */
        top: "55%", left: "15%",
        width: "50%",
        animation: "orb-drift-c",
      },
      {
        color: "rgba(52, 211, 153, 0.28)",   /* emerald          */
        top: "5%", left: "45%",
        width: "42%",
        animation: "orb-drift-d",
      },
    ],
  },

  purple: {
    base: "#faf8ff",
    gradient: "linear-gradient(135deg, rgba(167, 139, 250, 0.14) 0%, rgba(96, 165, 250, 0.08) 100%)",
    orbs: [
      {
        color: "rgba(167, 139, 250, 0.45)",  /* violet           */
        top: "-15%", left: "-5%",
        width: "65%",
        animation: "orb-drift-b",
      },
      {
        color: "rgba(96, 165, 250, 0.35)",   /* blue             */
        top: "40%", left: "55%",
        width: "58%",
        animation: "orb-drift-a",
      },
      {
        color: "rgba(244, 114, 182, 0.30)",  /* pink             */
        top: "60%", left: "5%",
        width: "48%",
        animation: "orb-drift-d",
      },
      {
        color: "rgba(232, 121, 249, 0.25)",  /* fuchsia          */
        top: "0%", left: "50%",
        width: "40%",
        animation: "orb-drift-c",
      },
    ],
  },

  sunset: {
    base: "#fff9f5",
    gradient: "linear-gradient(135deg, rgba(251, 146, 60, 0.16) 0%, rgba(252, 165, 165, 0.10) 100%)",
    orbs: [
      {
        color: "rgba(252, 165, 165, 0.50)",  /* coral            */
        top: "-12%", left: "-6%",
        width: "62%",
        animation: "orb-drift-c",
      },
      {
        color: "rgba(253, 186, 116, 0.40)",  /* orange           */
        top: "35%", left: "58%",
        width: "55%",
        animation: "orb-drift-a",
      },
      {
        color: "rgba(251, 191, 36, 0.30)",   /* amber            */
        top: "60%", left: "10%",
        width: "50%",
        animation: "orb-drift-b",
      },
      {
        color: "rgba(196, 181, 253, 0.28)",  /* lavender         */
        top: "5%", left: "40%",
        width: "40%",
        animation: "orb-drift-d",
      },
    ],
  },

  ocean: {
    base: "#f0f7ff",
    gradient: "linear-gradient(135deg, rgba(14, 165, 233, 0.14) 0%, rgba(59, 130, 246, 0.08) 100%)",
    orbs: [
      {
        color: "rgba(96, 165, 250, 0.45)",   /* blue             */
        top: "-10%", left: "-5%",
        width: "65%",
        animation: "orb-drift-a",
      },
      {
        color: "rgba(94, 234, 212, 0.38)",   /* teal             */
        top: "38%", left: "60%",
        width: "55%",
        animation: "orb-drift-d",
      },
      {
        color: "rgba(129, 140, 248, 0.30)",  /* indigo           */
        top: "58%", left: "8%",
        width: "48%",
        animation: "orb-drift-b",
      },
      {
        color: "rgba(52, 211, 153, 0.25)",   /* emerald          */
        top: "2%", left: "48%",
        width: "42%",
        animation: "orb-drift-c",
      },
    ],
  },

  dark: {
    base: "#07101f",
    gradient: "linear-gradient(135deg, rgba(22, 163, 74, 0.18) 0%, rgba(14, 116, 144, 0.10) 100%)",
    orbs: [
      {
        color: "rgba(14, 165, 233, 0.22)",   /* sky              */
        top: "-10%", left: "-5%",
        width: "70%",
        animation: "orb-drift-b",
      },
      {
        color: "rgba(139, 92, 246, 0.18)",   /* violet           */
        top: "35%", left: "55%",
        width: "60%",
        animation: "orb-drift-a",
      },
      {
        color: "rgba(16, 185, 129, 0.15)",   /* emerald          */
        top: "60%", left: "5%",
        width: "52%",
        animation: "orb-drift-c",
      },
      {
        color: "rgba(245, 158, 11, 0.12)",   /* amber            */
        top: "0%", left: "42%",
        width: "44%",
        animation: "orb-drift-d",
      },
    ],
  },

  /* Nền trắng xanh nhạt, orb loang rất mờ */
  mint: {
    base: "#f7fdfb",
    gradient: "linear-gradient(135deg, rgba(22, 163, 74, 0.12) 0%, rgba(22, 101, 52, 0.06) 100%)",
    orbs: [
      {
        color: "rgba(110, 231, 183, 0.30)",  /* mint xanh trái  */
        top: "-20%", left: "-15%",
        width: "80%",
        animation: "orb-drift-a",
      },
      {
        color: "rgba(52, 211, 153, 0.18)",   /* emerald phải    */
        top: "25%", left: "55%",
        width: "70%",
        animation: "orb-drift-b",
      },
      {
        color: "rgba(167, 243, 208, 0.22)",  /* pale mint dưới  */
        top: "60%", left: "-5%",
        width: "65%",
        animation: "orb-drift-c",
      },
      {
        color: "rgba(94, 234, 212, 0.15)",   /* teal nhạt giữa  */
        top: "5%", left: "38%",
        width: "55%",
        animation: "orb-drift-d",
      },
    ],
  },
};

const MeshBackground = ({
  variant   = "green",
  animated  = true,
  floating  = true,
  className = "",
  style     = {},
  tag: Tag  = "div",
  children,
}) => {
  const cfg = VARIANTS[variant] ?? VARIANTS.green;
  const FLOATS = [
    { left: "8%", top: "18%", size: "6px", delay: "0s", duration: "6.8s" },
    { left: "18%", top: "72%", size: "7px", delay: "1.1s", duration: "7.4s" },
    { left: "31%", top: "36%", size: "5px", delay: "0.8s", duration: "6.2s" },
    { left: "46%", top: "14%", size: "8px", delay: "1.6s", duration: "7.9s" },
    { left: "58%", top: "63%", size: "6px", delay: "0.4s", duration: "6.6s" },
    { left: "73%", top: "26%", size: "7px", delay: "2.1s", duration: "8.2s" },
    { left: "86%", top: "54%", size: "5px", delay: "1.4s", duration: "6.9s" },
    { left: "92%", top: "80%", size: "6px", delay: "0.2s", duration: "7.1s" },
  ];

  return (
    <Tag
      className={`mesh-root ${className}`}
      style={{
        "--mesh-base": cfg.base,
        "--mesh-gradient": cfg.gradient,
        ...style,
      }}
    >
      {/* Orb layer */}
      <div className="mesh-orbs" aria-hidden="true">
        {cfg.orbs.map((orb, i) => (
          <div
            key={i}
            className={`mesh-orb${animated ? " mesh-orb--animated" : ""}`}
            style={{
              "--orb-color":     orb.color,
              "--orb-animation": orb.animation,
              top:   orb.top,
              left:  orb.left,
              width: orb.width,
            }}
          />
        ))}
      </div>

      {floating && (
        <div className="mesh-floats" aria-hidden="true">
          {FLOATS.map((dot, index) => (
            <span
              key={index}
              className="mesh-float"
              style={{
                left: dot.left,
                top: dot.top,
                width: dot.size,
                height: dot.size,
                animationDelay: dot.delay,
                animationDuration: dot.duration,
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="mesh-content">
        {children}
      </div>
    </Tag>
  );
};

export default MeshBackground;
