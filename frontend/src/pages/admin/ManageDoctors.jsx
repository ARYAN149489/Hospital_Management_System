import { useState, useEffect } from 'react';
import { UserCheck, Search, CheckCircle, XCircle, Plus, Star } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [rejectionModal, setRejectionModal] = useState({ open: false, doctorId: '', reason: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [allRes, pendRes] = await Promise.all([adminAPI.getAllDoctors({}), adminAPI.getPendingDoctors()]);
      if (allRes.success) setDoctors(allRes.data || []);
      if (pendRes.success) setPending(pendRes.data || []);
    } catch { toast.error('Failed to load doctors'); }
    finally { setLoading(false); }
  };

  const approveDoctor = async (id) => {
    try {
      await adminAPI.approveDoctor(id);
      toast.success('Doctor approved!');
      fetchAll();
    } catch { toast.error('Failed to approve'); }
  };

  const openRejectionModal = (id) => {
    setRejectionModal({ open: true, doctorId: id, reason: '' });
  };

  const submitRejection = async () => {
    const { doctorId, reason } = rejectionModal;
    if (!reason || reason.trim().length < 10) {
      toast.error('Rejection reason must be at least 10 characters');
      return;
    }
    try {
      await adminAPI.rejectDoctor(doctorId, reason.trim());
      toast.success('Doctor profile rejected successfully');
      setRejectionModal({ open: false, doctorId: '', reason: '' });
      fetchAll();
    } catch {
      toast.error('Failed to reject doctor profile');
    }
  };

  const filtered = (tab === 'pending' ? pending : doctors).filter(d => {
    const name = `${d.user?.firstName || ''} ${d.user?.lastName || ''}`.toLowerCase();
    return !search || name.includes(search.toLowerCase());
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[['all', 'All Doctors'], ['pending', 'Pending Approval']].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '8px 18px', borderRadius: '999px', border: '1.5px solid', borderColor: tab === t ? 'var(--secondary)' : 'var(--outline-var)', background: tab === t ? 'rgba(0,106,106,0.1)' : 'transparent', color: tab === t ? 'var(--secondary)' : 'var(--on-surface-var)', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}>
              {l}{t === 'pending' && pending.length > 0 && <span style={{ marginLeft: '6px', background: '#d97706', color: 'white', borderRadius: '999px', padding: '1px 7px', fontSize: '11px' }}>{pending.length}</span>}
            </button>
          ))}
        </div>
        <div className="input-wrapper" style={{ flex: 1, minWidth: '200px' }}>
          <Search size={16} className="input-icon-left" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-glass input-with-left-icon" placeholder="Search doctors…" style={{ fontSize: '14px' }} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner spinner-lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <UserCheck size={48} color="var(--outline)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--on-surface-var)' }}>{tab === 'pending' ? 'No pending approvals' : 'No doctors found'}</p>
        </div>
      ) : (
        <div style={{ overflow: 'auto' }}>
          <table className="glass-table" style={{ minWidth: '700px' }}>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialty</th>
                <th>Experience</th>
                <th>Status</th>
                {tab === 'pending' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => {
                const name = `Dr. ${doc.user?.firstName || ''} ${doc.user?.lastName || ''}`.trim();
                const email = doc.user?.email || '—';
                const initials = (doc.user?.firstName?.[0] || 'D').toUpperCase();
                return (
                  <tr key={doc._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="avatar avatar-sm avatar-teal">{initials}</div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '14px' }}>{name}</p>
                          <p style={{ fontSize: '12px', color: 'var(--on-surface-var)' }}>{email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '14px' }}>{doc.specialization || '—'}</td>
                    <td style={{ fontSize: '14px' }}>{(doc.experience || doc.yearsOfExperience) ? `${doc.experience || doc.yearsOfExperience} yrs` : '—'}</td>
                    <td>
                      <span className={`badge ${doc.approvalStatus === 'approved' ? 'badge-stable' : 'badge-pending'}`} style={{ textTransform: 'capitalize' }}>
                        {doc.approvalStatus || 'pending'}
                      </span>
                    </td>
                    {tab === 'pending' && (
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => approveDoctor(doc._id)} className="btn btn-secondary btn-sm">
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button onClick={() => openRejectionModal(doc._id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectionModal.open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div className="glass-card-sm" style={{
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            boxShadow: 'var(--shadow-lg)',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid var(--outline-var)'
          }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', marginBottom: '12px' }}>Reject Doctor Profile</h3>
            <p style={{ fontSize: '13px', color: 'var(--on-surface-var)', marginBottom: '16px' }}>
              Please specify the reason for rejecting this doctor's profile. This will be sent to the doctor.
            </p>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Rejection Reason *</label>
              <textarea
                value={rejectionModal.reason}
                onChange={e => setRejectionModal(m => ({ ...m, reason: e.target.value }))}
                className="input-glass"
                placeholder="Type reason here (minimum 10 characters)..."
                rows={4}
                required
                style={{ resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => setRejectionModal({ open: false, doctorId: '', reason: '' })} 
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button 
                onClick={submitRejection} 
                className="btn btn-primary btn-sm"
                style={{ background: 'var(--error)', borderColor: 'var(--error)' }}
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
