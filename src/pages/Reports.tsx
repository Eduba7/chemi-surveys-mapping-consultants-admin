import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, CheckCircle2 } from 'lucide-react';
import { SectionHeader } from '../components/UI';
import toast from 'react-hot-toast';

const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

export default function Reports() {
  const [years, setYears] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('csmc_report_years') || 'null') ?? DEFAULT_YEARS; }
    catch { return DEFAULT_YEARS; }
  });
  const [newYear, setNewYear] = useState('');
  const [saved, setSaved]    = useState(false);

  function save(updated: number[]) {
    const sorted = [...new Set(updated)].sort((a, b) => a - b);
    setYears(sorted);
    localStorage.setItem('csmc_report_years', JSON.stringify(sorted));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    toast.success('Report year list updated.');
  }

  function addYear() {
    const y = parseInt(newYear);
    if (!y || y < 2000 || y > 2100) return toast.error('Enter a valid year between 2000 and 2100.');
    if (years.includes(y)) return toast.error('That year is already in the list.');
    save([...years, y]);
    setNewYear('');
  }

  function removeYear(y: number) {
    if (years.length <= 1) return toast.error('You must keep at least one year.');
    save(years.filter(x => x !== y));
  }

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  return (
    <div className="fade-in max-w-2xl">
      <SectionHeader
        title="Reports — Year Management"
        subtitle="This list is saved in this browser only; it does not update the live website."
      />

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={18} className="text-neon" />
          <h3 className="font-semibold text-white">Available report years</h3>
          {saved && <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle2 size={12} /> Saved</span>}
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {years.map(y => (
            <div key={y} className="flex items-center gap-1.5 bg-blue/20 border border-blue/30 rounded-lg px-3 py-1.5">
              <span className="text-sm font-semibold text-white">{y}</span>
              <button onClick={() => removeYear(y)} className="text-slate-500 hover:text-red-400 transition-colors ml-1">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Add year, e.g. 2027"
            value={newYear}
            onChange={e => setNewYear(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addYear()}
            className="input-field max-w-[180px]"
            min={2000} max={2100}
          />
          <button onClick={addYear} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add year
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-3">
          This local list is for reference only. The live website's report-year selector is not connected to this panel.
          Press Enter or click Add year to add a year in this browser.
        </p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={18} className="text-lemon" />
          <h3 className="font-semibold text-white">PDF report contents</h3>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          The generated PDF always includes the following sections. These are automatically
          populated from the live database — no additional configuration is needed.
        </p>
        <div className="space-y-2">
          {[
            'Official Chemi Surveys & Mapping Consultants letterhead',
            '8 summary stat boxes (tasks, completion rate, clients, etc.)',
            'Field tasks table for the selected month (colour-coded by status)',
            'Upcoming tasks table (all tasks beyond the selected month)',
            'Full client directory with phone and email',
            'Page numbers on every page',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
              <CheckCircle2 size={15} className="text-neon mt-0.5 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
