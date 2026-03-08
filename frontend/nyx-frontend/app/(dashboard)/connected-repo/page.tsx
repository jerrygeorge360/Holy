"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/shared/Button";
import {
  Github,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Wallet,
} from "lucide-react";
import { connectRepo, updateRepo, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function ConnectRepo() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [repoInput, setRepoInput] = useState("");
  const [nearWallet, setNearWallet] = useState("");
  const [connectedRepo, setConnectedRepo] = useState<{
    fullName: string;
    owner: string;
    name: string;
  } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSavingWallet, setIsSavingWallet] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!repoInput.includes("/")) {
      setError("Please enter a valid repo in the format owner/repo");
      return;
    }
    setError(null);
    setIsConnecting(true);
    try {
      const repo = await connectRepo(repoInput.trim());
      const [owner, name] = repo.fullName.split("/");
      setConnectedRepo({ fullName: repo.fullName, owner, name });
      refreshUser();
      setStep(2);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        setError("This repository is already connected.");
      } else if (err instanceof ApiError && err.status === 403) {
        setError("Insufficient GitHub permissions. Make sure you have admin access to this repo.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to connect repository");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSaveWallet = async () => {
    if (!connectedRepo) return;
    if (!nearWallet.trim()) {
      router.push("/dashboard");
      return;
    }
    setIsSavingWallet(true);
    setError(null);
    try {
      const result = await updateRepo(connectedRepo.owner, connectedRepo.name, {
        nearWallet: nearWallet.trim(),
      });
      if (result.message) {
        refreshUser();
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 503) {
        setError("Could not register with the NEAR contract. The agent service may be down. Your wallet was not saved.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to save wallet");
      }
    } finally {
      setIsSavingWallet(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0a0e1a', minHeight: '100vh', fontFamily: "'Courier New', Courier, monospace", color: '#00ff41', padding: '32px 16px' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .connect-wrap { max-width: 680px; margin: 0 auto; padding: 0 8px; }
        @media (min-width: 768px) { .connect-wrap { padding: 0 24px; } }

        .section-card { background: #1a1f2e; border: 2px solid #00ff41; padding: 24px; margin-bottom: 20px; }
        .section-card.accent { border-color: #8b5cf6; }

        .sh { padding: 8px 16px; margin-bottom: 20px; display: inline-block; }
        .sh.green  { background: #00ff41; }
        .sh.accent { background: #8b5cf6; }
        .sh h3 { font-size: 12px; font-weight: 700; color: #0a0e1a; margin: 0; letter-spacing: 0.05em; }

        .field-label { font-size: 10px; font-weight: 700; color: #4ade80; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; display: block; }

        .field-input {
          width: 100%; background: #0d1117; border: 1px solid #2a3a2a; color: #00ff41;
          font-family: 'Courier New', monospace; font-size: 12px; padding: 10px 12px;
          outline: none; box-sizing: border-box; transition: border-color 0.15s;
        }
        .field-input:focus { border-color: #00ff41; }
        .field-input::placeholder { color: #2a4a2a; }

        .btn-green {
          background: #00ff41; color: #0a0e1a; border: 2px solid #00ff41;
          padding: 8px 20px; font-family: 'Courier New', monospace; font-weight: 700;
          font-size: 11px; cursor: pointer; transition: background 0.15s, color 0.15s;
          display: inline-flex; align-items: center; gap: 6px; letter-spacing: 0.05em;
        }
        .btn-green:hover { background: transparent; color: #00ff41; }
        .btn-green:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-outline-green {
          background: transparent; color: #00ff41; border: 2px solid #00ff41;
          padding: 8px 20px; font-family: 'Courier New', monospace; font-weight: 700;
          font-size: 11px; cursor: pointer; transition: background 0.15s, color 0.15s;
          display: inline-flex; align-items: center; gap: 6px; letter-spacing: 0.05em;
        }
        .btn-outline-green:hover { background: #00ff41; color: #0a0e1a; }

        .step-indicator {
          display: flex; align-items: center; justify-content: center;
          gap: 16px; margin-bottom: 32px; overflow-x: auto; padding-bottom: 4px;
        }
        .step-node {
          display: flex; align-items: center; gap: 8px; white-space: nowrap;
        }
        .step-num {
          width: 28px; height: 28px; display: flex; align-items: center;
          justify-content: center; font-family: 'Courier New', monospace;
          font-size: 12px; font-weight: 700; flex-shrink: 0;
          border: 2px solid #2a3a2a; color: #2a3a2a; background: #0d1117;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .step-num.active   { border-color: #00ff41; color: #0a0e1a; background: #00ff41; }
        .step-num.complete { border-color: #00ff41; color: #00ff41; background: transparent; }
        .step-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .step-label.active   { color: #00ff41; }
        .step-label.complete { color: #00ff41; }
        .step-label.inactive { color: #2a3a2a; }
        .step-divider { width: 32px; height: 2px; background: #2a3a2a; flex-shrink: 0; }
        .step-divider.done { background: #00ff41; }

        .info-box { background: #0d1117; border: 1px solid #2a3a2a; padding: 16px; margin-bottom: 20px; }
        .info-box.accent { border-color: #8b5cf6; }
        .info-item { display: flex; align-items: flex-start; gap: 8px; font-size: 11px; color: #4ade80; margin-bottom: 8px; }
        .info-item:last-child { margin-bottom: 0; }
        .info-dot { color: #00ff41; font-weight: 700; flex-shrink: 0; margin-top: 1px; }

        .msg-success { padding: 12px 16px; background: rgba(0,255,65,0.05); border: 1px solid #00ff41; color: #00ff41; font-size: 11px; margin-bottom: 20px; }
        .msg-error   { padding: 12px 16px; background: rgba(255,23,68,0.05); border: 1px solid #ff1744; color: #ff1744; font-size: 11px; margin-bottom: 16px; }

        .divider-line { border: none; border-top: 1px solid #1e2a1e; margin: 20px 0; }

        .actions-row { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
        @media (min-width: 480px) { .actions-row { flex-direction: row; justify-content: space-between; } }
      `}</style>

      <div className="connect-wrap">

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ background: '#00ff41', padding: '8px 16px', display: 'inline-block', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0a0e1a' }}>═══ REPOSITORY SETUP ═══</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#00ff41', marginBottom: 4 }}>Connect Repository</h1>
          <p style={{ fontSize: 12, color: '#4ade80' }}>&gt; Link your GitHub repo to Holy in two steps</p>
        </div>

        {/* ── Step Indicator ── */}
        <div className="step-indicator">
          <div className="step-node">
            <div className={`step-num ${step >= 1 ? 'active' : ''}`}>1</div>
            <span className={`step-label ${step >= 1 ? 'active' : 'inactive'}`}>Connect Repository</span>
          </div>
          <div className={`step-divider ${step >= 2 ? 'done' : ''}`} />
          <div className="step-node">
            <div className={`step-num ${step >= 2 ? 'active' : ''}`}>2</div>
            <span className={`step-label ${step >= 2 ? 'active' : 'inactive'}`}>Link NEAR Wallet</span>
          </div>
        </div>

        {/* ══════════════════════════════════════
            STEP 1 — Enter Repository
        ══════════════════════════════════════ */}
        {step === 1 && (
          <div className="section-card">
            <div className="sh green"><h3>═══ CONNECT A REPOSITORY ═══</h3></div>
            <p style={{ fontSize: 11, color: '#4ade80', marginBottom: 20 }}>
              &gt; Enter the GitHub repository you want to connect to Holy
            </p>

            {/* Input */}
            <div style={{ marginBottom: 20 }}>
              <label className="field-label">Repository (owner/name)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <div style={{ background: '#0d1117', border: '1px solid #2a3a2a', borderRight: 'none', padding: '10px 12px', display: 'flex', alignItems: 'center' }}>
                  <Github style={{ width: 14, height: 14, color: '#4ade80' }} />
                </div>
                <input
                  type="text"
                  placeholder="jerrygeorge360/my-project"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                  className="field-input"
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            {/* Error */}
            {error && <div className="msg-error">&gt; ERROR: {error}</div>}

            {/* Info Box */}
            <div className="info-box" style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#00ff41', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                &gt; What happens when you connect?
              </p>
              {[
                'A webhook will be installed on the repository',
                'The Holy agent will start reviewing pull requests',
                'You can attach NEAR bounties to issues and PRs',
              ].map((item) => (
                <div key={item} className="info-item">
                  <span className="info-dot">&gt;</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="actions-row">
              <button className="btn-outline-green" onClick={() => router.push("/dashboard")}>
                CANCEL
              </button>
              <button
                className="btn-green"
                onClick={handleConnect}
                disabled={!repoInput.trim() || isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 style={{ width: 12, height: 12, animation: 'spin 0.8s linear infinite' }} />
                    CONNECTING...
                  </>
                ) : (
                  <>
                    CONNECT
                    <ChevronRight style={{ width: 12, height: 12 }} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            STEP 2 — Link NEAR Wallet
        ══════════════════════════════════════ */}
        {step === 2 && connectedRepo && (
          <div className="section-card">
            <div className="sh green"><h3>═══ LINK NEAR WALLET ═══</h3></div>
            <p style={{ fontSize: 11, color: '#4ade80', marginBottom: 20 }}>
              &gt; Set a NEAR wallet for bounty payouts on{' '}
              <span style={{ color: '#00ff41', fontWeight: 700 }}>{connectedRepo.fullName}</span>
            </p>

            {/* Success Banner */}
            <div className="msg-success">
              &gt; Repository connected successfully! Webhook installed.
            </div>

            {/* Wallet Input */}
            <div style={{ marginBottom: 8 }}>
              <label className="field-label">NEAR Wallet Address (optional)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <div style={{ background: '#0d1117', border: '1px solid #2a3a2a', borderRight: 'none', padding: '10px 12px', display: 'flex', alignItems: 'center' }}>
                  <Wallet style={{ width: 14, height: 14, color: '#4ade80' }} />
                </div>
                <input
                  type="text"
                  value={nearWallet}
                  onChange={(e) => setNearWallet(e.target.value)}
                  placeholder="your-name.testnet"
                  className="field-input"
                  style={{ flex: 1 }}
                />
              </div>
              <p style={{ fontSize: 10, color: '#2a5a2a', marginTop: 8 }}>
                &gt; This wallet receives bounty payouts and registers your repo on the NEAR contract
              </p>
            </div>

            <hr className="divider-line" />

            {/* Error */}
            {error && <div className="msg-error">&gt; ERROR: {error}</div>}

            {/* Actions */}
            <div className="actions-row">
              <button className="btn-outline-green" onClick={() => setStep(1)}>
                <ChevronLeft style={{ width: 12, height: 12 }} />
                BACK
              </button>
              <button
                className="btn-green"
                onClick={handleSaveWallet}
                disabled={isSavingWallet}
              >
                {isSavingWallet ? (
                  <>
                    <Loader2 style={{ width: 12, height: 12, animation: 'spin 0.8s linear infinite' }} />
                    REGISTERING ON CONTRACT...
                  </>
                ) : nearWallet.trim() ? (
                  <>
                    <Wallet style={{ width: 12, height: 12 }} />
                    SAVE WALLET & REGISTER
                  </>
                ) : (
                  <>
                    SKIP & GO TO DASHBOARD
                    <ChevronRight style={{ width: 12, height: 12 }} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}