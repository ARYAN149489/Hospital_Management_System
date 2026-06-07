import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, MapPin, FileText } from 'lucide-react';
import { doctorAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const STATUS_COLORS = { scheduled: 'badge-info', confirmed: 'badge-stable', completed: 'badge-completed', cancelled: 'badge-critical', 'no-show': 'badge-pending' };

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await doctorAPI.getAppointments({});
      if (res.success) setAppointments(res.data || []);
    } catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await doctorAPI.updateAppointmentStatus(id, { status });
      toast.success('Status updated');
      fetchAppointments();
    } catch { toast.error('Failed to update status'); }
    finally { setUpdatingId(null); }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['all', 'scheduled', 'confirmed', 'completed', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '8px 18px', borderRadius: '999px', border: '1.5px solid', borderColor: filter === f ? 'var(--secondary)' : 'var(--outline-var)', background: filter === f ? 'rgba(0,106,106,0.1)' : 'transparent', color: filter === f ? 'var(--secondary)' : 'var(--on-surface-var)', fontWeight: 600, fontSize: '13px', cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s' }}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner spinner-lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <Calendar size={48} color="var(--outline)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--on-surface-var)' }}>No appointments found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map(apt => {
            const patName = `${apt.patient?.user?.firstName || ''} ${apt.patient?.user?.lastName || ''}`.trim() || 'Patient';
            const date = apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'N/A';
            return (
              <div key={apt._id} className="glass-card-sm">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="avatar avatar-md avatar-teal">{patName[0]}</div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{patName}</p>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--on-surface-var)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} />{date}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} />{apt.appointmentTime || 'TBD'}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} />{apt.appointmentType || 'in-person'}</span>
                      </div>
                      {apt.reason && <p style={{ fontSize: '12px', color: 'var(--outline)', marginTop: '6px' }}>Reason: {apt.reason}</p>}
                    </div>
                  </div>
                  <span className={`badge ${STATUS_COLORS[apt.status] || 'badge-info'}`} style={{ textTransform: 'capitalize' }}>{apt.status}</span>
                </div>

                {['scheduled', 'confirmed'].includes(apt.status) && (
                  <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--surface-high)' }}>
                    <button onClick={() => updateStatus(apt._id, 'confirmed')} disabled={updatingId === apt._id || apt.status === 'confirmed'} className="btn btn-secondary btn-sm">
                      <CheckCircle size={14} /> Confirm
                    </button>
                    <button onClick={() => updateStatus(apt._id, 'completed')} disabled={updatingId === apt._id} className="btn btn-ghost btn-sm">
                      <CheckCircle size={14} /> Complete
                    </button>
                    <button onClick={() => updateStatus(apt._id, 'cancelled')} disabled={updatingId === apt._id} className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }}>
                      <XCircle size={14} /> Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
