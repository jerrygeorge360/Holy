"use client";

import { useState, useEffect } from "react";
import {
    Coins,
    Search,
    ExternalLink,
    Zap,
    Loader2,
    Trophy,
    GitBranch,
    ArrowRight,
} from "lucide-react";
import { getExploreBounties, type Bounty } from "@/lib/api";

export default function ExplorePage() {
    const [bounties, setBounties] = useState<Bounty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchBounties();
    }, []);

    const fetchBounties = async () => {
        setLoading(true);
        try {
            const data = await getExploreBounties();
            setBounties(data.bounties);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load bounties");
        } finally {
            setLoading(false);
        }
    };

    const filteredBounties = bounties.filter((b) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            b.repository?.fullName.toLowerCase().includes(searchLower) ||
            b.issueNumber?.toString().includes(searchLower) ||
            b.prNumber?.toString().includes(searchLower) ||
            b.amount.includes(searchLower)
        );
    });

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
                <p style={{ color: '#ff1744', fontSize: 13 }}>&gt; ERROR: {error}</p>
                <button
                    onClick={fetchBounties}
                    style={{ marginTop: 12, fontSize: 12, color: '#ff1744', background: 'transparent', border: '1px solid #ff1744', padding: '4px 12px', cursor: 'pointer', fontFamily: "'Courier New', monospace" }}
                >
                    [RETRY]
                </button>
            </div>
        );
    }

    const totalPool = bounties.reduce((acc, b) => acc + Number(b.amount), 0).toFixed(2);
    const highestBounty = Math.max(...bounties.map(b => Number(b.amount)), 0);

    return (
        <div style={{ backgroundColor: '#0a0e1a', minHeight: '100vh', fontFamily: "'Courier New', Courier, monospace", color: '#00ff41', padding: '32px 16px' }}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

                .explore-wrap { max-width: 1100px; margin: 0 auto; padding: 0 8px; }

                .stat-card { background: #1a1f2e; border: 2px solid #00ff41; padding: 16px; }
                .stat-card-accent { background: #1a1f2e; border: 2px solid #8b5cf6; padding: 16px; }
                .stat-card-orange { background: #1a1f2e; border: 2px solid #fb923c; padding: 16px; }

                .search-input {
                    width: 100%;
                    background: #1a1f2e;
                    border: 2px solid #00ff41;
                    color: #00ff41;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    padding: 10px 10px 10px 36px;
                    outline: none;
                    transition: border-color 0.15s;
                    box-sizing: border-box;
                }
                .search-input::placeholder { color: #4ade80; opacity: 0.6; }
                .search-input:focus { border-color: #8b5cf6; }

                .bounty-card {
                    background: #1a1f2e;
                    border: 2px solid #2a3a2a;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    transition: border-color 0.15s, background 0.15s;
                }
                .bounty-card:hover { border-color: #00ff41; background: rgba(0,255,65,0.03); }
                .bounty-card:hover .start-btn { background: #00ff41; color: #0a0e1a; }

                .start-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    background: transparent;
                    color: #00ff41;
                    border: 2px solid #00ff41;
                    font-family: 'Courier New', monospace;
                    font-weight: 700;
                    font-size: 11px;
                    cursor: pointer;
                    transition: background 0.15s, color 0.15s;
                    text-decoration: none;
                }
                .start-btn:hover { background: #00ff41; color: #0a0e1a; }

                .repo-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    background: rgba(0,255,65,0.08);
                    border: 1px solid #00ff41;
                    padding: 3px 10px;
                    font-size: 10px;
                    font-weight: 700;
                    color: #00ff41;
                    max-width: 70%;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }

                .high-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    background: rgba(251,146,60,0.1);
                    border: 1px solid #fb923c;
                    padding: 3px 8px;
                    font-size: 10px;
                    font-weight: 700;
                    color: #fb923c;
                }

                .ext-link {
                    color: #4ade80;
                    display: inline-flex;
                    align-items: center;
                    padding: 4px;
                    transition: color 0.15s;
                    text-decoration: none;
                }
                .ext-link:hover { color: #00ff41; }

                .bounties-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 16px;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 32px;
                }

                @media (min-width: 640px) {
                    .bounties-grid { grid-template-columns: 1fr 1fr; }
                }
                @media (min-width: 1024px) {
                    .bounties-grid { grid-template-columns: repeat(3, 1fr); }
                    .stats-grid { grid-template-columns: repeat(3, 1fr); }
                }
                @media (min-width: 768px) {
                    .explore-wrap { padding: 0 24px; }
                }
            `}</style>

            {/* Page Header */}
            <div className="explore-wrap" style={{ marginBottom: 32 }}>
                <div style={{ background: '#8b5cf6', padding: '8px 16px', display: 'inline-block', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0a0e1a' }}>═══ OPPORTUNITIES ═══</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <Trophy style={{ width: 20, height: 20, color: '#fb923c' }} />
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#00ff41', margin: 0 }}>Explore Bounties</h1>
                </div>
                <p style={{ fontSize: 12, color: '#4ade80' }}>
                    &gt; Find active bounties and start contributing to earn NEAR
                </p>
            </div>

            {/* Stats */}
            <div className="explore-wrap">
                <div className="stats-grid">
                    <div className="stat-card">
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#4ade80', marginBottom: 10, letterSpacing: 1 }}>AVAILABLE BOUNTIES</p>
                        <p style={{ fontSize: 32, fontWeight: 700, color: '#00ff41', lineHeight: 1 }}>{bounties.length}</p>
                    </div>
                    <div className="stat-card-accent">
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#8b5cf6', marginBottom: 10, letterSpacing: 1 }}>TOTAL REWARD POOL</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            <p style={{ fontSize: 32, fontWeight: 700, color: '#8b5cf6', lineHeight: 1 }}>{totalPool}</p>
                            <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 700 }}>NEAR</span>
                        </div>
                    </div>
                    <div className="stat-card-orange" style={{ gridColumn: 'span 2' }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#fb923c', marginBottom: 10, letterSpacing: 1 }}>HIGHEST BOUNTY</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            <p style={{ fontSize: 32, fontWeight: 700, color: '#fb923c', lineHeight: 1 }}>{highestBounty}</p>
                            <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 700 }}>NEAR</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="explore-wrap" style={{ marginBottom: 24 }}>
                <div style={{ position: 'relative', maxWidth: 600 }}>
                    <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#4ade80', pointerEvents: 'none' }} />
                    <input
                        type="text"
                        placeholder="Search by repository or amount..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {/* Bounty Grid */}
            <div className="explore-wrap" style={{ marginBottom: 40 }}>
                {/* Section label */}
                <div style={{ background: '#00ff41', padding: '8px 16px', marginBottom: 20, display: 'inline-block' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0a0e1a' }}>═══ ACTIVE BOUNTIES ═══</span>
                </div>

                {filteredBounties.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '64px 0', border: '2px solid #2a3a2a', background: '#1a1f2e' }}>
                        <Coins style={{ width: 40, height: 40, color: '#2a3a2a', margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#4ade80', marginBottom: 8 }}>NO BOUNTIES FOUND</h3>
                        <p style={{ fontSize: 12, color: '#4ade80', opacity: 0.6 }}>&gt; Try adjusting your search query or check back later.</p>
                    </div>
                ) : (
                    <div className="bounties-grid">
                        {filteredBounties.map((bounty) => (
                            <div key={bounty.id} className="bounty-card">
                                {/* Card Top */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                    <span className="repo-tag">
                                        <GitBranch style={{ width: 10, height: 10, flexShrink: 0 }} />
                                        {bounty.repository?.fullName}
                                    </span>
                                    {Number(bounty.amount) >= 20 && (
                                        <span className="high-tag">
                                            <Zap style={{ width: 10, height: 10 }} /> HIGH
                                        </span>
                                    )}
                                </div>

                                {/* Issue/PR + Amount */}
                                <div style={{ flex: 1, marginBottom: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: '#00ff41' }}>
                                            {bounty.issueNumber ? `ISSUE #${bounty.issueNumber}` : `PR #${bounty.prNumber}`}
                                        </span>
                                        <a
                                            href={bounty.repository?.url + (bounty.issueNumber ? `/issues/${bounty.issueNumber}` : `/pull/${bounty.prNumber}`)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ext-link"
                                        >
                                            <ExternalLink style={{ width: 12, height: 12 }} />
                                        </a>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                        <span style={{ fontSize: 36, fontWeight: 700, color: '#00ff41', lineHeight: 1 }}>{bounty.amount}</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>NEAR</span>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div style={{ borderTop: '1px solid #1e2a1e', paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <p style={{ fontSize: 9, fontWeight: 700, color: '#4ade80', letterSpacing: 1, marginBottom: 3 }}>POSTED</p>
                                        <p style={{ fontSize: 11, color: '#00ff41', fontWeight: 700 }}>
                                            {mounted ? new Date(bounty.createdAt).toLocaleDateString() : ""}
                                        </p>
                                    </div>
                                    <a
                                        href={bounty.repository?.url + (bounty.issueNumber ? `/issues/${bounty.issueNumber}` : `/pull/${bounty.prNumber}`)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="start-btn"
                                    >
                                        START WORK
                                        <ArrowRight style={{ width: 11, height: 11 }} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Disclaimer */}
            <div className="explore-wrap">
                <div style={{ border: '2px solid #2a3a2a', background: '#1a1f2e', padding: 24, textAlign: 'center' }}>
                    <p style={{ fontSize: 11, color: '#4ade80', maxWidth: 700, margin: '0 auto', lineHeight: 1.8 }}>
                        &gt; Bounties are secured by smart contracts on the NEAR network. Rewards are automatically released by the Holy Shard Agent upon verification of the merged pull request and adherence to review criteria.
                    </p>
                </div>
            </div>
        </div>
    );
}