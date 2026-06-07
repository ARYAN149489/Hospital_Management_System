import { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { doctorAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const LEAVE_TYPES = ['sick_leave', 'casual_leave', 'vacation', 'emergency', 'maternity', 'paternity', 'compensatory', 'unpaid', 'other'];

export default function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ startDate: '', endDate: '', leaveType: 'casual_leave', reason: '' });

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await doctorAPI.getLeaves();
      if (res.success) setLeaves(res.data || []);
    } catch { toast.error('Failed to load leaves'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate || !form.reason) { toast.error('Please fill all required fields'); return; }
    setSubmitting(true);
    try {
      const res = await doctorAPI.applyLeave(form);
      if (res.success) { toast.success('Leave applied!'); fetchLeaves(); setForm({ startDate: '', endDate: '', leaveType: 'casual_leave', reason: '' }); }
      else toast.error(res.message || 'Failed to apply');
    } catch (e) { toast.error(e.response?.data?.message || 'Error applying leave'); }
    finally { setSubmitting(false); }
  };

  const STATUS_COLORS = { pending: 'badge-pending', approved: 'badge-stable', rejected: 'badge-critical' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Apply Leave Form */}
      <div>
        <h2 className="headline-sm" style={{ marginBottom: '20px' }}>Apply for Leave</h2>
        <div className="glass-card-sm">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Start Date *</label>
                <input type="date" value={form.startDate} min={new Date().toISOString().split('T')[0]} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input-glass" required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">End Date *</label>
                <input type="date" value={form.endDate} min={form.startDate || new Date().toISOString().split('T')[0]} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="input-glass" required />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Leave Type</label>
              <select value={form.leaveType} onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))} className="input-glass select-glass">
                {LEAVE_TYPES.map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Reason *</label>
              <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className="input-glass" placeholder="Reason for leave…" rows={3} required style={{ resize: 'vertical' }} />
            </div>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? <><div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> Submitting…</> : <>Submit Request <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>
      </div>

      {/* Leave History */}
      <div>
        <h2 className="headline-sm" style={{ marginBottom: '20px' }}>Leave History</h2>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="spinner" /></div>
        ) : leaves.length === 0 ? (
          <div className="glass-card-sm" style={{ textAlign: 'center', padding: '40px' }}>
            <Calendar size={40} color="var(--outline)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--on-surface-var)' }}>No leave requests yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {leaves.map(leave => {
              const start = new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const end = new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              return (
                <div key={leave._id} className="glass-card-sm" style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '14px', textTransform: 'capitalize', marginBottom: '4px' }}>{leave.leaveType.replace('_', ' ')} Leave</p>
                      <p style={{ fontSize: '12px', color: 'var(--on-surface-var)' }}>{start} – {end}</p>
                      {leave.reason && <p style={{ fontSize: '12px', color: 'var(--outline)', marginTop: '4px' }}>{leave.reason}</p>}
                    </div>
                    <span className={`badge ${STATUS_COLORS[leave.status] || 'badge-info'}`} style={{ textTransform: 'capitalize' }}>{leave.status || 'pending'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
