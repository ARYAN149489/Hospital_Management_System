import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, X, RotateCcw, ChevronDown } from 'lucide-react';
import { appointmentAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const STATUS_COLORS = {
  scheduled: 'badge-info', confirmed: 'badge-stable', completed: 'badge-completed',
  cancelled: 'badge-critical', pending: 'badge-pending'
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentAPI.getMyAppointments({});
      if (res.success) setAppointments(res.data || []);
    } catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentAPI.cancel(id, 'Patient requested cancellation');
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch { toast.error('Failed to cancel appointment'); }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div>
      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['all', 'scheduled', 'confirmed', 'completed', 'cancelled'].map(f => (
          <button type="button" key={f} onClick={() => setFilter(f)}
            className="filter-pill"
            style={{
              borderColor: filter === f ? 'var(--secondary)' : 'var(--outline-var)',
              background: filter === f ? 'rgba(0,106,106,0.1)' : 'transparent',
              color: filter === f ? 'var(--secondary)' : 'var(--on-surface-var)',
            }}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner spinner-lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <Calendar size={48} color="var(--outline)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--on-surface-var)', marginBottom: '20px' }}>No appointments found</p>
          <button type="button" onClick={() => navigate('?section=book-appointment')} className="btn btn-primary btn-sm" style={{ border: 'none', cursor: 'pointer' }}>Book Appointment</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(apt => {
            const doctorName = `Dr. ${apt.doctor?.user?.firstName || ''} ${apt.doctor?.user?.lastName || ''}`.trim() || 'Doctor';
            const date = apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
            return (
              <div key={apt._id} className="glass-card-sm">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '14px', flex: 1 }}>
                    <div className="avatar avatar-md avatar-gradient">{doctorName[4] || 'D'}</div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{doctorName}</p>
                      <p style={{ fontSize: '13px', color: 'var(--secondary)', marginBottom: '10px' }}>{apt.doctor?.specialization || 'General'}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: 'var(--on-surface-var)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={14} />{date}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={14} />{apt.appointmentTime || 'TBD'}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={14} />{apt.appointmentType || 'in-person'}</span>
                      </div>
                      {apt.reason && <p style={{ fontSize: '13px', color: 'var(--outline)', marginTop: '8px' }}>Reason: {apt.reason}</p>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    <span className={`badge ${STATUS_COLORS[apt.status] || 'badge-info'}`} style={{ textTransform: 'capitalize' }}>{apt.status}</span>
                    {['scheduled', 'confirmed'].includes(apt.status) && (
                      <button type="button" onClick={() => handleCancel(apt._id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
                        <X size={14} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
