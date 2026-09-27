import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, CalendarDays, Clock } from 'lucide-react';
import { api } from '../utils/api';
import { Modal, Field, Input, Select, SectionHeader, Spinner, Empty, Badge } from '../components/UI';
import toast from 'react-hot-toast';

const STATUS_MAP: Record<string, { label: string; color: 'blue'|'green'|'yellow'|'red'|'gray' }> = {
  BOOKED:    { label: 'Booked',     color: 'yellow' },
  CONFIRMED: { label: 'Confirmed',  color: 'blue' },
  COMPLETED: { label: 'Completed',  color: 'green' },
  CANCELLED: { label: 'Cancelled',  color: 'gray' },
  NO_SHOW:   { label: 'No-show',    color: 'red' },
};
const STATUS_CYCLE = ['BOOKED','CONFIRMED','COMPLETED','NO_SHOW','BOOKED'];

function nextStatus(s: string) {
  const i = STATUS_CYCLE.indexOf(s);
  return STATUS_CYCLE[i + 1] ?? 'BOOKED';
}

export default function Dashboard() {
  const [todayTasks, setTodayTasks]       = useState<any[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [clients, setClients]             = useState<any[]>([]);
  const [services, setServices]           = useState<any[]>([]);
  const [stats, setStats]                 = useState<any>(null);
  const [loading, setLoading]             = useState(true);
  const [modal, setModal]                 = useState<'today'|'upcoming'|null>(null);
  const [form, setForm] = useState({ clientId: '', serviceId: '', time: '', date: '', location: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [t, u, c, s, st] = await Promise.all([
        api.consultations.getToday(),
        api.consultations.getUpcoming(),
        api.clients.getAll(),
        api.services.getAll(),
        api.consultations.stats(),
      ]);
      setTodayTasks(t);
      setUpcomingTasks(u);
      setClients(c);
      setServices(s);
      setStats(st);
    } catch (e: any) {
      toast.error('Failed to load dashboard: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!form.clientId || !form.serviceId) return toast.error('Client and service are required.');
    setSaving(true);
    try {
      const dt = modal === 'today'
        ? new Date(`${new Date().toISOString().split('T')[0]}T${form.time || '09:00'}`).toISOString()
        : new Date(`${form.date}T${form.time || '09:00'}`).toISOString();
      await api.consultations.create({
        clientId: Number(form.clientId),
        serviceId: Number(form.serviceId),
        scheduledTime: dt,
        location: form.location || 'Thika',
        isToday: modal === 'today',
      });
      toast.success('Task added — live site updated.');
      setModal(null);
      setForm({ clientId: '', serviceId: '', time: '', date: '', location: '' });
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.consultations.delete(id);
      toast.success('Task removed.');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function cycleStatus(id: number, current: string) {
    try {
      await api.consultations.updateStatus(id, nextStatus(current));
      toast.success('Status updated on live site.');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>
  );

  const statCards = [
    { label: "Today's tasks",   value: stats?.todayCount    ?? 0, color: 'from-blue-600 to-blue-800' },
    { label: 'Upcoming',        value: stats?.upcomingCount ?? 0, color: 'from-violet-600 to-violet-800' },
    { label: 'Active clients',  value: stats?.clientCount   ?? 0, color: 'from-emerald-600 to-emerald-800' },
    { label: 'Completion rate', value: stats?.completionRate != null ? `${stats.completionRate}%` : '—', color: 'from-amber-600 to-amber-800' },
    { label: 'Cancelled',       value: stats?.cancelledCount ?? 0, color: 'from-slate-600 to-slate-800' },
    { label: 'No-shows',        value: stats?.noShowCount   ?? 0, color: 'from-red-600 to-red-800' },
  ];

  return (
    <div className="fade-in">
      <SectionHeader
        title="Dashboard"
        subtitle="Manage Today's Schedule and Upcoming Tasks — changes reflect on the live site instantly."
      />

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {statCards.map(s => (
          <div key={s.label} className={`card p-4 bg-gradient-to-br ${s.color} border-0`}>
            <p className="text-xs text-white/70 font-medium">{s.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-neon" />
              <h3 className="font-semibold text-white">Today's Schedule</h3>
              <Badge color="blue">{todayTasks.length}</Badge>
            </div>
            <button
              onClick={() => setModal('today')}
              className="btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5"
            >
              <Plus size={14} /> Add Task
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {todayTasks.length === 0 ? (
              <Empty icon={Clock} message="No tasks scheduled today. Add one to get started." />
            ) : todayTasks.map((t: any) => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/2 group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{t.client?.nameOrCompany}</p>
                  <p className="text-xs text-slate-500">{t.service?.name} · {t.location}</p>
                  <p className="text-xs text-slate-600">
                    {new Date(t.scheduledTime).toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  onClick={() => cycleStatus(t.id, t.status)}
                  className="flex-shrink-0"
                >
                  <Badge color={STATUS_MAP[t.status]?.color ?? 'gray'}>
                    {STATUS_MAP[t.status]?.label ?? t.status}
                  </Badge>
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                  title="Delete task"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-lemon" />
              <h3 className="font-semibold text-white">Upcoming Tasks</h3>
              <Badge color="yellow">{upcomingTasks.length}</Badge>
            </div>
            <button
              onClick={() => setModal('upcoming')}
              className="btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {upcomingTasks.length === 0 ? (
              <Empty icon={CalendarDays} message="No upcoming tasks. Schedule one to appear on the live site." />
            ) : upcomingTasks.map((t: any) => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/2 group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{t.client?.nameOrCompany}</p>
                  <p className="text-xs text-slate-500">{t.service?.name} · {t.location}</p>
                  <p className="text-xs text-slate-600">
                    {new Date(t.scheduledTime).toLocaleDateString('en-KE', { weekday:'short', day:'numeric', month:'short' })}{' '}
                    {new Date(t.scheduledTime).toLocaleTimeString('en-KE', { hour:'numeric', minute:'2-digit' })}
                  </p>
                </div>
                <Badge color="yellow">Booked</Badge>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                  title="Delete task"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {modal && (
        <Modal
          title={`Add ${modal === 'today' ? "Today's" : 'Upcoming'} Task`}
          onClose={() => setModal(null)}
        >
          <div className="space-y-1">
            <Field label="Client">
              <Select value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})}>
                <option value="">Select a client…</option>
                {clients.map((c: any) => <option key={c.id} value={c.id}>{c.nameOrCompany}</option>)}
              </Select>
            </Field>
            <Field label="Service">
              <Select value={form.serviceId} onChange={e => setForm({...form, serviceId: e.target.value})}>
                <option value="">Select a service…</option>
                {services.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </Field>
            {modal === 'upcoming' && (
              <Field label="Date">
                <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </Field>
            )}
            <Field label="Time">
              <Input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} defaultValue="09:00" />
            </Field>
            <Field label="Location">
              <Input placeholder="e.g. Thika" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </Field>
          </div>
          <div className="flex gap-3 mt-5">
            <button className="btn-secondary flex-1" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save to live site'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
