"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const roles = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      title: "Branch Staff",
      desc: "Submit transfer requests and track your branch stock in real time.",
      color: "#3d7a2b",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          <line x1="12" y1="12" x2="12" y2="16"/>
          <line x1="10" y1="14" x2="14" y2="14"/>
        </svg>
      ),
      title: "Branch Manager",
      desc: "Review, approve or reject transfer requests from your branch.",
      color: "#1d6fa4",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      title: "HO Admin",
      desc: "Final approval authority. Full inventory visibility across all branches.",
      color: "#a05c0a",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      title: "Accountant",
      desc: "Record transfer costs and generate detailed finance reports.",
      color: "#7c2d8a",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07M8.46 8.46a5 5 0 0 0 0 7.07"/>
        </svg>
      ),
      title: "System Admin",
      desc: "Manage users, branches, and all system configuration.",
      color: "#b53030",
    },
  ];

  const features = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
      label: "Real-Time Stock",
      detail: "Live inventory levels per branch with low-stock alerts.",
      symbol: "01",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
      label: "Transfer Workflow",
      detail: "Multi-tier approval: Staff → Manager → HO Admin.",
      symbol: "02",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      label: "Finance Module",
      detail: "Cost tracking and finance summaries for every transfer.",
      symbol: "03",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
      label: "Reports & Export",
      detail: "Stock, transfer history, and low-stock reports. CSV export.",
      symbol: "04",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
      label: "Role-Based Access",
      detail: "Five distinct roles with granular permission control.",
      symbol: "05",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      label: "Audit Trail",
      detail: "Every action logged with user, timestamp, and comments.",
      symbol: "06",
    },
  ];

  const steps = [
    { status: "Pending", desc: "Staff submits request", icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    )},
    { status: "Mgr Approved", desc: "Branch Manager signs off", icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    )},
    { status: "HO Approved", desc: "Head Office final approval", icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      </svg>
    )},
    { status: "In Transit", desc: "Source branch ships stock", icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    )},
    { status: "Received", desc: "Destination confirms receipt", icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    )},
    { status: "Completed", desc: "Stock levels auto-updated", icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    )},
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #f7f8f4;
          --surface: #ffffff;
          --border: #dde0d4;
          --border-hover: #b8bead;
          --text: #1a1f0e;
          --muted: #6b7260;
          --accent: #3d7a2b;
          --accent-light: #eaf3e5;
          --accent-dark: #2a5a1e;
          --accent2: #1d6fa4;
          --serif: 'DM Serif Display', Georgia, serif;
          --mono: 'DM Mono', 'Courier New', monospace;
          --sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--sans);
          font-size: 15px;
          line-height: 1.65;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* NAV */
        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 48px;
          transition: background 0.3s, border-bottom 0.3s, box-shadow 0.3s;
        }
        .nav.scrolled {
          background: rgba(247,248,244,0.94);
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(12px);
          box-shadow: 0 1px 12px rgba(61,122,43,0.06);
        }
        .nav-logo {
          font-family: var(--serif);
          font-size: 22px;
          color: var(--text);
          letter-spacing: -0.5px;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nav-logo-mark {
          width: 30px; height: 30px;
          background: var(--accent);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 12px;
          font-family: var(--mono);
          font-weight: 500;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }

        /* NAV ACTIONS — sign in + register side by side */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nav-register {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 20px;
          background: var(--accent);
          color: #fff;
          font-family: var(--mono);
          font-size: 12px;
          text-decoration: none;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: background 0.2s;
        }
        .nav-register:hover { background: var(--accent-dark); }
        .nav-signin {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 20px;
          border: 1px solid var(--accent);
          color: var(--accent);
          font-family: var(--mono);
          font-size: 12px;
          text-decoration: none;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: background 0.2s, color 0.2s;
        }
        .nav-signin:hover { background: var(--accent); color: #fff; }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 140px 48px 80px;
          position: relative;
          overflow: hidden;
        }
        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(61,122,43,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(61,122,43,0.055) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }
        .hero-glow {
          position: absolute;
          top: -200px; right: -200px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(61,122,43,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-glow2 {
          position: absolute;
          bottom: -100px; left: -100px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(29,111,164,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-eyebrow {
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 28px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.6s 0.1s, transform 0.6s 0.1s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hero-eyebrow.visible { opacity: 1; transform: translateY(0); }
        .eyebrow-line {
          display: inline-block;
          width: 32px;
          height: 1px;
          background: var(--accent);
        }

        .hero-title {
          font-family: var(--serif);
          font-size: clamp(48px, 8vw, 108px);
          line-height: 0.98;
          letter-spacing: -2px;
          color: var(--text);
          max-width: 900px;
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s 0.2s, transform 0.7s 0.2s;
        }
        .hero-title.visible { opacity: 1; transform: translateY(0); }
        .hero-title em {
          font-style: italic;
          color: var(--accent);
        }

        .hero-sub {
          margin-top: 32px;
          max-width: 480px;
          color: var(--muted);
          font-size: 15px;
          line-height: 1.8;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.6s 0.35s, transform 0.6s 0.35s;
        }
        .hero-sub.visible { opacity: 1; transform: translateY(0); }

        .hero-actions {
          margin-top: 48px;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.6s 0.5s, transform 0.6s 0.5s;
        }
        .hero-actions.visible { opacity: 1; transform: translateY(0); }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 36px;
          background: var(--accent);
          color: #fff;
          font-family: var(--mono);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          background: var(--accent-dark);
          box-shadow: 0 8px 30px rgba(61,122,43,0.22);
        }

        /* Outlined secondary CTA — for "Request Access" in hero */
        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 32px;
          border: 1px solid var(--accent);
          color: var(--accent);
          font-family: var(--mono);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s, color 0.2s, transform 0.2s;
        }
        .btn-outline:hover {
          background: var(--accent);
          color: #fff;
          transform: translateY(-2px);
        }

        .btn-secondary {
          font-family: var(--mono);
          font-size: 13px;
          color: var(--muted);
          text-decoration: none;
          letter-spacing: 0.06em;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: color 0.2s;
        }
        .btn-secondary:hover { color: var(--text); }

        /* divider between hero CTAs and explore link */
        .hero-action-sep {
          width: 1px;
          height: 20px;
          background: var(--border);
          flex-shrink: 0;
        }

        .hero-stat-row {
          margin-top: 80px;
          display: flex;
          gap: 48px;
          flex-wrap: wrap;
          opacity: 0;
          transition: opacity 0.6s 0.65s;
          padding-top: 40px;
          border-top: 1px solid var(--border);
        }
        .hero-stat-row.visible { opacity: 1; }
        .stat { display: flex; flex-direction: column; gap: 4px; }
        .stat-num {
          font-family: var(--serif);
          font-size: 36px;
          color: var(--text);
          letter-spacing: -1px;
        }
        .stat-label {
          font-family: var(--mono);
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        /* DIVIDER */
        .divider {
          border: none;
          border-top: 1px solid var(--border);
          margin: 0 48px;
        }

        /* FEATURES */
        .section { padding: 100px 48px; }
        .section-label {
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-label svg { color: var(--accent); }
        .section-title {
          font-family: var(--serif);
          font-size: clamp(34px, 5vw, 58px);
          letter-spacing: -1px;
          line-height: 1.1;
          max-width: 600px;
          margin-bottom: 64px;
          color: var(--text);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
        }
        .feature-card {
          background: var(--surface);
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          transition: background 0.2s;
        }
        .feature-card:hover { background: var(--accent-light); }
        .feature-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .feature-icon {
          width: 40px; height: 40px;
          background: var(--accent-light);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
        }
        .feature-num {
          font-family: var(--mono);
          font-size: 11px;
          color: var(--border-hover);
          letter-spacing: 0.12em;
        }
        .feature-label {
          font-family: var(--serif);
          font-size: 21px;
          color: var(--text);
          letter-spacing: -0.3px;
        }
        .feature-detail {
          font-size: 13.5px;
          color: var(--muted);
          line-height: 1.7;
        }

        /* WORKFLOW */
        .workflow-section {
          padding: 100px 48px;
          background: var(--surface);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .workflow-steps {
          display: flex;
          align-items: stretch;
          gap: 0;
          margin-top: 60px;
          overflow-x: auto;
          padding-bottom: 8px;
        }
        .workflow-step {
          flex: 1;
          min-width: 140px;
          padding: 28px 20px;
          border: 1px solid var(--border);
          border-right: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
          background: var(--bg);
          transition: background 0.2s, border-color 0.2s;
        }
        .workflow-step:last-child { border-right: 1px solid var(--border); }
        .workflow-step:hover {
          background: var(--accent-light);
          border-color: var(--accent);
          z-index: 1;
        }
        .step-icon {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted);
          transition: background 0.2s, color 0.2s;
        }
        .workflow-step:hover .step-icon {
          background: var(--accent);
          color: #fff;
        }
        .step-status {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text);
          font-weight: 500;
        }
        .step-desc {
          font-size: 12.5px;
          color: var(--muted);
          line-height: 1.5;
        }
        .step-arrow {
          position: absolute;
          right: -9px; top: 50%;
          transform: translateY(-50%);
          z-index: 2;
          width: 16px; height: 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted);
        }
        .step-arrow svg { display: block; }

        /* ROLES */
        .roles-section { padding: 100px 48px; }
        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
          margin-top: 60px;
        }
        .role-card {
          border: 1px solid var(--border);
          background: var(--surface);
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          cursor: default;
        }
        .role-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.07);
        }
        .role-icon-wrap {
          width: 36px; height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }
        .role-title {
          font-family: var(--serif);
          font-size: 18px;
          letter-spacing: -0.2px;
          color: var(--text);
        }
        .role-desc {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.7;
        }

        /* CTA BANNER */
        .cta-banner {
          margin: 0 48px 80px;
          border: 1px solid var(--border);
          padding: 80px 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          flex-wrap: wrap;
          background: var(--surface);
          position: relative;
          overflow: hidden;
        }
        .cta-banner::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--accent);
        }
        .cta-banner::after {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(61,122,43,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-title {
          font-family: var(--serif);
          font-size: clamp(28px, 4vw, 46px);
          letter-spacing: -1px;
          max-width: 500px;
          line-height: 1.15;
          color: var(--text);
        }
        .cta-title em { font-style: italic; color: var(--accent); }
        .cta-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: flex-start;
          flex-shrink: 0;
        }
        .cta-hint {
          font-family: var(--mono);
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 0.08em;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* FOOTER */
        .footer {
          border-top: 1px solid var(--border);
          padding: 32px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          background: var(--surface);
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--serif);
          font-size: 16px;
          color: var(--text);
          text-decoration: none;
        }
        .footer-logo-mark {
          width: 22px; height: 22px;
          background: var(--accent);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 9px;
          font-family: var(--mono);
          font-weight: 500;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }
        .footer-copy {
          font-family: var(--mono);
          font-size: 12px;
          color: var(--muted);
        }

        @media (max-width: 768px) {
          .nav { padding: 16px 24px; }
          .hero { padding: 120px 24px 60px; }
          .section { padding: 60px 24px; }
          .workflow-section { padding: 60px 24px; }
          .roles-section { padding: 60px 24px; }
          .cta-banner { margin: 0 24px 60px; padding: 48px 32px; flex-direction: column; align-items: flex-start; gap: 28px; }
          .cta-buttons { flex-direction: row; flex-wrap: wrap; }
          .footer { padding: 24px; flex-direction: column; align-items: flex-start; gap: 12px; }
          .divider { margin: 0 24px; }
          .hero-stat-row { gap: 32px; }
          .section-title { margin-bottom: 40px; }
          .nav-actions { gap: 8px; }
        }

        @media (max-width: 560px) {
          .nav-register span.nav-label, .nav-signin span.nav-label { display: none; }
          .hero-actions { flex-direction: column; align-items: flex-start; gap: 12px; }
          .hero-action-sep { display: none; }
          .btn-primary, .btn-outline { width: 100%; justify-content: center; }
          .hero-stat-row { gap: 24px 40px; }
        }
      `}</style>

      {/* NAV — Sign In (outline) + Request Access (filled) */}
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <a href="#" className="nav-logo">
          <span className="nav-logo-mark">SB</span>
          StockBridge
        </a>
        <div className="nav-actions">
          <Link href="/login" className="nav-signin">
            <span className="nav-label">Sign In</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
          <Link href="/register" className="nav-register">
            <span className="nav-label">Sign Up</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-glow" />
        <div className="hero-glow2" />
        <h1 className={`hero-title${visible ? " visible" : ""}`}>
          Stock moves.<br />
          <em>Nothing slips</em><br />
          through.
        </h1>
        <p className={`hero-sub${visible ? " visible" : ""}`}>
          StockBridge gives every branch, manager, and head office a single
          source of truth — from transfer request to final receipt, with full
          audit trail and finance visibility.
        </p>

        {/* Hero actions: Sign In (primary) | Request Access (outline) | separator | Explore */}
        <div className={`hero-actions${visible ? " visible" : ""}`}>
          <Link href="/login" className="btn-primary">
            Sign In
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
          <Link href="/register" className="btn-outline">
            Request Access
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </Link>
          <span className="hero-action-sep" />
          <a href="#features" className="btn-secondary">
            Explore features
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
            </svg>
          </a>
        </div>

        <div className={`hero-stat-row${visible ? " visible" : ""}`}>
          <div className="stat">
            <span className="stat-num">5</span>
            <span className="stat-label">User Roles</span>
          </div>
          <div className="stat">
            <span className="stat-num">6</span>
            <span className="stat-label">Transfer Stages</span>
          </div>
          <div className="stat">
            <span className="stat-num">2-tier</span>
            <span className="stat-label">Approval Flow</span>
          </div>
          <div className="stat">
            <span className="stat-num">&#8734;</span>
            <span className="stat-label">Branches</span>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* FEATURES */}
      <section className="section" id="features">
        <p className="section-label">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Platform Capabilities
        </p>
        <h2 className="section-title">
          Everything the operation needs, nothing it doesn&apos;t.
        </h2>
        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.symbol}>
              <div className="feature-top">
                <div className="feature-icon">{f.icon}</div>
                <span className="feature-num">{f.symbol}</span>
              </div>
              <span className="feature-label">{f.label}</span>
              <span className="feature-detail">{f.detail}</span>
            </div>
          ))}
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="workflow-section">
        <p className="section-label">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          Transfer Lifecycle
        </p>
        <h2 className="section-title">
          From request<br />to completion.
        </h2>
        <div className="workflow-steps">
          {steps.map((s, i, arr) => (
            <div className="workflow-step" key={s.status}>
              <div className="step-icon">{s.icon}</div>
              <span className="step-status">{s.status}</span>
              <span className="step-desc">{s.desc}</span>
              {i < arr.length - 1 && (
                <span className="step-arrow">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ROLES */}
      <section className="roles-section">
        <p className="section-label">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Access Control
        </p>
        <h2 className="section-title">
          The right tools<br />for every role.
        </h2>
        <div className="roles-grid">
          {roles.map((r) => (
            <div
              className="role-card"
              key={r.title}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = r.color;
                e.currentTarget.style.boxShadow = `0 8px 24px ${r.color}18`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div className="role-icon-wrap" style={{ background: `${r.color}15`, color: r.color }}>
                {r.icon}
              </div>
              <span className="role-title">{r.title}</span>
              <span className="role-desc">{r.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER — two buttons: Sign In (primary) + Request Access (outline) */}
      <div className="cta-banner">
        <h2 className="cta-title">
          Ready to bring<br />
          <em>every branch</em><br />
          into sync?
        </h2>
        <div className="cta-buttons">
          <Link href="/login" className="btn-primary">
            Sign In to StockBridge
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
          <Link href="/register" className="btn-outline">
            Request access
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </Link>
          <span className="cta-hint">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            New accounts require administrator approval
          </span>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <a href="#" className="footer-logo">
          <span className="footer-logo-mark">SB</span>
          StockBridge
        </a>
        <span className="footer-copy">
          &copy; 2026 StockBridge &middot; Multi-Branch Inventory &amp; Transfer Management System
        </span>
      </footer>
    </>
  );
}