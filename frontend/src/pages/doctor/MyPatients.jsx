import { useState, useEffect } from 'react';
import { Users, ChevronRight } from 'lucide-react';
import { doctorAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

export default function MyPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    doctorAPI.getPatients()
      .then(r => { if (r.success) setPatients(r.data || []); })
      .catch(() => toast.error('Failed to load patients'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner spinner-lg" /></div>;

  return (
    <div>
      <h2 className="headline-sm" style={{ marginBottom: '24px' }}>My Patients ({patients.length})</h2>
      {patients.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <Users size={48} color="var(--outline)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--on-surface-var)' }}>No patients yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {patients.map(patient => {
            const p = patient.user || patient;
            const name = `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Patient';
            const initials = (p.firstName?.[0] || 'P').toUpperCase();
            return (
              <div key={patient._id} className="glass-card-sm">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div className="avatar avatar-md avatar-primary">{initials}</div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px' }}>{name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--on-surface-var)' }}>{p.email}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {patient.appointmentCount && <span className="badge badge-info">{patient.appointmentCount} appointments</span>}
                  {patient.lastVisit && <span className="badge badge-teal">Last: {new Date(patient.lastVisit).toLocaleDateString()}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
