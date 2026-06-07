import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

export default function ManageLeave() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionModal, setRejectionModal] = useState({ open: false, leaveId: '', reason: '' });

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllLeaves({});
      if (res.success) setLeaves(res.data || []);
    } catch { toast.error('Failed to load leave requests'); }
    finally { setLoading(false); }
  };

  const approve = async (id) => {
    try { await adminAPI.approveLeave(id); toast.success('Leave approved!'); fetchLeaves(); }
    catch { toast.error('Failed to approve'); }
  };

  const openRejectionModal = (id) => {
    setRejectionModal({ open: true, leaveId: id, reason: '' });
  };

  const submitRejection = async () => {
    const { leaveId, reason } = rejectionModal;
    if (!reason || reason.trim().length < 10) {
      toast.error('Rejection reason must be at least 10 characters');
      return;
    }
    try {
      await adminAPI.rejectLeave(leaveId, reason.trim());
      toast.success('Leave rejected successfully');
      setRejectionModal({ open: false, leaveId: '', reason: '' });
      fetchLeaves();
    } catch {
      toast.error('Failed to reject leave request');
    }
  };

  const STATUS_COLORS = { pending: 'badge-pending', approved: 'badge-stable', rejected: 'badge-critical' };

  return (
    <div>
      <h2 className="headline-sm" style={{ marginBottom: '20px' }}>Leave Requests ({leaves.length})</h2>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner spinner-lg" /></div>
      ) : leaves.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <Calendar size={48} color="var(--outline)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--on-surface-var)' }}>No leave requests found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {leaves.map(leave => {
            const docName = `Dr. ${leave.doctor?.user?.firstName || ''} ${leave.doctor?.user?.lastName || ''}`.trim() || 'Doctor';
            const start = new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const end = new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return (
              <div key={leave._id} className="glass-card-sm">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="avatar avatar-sm avatar-teal">{docName[4] || 'D'}</div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{docName}</p>
                      <p style={{ fontSize: '13px', color: 'var(--on-surface-var)' }}>
                        <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{leave.leaveType || 'full-day'}</span> leave · {start} – {end}
                      </p>
                      {leave.reason && <p style={{ fontSize: '12px', color: 'var(--outline)', marginTop: '4px' }}>{leave.reason}</p>}
                      {leave.rejectionReason && (
                        <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '6px', padding: '6px 10px', background: 'var(--error-container)', borderRadius: '6px', display: 'inline-block' }}>
                          <strong>Rejection Reason:</strong> {leave.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    <span className={`badge ${STATUS_COLORS[leave.status] || 'badge-info'}`} style={{ textTransform: 'capitalize' }}>{leave.status || 'pending'}</span>
                    {leave.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => approve(leave._id)} className="btn btn-secondary btn-sm">
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button onClick={() => openRejectionModal(leave._id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', marginBottom: '12px' }}>Reject Leave Request</h3>
            <p style={{ fontSize: '13px', color: 'var(--on-surface-var)', marginBottom: '16px' }}>
              Please specify the reason for rejecting this leave request. This will be sent to the doctor.
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
                onClick={() => setRejectionModal({ open: false, leaveId: '', reason: '' })} 
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
