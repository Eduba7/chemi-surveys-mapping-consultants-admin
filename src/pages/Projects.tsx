import React, { useState, useEffect } from 'react';
import { Plus, X, FolderOpen, Pencil } from 'lucide-react';
import { api } from '../utils/api';
import { Modal, Field, Input, SectionHeader, Spinner } from '../components/UI';
import toast from 'react-hot-toast';

const BLANK = { projectTitle: '', completionDate: '', imageUrl: '', description: '' };

export default function Projects() {
  const [grid, setGrid]         = useState<(any|null)[]>(Array(12).fill(null));
  const [loading, setLoading]   = useState(true);
  const [editingSlot, setEditingSlot] = useState<number|null>(null);
  const [form, setForm]         = useState({ ...BLANK });
  const [saving, setSaving]     = useState(false);

  async function load() {
    try {
      const data = await api.projects.getGrid();
      setGrid(Array.isArray(data) ? data : Array(12).fill(null));
    } catch (e: any) { toast.error('Failed to load projects: ' + e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function openSlot(i: number) {
    const p = grid[i];
    setForm({
      projectTitle: p?.projectTitle ?? '',
      completionDate: p?.completionDate ? new Date(p.completionDate).toISOString().split('T')[0] : '',
      imageUrl: p?.imageUrl ?? '',
      description: p?.description ?? '',
    });
    setEditingSlot(i);
  }

  async function handleSave() {
    if (!form.projectTitle.trim()) return toast.error('Project title is required.');
    if (editingSlot === null) return;
    setSaving(true);
    try {
      await api.projects.upsertSlot({
        slotIndex: editingSlot,
        projectTitle: form.projectTitle,
        completionDate: form.completionDate || undefined,
        imageUrl: form.imageUrl || undefined,
        description: form.description || undefined,
      });
      toast.success('Project saved to live site.');
      setEditingSlot(null); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  async function handleClear(i: number, e: React.MouseEvent) {
    e.stopPropagation();
    try { await api.projects.clearSlot(i); toast.success('Project slot cleared.'); load(); }
    catch (err: any) { toast.error(err.message); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>;

  return (
    <div className="fade-in">
      <SectionHeader
        title="My Projects Portfolio"
        subtitle="Fill the 12 project slots on the live website. Click any slot to add or edit."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {grid.map((project, i) => (
          <div key={i} className="relative">
            {project ? (
              <div
                onClick={() => openSlot(i)}
                className="card overflow-hidden cursor-pointer hover:border-neon/40 transition-colors group"
              >
                <button
                  onClick={e => handleClear(i, e)}
                  className="absolute top-2 right-2 z-10 w-6 h-6 rounded bg-navy/80 text-neon flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Clear slot"
                >
                  <X size={12} />
                </button>
                <div className="h-20 bg-gradient-to-br from-blue to-blue/40 flex items-center justify-center overflow-hidden">
                  {project.imageUrl
                    ? <img src={project.imageUrl} alt={project.projectTitle} className="w-full h-full object-cover" />
                    : <FolderOpen size={24} className="text-neon" />
                  }
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-white leading-snug line-clamp-2">{project.projectTitle}</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {project.completionDate ? new Date(project.completionDate).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' }) : 'Date TBD'}
                  </p>
                </div>
                <div className="absolute inset-0 bg-blue/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-navy/80 text-neon text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <Pencil size={11} /> Edit
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => openSlot(i)}
                className="w-full h-full min-h-[120px] rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-600 hover:border-neon/40 hover:text-neon transition-all"
              >
                <Plus size={20} />
                <span className="text-[10px] mt-1">Slot {i + 1}</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {editingSlot !== null && (
        <Modal title={`Project — Slot ${editingSlot + 1}`} onClose={() => setEditingSlot(null)}>
          <Field label="Project title"><Input placeholder="e.g. Thika Boundary Survey — Phase 1" value={form.projectTitle} onChange={e => setForm({...form, projectTitle: e.target.value})} /></Field>
          <Field label="Completion date"><Input type="date" value={form.completionDate} onChange={e => setForm({...form, completionDate: e.target.value})} /></Field>
          <Field label="Image URL (optional)">
            <Input type="url" placeholder="https://cdn.example.com/project.jpg" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} />
            {form.imageUrl && (
              <div className="mt-2 h-24 rounded-lg overflow-hidden border border-white/10">
                <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}
          </Field>
          <Field label="Short description (optional)"><Input placeholder="Brief description of this project…" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></Field>
          <div className="flex gap-3 mt-5">
            <button className="btn-secondary flex-1" onClick={() => setEditingSlot(null)}>Cancel</button>
            <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save to live site'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
