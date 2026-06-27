import { useState, useEffect } from 'react';
import { FlaskConical, CheckCircle, Plus, Trash2, X, FileSpreadsheet } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'badge-pending',
  booked: 'badge-pending', // map backend 'booked' status to pending styling
  processing: 'badge-info',
  completed: 'badge-stable',
  report_ready: 'badge-teal',
  cancelled: 'badge-critical'
};

export default function ManageLabTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  // Modal Report entry state
  const [activeTest, setActiveTest] = useState(null);
  const [parameters, setParameters] = useState([{ parameter: '', value: '', unit: '', normalRange: '', status: 'normal', notes: '' }]);
  const [resultSummary, setResultSummary] = useState({ overallStatus: 'normal', interpretation: '', recommendations: '' });
  const [testedBy, setTestedBy] = useState({ name: 'Dr. Jane Smith', qualification: 'B.Sc MLT, Lab Technician' });
  const [verifiedBy, setVerifiedBy] = useState({ name: 'Dr. Rajesh Kumar', qualification: 'MD, Chief Pathologist' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminAPI.getAllLabTests({})
      .then(r => { if (r.success) setTests(r.data || []); })
      .catch(() => toast.error('Failed to load lab tests'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await adminAPI.updateLabTestStatus(id, { status });
      setTests(ts => ts.map(t => t._id === id ? { ...t, status } : t));
      toast.success('Status updated');
    } catch { toast.error('Failed to update'); }
    finally { setUpdatingId(null); }
  };

  const openReportModal = (test) => {
    setActiveTest(test);
    
    // If the test already has results, load them into the form
    if (test.results && test.results.length > 0) {
      setParameters(test.results.map(r => ({
        parameter: r.parameter || '',
        value: r.value || '',
        unit: r.unit || '',
        normalRange: r.normalRange || '',
        status: r.status || 'normal',
        notes: r.notes || ''
      })));
    } else {
      // Default placeholder row
      setParameters([{ parameter: '', value: '', unit: '', normalRange: '', status: 'normal', notes: '' }]);
    }

    if (test.resultSummary) {
      setResultSummary({
        overallStatus: test.resultSummary.overallStatus || 'normal',
        interpretation: test.resultSummary.interpretation || '',
        recommendations: test.resultSummary.recommendations || ''
      });
    } else {
      setResultSummary({ overallStatus: 'normal', interpretation: '', recommendations: '' });
    }

    if (test.testedBy) {
      setTestedBy({
        name: test.testedBy.name || 'Dr. Jane Smith',
        qualification: test.testedBy.qualification || 'B.Sc MLT, Lab Technician'
      });
    } else {
      setTestedBy({ name: 'Dr. Jane Smith', qualification: 'B.Sc MLT, Lab Technician' });
    }

    if (test.verifiedBy) {
      setVerifiedBy({
        name: test.verifiedBy.name || 'Dr. Rajesh Kumar',
        qualification: test.verifiedBy.qualification || 'MD, Chief Pathologist'
      });
    } else {
      setVerifiedBy({ name: 'Dr. Rajesh Kumar', qualification: 'MD, Chief Pathologist' });
    }
  };

  const addParameterRow = () => {
    setParameters(p => [...p, { parameter: '', value: '', unit: '', normalRange: '', status: 'normal', notes: '' }]);
  };

  const removeParameterRow = (idx) => {
    if (parameters.length > 1) {
      setParameters(p => p.filter((_, i) => i !== idx));
    }
  };

  const updateParameter = (idx, key, val) => {
    setParameters(p => p.map((item, i) => i === idx ? { ...item, [key]: val } : item));
  };

  const handleSaveReport = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      testResults: parameters,
      resultSummary,
      testedBy: { ...testedBy, signature: testedBy.name },
      verifiedBy: { ...verifiedBy, signature: verifiedBy.name }
    };

    try {
      const response = await adminAPI.updateLabTestResult(activeTest._id, payload);
      if (response.success) {
        setTests(ts => ts.map(t => t._id === activeTest._id ? response.data : t));
        toast.success('Lab Test Report updated and status set to Ready');
        setActiveTest(null);
      } else {
        toast.error(response.error || 'Failed to save results');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save results');
    } finally {
      setSaving(false);
    }
  };

  const filtered = filter === 'all' 
    ? tests 
    : tests.filter(t => {
        if (filter === 'pending') return t.status === 'pending' || t.status === 'booked';
        return t.status === filter;
      });

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <h2 className="headline-sm" style={{ flex: 1 }}>Lab Tests</h2>
        {['all', 'pending', 'processing', 'completed', 'report_ready'].map(f => (
          <button type="button" key={f} onClick={() => setFilter(f)}
            className="filter-pill"
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              borderColor: filter === f ? 'var(--secondary)' : 'var(--outline-var)',
              background: filter === f ? 'rgba(0,106,106,0.1)' : 'transparent',
              color: filter === f ? 'var(--secondary)' : 'var(--on-surface-var)'
            }}>
            {f === 'all' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner spinner-lg" /></div>
      ) : (
        <div style={{ overflow: 'auto' }}>
          <table className="glass-table" style={{ minWidth: '700px' }}>
            <thead><tr><th>Test</th><th>Patient</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(test => {
                const patName = `${test.patient?.user?.firstName || ''} ${test.patient?.user?.lastName || ''}`.trim() || 'Patient';
                const date = test.scheduledDate ? new Date(test.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
                return (
                  <tr key={test._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FlaskConical size={16} color="var(--secondary)" />
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{test.testName || test.testType || 'Lab Test'}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '14px' }}>{patName}</td>
                    <td style={{ fontSize: '13px', color: 'var(--on-surface-var)' }}>{date}</td>
                    <td><span className={`badge ${STATUS_COLORS[test.status] || 'badge-info'}`} style={{ textTransform: 'capitalize', fontSize: '11px' }}>{(test.status || 'pending').replace('_', ' ')}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {(test.status === 'pending' || test.status === 'booked') && (
                          <button type="button" onClick={() => updateStatus(test._id, 'processing')} disabled={updatingId === test._id} className="btn btn-ghost btn-sm">
                            → Processing
                          </button>
                        )}
                        {test.status === 'processing' && (
                          <button type="button" onClick={() => updateStatus(test._id, 'completed')} disabled={updatingId === test._id} className="btn btn-ghost btn-sm">
                            <CheckCircle size={13} /> Complete
                          </button>
                        )}
                        {(test.status === 'processing' || test.status === 'completed' || test.status === 'report_ready') && (
                          <button type="button" onClick={() => openReportModal(test)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {test.status === 'report_ready' ? 'Edit Report' : 'Enter Results'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <FlaskConical size={40} color="var(--outline)" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--on-surface-var)' }}>No lab tests found</p>
            </div>
          )}
        </div>
      )}

      {/* Enter Results Modal Overlay */}
      {activeTest && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div className="glass-card animate-scaleIn" style={{
            width: '100%', maxWidth: '850px', maxHeight: '90vh',
            overflowY: 'auto', padding: '32px', background: 'var(--surface)',
            border: '1px solid var(--outline-var)', boxShadow: '0 24px 60px rgba(0,16,62,0.15)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--outline-var)', paddingBottom: '16px' }}>
              <div>
                <h3 className="headline-sm" style={{ margin: 0, color: 'var(--primary)' }}>Enter Lab Test Report</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--outline)' }}>
                  Test: <strong>{activeTest.testName}</strong> | Patient: <strong>{activeTest.patient?.user ? `${activeTest.patient.user.firstName} ${activeTest.patient.user.lastName}` : 'Patient'}</strong>
                </p>
              </div>
              <button type="button" onClick={() => setActiveTest(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)', padding: 4 }}>
                <X size={24} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveReport}>
              {/* Dynamic Parameter Rows */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileSpreadsheet size={18} color="var(--secondary)" /> Test Parameters & Values
                  </h4>
                  <button type="button" onClick={addParameterRow} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Plus size={14} /> Add Parameter
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.2fr 1.2fr 1.5fr 1.5fr auto', gap: '8px', fontWeight: 600, fontSize: '12px', color: 'var(--outline)', paddingBottom: '4px', borderBottom: '1px solid var(--surface-high)' }}>
                    <span>Parameter Name</span>
                    <span>Result Value</span>
                    <span>Unit</span>
                    <span>Reference Range</span>
                    <span>Status / Flag</span>
                    <span></span>
                  </div>

                  {parameters.map((param, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.2fr 1.2fr 1.5fr 1.5fr auto', gap: '8px', alignItems: 'center' }}>
                      <input type="text" placeholder="e.g. Hemoglobin" value={param.parameter} onChange={(e) => updateParameter(idx, 'parameter', e.target.value)} className="input-glass input-sm" style={{ width: '100%' }} required />
                      <input type="text" placeholder="Value" value={param.value} onChange={(e) => updateParameter(idx, 'value', e.target.value)} className="input-glass input-sm" style={{ width: '100%' }} required />
                      <input type="text" placeholder="e.g. g/dL" value={param.unit} onChange={(e) => updateParameter(idx, 'unit', e.target.value)} className="input-glass input-sm" style={{ width: '100%' }} />
                      <input type="text" placeholder="e.g. 13.5 - 17.5" value={param.normalRange} onChange={(e) => updateParameter(idx, 'normalRange', e.target.value)} className="input-glass input-sm" style={{ width: '100%' }} />
                      <select value={param.status} onChange={(e) => updateParameter(idx, 'status', e.target.value)} className="input-glass select-glass input-sm" style={{ width: '100%', padding: '6px 8px' }}>
                        <option value="normal">Normal</option>
                        <option value="low">Low</option>
                        <option value="high">High</option>
                        <option value="abnormal">Abnormal</option>
                        <option value="critical">Critical</option>
                      </select>
                      <button type="button" onClick={() => removeParameterRow(idx)} disabled={parameters.length <= 1} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: '6px', opacity: parameters.length <= 1 ? 0.3 : 1 }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Summary & Interpretation */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Overall Status</label>
                  <select value={resultSummary.overallStatus} onChange={(e) => setResultSummary(s => ({ ...s, overallStatus: e.target.value }))} className="input-glass select-glass" style={{ width: '100%' }}>
                    <option value="normal">Normal</option>
                    <option value="abnormal">Abnormal</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Interpretation / Findings</label>
                  <textarea placeholder="Clinical interpretation of findings..." value={resultSummary.interpretation} onChange={(e) => setResultSummary(s => ({ ...s, interpretation: e.target.value }))} className="input-glass" style={{ width: '100%', height: '60px', padding: '8px 12px', resize: 'vertical' }} />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Recommendations</label>
                  <textarea placeholder="Follow-up advice or consultation recommendations..." value={resultSummary.recommendations} onChange={(e) => setResultSummary(s => ({ ...s, recommendations: e.target.value }))} className="input-glass" style={{ width: '100%', height: '60px', padding: '8px 12px', resize: 'vertical' }} />
                </div>
              </div>

              {/* Pathology Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '16px', background: 'var(--surface-low)', borderRadius: '12px', marginBottom: '28px' }}>
                <div>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 700, color: 'var(--secondary)' }}>Tested By (Technician)</h5>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" placeholder="Name" value={testedBy.name} onChange={(e) => setTestedBy(t => ({ ...t, name: e.target.value }))} className="input-glass input-sm" style={{ flex: 1.5 }} />
                    <input type="text" placeholder="Qualification" value={testedBy.qualification} onChange={(e) => setTestedBy(t => ({ ...t, qualification: e.target.value }))} className="input-glass input-sm" style={{ flex: 1 }} />
                  </div>
                </div>
                <div>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 700, color: 'var(--secondary)' }}>Verified By (Pathologist)</h5>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" placeholder="Name" value={verifiedBy.name} onChange={(e) => setVerifiedBy(v => ({ ...v, name: e.target.value }))} className="input-glass input-sm" style={{ flex: 1.5 }} />
                    <input type="text" placeholder="Qualification" value={verifiedBy.qualification} onChange={(e) => setVerifiedBy(v => ({ ...v, qualification: e.target.value }))} className="input-glass input-sm" style={{ flex: 1 }} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--outline-var)', paddingTop: '20px' }}>
                <button type="button" onClick={() => setActiveTest(null)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {saving ? <div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> : 'Submit & Save Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
