import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { doctorAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

export default function CreatePrescription() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ patientId: '', diagnosis: '', notes: '', followUpDate: '', medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    doctorAPI.getPatients().then(r => { 
      if (r.success) {
        // Filter to recently completed (e.g. within last 14 days)
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        const recentPatients = (r.data || []).filter(p => p.lastVisit && new Date(p.lastVisit) >= fourteenDaysAgo);
        setPatients(recentPatients);
      } 
    }).catch(() => {});
  }, []);

  const addMed = () => setForm(f => ({ ...f, medications: [...f.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }] }));
  const removeMed = (i) => setForm(f => ({ ...f, medications: f.medications.filter((_, idx) => idx !== i) }));
  const updateMed = (i, field, val) => setForm(f => ({ ...f, medications: f.medications.map((m, idx) => idx === i ? { ...m, [field]: val } : m) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.diagnosis) { toast.error('Patient and diagnosis are required'); return; }
    setLoading(true);
    try {
      const payload = {
        patientId: form.patientId,
        diagnosis: form.diagnosis,
        doctorNotes: form.notes,
        medications: form.medications.filter(m => m.name).map(m => ({
          name: m.name,
          dosage: m.dosage || 'As prescribed',
          frequency: m.frequency || 'Once daily',
          duration: m.duration ? { value: parseInt(m.duration) || 7, unit: 'days' } : { value: 7, unit: 'days' },
          instructions: m.instructions
        })),
      };

      if (form.followUpDate) {
         const days = Math.max(1, Math.ceil((new Date(form.followUpDate) - new Date()) / (1000 * 60 * 60 * 24)));
         payload.followUp = {
            required: true,
            after: { value: days, unit: 'days' }
         };
      }

      const res = await doctorAPI.createPrescription(payload);
      if (res.success) {
        toast.success('Prescription created!');
        setForm({ patientId: '', diagnosis: '', notes: '', followUpDate: '', medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }] });
      } else toast.error(res.message || 'Failed to create');
    } catch (e) { toast.error(e.response?.data?.message || 'Error creating prescription'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '680px' }}>
      <h2 className="headline-sm" style={{ marginBottom: '24px' }}>Create New Prescription</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-card-sm">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>Patient & Diagnosis</h3>
          <div className="form-group">
            <label className="form-label">Select Patient *</label>
            <select value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} className="input-glass select-glass" required>
              <option value="">Choose a patient…</option>
              {patients.map(p => {
                const name = `${p.user?.firstName || p.firstName || ''} ${p.user?.lastName || p.lastName || ''}`.trim();
                return <option key={p._id} value={p._id}>{name}</option>;
              })}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Diagnosis *</label>
            <input type="text" value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} className="input-glass" placeholder="Primary diagnosis" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Follow-up Date</label>
              <input type="date" value={form.followUpDate} min={new Date().toISOString().split('T')[0]} onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))} className="input-glass" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Notes</label>
              <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-glass" placeholder="Additional notes" />
            </div>
          </div>
        </div>

        <div className="glass-card-sm">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px' }}>Medications</h3>
            <button type="button" onClick={addMed} className="btn btn-secondary btn-sm"><Plus size={14} /> Add Medication</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {form.medications.map((med, i) => (
              <div key={i} style={{ background: 'var(--surface-low)', borderRadius: '14px', padding: '16px', position: 'relative' }}>
                <p style={{ fontWeight: 700, fontSize: '13px', color: 'var(--secondary)', marginBottom: '12px' }}>Medication {i + 1}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { label: 'Medicine Name', field: 'name', placeholder: 'e.g. Paracetamol' },
                    { label: 'Dosage', field: 'dosage', placeholder: 'e.g. 500mg' },
                    { label: 'Frequency', field: 'frequency', placeholder: 'e.g. Twice daily' },
                    { label: 'Duration', field: 'duration', placeholder: 'e.g. 7 days' },
                  ].map(({ label, field, placeholder }) => (
                    <div key={field} className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{label}</label>
                      <input type="text" value={med[field]} onChange={e => updateMed(i, field, e.target.value)} className="input-glass" placeholder={placeholder} />
                    </div>
                  ))}
                </div>
                <div className="form-group" style={{ marginBottom: 0, marginTop: '10px' }}>
                  <label className="form-label">Instructions</label>
                  <input type="text" value={med.instructions} onChange={e => updateMed(i, 'instructions', e.target.value)} className="input-glass" placeholder="e.g. Take with food" />
                </div>
                {form.medications.length > 1 && (
                  <button type="button" onClick={() => removeMed(i)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg">
          {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> Creating…</> : <>Create Prescription <ArrowRight size={18} /></>}
        </button>
      </form>
    </div>
  );
}
