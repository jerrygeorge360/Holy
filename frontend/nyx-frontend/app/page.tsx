"use client";
import { useAuth } from "@/lib/AuthContext";
import { API_BASE_URL } from "@/lib/config";
import { Github, Code2, Shield, Zap, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";




export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const handleSignIn = () => {
    window.location.href = `${API_BASE_URL}/auth/github`;
    
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0e1a",
        color: "#00ff41",
        fontFamily: "'Courier New', Courier, monospace",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #0a0e1a; }

        .terminal-border {
          border: 2px solid #00ff41;
        }

        .terminal-border-accent {
          border: 2px solid #8b5cf6;
        }

        .btn-primary {
          background: #00ff41;
          color: #0a0e1a;
          border: 2px solid #00ff41;
          padding: 12px 28px;
          font-family: 'Courier New', monospace;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary:hover {
          background: transparent;
          color: #00ff41;
        }

        .btn-outline {
          background: transparent;
          color: #00ff41;
          border: 2px solid #00ff41;
          padding: 10px 20px;
          font-family: 'Courier New', monospace;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }

        .btn-outline:hover {
          background: #00ff41;
          color: #0a0e1a;
        }

        .card {
          background: #1a1f2e;
          border: 2px solid #00ff41;
        }

        .card-accent {
          background: #1a1f2e;
          border: 2px solid #8b5cf6;
        }

        .card-header-green {
          background: #00ff41;
          padding: 12px 16px;
        }

        .card-header-accent {
          background: #8b5cf6;
          padding: 12px 16px;
        }

        .tag-green {
          color: #00ff41;
          font-size: 11px;
        }

        .tag-accent {
          color: #8b5cf6;
          font-size: 11px;
        }

        .muted { color: #4ade80; }

        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 16px;
        }

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

        .blink {
          animation: blink 1s step-end infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        pre {
          overflow-x: auto;
          color: #00ff41;
          font-size: 10px;
          line-height: 1.2;
        }

        @media (min-width: 640px) {
          pre { font-size: 13px; }
        }

        .step-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #00ff41;
          color: #0a0e1a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }

        .grid-3 {
          display: grid;
          gap: 24px;
        }

        @media (min-width: 640px) {
          .grid-3 { grid-template-columns: 1fr 1fr; }
        }

        @media (min-width: 768px) {
          .grid-3 { grid-template-columns: 1fr 1fr 1fr; }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          text-align: center;
        }

        @media (min-width: 768px) {
          .stats-grid { grid-template-columns: repeat(4, 1fr); }
        }

        .header-bar {
          border-bottom: 2px solid #00ff41;
          padding: 16px 0;
        }
      `}</style>

      {/* Scanline overlay */}
      <div className="scanline" />

      {/* Header */}
      <header className="header-bar">
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ border: "2px solid #00ff41", padding: "4px" }}>
              <Code2 style={{ width: 20, height: 20, color: "#00ff41" }} />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#00ff41", display: "block", lineHeight: 1.2 }}>HOLY</span>
              <span style={{ fontSize: 10, color: "#4ade80" }}>v1.0.0</span>
            </div>
          </div>

          {!isLoading && user ? (
            <button className="btn-outline" onClick={() => router.push("/dashboard")}>
              DASHBOARD
            </button>
          ) : (
            <button className="btn-outline" onClick={handleSignIn}>
              SIGN IN
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: "64px 0" }}>
        <div className="container">
          <div style={{ maxWidth: 900, margin: "0 auto" }}>

            {/* ASCII Art Header */}
            <div className="terminal-border" style={{ background: "#1a1f2e", marginBottom: 32, padding: 24 }}>
              <pre>{`
 ██╗  ██╗ ██████╗ ██╗  ██╗   ██╗
 ██║  ██║██╔═══██╗██║  ╚██╗ ██╔╝
 ███████║██║   ██║██║   ╚████╔╝ 
 ██╔══██║██║   ██║██║    ╚██╔╝  
 ██║  ██║╚██████╔╝███████╗██║   
 ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝   
`}</pre>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                <p style={{ color: "#00ff41", fontSize: 13 }}>&gt; SYSTEM: AI-Powered Code Review Agent</p>
                <p style={{ color: "#00ff41", fontSize: 13 }}>&gt; PLATFORM: GitHub Integration</p>
                <p style={{ color: "#00ff41", fontSize: 13 }}>&gt; NETWORK: NEAR Protocol Blockchain</p>
                <p style={{ color: "#00ff41", fontSize: 13 }}>&gt; STATUS: <span style={{ color: "#8b5cf6" }}>OPERATIONAL<span className="blink">█</span></span></p>
              </div>
            </div>

            {/* CTA Block */}
            <div className="terminal-border-accent" style={{ background: "#1a1f2e", padding: 32, marginBottom: 32 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#00ff41", marginBottom: 16 }}>
                [MISSION CRITICAL] AI-POWERED CODE REVIEWS
              </h2>
              <p className="muted" style={{ marginBottom: 24, lineHeight: 1.7, fontSize: 14 }}>
                Automatically review pull requests, catch security issues, and reward contributors 
                with instant NEAR token payouts when PRs are merged. Deploy autonomous AI agents 
                to scan every PR before it reaches production.
              </p>
              <button className="btn-primary" onClick={handleSignIn}>
                <Github style={{ width: 18, height: 18 }} />
                [AUTHENTICATE] GITHUB LOGIN
              </button>
              <p style={{ fontSize: 12, color: "#4ade80", marginTop: 12 }}>
                &gt; Free tier available for public repositories
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: "0 0 64px" }}>
        <div className="container">
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>

            {/* Section Header */}
            <div style={{ background: "#00ff41", padding: "8px 16px", marginBottom: 24 }}>
              <h2 style={{ color: "#0a0e1a", fontWeight: 700, fontSize: 14 }}>═══ SYSTEM CAPABILITIES ═══</h2>
            </div>

            <div className="grid-3">
              {/* Security */}
              <div className="card">
                <div className="card-header-green">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Shield style={{ width: 18, height: 18, color: "#0a0e1a" }} />
                    <h3 style={{ fontWeight: 700, color: "#0a0e1a", fontSize: 13 }}>SECURITY SCAN</h3>
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  <p className="muted" style={{ fontSize: 12, marginBottom: 12, lineHeight: 1.6 }}>
                    Deep analysis for vulnerabilities, injection attacks, and security misconfigurations
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <p className="tag-green">▸ SQL Injection Detection</p>
                    <p className="tag-green">▸ XSS Prevention</p>
                    <p className="tag-green">▸ Auth Bypass Check</p>
                    <p className="tag-green">▸ Dependency Audit</p>
                  </div>
                </div>
              </div>

              {/* NEAR Bounties */}
              <div className="card">
                <div className="card-header-green">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Zap style={{ width: 18, height: 18, color: "#0a0e1a" }} />
                    <h3 style={{ fontWeight: 700, color: "#0a0e1a", fontSize: 13 }}>NEAR BOUNTIES</h3>
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  <p className="muted" style={{ fontSize: 12, marginBottom: 12, lineHeight: 1.6 }}>
                    Attach NEAR token bounties to GitHub issues. Contributors get paid automatically when their PR is merged.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <p className="tag-green">▸ Smart Contract Agent</p>
                    <p className="tag-green">▸ Auto Pay-on-Merge</p>
                    <p className="tag-green">▸ Transparent Logging</p>
                    <p className="tag-green">▸ Immutable Records</p>
                  </div>
                </div>
              </div>

              {/* Custom Criteria */}
              <div className="card-accent" style={{ background: "#1a1f2e" }}>
                <div className="card-header-accent">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 style={{ width: 18, height: 18, color: "#0a0e1a" }} />
                    <h3 style={{ fontWeight: 700, color: "#0a0e1a", fontSize: 13 }}>CUSTOM CRITERIA</h3>
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  <p className="muted" style={{ fontSize: 12, marginBottom: 12, lineHeight: 1.6 }}>
                    Define custom review guidelines per repository. The AI enforces your team's coding standards on every PR.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <p className="tag-accent">▸ Per-Repo Config</p>
                    <p className="tag-accent">▸ Team Standards</p>
                    <p className="tag-accent">▸ Algorithm Analysis</p>
                    <p className="tag-accent">▸ Bundle Size Check</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: "0 0 64px" }}>
        <div className="container">
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div className="terminal-border" style={{ background: "#1a1f2e", padding: 40 }}>
              <div className="stats-grid">
                <div>
                  <div style={{ fontSize: 36, fontWeight: 700, color: "#00ff41", marginBottom: 6 }}>2.3M+</div>
                  <div style={{ fontSize: 11, color: "#4ade80" }}>REVIEWS EXECUTED</div>
                </div>
                <div>
                  <div style={{ fontSize: 36, fontWeight: 700, color: "#00ff41", marginBottom: 6 }}>15K+</div>
                  <div style={{ fontSize: 11, color: "#4ade80" }}>VULNERABILITIES CAUGHT</div>
                </div>
                <div>
                  <div style={{ fontSize: 36, fontWeight: 700, color: "#00ff41", marginBottom: 6 }}>1,200+</div>
                  <div style={{ fontSize: 11, color: "#4ade80" }}>REPOSITORIES</div>
                </div>
                <div>
                  <div style={{ fontSize: 36, fontWeight: 700, color: "#8b5cf6", marginBottom: 6 }}>99.9%</div>
                  <div style={{ fontSize: 11, color: "#4ade80" }}>UPTIME</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: "0 0 64px", borderTop: "2px solid #00ff41" }}>
        <div className="container">
          <div style={{ maxWidth: 700, margin: "0 auto", paddingTop: 48 }}>

            <div style={{ background: "#00ff41", padding: "8px 16px", marginBottom: 32 }}>
              <h2 style={{ color: "#0a0e1a", fontWeight: 700, fontSize: 14 }}>═══ DEPLOYMENT PROTOCOL ═══</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                { num: 1, title: "CONNECT YOUR REPOSITORY", desc: "Link your GitHub repo and install a webhook in one click" },
                { num: 2, title: "SET A BOUNTY", desc: "Attach NEAR tokens to issues to attract contributors" },
                { num: 3, title: "MERGE & PAY", desc: "When a PR is merged, the contributor gets paid from the smart contract" }
              ].map((step) => (
                <div key={step.num} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div className="step-circle">{step.num}</div>
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "#00ff41", marginBottom: 4 }}>
                      &gt; {step.title}
                    </h4>
                    <p className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: "0 0 64px", borderTop: "2px solid #00ff41" }}>
        <div className="container">
          <div style={{ maxWidth: 700, margin: "0 auto", paddingTop: 48 }}>
            <div className="terminal-border-accent" style={{ background: "#1a1f2e", padding: 40, textAlign: "center" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#00ff41", marginBottom: 16 }}>
                [INITIALIZE] START CODE PROTECTION NOW
              </h2>
              <p className="muted" style={{ marginBottom: 24, fontSize: 14, lineHeight: 1.7 }}>
                Connect your GitHub repositories and deploy your AI review agent in under 60 seconds
              </p>
              <button className="btn-primary" onClick={handleSignIn} style={{ margin: "0 auto 20px" }}>
                <Github style={{ width: 18, height: 18 }} />
                AUTHENTICATE WITH GITHUB
              </button>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 16 }}>
                <p style={{ fontSize: 12, color: "#4ade80" }}>✓ No credit card required</p>
                <p style={{ fontSize: 12, color: "#4ade80" }}>✓ Free for public repos</p>
                <p style={{ fontSize: 12, color: "#4ade80" }}>✓ 5-minute setup</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "2px solid #00ff41" }}>
        <div className="container" style={{ padding: "32px 16px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32, marginBottom: 24 }}>
              <div>
                <h4 style={{ fontWeight: 700, color: "#00ff41", marginBottom: 12, fontSize: 12 }}>PRODUCT</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {["Features", "Pricing", "Documentation", "Changelog"].map(item => (
                    <p key={item} className="muted" style={{ fontSize: 12 }}>&gt; {item}</p>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, color: "#00ff41", marginBottom: 12, fontSize: 12 }}>RESOURCES</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {["NEAR Protocol", "API Reference", "GitHub Integration", "Support"].map(item => (
                    <p key={item} className="muted" style={{ fontSize: 12 }}>&gt; {item}</p>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, color: "#00ff41", marginBottom: 12, fontSize: 12 }}>COMPANY</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {["About", "Blog", "Careers", "Contact"].map(item => (
                    <p key={item} className="muted" style={{ fontSize: 12 }}>&gt; {item}</p>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ borderTop: "2px solid #00ff41", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <p className="muted" style={{ fontSize: 12 }}>
                &gt; SYSTEM STATUS: <span style={{ color: "#00ff41" }}>ONLINE</span>
              </p>
              <p className="muted" style={{ fontSize: 12 }}>
                © 2026 HOLY AI | NEAR PROTOCOL INTEGRATION
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}