'use client';

import { Code2, LayoutDashboard, Settings, Plus, Menu, X, LogOut, Trophy } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  // const { user, isLoading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser]=useState<any>();

  const logout = () => {
    console.log('logout user')
  }

  // useEffect(() => {
  //   if (!isLoading && !user) {
  //     router.push('/');
  //   }
  // }, [isLoading, user, router]);

  const isActive = (path: string) => pathname === path;

  // if (isLoading) {
  //   return (
  //     <div style={{ minHeight: '100vh', backgroundColor: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  //       <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  //       <div style={{
  //         width: 32, height: 32,
  //         border: '3px solid #00ff41',
  //         borderTopColor: 'transparent',
  //         borderRadius: '50%',
  //         animation: 'spin 0.8s linear infinite',
  //       }} />
  //     </div>
  //   );
  // }

  // if (!user) return null;

  const navLink = (active: boolean, accent = false) => ({
    display: 'inline-flex',
    alignItems: 'center' as const,
    gap: 6,
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
    fontWeight: 700,
    padding: '6px 12px',
    border: `2px solid ${accent ? '#8b5cf6' : '#00ff41'}`,
    color: active ? '#0a0e1a' : (accent ? '#8b5cf6' : '#00ff41'),
    backgroundColor: active ? (accent ? '#8b5cf6' : '#00ff41') : 'transparent',
    textDecoration: 'none',
    transition: 'background 0.15s, color 0.15s',
    cursor: 'pointer',
  });

  const mobileNavLink = (active: boolean, accent = false) => ({
    display: 'flex',
    alignItems: 'center' as const,
    gap: 8,
    padding: '12px',
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
    fontWeight: 700,
    border: `2px solid ${accent ? '#8b5cf6' : '#00ff41'}`,
    color: active ? '#0a0e1a' : (accent ? '#8b5cf6' : '#00ff41'),
    backgroundColor: active ? (accent ? '#8b5cf6' : '#00ff41') : 'transparent',
    textDecoration: 'none',
    transition: 'background 0.15s, color 0.15s',
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0e1a', color: '#00ff41', fontFamily: "'Courier New', Courier, monospace" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        .scanline {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 65, 0.015) 2px,
            rgba(0, 255, 65, 0.015) 4px
          );
          pointer-events: none;
          z-index: 9999;
        }

        .nav-link-green:hover  { background-color: #00ff41 !important; color: #0a0e1a !important; }
        .nav-link-accent:hover { background-color: #8b5cf6 !important; color: #0a0e1a !important; }

        .btn-connect {
          background: #00ff41;
          color: #0a0e1a;
          border: 2px solid #00ff41;
          padding: 8px 16px;
          font-family: 'Courier New', monospace;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
        }
        .btn-connect:hover { background: transparent; color: #00ff41; }

        .btn-icon {
          background: transparent;
          color: #00ff41;
          border: 2px solid #00ff41;
          padding: 7px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btn-icon:hover { background: #00ff41; color: #0a0e1a; }

        .btn-mobile-menu {
          background: transparent;
          color: #00ff41;
          border: 2px solid #00ff41;
          padding: 6px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          display: flex;
          align-items: center;
        }
        .btn-mobile-menu:hover { background: #00ff41; color: #0a0e1a; }

        .btn-mobile-connect {
          background: #00ff41;
          color: #0a0e1a;
          border: 2px solid #00ff41;
          padding: 12px 16px;
          font-family: 'Courier New', monospace;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
          margin-top: 8px;
          text-decoration: none;
        }
        .btn-mobile-connect:hover { background: transparent; color: #00ff41; }

        .btn-signout {
          background: transparent;
          color: #ff1744;
          border: 2px solid #ff1744;
          padding: 12px;
          font-family: 'Courier New', monospace;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }
        .btn-signout:hover { background: #ff1744; color: #fff; }

        .agent-dot { animation: pulse-dot 1.5s infinite; }

        @media (max-width: 767px) {
          .desktop-nav, .desktop-actions { display: none !important; }
          .mobile-toggle { display: flex !important; }
          .agent-badge { display: none !important; }
        }
        @media (min-width: 768px) {
          .mobile-toggle { display: none !important; }
          .agent-badge { display: flex !important; }
        }
      `}</style>

      <div className="scanline" />

      <header style={{ backgroundColor: '#1a1f2e', borderBottom: '2px solid #00ff41', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div style={{ border: '2px solid #00ff41', padding: 4 }}>
                <Code2 style={{ width: 20, height: 20, color: '#00ff41' }} />
              </div>
              <div>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#00ff41', display: 'block', lineHeight: 1.2 }}>HOLY</span>
                <span style={{ fontSize: 10, color: '#4ade80' }}>v1.0.0</span>
              </div>
            </Link>
            <div className="agent-badge" style={{ alignItems: 'center', gap: 6, padding: '3px 8px', border: '1px solid #00ff41' }}>
              <div className="agent-dot" style={{ width: 6, height: 6, backgroundColor: '#00ff41' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#00ff41', letterSpacing: 1 }}>AGENT ACTIVE</span>
            </div>
          </div>
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/dashboard" style={navLink(isActive('/dashboard'))} className="nav-link-green">
              <LayoutDashboard style={{ width: 14, height: 14 }} />
              DASHBOARD
            </Link>
            <Link href="/explore" style={navLink(isActive('/explore'), true)} className="nav-link-accent">
              <Trophy style={{ width: 14, height: 14 }} />
              EXPLORE
            </Link>
            <Link href="/settings" style={navLink(isActive('/settings'))} className="nav-link-green">
              <Settings style={{ width: 14, height: 14 }} />
              SETTINGS
            </Link>
          </nav>

    
          <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: '#4ade80' }}>{'Joe'}</span>
            <Link href="/connected-repo" className="btn-connect">
              <Plus style={{ width: 14, height: 14 }} />
              CONNECT REPO
            </Link>
            <button className="btn-icon" onClick={() => { logout(); router.push('/'); }} title="Sign out">
              <LogOut style={{ width: 14, height: 14 }} />
            </button>
          </div>

        
          <button className="btn-mobile-menu mobile-toggle" style={{ display: 'none' }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
          </button>
        </div>


        {mobileMenuOpen && (
          <div style={{ borderTop: '2px solid #00ff41', backgroundColor: '#1a1f2e' }}>
            <nav style={{ display: 'flex', flexDirection: 'column', padding: 16, gap: 8 }}>
              <div style={{ padding: '8px 12px', fontSize: 12, color: '#4ade80', borderBottom: '2px solid #00ff41', marginBottom: 4 }}>
                &gt; Signed in as <span style={{ color: '#00ff41', fontWeight: 700 }}>{user.username}</span>
              </div>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} style={mobileNavLink(isActive('/dashboard'))} className="nav-link-green">
                <LayoutDashboard style={{ width: 14, height: 14 }} /> DASHBOARD
              </Link>
              <Link href="/explore" onClick={() => setMobileMenuOpen(false)} style={mobileNavLink(isActive('/explore'), true)} className="nav-link-accent">
                <Trophy style={{ width: 14, height: 14 }} /> EXPLORE
              </Link>
              <Link href="/settings" onClick={() => setMobileMenuOpen(false)} style={mobileNavLink(isActive('/settings'))} className="nav-link-green">
                <Settings style={{ width: 14, height: 14 }} /> SETTINGS
              </Link>
              <Link href="/connected-repo" onClick={() => setMobileMenuOpen(false)} className="btn-mobile-connect">
                <Plus style={{ width: 14, height: 14 }} /> CONNECT REPO
              </Link>
              <button className="btn-signout" onClick={() => { logout(); router.push('/'); }}>
                <LogOut style={{ width: 14, height: 14 }} /> SIGN OUT
              </button>
            </nav>
          </div>
        )}
      </header>

    
      <main>{children}</main>

  
      <footer style={{ borderTop: '2px solid #00ff41', marginTop: 48 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontSize: 12, color: '#4ade80' }}>
            &gt; SYSTEM STATUS: <span style={{ color: '#00ff41' }}>ONLINE</span> | NEAR PROTOCOL: <span style={{ color: '#00ff41' }}>CONNECTED</span>
          </p>
          <p style={{ fontSize: 12, color: '#4ade80' }}>© 2026 HOLY AI</p>
        </div>
      </footer>
    </div>
  );
}