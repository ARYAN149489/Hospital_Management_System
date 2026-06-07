import { useState, useEffect } from 'react';
import { Pill, Calendar, ChevronDown, ChevronUp, User } from 'lucide-react';
import { doctorAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    doctorAPI.getPrescriptions()
      .then(r => { if (r.success) setPrescriptions(r.data || []); })
      .catch(() => toast.error('Failed to load prescriptions'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner spinner-lg" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="headline-sm">Prescriptions ({prescriptions.length})</h2>
      </div>
      {prescriptions.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <Pill size={48} color="var(--outline)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--on-surface-var)' }}>No prescriptions created yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {prescriptions.map(rx => {
            const patName = `${rx.patient?.user?.firstName || ''} ${rx.patient?.user?.lastName || ''}`.trim() || 'Patient';
            const date = rx.prescriptionDate ? new Date(rx.prescriptionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
            const meds = rx.medications || [];
            const isOpen = expanded === rx._id;
            return (
              <div key={rx._id} className="glass-card-sm">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : rx._id)}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="avatar avatar-sm avatar-teal">{patName[0]}</div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{patName}</p>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: 'var(--on-surface-var)' }}>
                        <span>{rx.diagnosis || 'Diagnosis'}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={11} />{date}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-teal">{meds.length} med{meds.length !== 1 ? 's' : ''}</span>
                    {isOpen ? <ChevronUp size={16} color="var(--outline)" /> : <ChevronDown size={16} color="var(--outline)" />}
                  </div>
                </div>
                {isOpen && (
                  <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--surface-high)' }}>
                    {meds.map((med, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--surface-low)', borderRadius: '10px', marginBottom: '8px' }}>
                        <Pill size={16} color="var(--secondary)" />
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '13px' }}>{med.name}</p>
                          {med.dosage && <p style={{ fontSize: '12px', color: 'var(--on-surface-var)' }}>{med.dosage} · {med.frequency} · {typeof med.duration === 'object' ? `${med.duration?.value || ''} ${med.duration?.unit || ''}` : med.duration}</p>}
                        </div>
                      </div>
                    ))}
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
