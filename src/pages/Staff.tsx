import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ShieldCheck, User } from 'lucide-react';
import { api } from '../utils/api';
import { Modal, Field, Input, Select, SectionHeader, Spinner, Empty, Badge, Confirm } from '../components/UI';
import toast from 'react-hot-toast';

const BLANK = { fullName: '', email: '', phone: '', jobTitle: '', role: 'STAFF', password: '', confirmPassword: '' };

export default function Staff() {
  const [staff, setStaff]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState<'add'|'edit'|null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm]       = useState({ ...BLANK });
  const [saving, setSaving]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number|null>(null);

  async function load() {
    try {
      const data = await api.auth.staffDirectory();
      setStaff(data);
    } catch (e: any) {
      toast.error('Failed to load staff: ' + e.message);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function openAdd() { setForm({ ...BLANK }); setEditing(null); setModal('add'); }
  function openEdit(s: any) {
    setForm({ ...BLANK, fullName: s.fullName, email: s.email, phone: s.phone ?? '', jobTitle: s.jobTitle ?? '', role: s.role });
    setEditing(s);
    setModal('edit');
  }

  async function handleSave() {
    if (!form.fullName || !form.email) return toast.error('Name and email are required.');
    if (modal === 'add' && !form.password) return toast.error('Password is required for new accounts.');
    if (form.password && form.password !== form.confirmPassword) return toast.error('Passwords do not match.');
    setSaving(true);
    try {
      const payload: any = { fullName: form.fullName, email: form.email, phone: form.phone, jobTitle: form.jobTitle, role: form.role };
      if (form.password) payload.password = form.password;
      if (modal === 'add') {
        await api.users.create(payload);
        toast.success('Staff account created — they can now sign in.');
      } else {
        await api.users.update(editing.id, payload);
        toast.success('Staff account updated.');
      }
      setModal(null);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    try {
      await api.users.delete(id);
      toast.success('Staff account removed.');
      setDeleteTarget(null);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>;

  return (
    <div className="fade-in">
      <SectionHeader
        title="Staff & Users"
        subtitle="Manage admin and staff accounts, emails, passwords and contact details."
        action={
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add staff member
          </button>
        }
      />

      {staff.length === 0 ? (
        <Empty icon={User} message="No staff accounts found." action={<button className="btn-primary" onClick={openAdd}>Add first staff member</button>} />
      ) : (
        <div className="space-y-3">
          {staff.map((s: any) => (
            <div key={s.id} className="card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue/20 flex items-center justify-center flex-shrink-0">
                {s.role === 'ADMIN' ? <ShieldCheck size={18} className="text-neon" /> : <User size={18} className="text-blue-300" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-white">{s.fullName}</p>
                  <Badge color={s.role === 'ADMIN' ? 'green' : 'blue'}>{s.role}</Badge>
                </div>
                <p className="text-sm text-slate-400 mt-0.5">{s.email}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                  {s.phone && <span>📱 {s.phone}</span>}
                  {s.jobTitle && <span>💼 {s.jobTitle}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(s)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
                  <Pencil size={13} /> Edit
                </button>
                <button onClick={() => setDeleteTarget(s.id)} className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1.5">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add staff member' : 'Edit staff member'} onClose={() => setModal(null)}>
          <div className="space-y-1">
            <Field label="Full name"><Input placeholder="John Muiruri Gachemi" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} /></Field>
            <Field label="Email address"><Input type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></Field>
            <Field label="Phone number"><Input placeholder="0703 676 856" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></Field>
            <Field label="Job title"><Input placeholder="Land Surveyor" value={form.jobTitle} onChange={e => setForm({...form, jobTitle: e.target.value})} /></Field>
            <Field label="Role">
              <Select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="ADMIN">ADMIN</option>
                <option value="STAFF">STAFF</option>
              </Select>
            </Field>
            <Field label={modal === 'add' ? 'Password' : 'New password (leave blank to keep current)'}>
              <Input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </Field>
            {form.password && (
              <Field label="Confirm password">
                <Input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} />
              </Field>
            )}
          </div>
          <div className="flex gap-3 mt-5">
            <button className="btn-secondary flex-1" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : modal === 'add' ? 'Create account' : 'Save changes'}
            </button>
          </div>
        </Modal>
      )}

      {deleteTarget !== null && (
        <Confirm
          message="Are you sure you want to delete this staff account? They will no longer be able to sign in."
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
