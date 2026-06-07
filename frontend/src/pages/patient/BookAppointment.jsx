import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, User, Stethoscope } from 'lucide-react';
import { appointmentAPI, doctorAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

export default function BookAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    doctorId: '',
    date: '',
    time: '',
    type: 'in-person',
    reason: '',
    symptoms: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const doctorId = params.get('doctorId');
    if (doctorId) {
      setForm(f => ({ ...f, doctorId }));
    }
    
    // Fetch doctors
    doctorAPI.getAll({})
      .then(r => {
        if (r.success) setDoctors(r.data || []);
      })
      .catch(() => toast.error('Failed to load doctors'))
      .finally(() => setLoading(false));
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.doctorId || !form.date || !form.time || !form.reason) {
      toast.error('Please fill all required fields');
      return;
    }
    
    const selectedDoctor = doctors.find(d => d._id === form.doctorId);
    const departmentId = selectedDoctor?.department?._id || selectedDoctor?.department;

    setSubmitting(true);
    try {
      const res = await appointmentAPI.create({
        doctorId: form.doctorId,
        departmentId,
        date: form.date,
        time: form.time,
        type: form.type,
        reason: form.reason,
        symptoms: form.symptoms.split(',').map(s => s.trim()).filter(Boolean)
      });
      if (res.success) {
        toast.success('Appointment booked successfully!');
        navigate('?section=appointments');
      } else {
        toast.error(res.message || 'Booking failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner spinner-lg" /></div>;

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2 className="headline-sm" style={{ marginBottom: '24px' }}>Book Appointment</h2>
      
      <div className="glass-card-sm">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Select Doctor *</label>
            <select 
              value={form.doctorId} 
              onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))} 
              className="input-glass select-glass"
              required
            >
              <option value="">Choose a doctor...</option>
              {doctors.map(doc => {
                const name = `Dr. ${doc.user?.firstName || ''} ${doc.user?.lastName || ''}`.trim();
                return (
                  <option key={doc._id} value={doc._id}>
                    {name} - {doc.specialization || 'General'}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date *</label>
              <input 
                type="date" 
                value={form.date} 
                min={new Date().toISOString().split('T')[0]} 
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} 
                className="input-glass" 
                required 
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Time Slot *</label>
              <select 
                value={form.time} 
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))} 
                className="input-glass select-glass"
                required
              >
                <option value="">Select time...</option>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Appointment Type *</label>
            <select 
              value={form.type} 
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))} 
              className="input-glass select-glass"
            >
              <option value="in-person">In-Person Visit</option>
              <option value="emergency">Emergency Visit</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Reason for Visit *</label>
            <input 
              type="text" 
              value={form.reason} 
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} 
              className="input-glass" 
              placeholder="e.g. Regular checkup, headache, etc."
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Symptoms (Optional)</label>
            <input 
              type="text" 
              value={form.symptoms} 
              onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))} 
              className="input-glass" 
              placeholder="Comma separated (e.g. fever, cough)"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: '8px' }}>
            {submitting ? (
              <><div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> Booking...</>
            ) : (
              <>Confirm Booking <ArrowRight size={16} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
