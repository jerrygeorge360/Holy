"use client";
import Button from "@/shared/Button";
import { Github, Code2, Shield, Zap, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { API_BASE_URL } from "@/lib/config";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const handleSignIn = () => {
    window.location.href = `${API_BASE_URL}/auth/github`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
            <span className="font-semibold text-lg md:text-xl text-white">
              Holy
            </span>
          </div>
          <div className="grid place-content-center">
            {!isLoading && user ? (
              <Button
                onClick={() => router.push("/dashboard")}
                className="text-slate-300 hover:text-white rounded-md text-sm md:text-base px-3 py-2 md:px-4 md:py-2"
              >
                Dashboard
              </Button>
            ) : (
              <Button
                onClick={handleSignIn}
                className="text-slate-300 hover:text-white rounded-md text-sm md:text-base px-3 py-2 md:px-4 md:py-2"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
            AI-Powered Code Reviews
            <span className="block text-blue-500 mt-2">
              With NEAR Bounty Payouts
            </span>
          </h1>
          <p className="text-base md:text-xl text-slate-300 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Automatically review pull requests, catch security issues, and
            reward contributors with instant NEAR token payouts when PRs are
            merged.
          </p>
          <div className="grid place-content-center px-4">
            <Button
              onClick={handleSignIn}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 md:px-8 md:py-6 text-base md:text-lg rounded-[15px] w-full sm:w-auto"
            >
              <Github className="w-4 h-4 md:w-5 md:h-5" />
              Sign in with GitHub
            </Button>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-4">
            Free for public repositories
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 md:p-6">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3 md:mb-4">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
              Security Analysis
            </h3>
            <p className="text-sm md:text-base text-slate-400">
              Detect security vulnerabilities, SQL injections, XSS attacks, and
              other common security issues automatically.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 md:p-6">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-3 md:mb-4">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
              NEAR Bounties
            </h3>
            <p className="text-sm md:text-base text-slate-400">
              Attach NEAR token bounties to GitHub issues. Contributors get paid
              automatically when their PR is merged.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 md:p-6 sm:col-span-2 md:col-span-1">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-3 md:mb-4">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
              Custom Criteria
            </h3>
            <p className="text-sm md:text-base text-slate-400">
              Define custom review guidelines per repository. The AI enforces
              your team&apos;s coding standards on every PR.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-12 md:py-20 border-t border-slate-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 md:mb-12">How It Works</h2>
          <div className="space-y-6 md:space-y-8 text-left">
            {[
              { num: 1, title: "Connect Your Repository", desc: "Link your GitHub repo and install a webhook in one click" },
              { num: 2, title: "Set a Bounty", desc: "Attach NEAR tokens to issues to attract contributors" },
              { num: 3, title: "Merge & Pay", desc: "When a PR is merged, the contributor gets paid from the smart contract" }
            ].map((step) => (
              <div key={step.num} className="flex gap-3 md:gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0 text-white font-semibold text-sm md:text-base">
                  {step.num}
                </div>
                <div>
                  <h4 className="text-base md:text-lg font-semibold text-white mb-1">
                    {step.title}
                  </h4>
                  <p className="text-sm md:text-base text-slate-400">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 border-t border-slate-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">
            Ready to reward your contributors?
          </h2>
          <p className="text-base md:text-lg text-slate-300 mb-6 md:mb-8">
            Connect your repo, set a bounty, and let Holy handle the rest.
          </p>
          <div className="grid place-content-center px-4">
            <Button
              onClick={handleSignIn}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 md:px-8 md:py-6 text-base md:text-lg rounded-[15px] w-full sm:w-auto"
            >
              <Github className="w-4 h-4 md:w-5 md:h-5" />
              Get Started for Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 md:mt-20">
        <div className="container mx-auto px-4 py-6 md:py-8 text-center text-slate-400 text-xs md:text-sm">
          &copy; 2026 Holy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}