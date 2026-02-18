"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Loader2,
    Wallet,
    ExternalLink,
    Trash2,
    Copy,
    Check,
    Terminal,
    CircleDot,
    Coins,
    Save,
    Zap,
    Shield,
    AlertCircle,
    GitBranch,
    CheckCircle,
    AlertTriangle,
    ShieldAlert,
    Cpu,
} from "lucide-react";
import Button from "@/shared/Button";
import {
    getRepoBountyBalance,
    getRepoIssues,
    getRepoBounties,
    attachBounty,
    getFundingInstructions,
    updateRepo,
    deleteRepo,
    releaseBounty,
    getBountyHistory,
    ApiError,
    type GitHubIssue,
    type Bounty,
    type FundingInstructions,
} from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function RepoDetailPage({
    params,
}: {
    params: Promise<{ owner: string; repo: string }>;
}) {
    const { owner, repo } = use(params);
    const fullName = `${owner}/${repo}`;
    const router = useRouter();
    const { user, refreshUser } = useAuth();

    // Data states
    const [bountyData, setBountyData] = useState<Record<string, unknown> | null>(null);
    const [issues, setIssues] = useState<GitHubIssue[]>([]);
    const [bounties, setBounties] = useState<Bounty[]>([]);
    const [fundingInfo, setFundingInfo] = useState<FundingInstructions | null>(null);
    const [history, setHistory] = useState<any[]>([]);

    // UI states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const searchParams = useSearchParams();
    const initialTab = searchParams.get("tab") as any;
    const [activeTab, setActiveTab] = useState<"issues" | "bounties" | "funding" | "history" | "settings">(
        initialTab && ["issues", "bounties", "funding", "history", "settings"].includes(initialTab)
            ? initialTab
            : "issues"
    );

    // Attach bounty form
    const [attachType, setAttachType] = useState<"issue" | "pr">("issue");
    const [attachNumber, setAttachNumber] = useState("");
    const [attachAmount, setAttachAmount] = useState("");
    const [attaching, setAttaching] = useState(false);
    const [attachSuccess, setAttachSuccess] = useState<string | null>(null);

    // Manual release form (in Bounties tab)
    const [releaseWallet, setReleaseWallet] = useState("");
    const [releasePR, setReleasePR] = useState("");
    const [releaseAmount, setReleaseAmount] = useState("");
    const [releasing, setReleasing] = useState(false);
    const [releaseSuccess, setReleaseSuccess] = useState<string | null>(null);

    // Wallet
    const [walletInput, setWalletInput] = useState("");
    const [savingWallet, setSavingWallet] = useState(false);
    const [walletMsg, setWalletMsg] = useState<string | null>(null);

    // Misc
    const [copied, setCopied] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);

    // Current wallet from user context
    const currentRepo = user?.repositories.find((r) => r.fullName === fullName);
    const currentWallet = currentRepo?.nearWallet;

    useEffect(() => {
        setWalletInput(currentWallet || "");
    }, [currentWallet]);

    // Load data
    useEffect(() => {
        setMounted(true);
        async function load() {
            setLoading(true);
            try {
                const [bal, iss, bty] = await Promise.allSettled([
                    getRepoBountyBalance(owner, repo),
                    getRepoIssues(owner, repo),
                    getRepoBounties(owner, repo),
                ]);

                if (bal.status === "fulfilled") setBountyData(bal.value);
                if (iss.status === "fulfilled") setIssues(iss.value);
                if (bty.status === "fulfilled") setBounties(bty.value.bounties);
                if (activeTab === "funding") handleLoadFunding();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load data");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [owner, repo]);

    // Handlers
    const handleAttachBounty = async () => {
        if (!attachNumber || !attachAmount) return;
        setAttaching(true);
        setAttachType(attachType);
        setAttachSuccess(null);
        try {
            const result = await attachBounty({
                repo: fullName,
                ...(attachType === "issue" ? { issueNumber: Number(attachNumber) } : { prNumber: Number(attachNumber) }),
                amount: attachAmount,
            });
            setBounties((prev) => [result.bounty, ...prev]);
            setAttachSuccess(`Bounty of ${attachAmount} NEAR attached to ${attachType} #${attachNumber}`);
            setAttachNumber("");
            setAttachAmount("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to attach bounty");
        } finally {
            setAttaching(false);
        }
    };

    const handleLoadFunding = async () => {
        try {
            const info = await getFundingInstructions(owner, repo);
            setFundingInfo(info);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load funding info");
        }
    };

    const handleLoadHistory = async () => {
        try {
            const data: any = await getBountyHistory();
            if (data && data.history) {
                // Filter history for this repo only if backend returns global
                const filtered = data.history.filter((h: any) => h.repo === fullName);
                setHistory(filtered);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load history");
        }
    };

    const handleReleaseBounty = async () => {
        if (!releaseWallet || !releasePR) return;
        setReleasing(true);
        setReleaseSuccess(null);
        try {
            await releaseBounty({
                repo: fullName,
                contributorWallet: releaseWallet,
                prNumber: Number(releasePR),
                amount: releaseAmount || undefined
            });
            setReleaseSuccess(`Bounty release triggered for PR #${releasePR}`);
            setReleaseWallet("");
            setReleasePR("");
            setReleaseAmount("");
            // Refresh data
            const bal = await getRepoBountyBalance(owner, repo);
            setBountyData(bal);
            handleLoadHistory();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to release bounty");
        } finally {
            setReleasing(false);
        }
    };

    const handleSaveWallet = async () => {
        if (!walletInput.trim()) return;
        setSavingWallet(true);
        setWalletMsg(null);
        try {
            const result = await updateRepo(owner, repo, { nearWallet: walletInput.trim() });
            setWalletMsg(result.message);
            refreshUser();
        } catch (err) {
            setWalletMsg(err instanceof Error ? err.message : "Failed to update wallet");
        } finally {
            setSavingWallet(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm(`Disconnect ${fullName}? This will remove the webhook and all data.`)) return;
        setDisconnecting(true);
        try {
            await deleteRepo(owner, repo);
            refreshUser();
            router.push("/dashboard");
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to disconnect");
            setDisconnecting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-3"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Dashboard
                </Link>
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-black">{fullName}</h1>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {currentWallet ? (
                                <span className="bg-green-100 text-green-800 px-3 py-0.5 rounded-2xl text-xs">
                                    {currentWallet}
                                </span>
                            ) : (
                                <span className="bg-yellow-100 text-yellow-800 px-3 py-0.5 rounded-2xl text-xs">
                                    No NEAR wallet
                                </span>
                            )}
                            {bountyData && (
                                <span className="text-sm text-slate-600">
                                    Balance: <span className="font-medium text-green-700">{String(bountyData.balance ?? 0)} NEAR</span>
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => {
                                setActiveTab("funding");
                                if (!fundingInfo) handleLoadFunding();
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-4 py-2 text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                        >
                            <Coins className="w-3.5 h-3.5" />
                            Fund Repo
                        </Button>
                        <a
                            href={`https://github.com/${fullName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                            <ExternalLink className="w-4 h-4" />
                            GitHub
                        </a>
                    </div>
                </div>
            </div>

            {/* Health Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className={`p-3 rounded-xl border flex items-center justify-between ${!currentWallet ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
                    <div className="flex items-center gap-2">
                        {!currentWallet ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        <span className="text-[11px] font-bold uppercase tracking-wider">Wallet</span>
                    </div>
                    <span className="text-[10px] font-medium">{currentWallet ? 'Linked' : 'Missing'}</span>
                </div>
                <div className={`p-3 rounded-xl border flex items-center justify-between ${(Number(bountyData?.balance) || 0) === 0 ? 'bg-orange-50 border-orange-100 text-orange-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
                    <div className="flex items-center gap-2">
                        {(Number(bountyData?.balance) || 0) === 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        <span className="text-[11px] font-bold uppercase tracking-wider">Funds</span>
                    </div>
                    <span className="text-[10px] font-medium">{Number(bountyData?.balance) || 0} NEAR</span>
                </div>
                <div className={`p-3 rounded-xl border flex items-center justify-between ${(!currentRepo?.preferences || currentRepo.preferences.length === 0) ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
                    <div className="flex items-center gap-2">
                        {(!currentRepo?.preferences || currentRepo.preferences.length === 0) ? <Cpu className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        <span className="text-[11px] font-bold uppercase tracking-wider">AI Criteria</span>
                    </div>
                    <span className="text-[10px] font-medium">{(!currentRepo?.preferences || currentRepo.preferences.length === 0) ? 'Generic' : 'Custom'}</span>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{error}</p>
                    <button onClick={() => setError(null)} className="text-xs text-red-600 underline mt-1">
                        Dismiss
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-slate-200 mb-6 overflow-x-auto">
                <div className="flex gap-4 md:gap-6 min-w-max">
                    {(["issues", "bounties", "funding", "history", "settings"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                if (tab === "funding" && !fundingInfo) handleLoadFunding();
                                if (tab === "history") handleLoadHistory();
                            }}
                            className={`pb-3 px-1 border-b-2 transition-colors capitalize text-sm whitespace-nowrap cursor-pointer ${activeTab === tab
                                ? "border-blue-600 text-blue-600 font-medium"
                                : "border-transparent text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            {tab === "issues" ? `Issues (${issues.length})` :
                                tab === "bounties" ? `Bounties (${bounties.length})` :
                                    tab === "history" ? `History (${history.length})` :
                                        tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Issues Tab */}
            {activeTab === "issues" && (
                <div className="space-y-3">
                    {issues.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 bg-white border border-slate-200 rounded-lg">
                            <CircleDot className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <p className="text-sm">No open issues</p>
                        </div>
                    ) : (
                        issues.map((issue) => (
                            <a
                                key={issue.number}
                                href={issue.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <CircleDot className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-black">
                                            #{issue.number} {issue.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className="text-xs text-slate-500">by {issue.user.login}</span>
                                            {issue.labels.map((l) => (
                                                <span
                                                    key={l.name}
                                                    className="text-xs px-2 py-0.5 rounded-full"
                                                    style={{ backgroundColor: `#${l.color}20`, color: `#${l.color}` }}
                                                >
                                                    {l.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                                </div>
                            </a>
                        ))
                    )}
                </div>
            )}

            {/* Bounties Tab */}
            {activeTab === "bounties" && (
                <div className="space-y-4">
                    {/* Attach Bounty Form */}
                    <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-black text-sm">Create Bounty</h3>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setAttachType("issue")}
                                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${attachType === "issue" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
                                >
                                    ISSUE
                                </button>
                                <button
                                    onClick={() => setAttachType("pr")}
                                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${attachType === "pr" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
                                >
                                    PR
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                                    {attachType === "issue" ? "Issue Number" : "PR Number"}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">#</span>
                                    <input
                                        type="number"
                                        placeholder="42"
                                        value={attachNumber}
                                        onChange={(e) => setAttachNumber(e.target.value)}
                                        className="w-full pl-7 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                                    Amount (NEAR)
                                </label>
                                <div className="relative">
                                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="10"
                                        value={attachAmount}
                                        onChange={(e) => setAttachAmount(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-black bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex items-end">
                                <Button
                                    onClick={handleAttachBounty}
                                    disabled={!attachNumber || !attachAmount || attaching}
                                    className="w-full sm:w-auto h-[42px] gap-2 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-6 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                                >
                                    {attaching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Set Bounty
                                </Button>
                            </div>
                        </div>
                        {attachSuccess && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                <p className="text-xs text-green-700 font-medium">{attachSuccess}</p>
                            </div>
                        )}
                    </div>

                    {/* Bounty List */}
                    {bounties.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 bg-white border border-slate-200 rounded-lg">
                            <Coins className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <p className="text-sm">No bounties yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {bounties.map((bounty) => (
                                <div
                                    key={bounty.id}
                                    className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {bounty.issueNumber && (
                                                    <span className="text-sm font-medium text-black">
                                                        Issue #{bounty.issueNumber}
                                                    </span>
                                                )}
                                                {bounty.prNumber && (
                                                    <span className="text-sm font-medium text-black">
                                                        PR #{bounty.prNumber}
                                                    </span>
                                                )}
                                                <span
                                                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${bounty.status === "paid"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-blue-100 text-blue-800"
                                                        }`}
                                                >
                                                    {bounty.status || "open"}
                                                </span>
                                                {Number(bounty.amount) >= 20 && (
                                                    <span className="bg-orange-100 text-orange-800 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                                        <Zap className="w-2.5 h-2.5 fill-orange-500 text-orange-500" />
                                                        High Stake
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-400 mt-1">
                                                Created {mounted ? new Date(bounty.createdAt).toLocaleDateString() : ""}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-bold text-green-700">
                                                {bounty.amount} NEAR
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Manual Release Form */}
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 md:p-6 text-white mt-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <Coins className="w-4 h-4 text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-sm">Manual Bounty Release</h3>
                        </div>
                        <p className="text-xs text-slate-400 mb-6">
                            Manually payout a contributor for a specific pull request. This uses the Shade Agent to verify and release funds.
                        </p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Contributor Wallet</label>
                                    <input
                                        type="text"
                                        placeholder="contributor.near"
                                        value={releaseWallet}
                                        onChange={(e) => setReleaseWallet(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">PR Number</label>
                                        <input
                                            type="number"
                                            placeholder="123"
                                            value={releasePR}
                                            onChange={(e) => setReleasePR(e.target.value)}
                                            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Amount (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="5"
                                            value={releaseAmount}
                                            onChange={(e) => setReleaseAmount(e.target.value)}
                                            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </div>
                                </div>
                            </div>
                            <Button
                                onClick={handleReleaseBounty}
                                disabled={!releaseWallet || !releasePR || releasing}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white gap-2 py-3 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50"
                            >
                                {releasing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                                Trigger Manual Release
                            </Button>
                        </div>
                        {releaseSuccess && (
                            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <p className="text-xs text-green-400 font-medium">{releaseSuccess}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                        <h3 className="font-semibold text-black text-sm">Payout History</h3>
                    </div>
                    {history.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Terminal className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                            <p className="text-sm font-medium">No payout history found</p>
                            <p className="text-xs text-slate-400">Successfully processed payouts will appear here.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {history.map((item, idx) => (
                                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-bold text-black">PR #{item.prNumber}</span>
                                                <Check className="w-3.5 h-3.5 text-green-600" />
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-xs text-slate-600 truncate">
                                                    Sent to <span className="font-medium text-slate-900">{item.contributor}</span>
                                                </p>
                                                <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                                    {mounted ? new Date(item.timestamp).toLocaleString() : ""}
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                    via Smart Contract
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-sm font-extrabold text-green-700">+{item.amount} NEAR</div>
                                            {item.txHash ? (
                                                <a
                                                    href={`https://explorer.testnet.near.org/transactions/${item.txHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5 justify-end mt-1"
                                                >
                                                    View TX <ExternalLink className="w-2.5 h-2.5" />
                                                </a>
                                            ) : (
                                                <span className="text-[10px] text-slate-300 mt-1 block">Internal Ledger</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Funding Tab */}
            {activeTab === "funding" && (
                <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6 shadow-sm">
                    {/* Visual How-to Guide */}
                    <div className="mb-8 border-b border-slate-100 pb-8">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">How to fund your repo</h4>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
                            {/* Connector line (hidden on mobile) */}
                            <div className="hidden md:block absolute top-4 left-[10%] right-[10%] h-0.5 border-t-2 border-dashed border-slate-200 -z-0"></div>

                            {[
                                { step: 1, title: "Register", desc: "Connect repo & link your NEAR wallet in Settings.", icon: GitBranch },
                                { step: 2, title: "Deposit", desc: "Run the CLI command below to send NEAR to the contract.", icon: Coins },
                                { step: 3, title: "Bounty", desc: "Assign NEAR values to specific Issues or PRs.", icon: Zap },
                            ].map((s, idx) => (
                                <div key={idx} className="flex flex-row md:flex-col items-center gap-4 md:text-center relative z-10 bg-white md:px-4">
                                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/30">
                                        {s.step}
                                    </div>
                                    <div>
                                        <div className="font-bold text-black text-sm">{s.title}</div>
                                        <div className="text-[10px] text-slate-500 max-w-[140px] leading-relaxed">{s.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <Zap className="w-5 h-5 text-blue-600 mb-2" />
                            <h4 className="text-xs font-bold text-black mb-1">Instant Payouts</h4>
                            <p className="text-[10px] text-slate-500">Merged PRs trigger immediate token transfers to contributors.</p>
                        </div>
                        <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                            <Shield className="w-5 h-5 text-green-600 mb-2" />
                            <h4 className="text-xs font-bold text-black mb-1">Secure Escrow</h4>
                            <p className="text-[10px] text-slate-500">Funds are held in a decentralized smart contract for transparency.</p>
                        </div>
                        <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                            <ArrowLeft className="w-5 h-5 text-purple-600 mb-2 rotate-180" />
                            <h4 className="text-xs font-bold text-black mb-1">Boost Velocity</h4>
                            <p className="text-[10px] text-slate-500">Bounties attract high-quality developers to solve your issues faster.</p>
                        </div>
                    </div>

                    {!fundingInfo ? (
                        <div className="text-center py-6">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">Loading funding instructions...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-100 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-bold text-orange-900">Funding Instructions</h4>
                                    <p className="text-[11px] text-orange-800 mt-1">{fundingInfo.message}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                <h4 className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                                    <Terminal className="w-3 h-3" />
                                    Contract Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Method:</span>
                                        <code className="text-black bg-slate-200 px-2 py-0.5 rounded text-xs">
                                            {fundingInfo.instructions.method}
                                        </code>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Contract:</span>
                                        <code className="text-black bg-slate-200 px-2 py-0.5 rounded text-xs">
                                            {fundingInfo.instructions.contractId}
                                        </code>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Maintainer:</span>
                                        <code className="text-black bg-slate-200 px-2 py-0.5 rounded text-xs">
                                            {fundingInfo.instructions.maintainerAccount}
                                        </code>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-medium text-slate-500 mb-2">CLI Command</h4>
                                <div className="relative">
                                    <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
                                        {fundingInfo.cliExample}
                                    </pre>
                                    <button
                                        onClick={() => copyToClipboard(fundingInfo.cliExample)}
                                        className="absolute top-2 right-2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors"
                                        title="Copy"
                                    >
                                        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
                <div className="space-y-4">
                    {/* NEAR Wallet Section */}
                    <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6">
                        <h3 className="font-semibold text-black text-sm mb-1">NEAR Wallet</h3>
                        <p className="text-xs text-slate-500 mb-3">
                            The wallet that receives bounty payouts. Changing it re-registers the repo on the NEAR contract.
                        </p>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={walletInput}
                                    onChange={(e) => setWalletInput(e.target.value)}
                                    placeholder="your-name.testnet"
                                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-md text-sm text-black bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <Button
                                onClick={handleSaveWallet}
                                disabled={savingWallet || !walletInput.trim() || walletInput === currentWallet}
                                className="gap-1 text-xs text-white bg-black rounded-lg px-4 py-2 disabled:opacity-50"
                            >
                                {savingWallet ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                Save
                            </Button>
                        </div>
                        {walletMsg && (
                            <p className="text-xs mt-2 text-green-700">{walletMsg}</p>
                        )}
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white border border-red-200 rounded-lg p-4 md:p-6">
                        <h3 className="font-semibold text-red-900 text-sm mb-1">Danger Zone</h3>
                        <p className="text-xs text-slate-500 mb-3">
                            Disconnecting removes the webhook, all bounty records, and preferences for this repo.
                        </p>
                        <button
                            onClick={handleDisconnect}
                            disabled={disconnecting}
                            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 text-xs rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                            {disconnecting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                            Disconnect Repository
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
