import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { api } from '../utils/api';
import { Modal, Field, Input, Textarea, SectionHeader, Spinner, Empty, Confirm } from '../components/UI';
import toast from 'react-hot-toast';

const BLANK = { nameOrCompany: '', email: '', phone: '', logoUrl: '', notes: '' };

export default function Clients() {
  const [clients, setClients]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState<'add'|'edit'|null>(null);
  const [editing, setEditing]   = useState<any>(null);
  const [form, setForm]         = useState({ ...BLANK });
  const [saving, setSaving]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number|null>(null);

  async function load() {
    try { setClients(await api.clients.getAll()); }
    catch (e: any) { toast.error('Failed to load clients: ' + e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function openAdd() { setForm({ ...BLANK }); setEditing(null); setModal('add'); }
  function openEdit(c: any) {
    setForm({ nameOrCompany: c.nameOrCompany, email: c.email ?? '', phone: c.phone ?? '', logoUrl: c.logoUrl ?? '', notes: c.notes ?? '' });
    setEditing(c); setModal('edit');
  }

  async function handleSave() {
    if (!form.nameOrCompany.trim()) return toast.error('Client name is required.');
    setSaving(true);
    try {
      if (modal === 'add') { await api.clients.create(form); toast.success('Client added to live site.'); }
      else { await api.clients.update({ id: editing.id, ...form }); toast.success('Client updated.'); }
      setModal(null); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    try { await api.clients.delete(id); toast.success('Client removed.'); setDeleteTarget(null); load(); }
    catch (e: any) { toast.error(e.message); }
  }

  const filtered = clients.filter(c =>
    c.nameOrCompany.toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>;

  return (
    <div className="fade-in">
      <SectionHeader
        title="Client Directory"
        subtitle="Add or update clients — changes appear on the live website immediately."
        action={<button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add client</button>}
      />
      <div className="mb-5">
        <input type="text" placeholder="Search clients…" value={search} onChange={e => setSearch(e.target.value)} className="input-field max-w-sm" />
      </div>
      {filtered.length === 0 ? (
        <Empty icon={Building2} message={search ? 'No clients match your search.' : 'No clients yet.'} action={!search ? <button className="btn-primary" onClick={openAdd}>Add first client</button> : undefined} />
      ) : (
        <div className="space-y-3">
          {filtered.map((c: any) => (
            <div key={c.id} className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue/20 border border-blue/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {c.logoUrl ? <img src={c.logoUrl} alt={c.nameOrCompany} className="w-full h-full object-contain p-1 bg-white rounded-xl" /> : <Building2 size={20} className="text-blue-300" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{c.nameOrCompany}</p>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500 flex-wrap">
                  {c.phone && <span>📱 {c.phone}</span>}
                  {c.email && <span>✉️ {c.email}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(c)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"><Pencil size={13} /> Edit</button>
                <button onClick={() => setDeleteTarget(c.id)} className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1.5"><Trash2 size={13} /> Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add client' : 'Edit client'} onClose={() => setModal(null)}>
          <Field label="Client / company name"><Input placeholder="e.g. Greenfields Developers" value={form.nameOrCompany} onChange={e => setForm({...form, nameOrCompany: e.target.value})} /></Field>
          <Field label="Logo URL (optional)">
            <Input type="url" placeholder="https://cdn.example.com/logo.png" value={form.logoUrl} onChange={e => setForm({...form, logoUrl: e.target.value})} />
            {form.logoUrl && <div className="mt-2 w-14 h-14 rounded-lg bg-white flex items-center justify-center overflow-hidden"><img src={form.logoUrl} alt="preview" className="max-w-full max-h-full object-contain" /></div>}
          </Field>
          <Field label="Phone"><Input placeholder="0700 000 000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></Field>
          <Field label="Email"><Input type="email" placeholder="contact@client.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></Field>
          <Field label="Notes (optional)"><Textarea placeholder="Any notes…" value={form.notes} onChange={(e: any) => setForm({...form, notes: e.target.value})} /></Field>
          <div className="flex gap-3 mt-5">
            <button className="btn-secondary flex-1" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : modal === 'add' ? 'Add to live site' : 'Save changes'}</button>
          </div>
        </Modal>
      )}
      {deleteTarget !== null && <Confirm message="Remove this client from the live website?" onConfirm={() => handleDelete(deleteTarget)} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}
