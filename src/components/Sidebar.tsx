import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, FolderOpen,
  MessageSquare, FileText, Phone, Settings,
  LogOut, Globe, Image, Wrench,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLiveSiteUrl } from '../utils/api';

const nav = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard',   desc: 'Schedule & tasks' },
  { to: '/staff',       icon: Users,           label: 'Staff & Users',desc: 'Accounts & passwords' },
  { to: '/branding',    icon: Image,           label: 'Branding',    desc: 'Logo & hero image' },
  { to: '/clients',     icon: Briefcase,       label: 'Clients',     desc: 'Client directory' },
  { to: '/services',    icon: Wrench,          label: 'Services',    desc: 'Survey services' },
  { to: '/projects',    icon: FolderOpen,      label: 'Projects',    desc: '12-slot portfolio' },
  { to: '/reports',     icon: FileText,        label: 'Reports',     desc: 'PDF years & export' },
  { to: '/contact',     icon: Phone,           label: 'Contact Info',desc: 'Address & contacts' },
  { to: '/settings',    icon: Settings,        label: 'Settings',    desc: 'API & connection' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className="flex flex-col h-screen w-64 bg-navy border-r border-white/5 flex-shrink-0">
      {/* Logo block */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue flex items-center justify-center flex-shrink-0">
            <Globe size={18} className="text-neon" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">CSMC Admin</p>
            <p className="text-[10px] text-slate-500 leading-tight">Content Manager</p>
          </div>
        </div>
      </div>

      {/* Live site link */}
      <div className="px-5 py-3 border-b border-white/5">
        <a
          href={getLiveSiteUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-neon transition-colors group"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-neon status-dot" />
          <span className="group-hover:underline">View live website →</span>
        </a>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {nav.map(({ to, icon: Icon, label, desc }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                isActive
                  ? 'bg-blue/20 text-white border border-blue/40'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-neon' : 'text-slate-500 group-hover:text-slate-300'} />
                <div>
                  <p className="font-medium leading-none">{label}</p>
                  <p className={`text-[10px] mt-0.5 leading-none ${isActive ? 'text-blue-300' : 'text-slate-600 group-hover:text-slate-500'}`}>{desc}</p>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User block */}
      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon to-lemon flex items-center justify-center flex-shrink-0">
            <span className="text-navy font-bold text-xs">
              {user?.fullName?.split(' ').map((n: string) => n[0]).slice(0,2).join('') ?? 'JG'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.fullName ?? 'Admin'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-red-400 transition-colors w-full"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
