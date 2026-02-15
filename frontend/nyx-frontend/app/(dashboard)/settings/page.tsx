'use client';

import { useState } from 'react';
import Button from '@/shared/Button';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard,
  Github,
  Mail,
  Save,
  Trash2
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [autoReview, setAutoReview] = useState(true);

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-4xl">
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 text-black">Settings</h1>
        <p className="text-sm md:text-[16px] text-slate-600">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-4 md:mb-6 overflow-x-auto">
        <div className="flex gap-3 md:gap-6 min-w-max">
          {['account', 'notifications', 'integrations', 'billing'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 md:pb-3 px-1 border-b-2 transition-colors capitalize cursor-pointer text-xs md:text-[14px] whitespace-nowrap ${
                activeTab === tab
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
          {/* Profile Information Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-black">Profile Information</h2>
            <p className="text-xs md:text-sm text-slate-600 mb-4 md:mb-6">Update your account details</p>

            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <User className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-black text-sm md:text-base truncate">Sarah Developer</p>
                <p className="text-xs md:text-sm text-slate-600 truncate">sarah-dev@acme-corp.com</p>
              </div>
            </div>

            <div className="grid gap-3 md:gap-4">
              <div>
                <label htmlFor="name" className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-black">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  defaultValue="Sarah Developer"
                  className="w-full px-3 py-3 md:py-4 border text-black text-xs md:text-[12px] bg-gray-300 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-black">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  defaultValue="sarah-dev@acme-corp.com"
                  className="w-full px-3 py-3 md:py-4 border text-black text-xs md:text-[12px] bg-gray-300 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-black">
                  Company
                </label>
                <input
                  id="company"
                  type="text"
                  defaultValue="Acme Corp"
                  className="w-full px-3 py-3 md:py-4 border text-black text-xs md:text-[12px] bg-gray-300 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <Button className="gap-2 mt-4 md:mt-6 w-full sm:w-auto px-4 md:px-2 py-2 md:py-3 text-xs md:text-[12px] text-white rounded-[15px] border bg-black">
              <Save className="w-3 h-3 md:w-4 md:h-4" />
              Save Changes
            </Button>
          </div>

          {/* Connected Accounts Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-black">Connected Accounts</h2>
            <p className="text-xs md:text-sm text-slate-600 mb-4 md:mb-6">Manage your connected services</p>

            <div className="flex items-center justify-between p-3 md:p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2 md:gap-3 text-black min-w-0">
                <Github className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm md:text-base">GitHub</p>
                  <p className="text-xs md:text-sm text-slate-600 truncate">@sarah-dev</p>
                </div>
              </div>
              <span className="px-2 md:px-3 py-0.5 md:py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full shrink-0">
                Connected
              </span>
            </div>
          </div>

          {/* Danger Zone Card */}
          <div className="bg-white border border-red-200 rounded-lg p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-red-900">Danger Zone</h2>
            <p className="text-xs md:text-sm text-slate-600 mb-4 md:mb-6">Irreversible account actions</p>

            <button className="flex items-center gap-2 px-3 md:px-4 py-2 border border-red-200 text-red-600 text-xs md:text-sm rounded-md hover:bg-red-50 transition-colors">
              <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
              Delete Account
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-black">Notification Preferences</h2>
          <p className="text-xs md:text-sm text-slate-600 mb-4 md:mb-6">Configure how you receive updates</p>

          <div className="space-y-4 md:space-y-6">
            {/* Email Notifications Toggle */}
            <div className="flex items-start md:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-3 h-3 md:w-4 md:h-4 text-slate-600 shrink-0" />
                  <label className="font-medium text-black text-sm md:text-[16px]">Email Notifications</label>
                </div>
                <p className="text-xs md:text-sm text-slate-600">Receive notifications via email</p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                  emailNotifications ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    emailNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Critical Alerts Toggle */}
            <div className="flex items-start md:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-3 h-3 md:w-4 md:h-4 text-slate-600 shrink-0" />
                  <label className="font-medium text-black text-sm md:text-[16px]">Critical Issue Alerts</label>
                </div>
                <p className="text-xs md:text-sm text-slate-600">Get notified immediately for critical security issues</p>
              </div>
              <button
                onClick={() => setCriticalAlerts(!criticalAlerts)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                  criticalAlerts ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    criticalAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Weekly Reports Toggle */}
            <div className="flex items-start md:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="w-3 h-3 md:w-4 md:h-4 text-slate-600 shrink-0" />
                  <label className="font-medium text-black text-sm md:text-[16px]">Weekly Summary Reports</label>
                </div>
                <p className="text-xs md:text-sm text-slate-600">Receive a weekly summary of all reviews</p>
              </div>
              <button
                onClick={() => setWeeklyReports(!weeklyReports)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                  weeklyReports ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    weeklyReports ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Email Frequency */}
            <div className="pt-3 md:pt-4 border-t">
              <h4 className="font-medium mb-3 md:mb-4 text-black text-sm md:text-[16px]">Email Frequency</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="frequency" defaultChecked className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                  <span className="text-black text-xs md:text-[14px]">Real-time (as they happen)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="frequency" className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                  <span className="text-xs md:text-[14px] text-black">Daily digest</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="frequency" className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                  <span className="text-xs md:text-[14px] text-black">Weekly digest</span>
                </label>
              </div>
            </div>

            <Button className="gap-2 mt-4 md:mt-6 w-full sm:w-auto px-4 md:px-2 py-2 md:py-3 text-xs md:text-[12px] text-white rounded-[15px] border bg-black">
              <Save className="w-3 h-3 md:w-4 md:h-4" />
              Save Preferences
            </Button>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-black">Integration Settings</h2>
          <p className="text-xs md:text-sm text-slate-600 mb-4 md:mb-6">Configure CodeGuard AI behavior</p>

          <div className="space-y-4 md:space-y-6">
            {/* Auto Review Toggle */}  
            <div className="flex items-start md:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <label className="font-medium block mb-1 text-black text-sm md:text-[16px]">Automatic Pull Request Review</label>
                <p className="text-xs md:text-sm text-slate-600">Automatically review all new pull requests</p>
              </div>
              <button
                onClick={() => setAutoReview(!autoReview)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                  autoReview ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    autoReview ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Review Strictness */}
            <div className="pt-3 md:pt-4 border-t">
              <h4 className="font-medium mb-3 md:mb-4 text-black text-sm md:text-[16px]">Review Strictness</h4>
              <div className="space-y-2 md:space-y-3">
                {[
                  { title: 'Strict', desc: 'Report all potential issues' },
                  { title: 'Balanced', desc: 'Focus on important issues', checked: true },
                  { title: 'Relaxed', desc: 'Only critical and high priority issues' }
                ].map((option) => (
                  <label key={option.title} className="flex items-start gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="strictness" 
                      defaultChecked={option.checked}
                      className="w-3 h-3 md:w-4 md:h-4 mt-0.5 md:mt-1 text-blue-600" 
                    />
                    <div>
                      <div className="font-medium text-black text-xs md:text-[14px]">{option.title}</div>
                      <div className="text-xs md:text-sm text-slate-600">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Review Categories */}
            <div className="pt-3 md:pt-4 border-t">
              <h4 className="font-medium mb-2 md:mb-3 text-black text-sm md:text-[14px]">Review Categories</h4>
              <div className="space-y-2 md:space-y-3">
                {['Security vulnerabilities', 'Performance issues', 'Potential bugs', 'Best practices', 'Code style'].map((category, i) => (
                  <label key={category} className="flex items-center gap-2 cursor-pointer text-black text-xs md:text-[14px]">
                    <input
                      type="checkbox"
                      defaultChecked={i < 4}
                      className="w-3 h-3 md:w-4 md:h-4 text-blue-600 rounded"
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button className="gap-2 mt-4 md:mt-6 w-full sm:w-auto px-4 md:px-2 py-2 md:py-3 text-xs md:text-[12px] text-white rounded-[15px] border bg-black">
              <Save className="w-3 h-3 md:w-4 md:h-4" />
              Save Settings
            </Button>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-4 md:space-y-6">
          {/* Current Plan Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-black">Current Plan</h2>
            <p className="text-xs md:text-sm text-slate-600 mb-4 md:mb-6">Manage your subscription</p>

            <div className="flex items-start justify-between mb-4 md:mb-6 gap-3">
              <div>
                <h3 className="text-xl md:text-2xl font-bold mb-1 text-black">Free Plan</h3>
                <p className="text-slate-600 text-xs md:text-[12px]">For public repositories</p>
              </div>
              <span className="px-2 md:px-3 py-0.5 md:py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full shrink-0">
                Active
              </span>
            </div>

            <div className="space-y-2 mb-4 md:mb-6">
              {['Unlimited public repositories', 'AI-powered code reviews', 'Basic issue detection'].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-xs md:text-sm">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
                  <span className="text-black">{feature}</span>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2 text-black text-sm md:text-[16px]">Upgrade to Pro</h4>
              <p className="text-xs md:text-sm text-blue-800 mb-3">
                Get advanced features for private repositories and teams
              </p>
              <ul className="space-y-1 text-xs md:text-sm text-blue-800 mb-4">
                {['Private repository support', 'Advanced security scanning', 'Team collaboration features', 'Priority support'].map((feature) => (
                  <li key={feature} className="mb-1 md:mb-2">• {feature}</li>
                ))}
              </ul>
              <Button className="gap-2 w-full sm:w-auto px-3 md:px-2 py-2 md:py-3 text-xs md:text-[12px] text-white rounded-[15px] border bg-black">
                Upgrade to Pro - $29/month
              </Button>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-black">Payment Method</h2>
            <p className="text-xs md:text-sm text-slate-600 mb-4 md:mb-6">Manage your billing information</p>
            <p className="text-xs md:text-sm text-slate-600 mb-4">No payment method on file</p>
            <Button className="gap-2 w-full sm:w-auto px-4 md:px-2 py-2 md:py-3 text-xs md:text-[12px] text-white rounded-[15px] border bg-black">
              <CreditCard className="w-3 h-3 md:w-4 md:h-4" />
              Add Payment Method
            </Button>
          </div>

          {/* Billing History Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-black">Billing History</h2>
            <p className="text-xs md:text-sm text-slate-600 mb-4">View past invoices and payments</p>
            <p className="text-xs md:text-sm text-slate-600">No billing history available</p>
          </div>
        </div>
      )}
    </div>
  );
}