import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity, Bell, LogOut, User, ChevronDown, Menu, X,
  Stethoscope, Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      notificationAPI.getUnreadCount()
        .then(r => { if (r.success) setUnreadCount(r.data?.count || 0); })
        .catch(() => {});
    }
  }, [isAuthenticated, loc.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    const map = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' };
    return map[user.role] || '/';
  };

  const isHome = loc.pathname === '/';
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'User';
  const initials = (user?.firstName?.[0] || user?.name?.[0] || 'U').toUpperCase();

  return (
    <nav className={`nav-glass fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}>
      <div className="container" style={{ padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
          
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: 38, height: 38,
              background: 'linear-gradient(135deg, #0c2461, #006a6a)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Heart size={20} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '20px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              MediCare Plus
            </span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="desktop-nav">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="nav-link"
                  style={{ color: 'var(--on-surface-var)', fontWeight: 500, fontSize: '15px', textDecoration: 'none', padding: '8px 14px', borderRadius: '8px', transition: 'background-color 0.2s, color 0.2s' }}
                  onMouseEnter={e => { e.target.style.background = 'rgba(0,16,62,0.06)'; e.target.style.color = 'var(--primary)'; }}
                  onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--on-surface-var)'; }}
                >Dashboard</Link>

                {user?.role === 'patient' && (
                  <>
                    <Link to="/patient/dashboard?section=doctors" style={{ color: 'var(--on-surface-var)', fontWeight: 500, fontSize: '15px', textDecoration: 'none', padding: '8px 14px', borderRadius: '8px', transition: 'background-color 0.2s, color 0.2s' }}
                      onMouseEnter={e => { e.target.style.background = 'rgba(0,16,62,0.06)'; e.target.style.color = 'var(--primary)'; }}
                      onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--on-surface-var)'; }}
                    >Find Doctors</Link>
                    <Link to="/patient/dashboard?section=appointments" style={{ color: 'var(--on-surface-var)', fontWeight: 500, fontSize: '15px', textDecoration: 'none', padding: '8px 14px', borderRadius: '8px' }}
                      onMouseEnter={e => { e.target.style.background = 'rgba(0,16,62,0.06)'; e.target.style.color = 'var(--primary)'; }}
                      onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--on-surface-var)'; }}
                    >Appointments</Link>
                  </>
                )}

                {/* Notification Bell */}
                <button type="button" className="btn-icon" style={{ position: 'relative' }}
                  onClick={() => navigate(getDashboardLink())}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>

                {/* User Menu */}
                <div ref={userMenuRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="nav-user-btn"
                  >
                    <div className="avatar avatar-sm avatar-gradient">{initials}</div>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--on-surface)' }}>{firstName}</span>
                    <ChevronDown size={14} color="var(--outline)" />
                  </button>

                  {userMenuOpen && (
                    <div className="animate-scaleIn nav-dropdown">
                      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--surface-high)', marginBottom: '4px' }}>
                        <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--on-surface)' }}>{user?.firstName} {user?.lastName}</p>
                        <p style={{ fontSize: '12px', color: 'var(--on-surface-var)', marginTop: '2px' }}>{user?.email}</p>
                        <span className={`badge badge-teal`} style={{ marginTop: '6px', fontSize: '11px' }}>{user?.role}</span>
                      </div>
                      {user?.role !== 'admin' && (
                        <Link to={`/${user?.role}/dashboard?section=profile`}
                          className="nav-dropdown-item"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User size={16} color="var(--on-surface-var)" /> Profile
                        </Link>
                      )}
                      <button type="button" onClick={handleLogout}
                        className="nav-dropdown-logout-btn"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {isHome && (
                  <>
                    <a href="#features" style={{ color: 'var(--on-surface-var)', fontWeight: 500, fontSize: '15px', textDecoration: 'none', padding: '8px 14px' }}>Features</a>
                    <a href="#how-it-works" style={{ color: 'var(--on-surface-var)', fontWeight: 500, fontSize: '15px', textDecoration: 'none', padding: '8px 14px' }}>How It Works</a>
                  </>
                )}
                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="btn-icon mobile-only"
            style={{ display: 'none' }}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="animate-fadeInUp" style={{
          background: 'rgba(255,255,255,0.97)', borderTop: '1px solid var(--outline-var)',
          padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px'
        }}>
          {isAuthenticated ? (
            <>
              <Link to={getDashboardLink()} style={{ padding: '10px', color: 'var(--on-surface)', textDecoration: 'none', fontWeight: 500 }} onClick={() => setMobileOpen(false)}>Dashboard</Link>
              {user?.role !== 'admin' && (
                <Link to={`/${user?.role}/dashboard?section=profile`} style={{ padding: '10px', color: 'var(--on-surface)', textDecoration: 'none', fontWeight: 500 }} onClick={() => setMobileOpen(false)}>Profile</Link>
              )}
              <button type="button" onClick={handleLogout} style={{ background: 'none', border: 'none', textAlign: 'left', padding: '10px', color: 'var(--error)', fontWeight: 500, cursor: 'pointer' }}>Logout</button>
            </>
          ) : (
            <>
              {isHome && <a href="#features" style={{ padding: '10px', color: 'var(--on-surface)', textDecoration: 'none', fontWeight: 500 }} onClick={() => setMobileOpen(false)}>Features</a>}
              <Link to="/login" style={{ padding: '10px', color: 'var(--on-surface)', textDecoration: 'none', fontWeight: 500 }} onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm btn-full" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-only { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
