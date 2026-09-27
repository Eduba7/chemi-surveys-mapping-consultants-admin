import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/UI';
import { getLiveSiteUrl } from '../utils/api';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy px-4">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(16,52,166,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,52,166,0.5) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="relative w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue/20 border border-blue/40 mb-4 blue-glow">
            <ShieldCheck size={32} className="text-neon" />
          </div>
          <h1 className="text-2xl font-bold text-white">CSMC Admin Portal</h1>
          <p className="text-slate-400 text-sm mt-1">
            Chemi Surveys &amp; Mapping Consultants
          </p>
          <p className="text-slate-600 text-xs mt-2">
            Authorised personnel only — ADMIN access required
          </p>
        </div>

        {/* Form card */}
        <div className="card p-8">
          {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Admin email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="johnchemi24@gmail.com"
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-navy/40 border-t-navy rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in to Admin Portal'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-6">
            Only Surveyor John Muiruri Gachemi (ADMIN) can access this portal.
            <br />Changes made here reflect on the live website immediately.
          </p>
        </div>

        {/* Live site badge */}
        <div className="mt-4 text-center">
          <a
            href={getLiveSiteUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-neon transition-colors"
          >
            ↗ View live website
          </a>
        </div>
      </div>
    </div>
  );
}
