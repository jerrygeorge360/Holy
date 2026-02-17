"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
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

    // UI states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"issues" | "bounties" | "funding" | "settings">("issues");

    // Attach bounty form
    const [attachIssue, setAttachIssue] = useState("");
    const [attachAmount, setAttachAmount] = useState("");
    const [attaching, setAttaching] = useState(false);
    const [attachSuccess, setAttachSuccess] = useState<string | null>(null);

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
        if (!attachIssue || !attachAmount) return;
        setAttaching(true);
        setAttachSuccess(null);
        try {
            const result = await attachBounty({
                repo: fullName,
                issueNumber: Number(attachIssue),
                amount: attachAmount,
            });
            setBounties((prev) => [result.bounty, ...prev]);
            setAttachSuccess(`Bounty of ${attachAmount} NEAR attached to issue #${attachIssue}`);
            setAttachIssue("");
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
                    {(["issues", "bounties", "funding", "settings"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                if (tab === "funding" && !fundingInfo) handleLoadFunding();
                            }}
                            className={`pb-3 px-1 border-b-2 transition-colors capitalize text-sm whitespace-nowrap cursor-pointer ${activeTab === tab
                                    ? "border-blue-600 text-blue-600 font-medium"
                                    : "border-transparent text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            {tab === "issues" ? `Issues (${issues.length})` :
                                tab === "bounties" ? `Bounties (${bounties.length})` :
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
                    <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6">
                        <h3 className="font-semibold text-black text-sm mb-3">Attach Bounty to Issue</h3>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                                <label className="block text-xs text-slate-600 mb-1">Issue Number</label>
                                <input
                                    type="number"
                                    placeholder="42"
                                    value={attachIssue}
                                    onChange={(e) => setAttachIssue(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-black bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs text-slate-600 mb-1">Amount (NEAR)</label>
                                <input
                                    type="text"
                                    placeholder="10"
                                    value={attachAmount}
                                    onChange={(e) => setAttachAmount(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-black bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    onClick={handleAttachBounty}
                                    disabled={!attachIssue || !attachAmount || attaching}
                                    className="gap-1 text-xs text-white bg-black rounded-lg px-4 py-2 disabled:opacity-50"
                                >
                                    {attaching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Coins className="w-3 h-3" />}
                                    Attach
                                </Button>
                            </div>
                        </div>
                        {attachSuccess && (
                            <p className="text-xs text-green-700 mt-2">{attachSuccess}</p>
                        )}
                    </div>

                    {/* Bounty List */}
                    {bounties.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 bg-white border border-slate-200 rounded-lg">
                            <Coins className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <p className="text-sm">No bounties yet</p>
                        </div>
                    ) : (
                        bounties.map((bounty) => (
                            <div
                                key={bounty.id}
                                className="p-4 bg-white border border-slate-200 rounded-lg"
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
                                                className={`text-xs px-2 py-0.5 rounded-full ${bounty.status === "paid"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-blue-100 text-blue-800"
                                                    }`}
                                            >
                                                {bounty.status || "open"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {new Date(bounty.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="text-lg font-bold text-green-700">
                                        {bounty.amount} NEAR
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Funding Tab */}
            {activeTab === "funding" && (
                <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6">
                    <h3 className="font-semibold text-black text-sm mb-3">Fund Bounty Pool</h3>
                    {!fundingInfo ? (
                        <div className="text-center py-6">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">Loading funding instructions...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600">{fundingInfo.message}</p>

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
