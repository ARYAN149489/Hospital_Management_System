import { useState, useEffect } from 'react';
import { User, Mail, Lock, Edit2, Save, X, Phone, Clock, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI, authAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

export default function DoctorProfile() {
  const { user, updateUser, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    specialization: '',
    experience: '',
    consultationFee: '',
    bio: ''
  });
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    doctorAPI.getProfile().then(r => {
      if (r.success) {
        setProfile(r.data);
        setForm({
          firstName: r.data.user?.firstName || user?.firstName || '',
          lastName: r.data.user?.lastName || user?.lastName || '',
          phone: r.data.user?.phone || user?.phone || '',
          specialization: r.data.specialization || '',
          experience: r.data.yearsOfExperience || r.data.experience || '',
          consultationFee: r.data.consultationFee || '',
          bio: r.data.bio || ''
        });
      }
    }).catch(() => {});
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await doctorAPI.updateProfile(form);
      if (res.success) {
        setEditing(false);
        toast.success('Profile updated!');
        setProfile(res.data);
        // Re-fetch profile from backend to ensure context stays in sync
        await refreshProfile();
      } else {
        toast.error(res.message || 'Failed to update');
      }
    } catch {
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePwChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const res = await authAPI.changePassword({ currentPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      if (res.success) {
        toast.success('Password changed!');
        setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(res.message || 'Failed');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error');
    }
  };

  const initials = `${user?.firstName?.[0] || 'D'}${user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>
      <div className="glass-card-sm" style={{ textAlign: 'center', padding: '28px' }}>
        <div className="avatar avatar-xl avatar-teal" style={{ margin: '0 auto 16px' }}>{initials}</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', marginBottom: '4px' }}>Dr. {user?.firstName} {user?.lastName}</h2>
        <p style={{ color: 'var(--on-surface-var)', fontSize: '14px', marginBottom: '8px' }}>{user?.email}</p>
        <span className="badge badge-teal">{profile?.specialization || 'Doctor'}</span>
      </div>

      <div className="glass-card-sm">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px' }}>Professional Details</h3>
          {!editing ? (
            <button type="button" onClick={() => setEditing(true)} className="btn btn-ghost btn-sm"><Edit2 size={14} /> Edit</button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => setEditing(false)} className="btn btn-ghost btn-sm"><X size={14} /> Cancel</button>
              <button type="button" onClick={handleSave} disabled={loading} className="btn btn-primary btn-sm">
                {loading ? <div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> : <><Save size={14} /> Save</>}
              </button>
            </div>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {[
            { label: 'First Name', key: 'firstName', icon: User },
            { label: 'Last Name', key: 'lastName', icon: User },
            { label: 'Phone', key: 'phone', icon: Phone },
            { label: 'Specialization', key: 'specialization', icon: Award },
            { label: 'Experience (years)', key: 'experience', icon: Clock, type: 'number' },
            { label: 'Consultation Fee (₹)', key: 'consultationFee', icon: User, type: 'number' },
          ].map(({ label, key, icon: Icon, type = 'text' }) => (
            <div key={key} className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{label}</label>
              {editing ? (
                <div className="input-wrapper">
                  <Icon size={16} className="input-icon-left" />
                  <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="input-glass input-with-left-icon" />
                </div>
              ) : (
                <p style={{ padding: '12px 0', color: form[key] ? 'var(--on-surface)' : 'var(--outline)', borderBottom: '1px solid var(--surface-high)' }}>{form[key] || '—'}</p>
              )}
            </div>
          ))}
          <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
            <label className="form-label">Bio</label>
            {editing ? (
              <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} className="input-glass" rows={3} style={{ resize: 'vertical' }} placeholder="Brief professional bio…" />
            ) : (
              <p style={{ padding: '12px 0', color: form.bio ? 'var(--on-surface)' : 'var(--outline)', borderBottom: '1px solid var(--surface-high)' }}>{form.bio || '—'}</p>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card-sm">
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', marginBottom: '18px' }}>Change Password</h3>
        <form onSubmit={handlePwChange} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[{ label: 'Current Password', key: 'oldPassword' }, { label: 'New Password', key: 'newPassword' }, { label: 'Confirm New', key: 'confirmPassword' }].map(({ label, key }) => (
            <div key={key} className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{label}</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon-left" />
                <input type="password" value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} className="input-glass input-with-left-icon" placeholder="••••••••" />
              </div>
            </div>
          ))}
          <button type="submit" className="btn btn-secondary">Update Password</button>
        </form>
      </div>
    </div>
  );
}
