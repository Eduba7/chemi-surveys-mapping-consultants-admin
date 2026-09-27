import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { api } from '../utils/api';
import { SectionHeader, Alert } from '../components/UI';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({
    officeAddress: 'KIGIO PLAZA, 4th Floor — Room K482, Thika Town, Kiambu County, Kenya',
    primaryContactName: 'John Muiruri Gachemi',
    primaryContactPhone: '0703 676 856',
    email: 'johnchemi24@gmail.com',
    email2: 'chemisurveys22@gmail.com',
    mapEmbedUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    api.settings.get()
      .then(d => { if (d?.contact) setForm(f => ({ ...f, ...d.contact })); })
      .catch(() => {}); // OK if settings endpoint not yet deployed
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await api.settings.update({ contact: form });
      toast.success('Contact details updated on live site.');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      toast.error('Save failed: ' + e.message);
    } finally { setSaving(false); }
  }

  const F = (label: string, key: keyof typeof form, props: any = {}) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <input {...props} className="input-field" value={form[key] as string} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
    </div>
  );

  return (
    <div className="fade-in max-w-2xl">
      <SectionHeader
        title="Contact Us — Live Site"
        subtitle="Update the office address, phone number and emails shown on the Contact page."
      />

      <div className="space-y-4">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={18} className="text-neon" />
            <h3 className="font-semibold text-white">Office address</h3>
          </div>
          {F('Full office address', 'officeAddress', { placeholder: 'KIGIO PLAZA, 4th Floor — Room K482…' })}
          {F('Google Maps embed URL (optional)', 'mapEmbedUrl', { type: 'url', placeholder: 'https://www.google.com/maps/embed?pb=…' })}
          {form.mapEmbedUrl && (
            <div className="mt-2 rounded-xl overflow-hidden border border-white/10 h-36">
              <iframe src={form.mapEmbedUrl} width="100%" height="100%" style={{border:0}} allowFullScreen loading="lazy" title="Office location map" />
            </div>
          )}
          {!form.mapEmbedUrl && (
            <p className="text-xs text-slate-600 mt-1">
              To get a Google Maps embed URL: open Google Maps → search "KIGIO PLAZA Thika" → Share → Embed a map → copy the src URL.
            </p>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Phone size={18} className="text-lemon" />
            <h3 className="font-semibold text-white">Primary contact</h3>
          </div>
          {F('Contact name', 'primaryContactName', { placeholder: 'John Muiruri Gachemi' })}
          {F('Phone number', 'primaryContactPhone', { placeholder: '0703 676 856', type: 'tel' })}
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={18} className="text-blue-300" />
            <h3 className="font-semibold text-white">Email addresses</h3>
          </div>
          {F('Primary email', 'email', { type: 'email', placeholder: 'johnchemi24@gmail.com' })}
          {F('Secondary email (letterhead)', 'email2', { type: 'email', placeholder: 'chemisurveys22@gmail.com' })}
        </div>

        <div className="flex items-center gap-4">
          <button className="btn-primary flex items-center gap-2" onClick={handleSave} disabled={saving}>
            {saving
              ? <><span className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />Saving…</>
              : saved
              ? <><CheckCircle2 size={16} />Saved!</>
              : 'Save contact info to live site'}
          </button>
          {saved && <p className="text-green-400 text-sm">Contact page updated.</p>}
        </div>

        <div className="card p-4 bg-blue/10 border-blue/30">
          <p className="text-xs text-blue-300">
            <strong>Note:</strong> If your live site stores contact details in the code
            (static), you need to re-deploy Vercel for changes to take effect.
            If your backend has a settings table, changes are immediate.
          </p>
        </div>
      </div>
    </div>
  );
}
