'use client';

import { useState, useEffect } from 'react';
import Button from '@/shared/Button';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Github,
  Mail,
  Save,
  LogOut,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { getCriteria, updateCriteria, ApiError } from '@/lib/api';

export default function Settings() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('account');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  // Criteria state
  const [selectedRepo, setSelectedRepo] = useState('');
  const [criteriaText, setCriteriaText] = useState('');
  const [criteriaLoading, setCriteriaLoading] = useState(false);
  const [criteriaSaving, setCriteriaSaving] = useState(false);
  const [criteriaMsg, setCriteriaMsg] = useState<string | null>(null);
  const [criteriaError, setCriteriaError] = useState<string | null>(null);

  const repos = user?.repositories || [];

  // Load criteria when repo changes
  useEffect(() => {
    if (!selectedRepo) {
      setCriteriaText('');
      return;
    }
    const [owner, name] = selectedRepo.split('/');
    setCriteriaLoading(true);
    setCriteriaError(null);
    getCriteria(owner, name)
      .then((data) => {
        // The Shade Agent returns { criteria: "..." } or similar
        if (typeof data === 'object' && data.criteria) {
          setCriteriaText(
            typeof data.criteria === 'string'
              ? data.criteria
              : JSON.stringify(data.criteria, null, 2)
          );
        } else {
          setCriteriaText(JSON.stringify(data, null, 2));
        }
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 503) {
          setCriteriaError('Agent service unavailable. Criteria cannot be loaded right now.');
        } else {
          setCriteriaError(err.message);
        }
        setCriteriaText('');
      })
      .finally(() => setCriteriaLoading(false));
  }, [selectedRepo]);

  const handleSaveCriteria = async () => {
    if (!selectedRepo || !criteriaText.trim()) return;
    const [owner, name] = selectedRepo.split('/');
    setCriteriaSaving(true);
    setCriteriaMsg(null);
    setCriteriaError(null);
    try {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(criteriaText);
      } catch {
        // If not valid JSON, wrap as guidelines array
        parsed = {
          guidelines: criteriaText
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean),
        };
      }
      await updateCriteria(owner, name, parsed);
      setCriteriaMsg('Criteria saved and synced with the AI agent.');
    } catch (err) {
      setCriteriaError(err instanceof Error ? err.message : 'Failed to save criteria');
    } finally {
      setCriteriaSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-4xl">
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 text-black">Settings</h1>
        <p className="text-sm md:text-[16px] text-slate-600">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-4 md:mb-6 overflow-x-auto">
        <div className="flex gap-3 md:gap-6 min-w-max">
          {['account', 'integrations', 'notifications', 'billing'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 md:pb-3 px-1 border-b-2 transition-colors capitalize cursor-pointer text-xs md:text-[14px] whitespace-nowrap ${activeTab === tab
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="space-y-4 md:space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-black">Profile Information</h2>
            <p className="text-xs md:text-sm text-slate-600 mb-4 md:mb-6">Your GitHub account details</p>

            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <User className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-black text-sm md:text-base truncate">
                  {user?.username || 'Unknown'}
                </p>
                <p className="text-xs md:text-sm text-slate-600 truncate">
                  {user?.email || 'No email available'}
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-black">Username</label>
                <input type="text" value={user?.username || ''} readOnly className="w-full px-3 py-3 md:py-4 border text-black text-xs md:text-[12px] bg-gray-100 border-slate-200 rounded-md" />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-black">Email</label>
                <input type="email" value={user?.email || ''} readOnly className="w-full px-3 py-3 md:py-4 border text-black text-xs md:text-[12px] bg-gray-100 border-slate-200 rounded-md" />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-black">Connected Repos</label>
                <p className="text-sm text-slate-600">{repos.length} repositories linked</p>
              </div>
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-black">Connected Accounts</h2>
            <div className="flex items-center justify-between p-3 md:p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2 md:gap-3 text-black min-w-0">
                <Github className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm md:text-base">GitHub</p>
                  <p className="text-xs md:text-sm text-slate-600 truncate">@{user?.username}</p>
                </div>
              </div>
              <span className="px-2 md:px-3 py-0.5 md:py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full shrink-0">Connected</span>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white border border-red-200 rounded-lg p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-red-900">Danger Zone</h2>
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 md:px-4 py-2 border border-red-200 text-red-600 text-xs md:text-sm rounded-md hover:bg-red-50 transition-colors">
              <LogOut className="w-3 h-3 md:w-4 md:h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Integrations Tab — wired to Criteria API */}
      {activeTab === 'integrations' && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-black">AI Review Criteria</h2>
          <p className="text-xs md:text-sm text-slate-600 mb-4 md:mb-6">
            Define custom review guidelines per repository. The AI agent enforces these on every PR.
          </p>

          {repos.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">Connect a repository first to configure criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Repo selector */}
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1 text-black">Select Repository</label>
                <select
                  value={selectedRepo}
                  onChange={(e) => setSelectedRepo(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-md text-sm text-black bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a repository...</option>
                  {repos.map((r) => (
                    <option key={r.id} value={r.fullName}>
                      {r.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRepo && (
                <>
                  {criteriaLoading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading criteria from agent...
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs md:text-sm font-medium mb-1 text-black">
                          Review Guidelines
                        </label>
                        <p className="text-xs text-slate-500 mb-2">
                          Enter as JSON or one guideline per line. Lines will be sent as a guidelines array.
                        </p>
                        <textarea
                          value={criteriaText}
                          onChange={(e) => setCriteriaText(e.target.value)}
                          rows={8}
                          placeholder={`Check for SQL injection vulnerabilities\nEnsure all API endpoints have proper auth\nVerify error handling patterns`}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-md text-sm text-black bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                      </div>

                      {criteriaError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-xs text-red-800">{criteriaError}</p>
                        </div>
                      )}

                      {criteriaMsg && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-xs text-green-800">{criteriaMsg}</p>
                        </div>
                      )}

                      <Button
                        onClick={handleSaveCriteria}
                        disabled={criteriaSaving || !criteriaText.trim()}
                        className="gap-2 w-full sm:w-auto px-4 py-2.5 text-xs text-white rounded-lg bg-black disabled:opacity-50"
                      >
                        {criteriaSaving ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Save className="w-3 h-3" />
                        )}
                        Save & Sync with Agent
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-black">Notification Preferences</h2>
          <p className="text-xs md:text-sm text-slate-600 mb-4 md:mb-6">Configure how you receive updates</p>

          <div className="space-y-4 md:space-y-6">
            {[
              { label: 'Email Notifications', desc: 'Receive notifications via email', icon: Mail, state: emailNotifications, toggle: () => setEmailNotifications(!emailNotifications) },
              { label: 'Critical Issue Alerts', desc: 'Get notified immediately for critical security issues', icon: Shield, state: criticalAlerts, toggle: () => setCriticalAlerts(!criticalAlerts) },
              { label: 'Weekly Summary Reports', desc: 'Receive a weekly summary of all reviews', icon: Bell, state: weeklyReports, toggle: () => setWeeklyReports(!weeklyReports) },
            ].map(({ label, desc, icon: Icon, state, toggle }) => (
              <div key={label} className="flex items-start md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-3 h-3 md:w-4 md:h-4 text-slate-600 shrink-0" />
                    <label className="font-medium text-black text-sm md:text-[16px]">{label}</label>
                  </div>
                  <p className="text-xs md:text-sm text-slate-600">{desc}</p>
                </div>
                <button
                  onClick={toggle}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${state ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${state ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}

            <Button className="gap-2 mt-4 md:mt-6 w-full sm:w-auto px-4 md:px-2 py-2 md:py-3 text-xs md:text-[12px] text-white rounded-[15px] border bg-black">
              <Save className="w-3 h-3 md:w-4 md:h-4" />
              Save Preferences
            </Button>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-4 md:space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-black">Current Plan</h2>
            <div className="flex items-start justify-between mb-4 md:mb-6 gap-3">
              <div>
                <h3 className="text-xl md:text-2xl font-bold mb-1 text-black">Free Plan</h3>
                <p className="text-slate-600 text-xs">For public repositories</p>
              </div>
              <span className="px-2 md:px-3 py-0.5 md:py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full shrink-0">Active</span>
            </div>
            <div className="space-y-2 mb-4 md:mb-6">
              {['Unlimited public repositories', 'AI-powered code reviews', 'NEAR bounty management'].map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs md:text-sm">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
                  <span className="text-black">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-black">Payment Method</h2>
            <p className="text-xs md:text-sm text-slate-600 mb-4">No payment method on file</p>
            <Button className="gap-2 w-full sm:w-auto px-4 md:px-2 py-2 md:py-3 text-xs md:text-[12px] text-white rounded-[15px] border bg-black">
              <CreditCard className="w-3 h-3 md:w-4 md:h-4" />
              Add Payment Method
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}