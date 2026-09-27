import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Wrench } from 'lucide-react';
import { api } from '../utils/api';
import { Modal, Field, Input, Textarea, SectionHeader, Spinner, Empty, Confirm } from '../components/UI';
import toast from 'react-hot-toast';

const BLANK = { name: '', description: '', iconKey: '' };

export default function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState<'add'|'edit'|null>(null);
  const [editing, setEditing]   = useState<any>(null);
  const [form, setForm]         = useState({ ...BLANK });
  const [saving, setSaving]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number|null>(null);

  async function load() {
    try { setServices(await api.services.getAll()); }
    catch (e: any) { toast.error('Failed to load services: ' + e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function openAdd() { setForm({ ...BLANK }); setEditing(null); setModal('add'); }
  function openEdit(s: any) {
    setForm({ name: s.name, description: s.description ?? '', iconKey: s.iconKey ?? '' });
    setEditing(s); setModal('edit');
  }

  async function handleSave() {
    if (!form.name.trim()) return toast.error('Service name is required.');
    setSaving(true);
    try {
      if (modal === 'add') { await api.services.create(form); toast.success('Service added to live site.'); }
      else { await api.services.update({ id: editing.id, ...form }); toast.success('Service updated.'); }
      setModal(null); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    try { await api.services.delete(id); toast.success('Service removed.'); setDeleteTarget(null); load(); }
    catch (e: any) { toast.error(e.message); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>;

  return (
    <div className="fade-in max-w-3xl">
      <SectionHeader
        title="Surveying Services"
        subtitle="Add, edit or remove the services shown on the live Chemi Surveys website."
        action={<button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add service</button>}
      />

      {services.length === 0 ? (
        <Empty icon={Wrench} message="No services added yet." action={<button className="btn-primary" onClick={openAdd}>Add first service</button>} />
      ) : (
        <div className="space-y-3">
          {services.map((s: any, i: number) => (
            <div key={s.id} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue/30 to-blue/10 border border-blue/30 flex items-center justify-center flex-shrink-0">
                <span className="text-neon font-bold text-sm">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{s.name}</p>
                {s.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{s.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(s)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"><Pencil size={13} /> Edit</button>
                <button onClick={() => setDeleteTarget(s.id)} className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1.5"><Trash2 size={13} /> Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add surveying service' : 'Edit service'} onClose={() => setModal(null)}>
          <Field label="Service name"><Input placeholder="e.g. Boundary Survey" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></Field>
          <Field label="Description"><Textarea placeholder="Brief description of this service…" value={form.description} onChange={(e: any) => setForm({...form, description: e.target.value})} /></Field>
          <Field label="Icon key (optional)">
            <Input placeholder="e.g. border-outer" value={form.iconKey} onChange={e => setForm({...form, iconKey: e.target.value})} />
            <p className="text-xs text-slate-600 mt-1">Tabler icon name used on the live site (e.g. satellite, map-2, building).</p>
          </Field>
          <div className="flex gap-3 mt-5">
            <button className="btn-secondary flex-1" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : modal === 'add' ? 'Add to live site' : 'Save changes'}</button>
          </div>
        </Modal>
      )}
      {deleteTarget !== null && <Confirm message="Remove this service from the live website?" onConfirm={() => handleDelete(deleteTarget)} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}
