import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CreditCard, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', remember: false });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      let result = null;
      for (const role of ['patient', 'doctor', 'admin']) {
        result = await login({ email: form.email, password: form.password }, role);
        if (result.success) break;
      }
      if (result?.success) {
        toast.success('Welcome back!');
        const map = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' };
        navigate(map[result.role] || '/');
      } else {
        toast.error(result?.error || 'Invalid email or password');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
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
      {/* Background orbs */}
      <div style={{ position: 'absolute', top: '10%', left: '15%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,106,106,0.1), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(27,0,74,0.08), transparent)', pointerEvents: 'none' }} />

      {/* Logo Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }} className="animate-fadeInUp">
        <div style={{
          width: 72, height: 72,
          background: 'linear-gradient(135deg, #0c2461, #006a6a)',
          borderRadius: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 12px 32px rgba(0,16,62,0.25)',
        }}>
          <Heart size={32} color="white" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', color: 'var(--primary)', marginBottom: '6px' }}>
          MediCare Plus
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--on-surface-var)', letterSpacing: '0.03em' }}>Spatial Healthcare System</p>
      </div>

      {/* Glass Card */}
      <div className="glass-card animate-fadeInUp" style={{ width: '100%', maxWidth: '460px', padding: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '24px', color: 'var(--on-surface)', marginBottom: '8px' }}>
          Welcome back
        </h2>
        <p style={{ color: 'var(--on-surface-var)', fontSize: '15px', marginBottom: '32px' }}>
          Sign in to access your dashboard.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon-left" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input-glass input-with-left-icon"
                placeholder="dr.smith@medicareplus.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <a href="#" style={{ fontSize: '13px', color: 'var(--secondary)', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</a>
            </div>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon-left" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input-glass input-with-left-icon input-with-right-icon"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '28px' }}>
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
              style={{ width: 16, height: 16, accentColor: 'var(--secondary)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', color: 'var(--on-surface-var)' }}>Remember this device</span>
          </label>

          {/* Submit */}
          <button type="submit" disabled={loading} className="btn btn-primary btn-full btn-lg" style={{ marginBottom: '20px' }}>
            {loading ? (
              <><div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> Signing In…</>
            ) : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="divider" style={{ marginBottom: '20px' }}>or continue with</div>

        {/* Staff ID Login button */}
        <button className="btn btn-ghost btn-full" style={{ marginBottom: '28px' }}>
          <CreditCard size={18} color="var(--primary)" />
          Staff ID Login
        </button>

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--on-surface-var)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--secondary)', fontWeight: 700, textDecoration: 'none' }}>
            Create account
          </Link>
        </p>
      </div>

      <Link to="/" style={{ marginTop: '24px', fontSize: '13px', color: 'var(--on-surface-var)', textDecoration: 'none' }}>
        ← Back to home
      </Link>
    </div>
  );
}
