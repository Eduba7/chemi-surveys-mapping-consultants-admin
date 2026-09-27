import React, { useState, useEffect } from 'react';
import { Upload, Image, Globe, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../utils/api';
import { SectionHeader, Alert } from '../components/UI';
import toast from 'react-hot-toast';

export default function Branding() {
  const [settings, setSettings]   = useState<any>(null);
  const [logoUrl, setLogoUrl]     = useState('');
  const [heroUrl, setHeroUrl]     = useState('');
  const [siteTitle, setSiteTitle] = useState('');
  const [tagline, setTagline]     = useState('');
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  useEffect(() => {
    api.settings.get()
      .then(d => { setSettings(d); setLogoUrl(d?.logoUrl ?? ''); setHeroUrl(d?.heroImageUrl ?? ''); setSiteTitle(d?.siteTitle ?? ''); setTagline(d?.tagline ?? ''); })
      .catch(() => {
        // Settings endpoint may not exist yet — pre-fill with defaults
        setLogoUrl(''); setHeroUrl(''); setSiteTitle('Chemi Surveys & Mapping Consultants'); setTagline('Professional Surveyors at Work');
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await api.settings.update({ logoUrl, heroImageUrl: heroUrl, siteTitle, tagline });
      toast.success('Branding updated on live site.');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      toast.error('Save failed: ' + e.message);
    } finally { setSaving(false); }
  }

  return (
    <div className="fade-in max-w-2xl">
      <SectionHeader
        title="Branding"
        subtitle="Update the logo and hero image shown on the live Chemi Surveys website."
      />

      <div className="space-y-6">
        {/* Logo */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={18} className="text-neon" />
            <h3 className="font-semibold text-white">Company Logo</h3>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            The logo appears in the website header and in all generated PDF reports.
            Paste a public image URL (from Supabase Storage, Cloudinary, or any CDN).
          </p>
          {logoUrl && (
            <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center h-28">
              <img src={logoUrl} alt="Current logo preview" className="max-h-24 max-w-full object-contain" />
            </div>
          )}
          {!logoUrl && (
            <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center h-28 text-slate-600">
              <Image size={28} className="mb-2" />
              <span className="text-xs">No logo URL set — paste one below</span>
            </div>
          )}
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Logo image URL</label>
          <input
            type="url"
            placeholder="https://your-cdn.com/csmc-logo.png"
            value={logoUrl}
            onChange={e => setLogoUrl(e.target.value)}
            className="input-field"
          />
          <p className="text-xs text-slate-600 mt-1.5">
            Recommended: square image, 200×200 px or larger, PNG with transparent background.
          </p>
        </div>

        {/* Hero image */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Upload size={18} className="text-lemon" />
            <h3 className="font-semibold text-white">Homepage Hero Image</h3>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            The hero image is the large photo shown at the top of the Home page ("Professional Surveyors at Work").
            Paste a public image URL below to change it.
          </p>
          {heroUrl && (
            <div className="mb-4 rounded-xl overflow-hidden border border-white/10 h-36 relative">
              <img src={heroUrl} alt="Hero preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent flex items-end p-3">
                <p className="text-xs text-neon font-semibold">Professional Surveyors at Work</p>
              </div>
            </div>
          )}
          {!heroUrl && (
            <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center h-36 text-slate-600">
              <Image size={28} className="mb-2" />
              <span className="text-xs">No hero image URL set</span>
            </div>
          )}
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Hero image URL</label>
          <input
            type="url"
            placeholder="https://your-cdn.com/field-survey-hero.jpg"
            value={heroUrl}
            onChange={e => setHeroUrl(e.target.value)}
            className="input-field"
          />
          <p className="text-xs text-slate-600 mt-1.5">
            Recommended: landscape photo, 1920×1080 px or larger, JPEG or WebP.
          </p>
        </div>

        {/* Site copy */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw size={18} className="text-blue-300" />
            <h3 className="font-semibold text-white">Site Title &amp; Tagline</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Site title</label>
              <input className="input-field" value={siteTitle} onChange={e => setSiteTitle(e.target.value)} placeholder="Chemi Surveys & Mapping Consultants" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Hero tagline</label>
              <input className="input-field" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Professional Surveyors at Work" />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button className="btn-primary flex items-center gap-2" onClick={handleSave} disabled={saving}>
            {saving ? (
              <><span className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />Saving…</>
            ) : saved ? (
              <><CheckCircle2 size={16} />Saved!</>
            ) : (
              'Save branding to live site'
            )}
          </button>
          {saved && <p className="text-green-400 text-sm">Changes are now live on the website.</p>}
        </div>

        <div className="card p-4 bg-blue/10 border-blue/30">
          <p className="text-xs text-blue-300">
            <strong>Note:</strong> If your live site stores its logo in the code bundle (the default),
            you need to re-deploy Vercel after updating image URLs for the change to take effect.
            If you use a database-backed settings table, changes reflect immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
