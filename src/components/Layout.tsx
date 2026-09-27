import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X, Wifi, WifiOff } from 'lucide-react';
import Sidebar from './Sidebar';
import { api } from '../utils/api';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function ping() {
      try {
        await api.health();
        if (!cancelled) setOnline(true);
      } catch {
        if (!cancelled) setOnline(false);
      }
    }
    ping();
    const iv = setInterval(ping, 30_000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed on desktop, slide-in on mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-40 md:relative md:z-auto
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-white/5 bg-navy/80 backdrop-blur-sm flex-shrink-0">
          <button
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1 md:flex-none" />

          {/* Connection status */}
          <div className="flex items-center gap-2">
            {online === null ? (
              <span className="text-xs text-slate-500">Checking connection…</span>
            ) : online ? (
              <span className="flex items-center gap-1.5 text-xs text-green-400">
                <Wifi size={13} />
                <span>Backend connected</span>
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full status-dot" />
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-red-400">
                <WifiOff size={13} />
                <span>Backend offline — check your API URL</span>
              </span>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
