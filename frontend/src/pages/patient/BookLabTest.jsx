import { useState, useEffect } from 'react';
import { TestTube, Calendar, Clock, ArrowRight } from 'lucide-react';
import { doctorAPI, patientAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const TESTS = ['Complete Blood Count (CBC)', 'Blood Glucose', 'Lipid Profile', 'Thyroid Panel', 'Liver Function Test', 'Kidney Function Test', 'Urine Analysis', 'Chest X-Ray', 'ECG'];
const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

export default function BookLabTest() {
  const [form, setForm] = useState({ testType: '', testDate: '', timeSlot: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.testType || !form.testDate || !form.timeSlot) { toast.error('Please fill all required fields'); return; }
    
    // Convert 12-hour AM/PM format to HH:MM (24-hour)
    const match = form.timeSlot.match(/^(\d{2}):(\d{2})\s(AM|PM)$/);
    let formattedTime = "09:00";
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2];
      const ampm = match[3];
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
      formattedTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    const payload = {
      testName: form.testType,
      testCategory: 'Other',
      scheduledDate: form.testDate,
      scheduledTime: formattedTime,
      amount: 500,
      specialInstructions: form.notes
    };

    setLoading(true);
    try {
      const res = await patientAPI.bookLabTest(payload);
      if (res.success) { toast.success('Lab test booked successfully!'); setForm({ testType: '', testDate: '', timeSlot: '', notes: '' }); }
      else toast.error(res.message || 'Booking failed');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to book lab test'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '560px' }}>
      <h2 className="headline-sm" style={{ marginBottom: '24px' }}>Book a Lab Test</h2>
      <div className="glass-card-sm">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Test Type *</label>
            <select value={form.testType} onChange={e => setForm(f => ({ ...f, testType: e.target.value }))} className="input-glass select-glass" required>
              <option value="">Select a test…</option>
              {TESTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date *</label>
              <div className="input-wrapper">
                <Calendar size={16} className="input-icon-left" />
                <input type="date" value={form.testDate} min={new Date().toISOString().split('T')[0]} onChange={e => setForm(f => ({ ...f, testDate: e.target.value }))} className="input-glass input-with-left-icon" required />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Time Slot *</label>
              <select value={form.timeSlot} onChange={e => setForm(f => ({ ...f, timeSlot: e.target.value }))} className="input-glass select-glass" required>
                <option value="">Select time…</option>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Additional Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-glass" placeholder="Any special instructions or symptoms…" rows={3} style={{ resize: 'vertical' }} />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-lg">
            {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> Booking…</> : <>Confirm Booking <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
