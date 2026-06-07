import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const STATUS_COLORS = { scheduled: 'badge-info', confirmed: 'badge-stable', completed: 'badge-completed', cancelled: 'badge-critical' };

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    adminAPI.getAllAppointments({})
      .then(r => { if (r.success) setAppointments(r.data || []); })
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <h2 className="headline-sm" style={{ flex: 1 }}>All Appointments</h2>
        {['all', 'scheduled', 'confirmed', 'completed', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 14px', borderRadius: '999px', border: '1.5px solid', borderColor: filter === f ? 'var(--secondary)' : 'var(--outline-var)', background: filter === f ? 'rgba(0,106,106,0.1)' : 'transparent', color: filter === f ? 'var(--secondary)' : 'var(--on-surface-var)', fontWeight: 600, fontSize: '12px', cursor: 'pointer', textTransform: 'capitalize' }}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner spinner-lg" /></div>
      ) : (
        <div style={{ overflow: 'auto' }}>
          <table className="glass-table" style={{ minWidth: '800px' }}>
            <thead><tr><th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Type</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(apt => {
                const pat = `${apt.patient?.user?.firstName || ''} ${apt.patient?.user?.lastName || ''}`.trim() || 'Patient';
                const doc = `Dr. ${apt.doctor?.user?.firstName || ''} ${apt.doctor?.user?.lastName || ''}`.trim() || 'Doctor';
                const date = apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
                return (
                  <tr key={apt._id}>
                    <td style={{ fontWeight: 600, fontSize: '14px' }}>{pat}</td>
                    <td style={{ fontWeight: 600, fontSize: '14px', color: 'var(--secondary)' }}>{doc}</td>
                    <td style={{ fontSize: '13px', color: 'var(--on-surface-var)' }}>{date} · {apt.appointmentTime || 'TBD'}</td>
                    <td><span className="badge badge-info" style={{ textTransform: 'capitalize', fontSize: '11px' }}>{apt.appointmentType || 'in-person'}</span></td>
                    <td><span className={`badge ${STATUS_COLORS[apt.status] || 'badge-info'}`} style={{ textTransform: 'capitalize', fontSize: '11px' }}>{apt.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Calendar size={40} color="var(--outline)" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--on-surface-var)' }}>No appointments found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
