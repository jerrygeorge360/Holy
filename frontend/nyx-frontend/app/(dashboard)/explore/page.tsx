"use client";

import { useState, useEffect } from "react";
import {
    Coins,
    Search,
    ExternalLink,
    Zap,
    Loader2,
    Trophy,
    Filter,
    ArrowRight,
    GitBranch,
} from "lucide-react";
import Button from "@/shared/Button";
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
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="bg-[#f8fbffa7] min-h-screen mx-auto px-3 md:px-4 py-4 md:py-8">
            {/* Page Header */}
            <div className="mb-8 mx-2 md:mx-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-500/20" />
                        <span className="text-xs font-bold text-yellow-600 uppercase tracking-widest">Opportunities</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-black mb-1">
                        Explore Bounties
                    </h1>
                    <p className="text-sm md:text-base text-slate-600">
                        Find active bounties and start contributing to earn NEAR
                    </p>
                </div>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 mx-2 md:mx-6">
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Available Bounties</p>
                    <p className="text-2xl font-bold text-black">{bounties.length}</p>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Reward Pool</p>
                    <p className="text-2xl font-bold text-green-600 flex items-center gap-2">
                        {bounties.reduce((acc, b) => acc + Number(b.amount), 0).toFixed(2)}
                        <span className="text-xs font-medium text-slate-500">NEAR</span>
                    </p>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Highest Bounty</p>
                    <p className="text-2xl font-bold text-orange-600 flex items-center gap-2">
                        {Math.max(...bounties.map(b => Number(b.amount)), 0)}
                        <span className="text-xs font-medium text-slate-500">NEAR</span>
                    </p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="mb-6 mx-2 md:mx-6 flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by repository or amount..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm text-black"
                    />
                </div>
                <Button className="hidden sm:flex items-center gap-2 text-slate-600 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50">
                    <Filter className="w-4 h-4" />
                    More Filters
                </Button>
            </div>

            {/* Bounty Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-2 md:mx-6">
                {filteredBounties.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <Coins className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">No bounties found</h3>
                        <p className="text-slate-500">Try adjusting your search query or check back later.</p>
                    </div>
                ) : (
                    filteredBounties.map((bounty) => (
                        <div
                            key={bounty.id}
                            className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all group flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-slate-50 px-3 py-1 rounded-full border border-slate-100 flex items-center gap-1.5 overflow-hidden max-w-[70%]">
                                    <GitBranch className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="text-[11px] font-bold text-slate-600 truncate">{bounty.repository?.fullName}</span>
                                </div>
                                {Number(bounty.amount) >= 20 && (
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                                        <Zap className="w-3 h-3 fill-orange-500 text-orange-500" /> HIGH
                                    </div>
                                )}
                            </div>

                            <div className="mb-6 flex-1">
                                <h3 className="text-lg font-bold text-black mb-2 flex items-center gap-2">
                                    {bounty.issueNumber ? `Issue #${bounty.issueNumber}` : `PR #${bounty.prNumber}`}
                                    <a
                                        href={bounty.repository?.url + (bounty.issueNumber ? `/issues/${bounty.issueNumber}` : `/pull/${bounty.prNumber}`)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl font-black text-green-600">{bounty.amount}</span>
                                    <span className="text-sm font-bold text-slate-400 mt-2">NEAR</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Posted</span>
                                    <span className="text-xs font-semibold text-slate-600">
                                        {mounted ? new Date(bounty.createdAt).toLocaleDateString() : ""}
                                    </span>
                                </div>
                                <a
                                    href={bounty.repository?.url + (bounty.issueNumber ? `/issues/${bounty.issueNumber}` : `/pull/${bounty.prNumber}`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold gap-2 group-hover:bg-blue-600 transition-colors">
                                        Start Work
                                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Disclaimer */}
            <div className="mt-12 mx-2 md:mx-6 p-6 rounded-3xl bg-slate-100/50 border border-slate-200 text-center">
                <p className="text-xs text-slate-500 max-w-2xl mx-auto leading-relaxed">
                    Bounties are secured by smart contracts on the NEAR network. Rewards are automatically released by the Holy Shard Agent upon verification of the merged pull request and adherence to review criteria.
                </p>
            </div>
        </div>
    );
}
