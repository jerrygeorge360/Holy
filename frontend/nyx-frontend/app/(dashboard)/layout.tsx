'use client';

import Button from '@/shared/Button';
import { Code2, LayoutDashboard, Settings, Plus, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-blue-600" />
            <span className="font-semibold text-black text-xl">CodeGuard AI</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/dashboard" 
              className={`flex items-center gap-2 text-sm transition-colors ${
                isActive('/dashboard') ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link 
              href="/settings" 
              className={`flex items-center gap-2 text-sm transition-colors ${
                isActive('/settings') ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </nav>

          <Link href="/connected-repo" className="hidden md:block">
            <Button className="gap-2 text-white text-[14px] bg-black rounded-[15px]">
              <Plus className="w-4 h-4" />
              Connect Repo
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <nav className="flex flex-col p-4 space-y-2">
              <Link 
                href="/dashboard" 
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                  isActive('/dashboard') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link 
                href="/settings" 
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                  isActive('/settings') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <Link href="/connected-repo" onClick={() => setMobileMenuOpen(false)}>
                <Button className="gap-2 text-white text-[14px] bg-black rounded-[15px] w-full mt-2">
                  <Plus className="w-4 h-4" />
                  Connect Repo
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}