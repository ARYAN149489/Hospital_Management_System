import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, Calendar, ArrowRight, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, googleLogin } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', dateOfBirth: '', gender: 'other', address: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill in all required fields'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signup(form, 'patient');
      if (result.success) {
        toast.success('Account created successfully!');
        navigate('/patient/dashboard');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const result = await googleLogin(credentialResponse.credential);
      if (result?.success) {
        toast.success('Account created successfully!');
        navigate('/patient/dashboard');
      } else {
        toast.error(result?.error || 'Google signup failed');
      }
    } catch {
      toast.error('Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #e8f0fe 0%, #f0f8f8 50%, #e8e8fe 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '100px 20px 40px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '10%', right: '15%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,106,106,0.1), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', left: '10%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(27,0,74,0.08), transparent)', pointerEvents: 'none' }} />

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }} className="animate-fadeInUp">
        <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #0c2461, #006a6a)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 12px 28px rgba(0,16,62,0.2)' }}>
          <Heart size={28} color="white" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '26px', color: 'var(--primary)' }}>MediCare Plus</h1>
        <p style={{ fontSize: '14px', color: 'var(--on-surface-var)' }}>Create your patient account</p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        {[1, 2].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: s <= step ? 'var(--secondary)' : 'var(--surface-container)',
              color: s <= step ? 'white' : 'var(--outline)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '14px',
              transition: 'background-color 0.3s, color 0.3s',
            }}>{s}</div>
            <span style={{ fontSize: '13px', fontWeight: s === step ? 600 : 400, color: s === step ? 'var(--on-surface)' : 'var(--on-surface-var)' }}>
              {s === 1 ? 'Account' : 'Profile'}
            </span>
            {s < 2 && <div style={{ width: 32, height: 2, background: step > 1 ? 'var(--secondary)' : 'var(--outline-var)', borderRadius: 2, transition: 'background-color 0.3s' }} />}
          </div>
        ))}
      </div>

      <div className="glass-card animate-scaleIn" style={{ width: '100%', maxWidth: '480px', padding: '40px' }}>
        {step === 1 ? (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '22px', marginBottom: '8px' }}>Create Account</h2>
            <p style={{ color: 'var(--on-surface-var)', fontSize: '14px', marginBottom: '28px' }}>Set up your login credentials</p>
            <form onSubmit={handleStep1}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon-left" />
                  <input type="text" name="name" value={form.name} onChange={handleChange} className="input-glass input-with-left-icon" placeholder="John Doe" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon-left" />
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="input-glass input-with-left-icon" placeholder="john@email.com" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon-left" />
                  <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} className="input-glass input-with-left-icon input-with-right-icon" placeholder="Min. 8 characters" required />
                  <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon-left" />
                  <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="input-glass input-with-left-icon" placeholder="Re-enter password" required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: '8px' }}>
                Continue <ArrowRight size={18} />
              </button>
            </form>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setStep(1)} className="btn-text-link" style={{ color: 'var(--on-surface-var)', marginBottom: '20px' }}>
              ← Back
            </button>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '22px', marginBottom: '8px' }}>Your Profile</h2>
            <p style={{ color: 'var(--on-surface-var)', fontSize: '14px', marginBottom: '28px' }}>Optional medical information</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="input-wrapper">
                  <Phone size={18} className="input-icon-left" />
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="input-glass input-with-left-icon" placeholder="+91 9876543210" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <div className="input-wrapper">
                  <Calendar size={18} className="input-icon-left" />
                  <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="input-glass input-with-left-icon" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="input-glass select-glass">
                  <option value="other">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Address (Optional)</label>
                <input type="text" name="address" value={form.address} onChange={handleChange} className="input-glass" placeholder="Your address" />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary btn-full btn-lg" style={{ marginTop: '8px' }}>
                {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> Creating Account…</> : <>Create Account <ArrowRight size={18} /></>}
              </button>
            </form>
          </>
        )}

        {/* Divider */}
        <div className="divider" style={{ margin: '24px 0 20px' }}>or sign up with</div>

        {/* Google Sign-Up */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error('Google sign-in was cancelled or failed')}
            theme="outline"
            size="large"
            width="380"
            text="signup_with"
            shape="rectangular"
          />
        </div>

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--on-surface-var)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--secondary)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
