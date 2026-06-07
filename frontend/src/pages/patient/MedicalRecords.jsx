import { useState, useEffect } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { patientAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientAPI.getMedicalRecords()
      .then(r => { if (r.success) setRecords(r.data || []); })
      .catch(() => toast.error('Failed to load records'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner spinner-lg" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="headline-sm">Medical Records</h2>
      </div>
      {records.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <FileText size={48} color="var(--outline)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--on-surface-var)' }}>No medical records found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {records.map(record => (
            <div key={record._id} className="glass-card-sm" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: 46, height: 46, background: 'rgba(0,16,62,0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={22} color="var(--primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: '15px' }}>{record.fileName || record.documentName || 'Medical Record'}</p>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--on-surface-var)', marginTop: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} />{new Date(record.uploadDate || record.createdAt).toLocaleDateString()}</span>
                  {record.fileType && <span className="badge badge-info" style={{ fontSize: '11px' }}>{record.fileType.toUpperCase()}</span>}
                </div>
              </div>
              {record.fileUrl && (
                <a href={record.fileUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                  <Download size={15} /> Download
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
