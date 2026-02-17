"use client";

import { useState, useEffect } from "react";
import {
  GitBranch,
  ChevronRight,
  Wallet,
  Loader2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import Button from "@/shared/Button";
import Link from "next/link";
import {
  getMyRepos,
  deleteRepo,
  type EnrichedRepository,
  ApiError,
} from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function DashboardPage() {
  const { refreshUser } = useAuth();
  const [repos, setRepos] = useState<EnrichedRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRepos = () => {
    setLoading(true);
    getMyRepos()
      .then((data) => {
        setRepos(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mx-6 my-8">
        <p className="text-red-800 text-sm">Failed to load repositories: {error}</p>
        <button
          onClick={fetchRepos}
          className="mt-3 text-sm text-red-600 underline hover:text-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  const totalRepos = repos.length;
  const reposWithWallet = repos.filter((r) => r.nearWallet).length;
  const totalBalance = repos.reduce((sum, r) => {
    const bal = Number(r.bountyBalance) || 0;
    return sum + bal;
  }, 0);

  return (
    <div className="bg-[#f8fbffa7] mx-auto px-3 md:px-4 py-4 md:py-8">
      {/* Page Header */}
      <div className="mb-4 md:mb-8 mx-2 md:mx-6">
        <h1 className="text-2xl md:text-3xl font-bold text-black mb-1 md:mb-2">
          Dashboard
        </h1>
        <p className="text-sm md:text-base text-slate-600">
          Overview of your connected repositories and bounties
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-8 mx-2 md:mx-6">
        <div className="border border-gray-400 px-3 md:px-4 py-3 md:py-4 rounded-lg bg-white">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-xs md:text-sm font-medium text-slate-600">
              Connected Repos
            </h3>
            <GitBranch className="w-3 h-3 md:w-4 md:h-4 text-slate-600" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-black">
              {totalRepos}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {reposWithWallet} with wallet
            </p>
          </div>
        </div>

        <div className="border border-gray-400 px-3 md:px-4 py-3 md:py-4 rounded-lg bg-white">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-xs md:text-sm font-medium text-slate-600">
              Total Bounty Balance
            </h3>
            <Wallet className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-black">
              {totalBalance > 0 ? `${totalBalance} NEAR` : "0"}
            </div>
            <p className="text-xs text-green-600 mt-1">
              Across all repos
            </p>
          </div>
        </div>

        <div className="border border-gray-400 px-3 md:px-4 py-3 md:py-4 rounded-lg bg-white col-span-2 lg:col-span-1">
          <div className="pb-2">
            <h3 className="text-xs md:text-sm font-medium text-slate-600">
              Quick Actions
            </h3>
          </div>
          <div className="flex gap-2">
            <Link href="/connected-repo">
              <Button className="text-xs md:text-sm text-white bg-black rounded-lg px-3 py-2">
                Connect Repo
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Connected Repositories */}
      <div className="mx-2 md:mx-6">
        <div className="border border-gray-400 rounded-2xl md:rounded-3xl px-4 md:px-6 py-4 md:py-6 bg-white">
          <div className="mb-3 md:mb-4">
            <h3 className="text-black text-sm md:text-[16px] font-bold">
              Connected Repositories
            </h3>
            <p className="text-gray-400 text-xs md:text-[12px]">
              Your repositories linked to Holy
            </p>
          </div>
          <div className="space-y-3 md:space-y-4">
            {repos.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm mb-3">
                  No repositories connected yet.
                </p>
                <Link href="/connected-repo">
                  <Button className="text-xs text-white bg-black rounded-lg px-4 py-2">
                    Connect Your First Repo
                  </Button>
                </Link>
              </div>
            ) : (
              repos.map((repo) => {
                const [owner, name] = (repo.fullName || "").split("/");
                const balance = Number(repo.bountyBalance) || 0;
                return (
                  <div key={repo.id}>
                    <div className="flex items-center justify-between p-3 md:p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors group">
                      <Link
                        href={`/repo/${owner}/${name}`}
                        className="flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-semibold text-black text-sm md:text-[16px] truncate">
                            {repo.fullName}
                          </h4>
                          {repo.nearWallet ? (
                            <span className="bg-green-100 text-green-800 border-green-200 px-2 md:px-4 py-0.5 rounded-2xl text-xs">
                              wallet linked
                            </span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-800 border-yellow-200 px-2 md:px-4 py-0.5 rounded-2xl text-xs">
                              no wallet
                            </span>
                          )}
                          {repo.preferences && repo.preferences.length > 0 && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-2xl text-xs">
                              criteria set
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-slate-600">
                          {repo.nearWallet && (
                            <span className="truncate max-w-[160px]">{repo.nearWallet}</span>
                          )}
                          {balance > 0 && (
                            <span className="text-green-700 font-medium">
                              {balance} NEAR
                            </span>
                          )}
                        </div>
                      </Link>
                      <div className="flex items-center gap-1 ml-2 shrink-0">
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Open on GitHub"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDisconnect(repo);
                          }}
                          disabled={deletingId === repo.id}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Disconnect repo"
                        >
                          {deletingId === repo.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                        <Link href={`/repo/${owner}/${name}`}>
                          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-blue-600" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <Link href="/connected-repo">
            <Button className="w-full mt-3 md:mt-4 text-gray-400 text-xs md:text-sm py-2 md:py-3">
              Connect New Repository
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}