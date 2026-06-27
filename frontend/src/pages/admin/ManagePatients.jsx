import { useState, useEffect } from 'react';
import { Users, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

export default function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminAPI.getAllPatients({})
      .then(r => { if (r.success) setPatients(r.data || []); })
      .catch(() => toast.error('Failed to load patients'))
      .finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (userId, patientId, currentActive) => {
    if (!userId) {
      toast.error('User reference not found');
      return;
    }
    try {
      const nextActive = currentActive === false ? true : false;
      await adminAPI.toggleUserStatus(userId, nextActive);
      setPatients(ps => ps.map(p => p._id === patientId ? { ...p, user: { ...p.user, isActive: nextActive } } : p));
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
  };

  const filtered = patients.filter(p => {
    const name = `${p.user?.firstName || p.firstName || ''} ${p.user?.lastName || p.lastName || ''}`.toLowerCase();
    return !search || name.includes(search.toLowerCase()) || (p.user?.email || p.email || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <h2 className="headline-sm" style={{ flex: 1 }}>Patients ({patients.length})</h2>
        <div className="input-wrapper" style={{ minWidth: '220px' }}>
          <Search size={16} className="input-icon-left" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-glass input-with-left-icon" placeholder="Search patients…" style={{ fontSize: '14px' }} />
        </div>
      </div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner spinner-lg" /></div>
      ) : (
        <div style={{ overflow: 'auto' }}>
          <table className="glass-table" style={{ minWidth: '600px' }}>
            <thead><tr><th>Patient</th><th>Phone</th><th>Gender</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(pat => {
                const u = pat.user || pat;
                const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Patient';
                const isUserActive = pat.user?.isActive !== false;
                return (
                  <tr key={pat._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar avatar-sm avatar-primary">{name[0]?.toUpperCase()}</div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '14px' }}>{name}</p>
                          <p style={{ fontSize: '12px', color: 'var(--on-surface-var)' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '14px', color: 'var(--on-surface-var)' }}>{u.phone || '—'}</td>
                    <td><span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{u.gender || '—'}</span></td>
                    <td><span className={`badge ${isUserActive ? 'badge-stable' : 'badge-critical'}`}>{isUserActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <button type="button" onClick={() => toggleStatus(pat.user?._id, pat._id, pat.user?.isActive)} className="btn btn-ghost btn-sm">
                        {isUserActive ? <ToggleRight size={16} color="var(--secondary)" /> : <ToggleLeft size={16} />}
                        {isUserActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
