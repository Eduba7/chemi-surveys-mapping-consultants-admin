import React, { useState } from 'react';
import { X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, children, onClose }: {
  title: string; children: React.ReactNode; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative card w-full max-w-lg p-6 fade-in max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── FormField ────────────────────────────────────────────────────────────────
export function Field({ label, error, children }: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input-field" {...props} />;
}

// ── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="input-field resize-none"
      rows={3}
      {...props}
    />
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      className="input-field"
      style={{ appearance: 'none' }}
      {...props}
    />
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin text-neon" />;
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function Empty({ icon: Icon, message, action }: {
  icon: React.ElementType; message: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-4">
        <Icon size={24} className="text-slate-500" />
      </div>
      <p className="text-slate-400 text-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Alert ─────────────────────────────────────────────────────────────────────
export function Alert({ type, message }: { type: 'error' | 'success'; message: string }) {
  const Icon = type === 'error' ? AlertCircle : CheckCircle2;
  const cls  = type === 'error'
    ? 'bg-red-500/10 border border-red-500/30 text-red-300'
    : 'bg-green-500/10 border border-green-500/30 text-green-300';
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${cls}`}>
      <Icon size={16} className="flex-shrink-0" />
      {message}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'blue' }: { children: React.ReactNode; color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray' }) {
  const cls = {
    blue:   'bg-blue-500/15 text-blue-300',
    green:  'bg-green-500/15 text-green-300',
    yellow: 'bg-yellow-500/15 text-yellow-300',
    red:    'bg-red-500/15 text-red-300',
    gray:   'bg-slate-500/15 text-slate-400',
  }[color];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
export function Confirm({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Modal title="Confirm action" onClose={onCancel}>
      <p className="text-slate-300 text-sm mb-6">{message}</p>
      <div className="flex gap-3">
        <button className="btn-secondary flex-1" onClick={onCancel}>Cancel</button>
        <button className="btn-danger flex-1" onClick={onConfirm}>Yes, delete</button>
      </div>
    </Modal>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }: {
  title: string; subtitle?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
