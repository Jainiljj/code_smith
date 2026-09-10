import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import {
  LayoutDashboard,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  ShieldCheck,
  Building2,
  User,
  Bell,
  Menu,
  X,
  LogOut,
  UserCheck,
  ShieldAlert
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const allNavItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, permission: 'tenders:read' },
    { label: 'Tenders & Requirements', path: '/tenders', icon: FileText, permission: 'tenders:read' },
    { label: 'Compliance Matrix', path: '/compliance', icon: CheckCircle2, permission: 'compliance:read' },
    { label: 'Seller Verification Queue', path: '/sellers', icon: UserCheck, permission: 'sellers:read' },
    { label: 'Review Queue', path: '/reviews', icon: AlertTriangle, permission: 'reviews:write' },
    { label: 'Compliance Reports', path: '/reports', icon: ClipboardList, permission: 'compliance:read' },
    { label: 'Audit Trail', path: '/audit', icon: ShieldCheck, permission: 'audit:read' },
  ];

  const visibleNavItems = allNavItems.filter((item) => {
    if (!user) return true; // Show default menu if session loading
    if (user.role === 'SYSTEM_ADMIN' || user.role === 'PROCUREMENT_OFFICER' || user.role === 'COMPLIANCE_REVIEWER') return true;
    if (user.role === 'BIDDER_VENDOR' || user.role === 'BIDDER') {
      return ['/', '/tenders'].includes(item.path);
    }
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden">
      {/* Top Bar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-950 shadow-inner text-sm md:text-base">
              GeM
            </div>
            <div>
              <h1 className="text-xs md:text-base font-semibold leading-none tracking-tight">SIH26100 Verification</h1>
              <p className="hidden sm:block text-[10px] md:text-xs text-slate-400 mt-1">Government e-Marketplace Integrated Bid Compliance & Seller Platform</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="hidden lg:flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 text-xs text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ministry of Public Procurement</span>
          </div>

          <div className="relative">
            <button className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
                {user.fullName ? user.fullName.charAt(0) : 'U'}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-semibold text-slate-100 leading-tight truncate max-w-[140px]">{user.fullName}</p>
                <p className="text-[10px] text-emerald-400 font-mono font-medium">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-400 text-slate-950 rounded-lg hover:bg-emerald-300 transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Mobile Off-Canvas Overlay */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
          />
        )}

        {/* Sidebar (Desktop Persistent & Mobile Drawer) */}
        <aside
          className={`fixed md:static top-16 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col py-4 shadow-xl md:shadow-none transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="px-4 mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Navigation</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="space-y-1 px-2 flex-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold border-l-4 border-emerald-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {user && (
            <div className="p-3 mx-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Role</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <p className="font-semibold text-emerald-400 text-xs font-mono">{user.role}</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
