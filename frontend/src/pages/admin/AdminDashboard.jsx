import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Activity, Users, Calendar, Building2, CalendarClock, FlaskConical,
  LogOut, Menu, Heart, BarChart2, Settings, UserCheck, Bell, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ManageDoctors from './ManageDoctors';
import ManagePatients from './ManagePatients';
import ManageAppointments from './ManageAppointments';
import ManageLeave from './ManageLeave';
import NotificationsTab from '../../components/common/NotificationsTab';
import ManageDepartments from './ManageDepartments';
import ManageLabTests from './ManageLabTests';
import NotificationWidget from '../../components/common/NotificationWidget';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity },
  { id: 'doctors', label: 'Doctors', icon: UserCheck },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'leave', label: 'Leave Requests', icon: CalendarClock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'reports', label: 'Reports & Analytics', icon: FileText },
  { id: 'lab-tests', label: 'Lab Tests', icon: FlaskConical },
];

const CHART_DATA = [
  { name: 'Mon', patients: 42 }, { name: 'Tue', patients: 58 }, { name: 'Wed', patients: 65 },
  { name: 'Thu', patients: 49 }, { name: 'Fri', patients: 73 }, { name: 'Sat', patients: 38 }, { name: 'Sun', patients: 21 }
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState('dashboard');
  const [stats, setStats] = useState({ totalPatients: 0, totalDoctors: 0, totalAppointments: 0, pendingLeaves: 0, todayAppointments: 0, activeDepartments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setActive(params.get('section') || 'dashboard');
  }, [location.search]);

  useEffect(() => { if (active === 'dashboard') fetchStats(); }, [active]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDashboardStats();
      if (res.success) {
        const d = res.data || {};
        const s = d.statistics || d;
        setStats({
          totalPatients: s.users?.patients || s.totalPatients || 0,
          totalDoctors: s.users?.doctors || s.totalDoctors || 0,
          totalAppointments: s.appointments?.total || s.totalAppointments || 0,
          pendingLeaves: s.leaves?.pending || s.pendingLeaves || 0,
          todayAppointments: s.appointments?.today || s.todayAppointments || 0,
          activeDepartments: s.departments?.total || s.activeDepartments || 0,
        });
      }
    } catch { toast.error('Failed to load stats'); }
    finally { setLoading(false); }
  };

  const handleLogout = async () => { await logout(); navigate('/'); };
  const nav = (section) => { navigate(`?section=${section}`); setSidebarOpen(false); };

  const STAT_CARDS = [
    { label: 'Total Patients', value: stats.totalPatients, icon: Users, color: '#0c2461', bg: 'linear-gradient(135deg, #0c2461, #1a3c78)', action: 'patients' },
    { label: 'Total Doctors', value: stats.totalDoctors, icon: UserCheck, color: '#006a6a', bg: 'linear-gradient(135deg, #006a6a, #009999)', action: 'doctors' },
    { label: 'Appointments', value: stats.totalAppointments, icon: Calendar, color: '#5420b5', bg: 'linear-gradient(135deg, #5420b5, #7c3aed)', action: 'appointments' },
    { label: 'Pending Leaves', value: stats.pendingLeaves, icon: CalendarClock, color: '#d97706', bg: 'linear-gradient(135deg, #b45309, #d97706)', action: 'leave' },
    { label: "Today's Appointments", value: stats.todayAppointments, icon: Calendar, color: '#0284c7', bg: 'linear-gradient(135deg, #0284c7, #0ea5e9)', action: 'appointments' },
    { label: 'Departments', value: stats.activeDepartments, icon: Building2, color: '#7c3aed', bg: 'linear-gradient(135deg, #6d28d9, #7c3aed)', action: 'departments' },
  ];

  const renderDashboard = () => (
    <div>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {STAT_CARDS.map(({ label, value, icon: Icon, bg, action }) => (
          <button key={label} onClick={() => nav(action)}
            style={{ background: bg, borderRadius: '18px', padding: '22px', color: 'white', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', fontWeight: 500 }}>{label}</p>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '32px' }}>{loading ? '…' : value}</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>Click to manage →</p>
              </div>
              <Icon size={32} color="rgba(255,255,255,0.4)" />
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Chart */}
        <div className="glass-card-sm">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="headline-sm">Patient Admissions</h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['Week', 'Month'].map(p => (
                <button key={p} style={{ padding: '5px 14px', borderRadius: '8px', border: '1px solid var(--outline-var)', background: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'var(--on-surface-var)' }}>{p}</button>
              ))}
            </div>
          </div>
          <div className="chart-container" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA}>
                <defs>
                  <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#006a6a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#006a6a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-high)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--on-surface-var)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--on-surface-var)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid var(--outline-var)', borderRadius: '10px', fontSize: '13px' }} />
                <Area type="monotone" dataKey="patients" stroke="var(--secondary)" strokeWidth={2} fill="url(#tealGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions + Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card-sm">
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', marginBottom: '14px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {NAV.filter(n => n.id !== 'dashboard').map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => nav(id)} className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', gap: '10px', padding: '10px 12px' }}>
                  <Icon size={16} color="var(--secondary)" /> {label}
                </button>
              ))}
            </div>
          </div>

          {stats.pendingLeaves > 0 && (
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '14px', padding: '16px' }}>
              <p style={{ fontWeight: 700, fontSize: '14px', color: '#d97706', marginBottom: '6px' }}>⚠️ Pending Action</p>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-var)', marginBottom: '10px' }}>{stats.pendingLeaves} leave request{stats.pendingLeaves !== 1 ? 's' : ''} awaiting approval</p>
              <button onClick={() => nav('leave')} className="btn btn-sm" style={{ background: '#d97706', color: 'white', border: 'none' }}>Review Now</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-mesh" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <aside className={`page-sidebar sidebar-light ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--surface-high)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #0c2461, #006a6a)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={18} color="white" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MediCare Plus</span>
            </div>
          </div>

          <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--outline)', textTransform: 'uppercase', padding: '8px 10px 4px', marginBottom: '4px' }}>Admin Portal</p>
            {NAV.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => nav(id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  marginBottom: '2px', transition: 'all 0.2s', textAlign: 'left',
                  background: active === id ? 'linear-gradient(135deg, rgba(0,16,62,0.08), rgba(0,106,106,0.06))' : 'transparent',
                  color: active === id ? 'var(--primary)' : 'var(--on-surface-var)',
                  fontWeight: active === id ? 700 : 500, fontSize: '14px',
                  boxShadow: active === id ? 'inset 3px 0 0 var(--secondary)' : 'none',
                  fontFamily: 'var(--font-body)',
                }}>
                <Icon size={18} color={active === id ? 'var(--secondary)' : 'var(--on-surface-var)'} /> {label}
                {id === 'leave' && stats.pendingLeaves > 0 && (
                  <span style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: '#d97706', color: 'white', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stats.pendingLeaves}</span>
                )}
              </button>
            ))}
          </nav>

          <div style={{ padding: '16px 12px' }}>
            <button onClick={handleLogout}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--error)', fontWeight: 600, fontSize: '14px', fontFamily: 'var(--font-body)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--error-container)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>

          <div style={{ padding: '16px', borderTop: '1px solid var(--surface-high)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar avatar-sm avatar-primary">A</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '13px' }}>{user?.firstName} {user?.lastName}</p>
              <p style={{ fontSize: '11px', color: 'var(--outline)' }}>Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay show" onClick={() => setSidebarOpen(false)} />}

      <main className="page-main">
        <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(246,250,254,0.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--surface-high)', padding: '0 28px', height: '64px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn-icon" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'none' }} id="sidebar-toggle-admin"><Menu size={20} /></button>
          <h2 style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px' }}>
            {NAV.find(n => n.id === active)?.label || 'Dashboard'}
          </h2>
          <div className="avatar avatar-sm avatar-primary">A</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '13px', lineHeight: 1.2 }}>{user?.firstName} {user?.lastName}</p>
            <p style={{ fontSize: '11px', color: 'var(--outline)' }}>Administrator</p>
          </div>
        </div>

        <div style={{ padding: '28px', maxWidth: '1200px' }}>
          {active === 'dashboard' && renderDashboard()}
          {active === 'doctors' && <ManageDoctors />}
          {active === 'patients' && <ManagePatients />}
          {active === 'appointments' && <ManageAppointments />}
          {active === 'leave' && <ManageLeave />}
          {active === 'notifications' && <NotificationsTab />}
          {active === 'reports' && <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>Reports module coming soon</div>}
          {active === 'departments' && <ManageDepartments />}
          {active === 'lab-tests' && <ManageLabTests />}
        </div>
      </main>

      <NotificationWidget />

      <style>{`@media (max-width: 1024px) { #sidebar-toggle-admin { display: flex !important; } }`}</style>
    </div>
  );
}
