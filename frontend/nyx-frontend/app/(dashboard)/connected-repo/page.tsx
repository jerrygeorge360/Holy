"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/shared/Button";
import { Github, Search, ChevronRight, ChevronLeft } from "lucide-react";

// Mock GitHub repositories
const mockGitHubRepos = [
  {
    id: "1",
    name: "analytics-dashboard",
    owner: "acme-corp",
    language: "TypeScript",
    private: false,
    stars: 145,
  },
  {
    id: "2",
    name: "payment-service",
    owner: "acme-corp",
    language: "Go",
    private: true,
    stars: 89,
  },
  {
    id: "3",
    name: "notification-worker",
    owner: "acme-corp",
    language: "Python",
    private: true,
    stars: 56,
  },
  {
    id: "4",
    name: "docs-website",
    owner: "acme-corp",
    language: "JavaScript",
    private: false,
    stars: 234,
  },
  {
    id: "5",
    name: "infrastructure",
    owner: "acme-corp",
    language: "HCL",
    private: true,
    stars: 23,
  },
];

export default function ConnectRepo() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoReview, setAutoReview] = useState(true);
  const [notifyOnIssues, setNotifyOnIssues] = useState(true);

  const filteredRepos = mockGitHubRepos.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.owner.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedRepoData = mockGitHubRepos.find((r) => r.id === selectedRepo);

  const handleConnect = () => {
    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  };

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-3xl">
      {/* Progress Indicator */}
      <div className="mb-6 md:mb-8 overflow-x-auto">
        <div className="flex items-center justify-center gap-2 md:gap-4 min-w-max px-4">
          <div
            className={`flex items-center gap-1 md:gap-2 ${step >= 1 ? "text-blue-600" : "text-slate-400"}`}
          >
            <div
              className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-sm md:text-base ${
                step >= 1
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              1
            </div>
            <span className="font-medium text-xs md:text-sm">Select Repository</span>
          </div>
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-slate-400 shrink-0" />
          <div
            className={`flex items-center gap-1 md:gap-2 ${step >= 2 ? "text-blue-600" : "text-slate-400"}`}
          >
            <div
              className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-sm md:text-base ${
                step >= 2
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              2
            </div>
            <span className="font-medium text-xs md:text-sm">Configure Settings</span>
          </div>
        </div>
      </div>

      {/* Step 1: Select Repository */}
      {step === 1 && (
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="p-4 md:p-6 border-b border-slate-200">
            <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-black">
              Select a Repository
            </h2>
            <p className="text-xs md:text-sm text-slate-600">
              Choose a repository to connect to CodeGuard AI
            </p>
          </div>
          <div className="p-4 md:p-6">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 md:pl-9 pr-3 py-3 md:py-4 border text-black text-xs md:text-[12px] bg-gray-300 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Repository List */}
            <div className="space-y-2 mb-4 md:mb-6 max-h-[400px] overflow-y-auto">
              {filteredRepos.map((repo) => (
                <div
                  key={repo.id}
                  onClick={() => setSelectedRepo(repo.id)}
                  className={`p-3 md:p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedRepo === repo.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Github className="w-3 h-3 md:w-4 md:h-4 text-slate-600 shrink-0" />
                        <span className="text-xs md:text-sm text-black font-bold truncate">
                          {repo.owner}/{repo.name}
                        </span>
                        {repo.private && (
                          <span className="px-1.5 md:px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 border border-slate-300 rounded-full shrink-0">
                            Private
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-slate-600">
                        <span>{repo.language}</span>
                        <span>•</span>
                        <span>⭐ {repo.stars}</span>
                      </div>
                    </div>
                    {selectedRepo === repo.id && (
                      <div className="w-4 h-4 md:w-5 md:h-5 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <Button
                onClick={() => router.push("/dashboard")}
                className="order-2 sm:order-1 w-full sm:w-auto px-4 py-2 border border-slate-300 text-black text-xs md:text-[12px] rounded-md hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedRepo}
                className="order-1 sm:order-2 w-full sm:w-auto gap-2 px-4 py-2 text-xs md:text-[12px] text-white rounded-md border bg-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Configure Settings */}
      {step === 2 && selectedRepoData && (
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="p-4 md:p-6 border-b border-slate-200">
            <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-black">Configure Repository</h2>
            <p className="text-xs md:text-sm text-slate-600">
              Set up review settings for{" "}
              <span className="font-medium">
                {selectedRepoData.owner}/{selectedRepoData.name}
              </span>
            </p>
          </div>
          <div className="p-4 md:p-6">
            <div className="space-y-4 md:space-y-6">
              {/* Branch Selection */}
              <div>
                <label
                  htmlFor="branch"
                  className="block text-xs md:text-sm font-medium mb-2 text-black"
                >
                  Default Branch
                </label>
                <input
                  id="branch"
                  type="text"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  placeholder="main"
                  className="w-full px-3 py-2 md:py-3 border text-black text-xs md:text-sm bg-gray-300 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs md:text-sm text-slate-600 mt-1">
                  CodeGuard AI will review pull requests targeting this branch
                </p>
              </div>

              {/* Review Settings */}
              <div className="space-y-3 md:space-y-4">
                <h4 className="font-medium text-sm md:text-base text-black">Review Settings</h4>

                <div className="flex items-start gap-2 md:gap-3">
                  <input
                    type="checkbox"
                    id="auto-review"
                    checked={autoReview}
                    onChange={(e) => setAutoReview(e.target.checked)}
                    className="w-3 h-3 md:w-4 md:h-4 mt-0.5 md:mt-1 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor="auto-review"
                      className="block font-medium cursor-pointer text-sm md:text-base text-black"
                    >
                      Automatic PR Review
                    </label>
                    <p className="text-xs md:text-sm text-slate-600 mt-1">
                      Automatically review all new pull requests
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 md:gap-3">
                  <input
                    type="checkbox"
                    id="notify"
                    checked={notifyOnIssues}
                    onChange={(e) => setNotifyOnIssues(e.target.checked)}
                    className="w-3 h-3 md:w-4 md:h-4 mt-0.5 md:mt-1 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor="notify"
                      className="block font-medium cursor-pointer text-sm md:text-base text-black"
                    >
                      Notify on Critical Issues
                    </label>
                    <p className="text-xs md:text-sm text-slate-600 mt-1">
                      Get notified when critical security or performance issues are found
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                <h4 className="font-medium text-blue-900 mb-2 text-sm md:text-base">
                  What happens next?
                </h4>
                <ul className="space-y-1 text-xs md:text-sm text-blue-800">
                  <li>• CodeGuard AI will be added to your repository</li>
                  <li>• New pull requests will be automatically reviewed</li>
                  <li>• You'll receive detailed feedback on every PR</li>
                  <li>• Review history will be available in your dashboard</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4 md:mt-6">
              <button
                onClick={() => setStep(1)}
                className="order-2 sm:order-1 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors text-xs md:text-sm"
              >
                <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
                Back
              </button>
              <Button onClick={handleConnect} className="order-1 sm:order-2 w-full sm:w-auto gap-2 text-xs md:text-sm">
                <Github className="w-3 h-3 md:w-4 md:h-4" />
                Connect Repository
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}