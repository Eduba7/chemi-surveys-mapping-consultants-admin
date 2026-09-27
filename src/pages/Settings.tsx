import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Globe, Key, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { api, getLiveSiteUrl } from '../utils/api';
import { SectionHeader, Alert } from '../components/UI';
import toast from 'react-hot-toast';

export default function Settings() {
  const [apiUrl, setApiUrl]     = useState(() => localStorage.getItem('csmc_api_url_override') || import.meta.env.VITE_API_URL || 'http://localhost:4000');
  const [siteUrl, setSiteUrl]   = useState(() => getLiveSiteUrl());
  const [health, setHealth]     = useState<'idle'|'ok'|'fail'>('idle');
  const [checking, setChecking] = useState(false);
  const [saved, setSaved]       = useState(false);

  async function checkHealth() {
    setChecking(true);
    setHealth('idle');
    try {
      await api.health();
      setHealth('ok');
      toast.success('Backend connection successful!');
    } catch {
      setHealth('fail');
      toast.error('Cannot reach backend. Check the API URL.');
    } finally { setChecking(false); }
  }

  function handleSave() {
    // In a real deployment these are set via .env / Vercel env vars.
    // Here we persist to localStorage so the admin can override for the session.
    localStorage.setItem('csmc_api_url_override', apiUrl);
    localStorage.setItem('csmc_site_url_override', siteUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    toast.success('Settings saved for this session. To persist, update your Vercel env vars.');
  }

  return (
    <div className="fade-in max-w-2xl">
      <SectionHeader
        title="Admin Settings"
        subtitle="Configure the connection between this admin panel and your live backend."
      />

      <div className="space-y-5">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key size={18} className="text-neon" />
            <h3 className="font-semibold text-white">Backend API URL</h3>
          </div>
          <p className="text-sm text-slate-400 mb-3">
            This is the URL of your Chemi Surveys backend deployed on Render or Railway.
            All data changes are sent here.
          </p>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">API base URL</label>
          <input
            type="url"
            value={apiUrl}
            onChange={e => setApiUrl(e.target.value)}
            placeholder="https://chemi-surveys-api.onrender.com"
            className="input-field mb-3"
          />
          <button onClick={checkHealth} disabled={checking} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
            {checking ? 'Checking…' : 'Test connection'}
          </button>
          {health === 'ok' && <div className="mt-3"><Alert type="success" message="Backend is reachable and responding correctly." /></div>}
          {health === 'fail' && <div className="mt-3"><Alert type="error" message="Cannot reach backend. Check the URL and make sure your backend is running." /></div>}
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={18} className="text-lemon" />
            <h3 className="font-semibold text-white">Live website URL</h3>
          </div>
          <p className="text-sm text-slate-400 mb-3">
            The public URL of the Chemi Surveys portfolio website on Vercel.
            Used for the "View live website" link in the sidebar.
          </p>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Live site URL</label>
          <input
            type="url"
            value={siteUrl}
            onChange={e => setSiteUrl(e.target.value)}
            placeholder="https://chemi-surveys-and-mapping-consultants.vercel.app"
            className="input-field"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="btn-primary flex items-center gap-2" onClick={handleSave}>
            {saved ? <><CheckCircle2 size={16} />Saved!</> : 'Save settings'}
          </button>
        </div>

        <div className="card p-5">
          <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
            <SettingsIcon size={15} className="text-slate-400" /> Deployment instructions
          </h4>
          <div className="space-y-3 text-xs text-slate-400">
            <div>
              <p className="font-semibold text-slate-300 mb-1">Vercel (frontend + this admin panel)</p>
              <p>Set these environment variables in your Vercel project settings:</p>
              <ul className="mt-1 space-y-1 font-mono text-slate-500">
                <li>VITE_API_URL = https://chemi-surveys-api.onrender.com</li>
                <li>VITE_LIVE_SITE_URL = https://chemi-surveys-and-mapping-consultants.vercel.app</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-300 mb-1">Render / Railway (backend)</p>
              <p>Set these environment variables in your backend service:</p>
              <ul className="mt-1 space-y-1 font-mono text-slate-500">
                <li>DATABASE_URL = postgresql://... (Neon PostgreSQL)</li>
                <li>JWT_SECRET = long random secret shared with the login token signer</li>
                <li>CLIENT_ORIGIN = https://your-live-site.vercel.app,https://your-admin.vercel.app</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
