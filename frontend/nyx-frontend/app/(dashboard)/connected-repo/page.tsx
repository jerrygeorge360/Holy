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
      // result is { message, nearWallet, contractRegistration } — not a Repository
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
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-3xl">
      {/* Progress Indicator */}
      <div className="mb-6 md:mb-8 overflow-x-auto">
        <div className="flex items-center justify-center gap-2 md:gap-4 min-w-max px-4">
          <div
            className={`flex items-center gap-1 md:gap-2 ${step >= 1 ? "text-blue-600" : "text-slate-400"}`}
          >
            <div
              className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-sm md:text-base ${step >= 1
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-600"
                }`}
            >
              1
            </div>
            <span className="font-medium text-xs md:text-sm">
              Connect Repository
            </span>
          </div>
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-slate-400 shrink-0" />
          <div
            className={`flex items-center gap-1 md:gap-2 ${step >= 2 ? "text-blue-600" : "text-slate-400"}`}
          >
            <div
              className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-sm md:text-base ${step >= 2
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-600"
                }`}
            >
              2
            </div>
            <span className="font-medium text-xs md:text-sm">
              Link NEAR Wallet
            </span>
          </div>
        </div>
      </div>

      {/* Step 1: Enter Repository */}
      {step === 1 && (
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="p-4 md:p-6 border-b border-slate-200">
            <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-black">
              Connect a Repository
            </h2>
            <p className="text-xs md:text-sm text-slate-600">
              Enter the GitHub repository you want to connect to Holy
            </p>
          </div>
          <div className="p-4 md:p-6">
            <div className="mb-4">
              <label
                htmlFor="repo"
                className="block text-xs md:text-sm font-medium mb-2 text-black"
              >
                Repository (owner/name)
              </label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-slate-400" />
                <input
                  id="repo"
                  type="text"
                  placeholder="jerrygeorge360/my-project"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                  className="w-full pl-8 md:pl-9 pr-3 py-3 md:py-4 border text-black text-xs md:text-sm bg-gray-100 border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-xs md:text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2 text-sm md:text-base">
                What happens when you connect?
              </h4>
              <ul className="space-y-1 text-xs md:text-sm text-blue-800">
                <li>- A webhook will be installed on the repository</li>
                <li>- The Holy agent will start reviewing pull requests</li>
                <li>- You can attach NEAR bounties to issues and PRs</li>
              </ul>
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
                onClick={handleConnect}
                disabled={!repoInput.trim() || isConnecting}
                className="order-1 sm:order-2 w-full sm:w-auto gap-2 px-4 py-2 text-xs md:text-[12px] text-white rounded-md border bg-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect
                    <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Link NEAR Wallet */}
      {step === 2 && connectedRepo && (
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="p-4 md:p-6 border-b border-slate-200">
            <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-black">
              Link NEAR Wallet
            </h2>
            <p className="text-xs md:text-sm text-slate-600">
              Set a NEAR wallet for bounty payouts on{" "}
              <span className="font-medium">{connectedRepo.fullName}</span>
            </p>
          </div>
          <div className="p-4 md:p-6">
            <div className="space-y-4 md:space-y-6">
              {/* Success Banner */}
              <div className="p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  Repository connected successfully! Webhook installed.
                </p>
              </div>

              {/* Wallet Input */}
              <div>
                <label
                  htmlFor="wallet"
                  className="block text-xs md:text-sm font-medium mb-2 text-black"
                >
                  NEAR Wallet Address (optional)
                </label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-slate-400" />
                  <input
                    id="wallet"
                    type="text"
                    value={nearWallet}
                    onChange={(e) => setNearWallet(e.target.value)}
                    placeholder="your-name.testnet"
                    className="w-full pl-8 md:pl-9 pr-3 py-3 md:py-4 border text-black text-xs md:text-sm bg-gray-100 border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs md:text-sm text-slate-600 mt-1">
                  This wallet receives bounty payouts and registers your repo on the NEAR contract.
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-xs md:text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4 md:mt-6">
              <button
                onClick={() => setStep(1)}
                className="order-2 sm:order-1 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors text-xs md:text-sm"
              >
                <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
                Back
              </button>
              <Button
                onClick={handleSaveWallet}
                disabled={isSavingWallet}
                className="order-1 sm:order-2 w-full sm:w-auto gap-2 text-xs md:text-sm text-white rounded-md border bg-black disabled:opacity-50"
              >
                {isSavingWallet ? (
                  <>
                    <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                    Registering on contract...
                  </>
                ) : nearWallet.trim() ? (
                  "Save Wallet & Register"
                ) : (
                  "Skip & Go to Dashboard"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}