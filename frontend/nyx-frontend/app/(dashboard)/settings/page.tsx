'use client'
import { useState } from 'react';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Github,
  Mail,
  Save,
  Trash2,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';

export default function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [autoReview, setAutoReview] = useState(true);
  const [activeTab, setActiveTab] = useState('account');

  const tabs = ['account', 'notifications', 'integrations', 'billing'];

  return (
    <div style={{ backgroundColor: '#0a0e1a', minHeight: '100vh', fontFamily: "'Courier New', Courier, monospace", color: '#00ff41', padding: '32px 16px' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .settings-wrap { max-width: 860px; margin: 0 auto; padding: 0 8px; }
        @media (min-width: 768px) { .settings-wrap { padding: 0 24px; } }

        /* ── Tabs ── */
        .tab-btn {
          background: transparent; color: #4ade80; border: none;
          border-bottom: 2px solid transparent;
          padding: 10px 4px;
          font-family: 'Courier New', monospace; font-size: 11px; font-weight: 700;
          cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em;
          transition: color 0.15s, border-color 0.15s; white-space: nowrap;
        }
        .tab-btn:hover { color: #00ff41; }
        .tab-btn.active { color: #00ff41; border-bottom-color: #00ff41; }

        /* ── Cards ── */
        .section-card { background: #1a1f2e; border: 2px solid #00ff41; padding: 24px; margin-bottom: 20px; }
        .section-card.danger  { border-color: #ff1744; }
        .section-card.accent  { border-color: #8b5cf6; }

        /* ── Section header bars ── */
        .sh { padding: 8px 16px; margin-bottom: 20px; display: inline-block; }
        .sh.green  { background: #00ff41; }
        .sh.accent { background: #8b5cf6; }
        .sh.danger { background: #ff1744; }
        .sh h3 { font-size: 12px; font-weight: 700; color: #0a0e1a; margin: 0; letter-spacing: 0.05em; }

        /* ── Fields ── */
        .field-label { font-size: 10px; font-weight: 700; color: #4ade80; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; display: block; }

        .field-input {
          width: 100%; background: #0d1117; border: 1px solid #2a3a2a; color: #00ff41;
          font-family: 'Courier New', monospace; font-size: 12px; padding: 10px 12px;
          outline: none; box-sizing: border-box; transition: border-color 0.15s;
        }
        .field-input:focus { border-color: #00ff41; }

        /* ── Buttons ── */
        .btn-green {
          background: #00ff41; color: #0a0e1a; border: 2px solid #00ff41;
          padding: 8px 18px; font-family: 'Courier New', monospace; font-weight: 700;
          font-size: 11px; cursor: pointer; transition: background 0.15s, color 0.15s;
          display: inline-flex; align-items: center; gap: 6px; letter-spacing: 0.05em;
        }
        .btn-green:hover { background: transparent; color: #00ff41; }

        .btn-outline-green {
          background: transparent; color: #00ff41; border: 2px solid #00ff41;
          padding: 8px 18px; font-family: 'Courier New', monospace; font-weight: 700;
          font-size: 11px; cursor: pointer; transition: background 0.15s, color 0.15s;
          display: inline-flex; align-items: center; gap: 6px; letter-spacing: 0.05em;
          text-decoration: none;
        }
        .btn-outline-green:hover { background: #00ff41; color: #0a0e1a; }

        .btn-outline-danger {
          background: transparent; color: #ff1744; border: 2px solid #ff1744;
          padding: 8px 18px; font-family: 'Courier New', monospace; font-weight: 700;
          font-size: 11px; cursor: pointer; transition: background 0.15s, color 0.15s;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .btn-outline-danger:hover { background: #ff1744; color: #0a0e1a; }

        .btn-accent {
          background: #8b5cf6; color: #0a0e1a; border: 2px solid #8b5cf6;
          padding: 8px 18px; font-family: 'Courier New', monospace; font-weight: 700;
          font-size: 11px; cursor: pointer; transition: background 0.15s, color 0.15s;
          display: inline-flex; align-items: center; gap: 6px; text-decoration: none;
        }
        .btn-accent:hover { background: transparent; color: #8b5cf6; }

        /* ── Toggle ── */
        .toggle-track {
          position: relative; width: 44px; height: 24px;
          border: 2px solid #2a3a2a; background: #0d1117;
          cursor: pointer; flex-shrink: 0;
          transition: border-color 0.15s, background 0.15s;
        }
        .toggle-track.on { border-color: #00ff41; background: rgba(0,255,65,0.1); }
        .toggle-thumb {
          position: absolute; top: 2px; left: 2px;
          width: 16px; height: 16px; background: #2a3a2a;
          transition: transform 0.15s, background 0.15s;
        }
        .toggle-track.on .toggle-thumb { transform: translateX(20px); background: #00ff41; }

        /* ── Radio / Checkbox ── */
        .radio-custom {
          appearance: none; -webkit-appearance: none;
          width: 14px; height: 14px; border: 2px solid #2a3a2a;
          background: #0d1117; cursor: pointer; flex-shrink: 0;
          transition: border-color 0.15s;
        }
        .radio-custom:checked { border-color: #00ff41; background: #00ff41; }

        .check-custom {
          appearance: none; -webkit-appearance: none;
          width: 14px; height: 14px; border: 2px solid #2a3a2a;
          background: #0d1117; cursor: pointer; flex-shrink: 0;
          transition: border-color 0.15s;
        }
        .check-custom:checked { border-color: #00ff41; background: rgba(0,255,65,0.25); }

        /* ── Misc ── */
        .profile-avatar {
          width: 52px; height: 52px; background: rgba(0,255,65,0.1);
          border: 2px solid #00ff41; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0;
        }
        .connected-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border: 1px solid #2a3a2a; background: #0d1117;
        }
        .tag-green { background: rgba(0,255,65,0.1); color: #00ff41; border: 1px solid #00ff41; padding: 2px 8px; font-size: 10px; font-weight: 700; }
        .tag-blue  { background: rgba(59,130,246,0.1); color: #60a5fa; border: 1px solid #3b82f6; padding: 2px 8px; font-size: 10px; font-weight: 700; }

        .notif-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 16px 0; border-bottom: 1px solid #1e2a1e; }
        .notif-row:last-of-type { border-bottom: none; }

        .divider-line { border: none; border-top: 1px solid #1e2a1e; margin: 20px 0; }

        .billing-feature { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #4ade80; margin-bottom: 8px; }
        .billing-dot { width: 6px; height: 6px; background: #00ff41; flex-shrink: 0; }

        .grid-2 { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 640px) { .grid-2 { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <div className="settings-wrap">

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ background: '#00ff41', padding: '8px 16px', display: 'inline-block', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0a0e1a' }}>═══ SYSTEM CONFIG ═══</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#00ff41', marginBottom: 4 }}>Settings</h1>
          <p style={{ fontSize: 12, color: '#4ade80' }}>&gt; Manage your account and preferences</p>
        </div>

        {/* ── Tab Bar ── */}
        <div style={{ borderBottom: '2px solid #1e2a1e', marginBottom: 28, overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 24, minWidth: 'max-content' }}>
            {tabs.map((t) => (
              <button key={t} onClick={() => setActiveTab(t)} className={`tab-btn${activeTab === t ? ' active' : ''}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════
            ACCOUNT TAB
        ══════════════════════════════════════ */}
        {activeTab === 'account' && (
          <div>

            {/* Profile Information */}
            <div className="section-card">
              <div className="sh green"><h3>═══ PROFILE INFORMATION ═══</h3></div>
              <p style={{ fontSize: 11, color: '#4ade80', marginBottom: 20 }}>&gt; Update your account details</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div className="profile-avatar">
                  <User style={{ width: 24, height: 24, color: '#00ff41' }} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: '#00ff41', fontSize: 14, marginBottom: 2 }}>Sarah Developer</p>
                  <p style={{ fontSize: 11, color: '#4ade80' }}>sarah-dev@acme-corp.com</p>
                </div>
              </div>

              <div className="grid-2" style={{ marginBottom: 20 }}>
                <div>
                  <label className="field-label">Full Name</label>
                  <input className="field-input" type="text" defaultValue="Sarah Developer" />
                </div>
                <div>
                  <label className="field-label">Email</label>
                  <input className="field-input" type="email" defaultValue="sarah-dev@acme-corp.com" />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="field-label">Company</label>
                <input className="field-input" type="text" defaultValue="Acme Corp" />
              </div>

              <button className="btn-green">
                <Save style={{ width: 12, height: 12 }} />
                SAVE CHANGES
              </button>
            </div>

            {/* Connected Accounts */}
            <div className="section-card">
              <div className="sh green"><h3>═══ CONNECTED ACCOUNTS ═══</h3></div>
              <p style={{ fontSize: 11, color: '#4ade80', marginBottom: 16 }}>&gt; Manage your connected services</p>
              <div className="connected-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Github style={{ width: 18, height: 18, color: '#00ff41' }} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13, color: '#00ff41', marginBottom: 2 }}>GitHub</p>
                    <p style={{ fontSize: 11, color: '#4ade80' }}>@sarah-dev</p>
                  </div>
                </div>
                <span className="tag-green">CONNECTED</span>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="section-card danger">
              <div className="sh danger"><h3>═══ DANGER ZONE ═══</h3></div>
              <p style={{ fontSize: 11, color: '#ff6b6b', marginBottom: 16 }}>&gt; Irreversible account actions</p>
              <button className="btn-outline-danger">
                <Trash2 style={{ width: 14, height: 14 }} />
                DELETE ACCOUNT
              </button>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════
            NOTIFICATIONS TAB
        ══════════════════════════════════════ */}
        {activeTab === 'notifications' && (
          <div className="section-card">
            <div className="sh green"><h3>═══ NOTIFICATION PREFERENCES ═══</h3></div>
            <p style={{ fontSize: 11, color: '#4ade80', marginBottom: 8 }}>&gt; Configure how you receive updates</p>

            {[
              { label: 'Email Notifications',    desc: 'Receive notifications via email',                        icon: Mail,   state: emailNotifications, toggle: () => setEmailNotifications(!emailNotifications) },
              { label: 'Critical Issue Alerts',  desc: 'Get notified immediately for critical security issues',  icon: Shield, state: criticalAlerts,      toggle: () => setCriticalAlerts(!criticalAlerts) },
              { label: 'Weekly Summary Reports', desc: 'Receive a weekly summary of all reviews',                icon: Bell,   state: weeklyReports,       toggle: () => setWeeklyReports(!weeklyReports) },
            ].map(({ label, desc, icon: Icon, state, toggle }) => (
              <div key={label} className="notif-row">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Icon style={{ width: 14, height: 14, color: '#4ade80', flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: 12, color: '#00ff41', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#4ade80', paddingLeft: 22 }}>{desc}</p>
                </div>
                <div className={`toggle-track${state ? ' on' : ''}`} onClick={toggle}>
                  <div className="toggle-thumb" />
                </div>
              </div>
            ))}

            <hr className="divider-line" />

            <p style={{ fontSize: 11, fontWeight: 700, color: '#00ff41', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              &gt; Email Frequency
            </p>
            {['Real-time (as they happen)', 'Daily digest', 'Weekly digest'].map((opt, i) => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer', fontSize: 12, color: '#4ade80' }}>
                <input type="radio" name="frequency" defaultChecked={i === 0} className="radio-custom" />
                {opt}
              </label>
            ))}

            <div style={{ marginTop: 20 }}>
              <button className="btn-green">
                <Save style={{ width: 12, height: 12 }} />
                SAVE PREFERENCES
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            INTEGRATIONS TAB
        ══════════════════════════════════════ */}
        {activeTab === 'integrations' && (
          <div className="section-card">
            <div className="sh green"><h3>═══ INTEGRATION SETTINGS ═══</h3></div>
            <p style={{ fontSize: 11, color: '#4ade80', marginBottom: 20 }}>&gt; Configure CodeGuard AI behavior</p>

            {/* Auto Review toggle */}
            <div className="notif-row">
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: '#00ff41', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>
                  Automatic Pull Request Review
                </span>
                <p style={{ fontSize: 11, color: '#4ade80' }}>Automatically review all new pull requests</p>
              </div>
              <div className={`toggle-track${autoReview ? ' on' : ''}`} onClick={() => setAutoReview(!autoReview)}>
                <div className="toggle-thumb" />
              </div>
            </div>

            <hr className="divider-line" />

            {/* Review Strictness */}
            <p style={{ fontSize: 11, fontWeight: 700, color: '#00ff41', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              &gt; Review Strictness
            </p>
            {[
              { val: 'strict',   label: 'Strict',   desc: 'Report all potential issues' },
              { val: 'balanced', label: 'Balanced',  desc: 'Focus on important issues', checked: true },
              { val: 'relaxed',  label: 'Relaxed',   desc: 'Only critical and high priority issues' },
            ].map(({ val, label, desc, checked }) => (
              <label key={val} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, cursor: 'pointer' }}>
                <input type="radio" name="strictness" defaultChecked={!!checked} className="radio-custom" style={{ marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: '#00ff41' }}>{label}</div>
                  <div style={{ fontSize: 11, color: '#4ade80' }}>{desc}</div>
                </div>
              </label>
            ))}

            <hr className="divider-line" />

            {/* Review Categories */}
            <p style={{ fontSize: 11, fontWeight: 700, color: '#00ff41', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              &gt; Review Categories
            </p>
            {[
              { label: 'Security vulnerabilities', checked: true },
              { label: 'Performance issues',       checked: true },
              { label: 'Potential bugs',           checked: true },
              { label: 'Best practices',           checked: true },
              { label: 'Code style',               checked: false },
            ].map(({ label, checked }) => (
              <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer', fontSize: 12, color: '#4ade80' }}>
                <input type="checkbox" defaultChecked={checked} className="check-custom" />
                {label}
              </label>
            ))}

            <div style={{ marginTop: 20 }}>
              <button className="btn-green">
                <Save style={{ width: 12, height: 12 }} />
                SAVE SETTINGS
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            BILLING TAB
        ══════════════════════════════════════ */}
        {activeTab === 'billing' && (
          <div>

            {/* NEAR Agent Funding */}
            <div className="section-card accent">
              <div className="sh accent"><h3>═══ NEAR AGENT FUNDING ═══</h3></div>
              <p style={{ fontSize: 11, color: '#4ade80', marginBottom: 16 }}>
                &gt; Your CodeGuard AI agent runs on the NEAR blockchain and requires NEAR tokens to perform code reviews.
                View our step-by-step guide to transfer NEAR to your agent contract.
              </p>
              <hr className="divider-line" />
              <Link href="/funding" className="btn-accent">
                <Wallet style={{ width: 14, height: 14 }} />
                VIEW FUNDING INSTRUCTIONS
              </Link>
            </div>

            {/* Current Plan */}
            <div className="section-card">
              <div className="sh green"><h3>═══ CURRENT PLAN ═══</h3></div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 28, fontWeight: 700, color: '#00ff41', marginBottom: 4 }}>FREE PLAN</h3>
                  <p style={{ fontSize: 11, color: '#4ade80' }}>For public repositories</p>
                </div>
                <span className="tag-blue">ACTIVE</span>
              </div>

              <div style={{ marginBottom: 20 }}>
                {['Unlimited public repositories', 'AI-powered code reviews', 'Basic issue detection'].map((f) => (
                  <div key={f} className="billing-feature">
                    <div className="billing-dot" />
                    {f}
                  </div>
                ))}
              </div>

              {/* Upgrade CTA */}
              <div style={{ background: '#0d1117', border: '2px solid #8b5cf6', padding: 20 }}>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ background: '#8b5cf6', padding: '2px 10px', display: 'inline-block' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#0a0e1a' }}>UPGRADE AVAILABLE</span>
                  </div>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#8b5cf6', marginBottom: 4 }}>PRO PLAN</p>
                <p style={{ fontSize: 11, color: '#4ade80', marginBottom: 12 }}>&gt; Get advanced features for private repositories and teams</p>
                {['Private repository support', 'Advanced security scanning', 'Team collaboration features', 'Priority support'].map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#8b5cf6', marginBottom: 6 }}>
                    <div style={{ width: 6, height: 6, background: '#8b5cf6', flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
                <button style={{ marginTop: 16, background: '#8b5cf6', color: '#0a0e1a', border: '2px solid #8b5cf6', padding: '8px 20px', fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 11, cursor: 'pointer', letterSpacing: '0.05em' }}>
                  UPGRADE TO PRO — $29/MONTH
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="section-card">
              <div className="sh green"><h3>═══ PAYMENT METHOD ═══</h3></div>
              <p style={{ fontSize: 11, color: '#4ade80', marginBottom: 16 }}>&gt; No payment method on file</p>
              <button className="btn-outline-green">
                <CreditCard style={{ width: 14, height: 14 }} />
                ADD PAYMENT METHOD
              </button>
            </div>

            {/* Billing History */}
            <div className="section-card">
              <div className="sh green"><h3>═══ BILLING HISTORY ═══</h3></div>
              <p style={{ fontSize: 11, color: '#4ade80' }}>&gt; No billing history available</p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}