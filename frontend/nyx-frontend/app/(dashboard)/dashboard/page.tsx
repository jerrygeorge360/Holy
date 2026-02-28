"use client";

import { useState, useEffect } from "react";
import {
  GitBranch,
  ChevronRight,
  Wallet,
  Loader2,
  Trash2,
  ExternalLink,
  Coins,
  Terminal,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  Cpu,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import {
  getMyRepos,
  deleteRepo,
  getBountyHistory,
  type EnrichedRepository,
  ApiError,
} from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function DashboardPage() {
  const { refreshUser } = useAuth();
  const [repos, setRepos] = useState<EnrichedRepository[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showBulkFund, setShowBulkFund] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchRepos = () => {
    setLoading(true);
    Promise.all([getMyRepos(), getBountyHistory().catch(() => ({ payouts: [] }))])
      .then(([reposData, historyData]: [EnrichedRepository[], any]) => {
        setRepos(reposData);
        if (historyData?.payouts) {
          setHistory(historyData.payouts.slice(0, 5));
        }
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setMounted(true);
    fetchRepos();
  }, []);

  const handleDisconnect = async (repo: EnrichedRepository) => {
    if (!confirm(`Disconnect ${repo.fullName}? This will remove the webhook.`)) return;
    const [owner, name] = repo.fullName.split("/");
    setDeletingId(repo.id);
    try {
      await deleteRepo(owner, name);
      setRepos((prev) => prev.filter((r) => r.id !== repo.id));
      refreshUser();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to disconnect");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0e1a' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 32, height: 32, border: '3px solid #00ff41', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ margin: '32px 24px', padding: 24, border: '2px solid #ff1744', backgroundColor: '#1a0a0a', fontFamily: "'Courier New', monospace" }}>
        <p style={{ color: '#ff1744', fontSize: 13 }}>&gt; ERROR: Failed to load repositories: {error}</p>
        <button
          onClick={fetchRepos}
          style={{ marginTop: 12, fontSize: 12, color: '#ff1744', background: 'transparent', border: '1px solid #ff1744', padding: '4px 12px', cursor: 'pointer', fontFamily: "'Courier New', monospace" }}
        >
          [RETRY]
        </button>
      </div>
    );
  }

  const totalRepos = repos.length;
  const reposWithWallet = repos.filter((r) => r.nearWallet).length;
  const totalBalance = repos.reduce((sum, r) => sum + (Number(r.bountyBalance) || 0), 0);

  return (
    <div style={{ backgroundColor: '#0a0e1a', minHeight: '100vh', fontFamily: "'Courier New', Courier, monospace", color: '#00ff41', padding: '32px 16px' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        .repo-row { border: 2px solid #2a3a2a; background: transparent; padding: 14px 16px; transition: border-color 0.15s, background 0.15s; }
        .repo-row:hover { border-color: #00ff41 !important; background-color: rgba(0,255,65,0.05) !important; }
        .repo-row:hover .chevron-icon { color: #00ff41 !important; }

        .btn-outline-green { background: transparent; color: #00ff41; border: 2px solid #00ff41; padding: 8px 16px; font-family: 'Courier New', monospace; font-weight: 700; font-size: 12px; cursor: pointer; transition: background 0.15s, color 0.15s; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; }
        .btn-outline-green:hover { background: #00ff41; color: #0a0e1a; }

        .btn-solid-green { background: #00ff41; color: #0a0e1a; border: 2px solid #00ff41; padding: 8px 16px; font-family: 'Courier New', monospace; font-weight: 700; font-size: 12px; cursor: pointer; transition: background 0.15s, color 0.15s; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; }
        .btn-solid-green:hover { background: transparent; color: #00ff41; }

        .btn-outline-accent { background: transparent; color: #8b5cf6; border: 2px solid #8b5cf6; padding: 8px 16px; font-family: 'Courier New', monospace; font-weight: 700; font-size: 12px; cursor: pointer; transition: background 0.15s, color 0.15s; display: inline-flex; align-items: center; gap: 6px; }
        .btn-outline-accent:hover { background: #8b5cf6; color: #0a0e1a; }

        .btn-icon-ghost { background: transparent; color: #4ade80; border: none; padding: 6px; cursor: pointer; transition: color 0.15s; display: inline-flex; align-items: center; }
        .btn-icon-ghost:hover { color: #00ff41; }

        .btn-icon-danger { background: transparent; color: #4ade80; border: none; padding: 6px; cursor: pointer; transition: color 0.15s; display: inline-flex; align-items: center; }
        .btn-icon-danger:hover { color: #ff1744; }

        .btn-fund-mini { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; font-family: 'Courier New', monospace; font-weight: 700; font-size: 10px; color: #8b5cf6; border: 1px solid #8b5cf6; background: transparent; cursor: pointer; transition: background 0.15s, color 0.15s; text-decoration: none; }
        .btn-fund-mini:hover { background: #8b5cf6; color: #0a0e1a; }

        .tag-green  { background: rgba(0,255,65,0.1);   color: #00ff41;  border: 1px solid #00ff41;  padding: 2px 8px; font-size: 10px; font-weight: 700; }
        .tag-yellow { background: rgba(251,191,36,0.1); color: #fbbf24;  border: 1px solid #fbbf24;  padding: 2px 8px; font-size: 10px; font-weight: 700; }
        .tag-accent { background: rgba(139,92,246,0.1); color: #8b5cf6;  border: 1px solid #8b5cf6;  padding: 2px 8px; font-size: 10px; font-weight: 700; }
        .tag-red    { background: rgba(255,23,68,0.1);  color: #ff1744;  border: 1px solid #ff1744;  padding: 2px 8px; font-size: 10px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; }
        .tag-orange { background: rgba(251,146,60,0.1); color: #fb923c;  border: 1px solid #fb923c;  padding: 2px 8px; font-size: 10px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; }

        .stat-card { background: #1a1f2e; border: 2px solid #00ff41; padding: 16px; }
        .section-card { background: #1a1f2e; border: 2px solid #00ff41; padding: 24px; }
        .section-header-green { background: #00ff41; padding: 8px 16px; margin-bottom: 20px; }
        .section-header-accent { background: #8b5cf6; padding: 8px 16px; margin-bottom: 20px; }
        .divider { border-bottom: 1px solid #1e2a1e; padding-bottom: 12px; margin-bottom: 12px; }
        .divider:last-child { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }

        .copy-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: #1e2a3a; color: #00ff41; border: 1px solid #00ff41; font-family: 'Courier New', monospace; font-size: 11px; font-weight: 700; cursor: pointer; transition: background 0.15s; }
        .copy-btn:hover { background: #2a3a4a; }

        .stats-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .main-grid   { display: grid; grid-template-columns: 1fr; gap: 24px; }
        .dash-wrap   { max-width: 1100px; margin: 0 auto; padding: 0 8px; }

        @media (min-width: 768px) {
          .stats-grid { grid-template-columns: repeat(3, 1fr); }
          .main-grid  { grid-template-columns: 2fr 1fr; }
          .dash-wrap  { padding: 0 24px; }
        }
      `}</style>

      {/* Page Header */}
      <div className="dash-wrap" style={{ marginBottom: 32 }}>
        <div style={{ background: '#00ff41', padding: '8px 16px', display: 'inline-block', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0a0e1a' }}>═══ COMMAND CENTER ═══</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#00ff41', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 12, color: '#4ade80' }}>&gt; Overview of your connected repositories and bounties</p>
      </div>

      {/* Stats Grid */}
      <div className="dash-wrap" style={{ marginBottom: 32 }}>
        <div className="stats-grid">
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 700 }}>CONNECTED REPOS</span>
              <GitBranch style={{ width: 14, height: 14, color: '#4ade80' }} />
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#00ff41', lineHeight: 1 }}>{totalRepos}</div>
            <p style={{ fontSize: 11, color: '#4ade80', marginTop: 6 }}>{reposWithWallet} with wallet</p>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 700 }}>TOTAL BOUNTY BALANCE</span>
              <Wallet style={{ width: 14, height: 14, color: '#4ade80' }} />
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#00ff41', lineHeight: 1 }}>
              {totalBalance > 0 ? `${totalBalance}` : '0'}
            </div>
            <p style={{ fontSize: 11, color: '#4ade80', marginTop: 6 }}>NEAR across all repos</p>
          </div>

          <div className="stat-card" style={{ borderColor: '#8b5cf6', gridColumn: 'span 2' }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 700 }}>QUICK ACTIONS</span>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/connected-repo" className="btn-solid-green">+ CONNECT REPO</Link>
              <button className="btn-outline-accent" onClick={() => setShowBulkFund(!showBulkFund)}>
                <Terminal style={{ width: 12, height: 12 }} />
                BULK FUND CLI
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Fund Assistant */}
      {showBulkFund && (
        <div className="dash-wrap" style={{ marginBottom: 32 }}>
          <div style={{ background: '#0d1117', border: '2px solid #8b5cf6', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ border: '2px solid #8b5cf6', padding: 6 }}>
                  <Terminal style={{ width: 14, height: 14, color: '#8b5cf6' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#8b5cf6', margin: 0 }}>BULK FUNDING ASSISTANT</h3>
                  <p style={{ fontSize: 10, color: '#4ade80', margin: 0 }}>&gt; Fund all low-balance repositories in one go</p>
                </div>
              </div>
              <button
                className="copy-btn"
                onClick={() => {
                  const cmd = repos
                    .filter(r => (Number(r.bountyBalance) || 0) < 5)
                    .map(r => `near call holy_contract.testnet fund_bounty '{"repo_id": "${r.fullName}"}' --accountId ${r.nearWallet || 'YOUR_ACCOUNT'} --deposit 10`)
                    .join(' && \\\n');
                  navigator.clipboard.writeText(cmd);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check style={{ width: 12, height: 12, color: '#00ff41' }} /> : <Copy style={{ width: 12, height: 12 }} />}
                {copied ? 'COPIED!' : 'COPY SHELL SCRIPT'}
              </button>
            </div>
            <div style={{ background: '#000', border: '1px solid #8b5cf6', padding: 16, maxHeight: 150, overflow: 'auto' }}>
              {repos.filter(r => (Number(r.bountyBalance) || 0) < 5).length > 0 ? (
                <pre style={{ fontSize: 11, color: '#8b5cf6', margin: 0, lineHeight: 1.6 }}>
                  {repos
                    .filter(r => (Number(r.bountyBalance) || 0) < 5)
                    .map(r => `near call holy_contract.testnet fund_bounty '{"repo_id": "${r.fullName}"}' --accountId ${r.nearWallet || 'YOUR_ACCOUNT'} --deposit 10`)
                    .join(' && \\\n')}
                </pre>
              ) : (
                <p style={{ fontSize: 11, color: '#4ade80', margin: 0, fontStyle: 'italic' }}>
                  &gt; All repositories have healthy balances (≥ 5 NEAR).
                </p>
              )}
            </div>
            <p style={{ marginTop: 12, fontSize: 10, color: '#4ade80' }}>
              &gt; TIP: This command deposits 10 NEAR into each repository marked as "Needs Funding".
            </p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="dash-wrap">
        <div className="main-grid">

          {/* Connected Repositories */}
          <div className="section-card">
            <div className="section-header-green">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0a0e1a', margin: 0 }}>═══ CONNECTED REPOSITORIES ═══</h3>
            </div>
            <p style={{ fontSize: 11, color: '#4ade80', marginBottom: 20 }}>&gt; Your repositories linked to Holy</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {repos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <p style={{ fontSize: 12, color: '#4ade80', marginBottom: 16 }}>&gt; No repositories connected yet.</p>
                  <Link href="/connected-repo" className="btn-solid-green">+ CONNECT YOUR FIRST REPO</Link>
                </div>
              ) : (
                repos.map((repo) => {
                  const [owner, name] = (repo.fullName || "").split("/");
                  const balance = Number(repo.bountyBalance) || 0;
                  return (
                    <div key={repo.id} className="repo-row">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Link href={`/repo/${owner}/${name}`} style={{ flex: 1, textDecoration: 'none', minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                            <span style={{ fontWeight: 700, color: '#00ff41', fontSize: 13 }}>{repo.fullName}</span>
                            {repo.nearWallet
                              ? <span className="tag-green">WALLET LINKED</span>
                              : <span className="tag-yellow">NO WALLET</span>
                            }
                            {repo.preferences && repo.preferences.length > 0 &&
                              <span className="tag-accent">CRITERIA SET</span>
                            }
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            {balance > 0
                              ? <span style={{ fontSize: 11, color: '#00ff41', fontWeight: 700 }}>{balance} NEAR</span>
                              : <span style={{ fontSize: 11, color: '#fb923c', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <AlertTriangle style={{ width: 11, height: 11 }} /> 0 NEAR
                                </span>
                            }
                            {!repo.nearWallet
                              ? <span className="tag-red"><ShieldAlert style={{ width: 10, height: 10 }} /> NO ACCT</span>
                              : balance === 0
                              ? <span className="tag-orange"><Coins style={{ width: 10, height: 10 }} /> NEEDS FUND</span>
                              : (!repo.preferences || repo.preferences.length === 0)
                              ? <span className="tag-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Cpu style={{ width: 10, height: 10 }} /> SET AI</span>
                              : <span className="tag-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle style={{ width: 10, height: 10 }} /> OK</span>
                            }
                          </div>
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8, flexShrink: 0 }}>
                          <Link href={`/repo/${owner}/${name}?tab=funding`} className="btn-fund-mini">
                            <Coins style={{ width: 10, height: 10 }} /> FUND
                          </Link>
                          <a href={repo.url} target="_blank" rel="noopener noreferrer" className="btn-icon-ghost" title="Open on GitHub">
                            <ExternalLink style={{ width: 14, height: 14 }} />
                          </a>
                          <button
                            className="btn-icon-danger"
                            onClick={(e) => { e.preventDefault(); handleDisconnect(repo); }}
                            disabled={deletingId === repo.id}
                            title="Disconnect repo"
                          >
                            {deletingId === repo.id
                              ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 0.8s linear infinite' }} />
                              : <Trash2 style={{ width: 14, height: 14 }} />
                            }
                          </button>
                          <Link href={`/repo/${owner}/${name}`} style={{ color: '#4ade80', display: 'inline-flex' }}>
                            <ChevronRight style={{ width: 16, height: 16 }} className="chevron-icon" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <Link href="/connected-repo" className="btn-outline-green" style={{ width: '100%', marginTop: 20, justifyContent: 'center', boxSizing: 'border-box' }}>
              + CONNECT NEW REPOSITORY
            </Link>
          </div>

          {/* Recent Payouts */}
          <div className="section-card" style={{ borderColor: '#8b5cf6', alignSelf: 'start' }}>
            <div className="section-header-accent">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0a0e1a', margin: 0 }}>═══ RECENT PAYOUTS ═══</h3>
            </div>
            <p style={{ fontSize: 11, color: '#4ade80', marginBottom: 20 }}>&gt; Latest rewards across your repos</p>

            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <p style={{ fontSize: 11, color: '#4ade80' }}>&gt; No recent payouts to show.</p>
              </div>
            ) : (
              <div>
                {history.map((item, idx) => (
                  <div key={idx} className="divider">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#00ff41', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                        {item.repo}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#00ff41', flexShrink: 0 }}>
                        +{item.amount} NEAR
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10, color: '#4ade80' }}>PR #{item.prNumber}</span>
                      <span style={{ fontSize: 10, color: '#4ade80' }}>
                        {mounted ? new Date(item.timestamp).toLocaleDateString() : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}