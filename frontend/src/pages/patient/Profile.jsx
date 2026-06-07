import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Edit2, Save, X, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { patientAPI, authAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', gender: '',
  });
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        gender: user.gender || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await patientAPI.updateProfile(form);
      if (res.success) {
        await refreshProfile();
        setEditing(false);
        toast.success('Profile updated successfully');
      }
    } catch { toast.error('Failed to update profile'); }
    finally { setLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setPwLoading(true);
    try {
      const res = await authAPI.changePassword({ currentPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      if (res.success) { toast.success('Password changed successfully'); setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' }); }
      else toast.error(res.message || 'Failed to change password');
    } catch (e) { toast.error(e.response?.data?.message || 'Error changing password'); }
    finally { setPwLoading(false); }
  };

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'P';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>
      {/* Avatar Card */}
      <div className="glass-card-sm" style={{ textAlign: 'center', padding: '32px' }}>
        <div className="avatar avatar-xl avatar-gradient" style={{ margin: '0 auto 16px' }}>{initials}</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', marginBottom: '4px' }}>{user?.firstName} {user?.lastName}</h2>
        <p style={{ color: 'var(--on-surface-var)', fontSize: '14px', marginBottom: '12px' }}>{user?.email}</p>
        <span className="badge badge-teal">Patient</span>
      </div>

      {/* Profile Info */}
      <div className="glass-card-sm">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px' }}>Personal Information</h3>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn btn-ghost btn-sm"><Edit2 size={15} /> Edit</button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setEditing(false)} className="btn btn-ghost btn-sm"><X size={15} /> Cancel</button>
              <button onClick={handleSave} disabled={loading} className="btn btn-primary btn-sm">
                {loading ? <div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> : <><Save size={15} /> Save</>}
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { label: 'First Name', key: 'firstName', icon: User },
            { label: 'Last Name', key: 'lastName', icon: User },
            { label: 'Email', key: 'email', icon: Mail, type: 'email', span: 2 },
            { label: 'Phone', key: 'phone', icon: Phone },
            { label: 'Date of Birth', key: 'dateOfBirth', icon: Calendar, type: 'date' },
            { label: 'Gender', key: 'gender', icon: User, select: ['male', 'female', 'other'] },
          ].map(({ label, key, icon: Icon, type = 'text', span, select }) => (
            <div key={key} className="form-group" style={{ gridColumn: span === 2 ? '1 / -1' : 'auto', marginBottom: 0 }}>
              <label className="form-label">{label}</label>
              {editing ? (
                select ? (
                  <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="input-glass select-glass">
                    {select.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                  </select>
                ) : (
                  <div className="input-wrapper">
                    <Icon size={16} className="input-icon-left" />
                    <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="input-glass input-with-left-icon" />
                  </div>
                )
              ) : (
                <p style={{ padding: '12px 0', color: form[key] ? 'var(--on-surface)' : 'var(--outline)', fontSize: '15px', borderBottom: '1px solid var(--surface-high)' }}>
                  {form[key] || '—'}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <div className="glass-card-sm">
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', marginBottom: '20px' }}>Change Password</h3>
        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { label: 'Current Password', key: 'oldPassword' },
            { label: 'New Password', key: 'newPassword' },
            { label: 'Confirm New Password', key: 'confirmPassword' },
          ].map(({ label, key }) => (
            <div className="form-group" key={key} style={{ marginBottom: 0 }}>
              <label className="form-label">{label}</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon-left" />
                <input type="password" value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} className="input-glass input-with-left-icon" placeholder="••••••••" />
              </div>
            </div>
          ))}
          <button type="submit" disabled={pwLoading} className="btn btn-secondary">
            {pwLoading ? <div className="spinner spinner-sm" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
