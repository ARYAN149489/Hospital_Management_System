import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar, Users, FileText, Clock, Activity, LogOut,
  Menu, Heart, CheckCircle, XCircle, AlertCircle, User,
  Bell, ChevronRight, Plus, Stethoscope, BarChart2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI, appointmentAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import DoctorAppointments from './Appointments';
import MyPatients from './MyPatients';
import CreatePrescription from './CreatePrescription';
import Prescriptions from './Prescriptions';
import MySchedule from './MySchedule';
import Leave from './Leave';
import NotificationsTab from '../../components/common/NotificationsTab';
import Profile from './Profile';
import DoctorProfile from './Profile';
import NotificationWidget from '../../components/common/NotificationWidget';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'patients', label: 'My Patients', icon: Users },
  { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
  { id: 'create-prescription', label: 'New Prescription', icon: Plus },
  { id: 'schedule', label: 'My Schedule', icon: Clock },
  { id: 'leave', label: 'Leave', icon: Calendar },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState('dashboard');
  const [stats, setStats] = useState({ totalPatients: 0, todayAppointments: 0, totalPrescriptions: 0, pendingAppointments: 0 });
  const [todayApts, setTodayApts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    setActive(params.get('section') || 'dashboard');
  }, [loc.search]);

  useEffect(() => {
    if (active === 'dashboard') fetchDashboard();
  }, [active]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await doctorAPI.getDashboard();
      if (res.success) {
        const d = res.data || {};
        setStats({ totalPatients: d.totalPatients || 0, todayAppointments: d.todayAppointments?.length || 0, totalPrescriptions: d.totalPrescriptions || 0, pendingAppointments: d.pendingAppointments || 0 });
        setTodayApts(d.todayAppointments || []);
        setRecentActivity(d.recentActivity || []);
      }
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  const handleLogout = async () => { await logout(); navigate('/'); };
  const nav = (section) => { navigate(`?section=${section}`); setSidebarOpen(false); };

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Doctor';
  const initials = `Dr. ${firstName[0] || 'D'}`.slice(-1);

  const renderDashboard = () => (
    <div>
      {/* Welcome Banner (dark style) */}
      <div style={{ background: 'linear-gradient(135deg, #050e2a 0%, #0a1e50 100%)', borderRadius: '20px', padding: '32px', marginBottom: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(0,106,106,0.15)' }} />
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '26px', marginBottom: '6px' }}>
          Welcome, Dr. {firstName}! 👨‍⚕️
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>Here's your practice overview for today</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { label: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'rgba(38,220,221,0.2)' },
            { label: "Today's Apts", value: stats.todayAppointments, icon: Calendar, color: 'rgba(0,106,106,0.25)' },
            { label: 'Prescriptions', value: stats.totalPrescriptions, icon: FileText, color: 'rgba(159,119,255,0.2)' },
            { label: 'Pending', value: stats.pendingAppointments, icon: Clock, color: 'rgba(217,119,6,0.2)' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{ background: color, backdropFilter: 'blur(10px)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Icon size={20} color="rgba(255,255,255,0.7)" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: 800 }}>{value}</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Today's Appointments */}
        <div className="glass-card-sm">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="headline-sm">Today's Schedule</h2>
            <button type="button" onClick={() => nav('appointments')} className="btn-text-link">
              View All <ChevronRight size={16} />
            </button>
          </div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}><div className="spinner" /></div>
          ) : todayApts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Calendar size={40} color="var(--outline)" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--on-surface-var)' }}>No appointments today</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {todayApts.slice(0, 5).map(apt => {
                const patName = `${apt.patient?.user?.firstName || ''} ${apt.patient?.user?.lastName || ''}`.trim() || 'Patient';
                const statusMap = { confirmed: 'badge-stable', scheduled: 'badge-info', completed: 'badge-completed', cancelled: 'badge-critical' };
                return (
                  <div key={apt._id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'var(--surface-low)', borderRadius: '12px' }}>
                    <div className="avatar avatar-sm avatar-teal">{patName[0]}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: '14px' }}>{patName}</p>
                      <p style={{ fontSize: '12px', color: 'var(--on-surface-var)' }}>{apt.appointmentTime || 'TBD'} · {apt.appointmentType || 'in-person'}</p>
                    </div>
                    <span className={`badge ${statusMap[apt.status] || 'badge-info'}`} style={{ textTransform: 'capitalize' }}>{apt.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions + Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card-sm">
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', marginBottom: '14px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'View Patients', action: 'patients', icon: Users },
                { label: 'Manage Schedule', action: 'schedule', icon: Clock },
                { label: 'New Prescription', action: 'create-prescription', icon: Plus },
                { label: 'Apply for Leave', action: 'leave', icon: Calendar },
              ].map(({ label, action, icon: Icon }) => (
                <button type="button" key={action} onClick={() => nav(action)} className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', gap: '10px', padding: '10px 12px' }}>
                  <Icon size={16} color="var(--secondary)" /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card-sm" style={{ background: 'linear-gradient(135deg, rgba(0,16,62,0.04), rgba(0,106,106,0.04))' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', marginBottom: '14px' }}>This Month</h3>
            {[
              { label: 'Completed', value: stats.completedThisMonth || 0, icon: CheckCircle, color: 'var(--secondary)' },
              { label: 'Cancelled', value: stats.cancelledThisMonth || 0, icon: XCircle, color: 'var(--error)' },
              { label: 'No-shows', value: stats.noShowsThisMonth || 0, icon: AlertCircle, color: '#d97706' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--surface-high)' }}>
                <span style={{ fontSize: '14px', color: 'var(--on-surface-var)' }}>{label}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700, color }}>
                  <Icon size={14} /> {value}
                </span>
              </div>
            ))}
          </div>
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
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--outline)', textTransform: 'uppercase', padding: '8px 10px 4px', marginBottom: '4px' }}>Doctor Portal</p>
            {NAV.map(({ id, label, icon: Icon }) => (
              <button type="button" key={id} onClick={() => nav(id)}
                className={`sidebar-nav-btn ${active === id ? 'active' : ''}`}
              >
                <Icon size={18} color={active === id ? 'var(--secondary)' : 'var(--on-surface-var)'} /> {label}
              </button>
            ))}
          </nav>

          <div style={{ padding: '16px 12px' }}>
            <button type="button" onClick={handleLogout}
              className="sidebar-logout-btn"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>

          <div style={{ padding: '16px', borderTop: '1px solid var(--surface-high)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar avatar-sm avatar-teal">D</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '13px' }}>Dr. {user?.firstName} {user?.lastName}</p>
              <p style={{ fontSize: '11px', color: 'var(--outline)' }}>Doctor</p>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay show" aria-hidden="true" onClick={() => setSidebarOpen(false)} />}

      <main className="page-main">
        <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(246,250,254,0.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--surface-high)', padding: '0 28px', height: '64px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button type="button" className="btn-icon" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'none' }} id="sidebar-toggle-doc"><Menu size={20} /></button>
          <h2 style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px' }}>
            {NAV.find(n => n.id === active)?.label || 'Dashboard'}
          </h2>
          <div className="avatar avatar-sm avatar-teal">D</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '13px', lineHeight: 1.2 }}>Dr. {user?.firstName} {user?.lastName}</p>
            <p style={{ fontSize: '11px', color: 'var(--outline)' }}>Doctor</p>
          </div>
        </div>
        <div style={{ padding: '28px', maxWidth: '1200px' }}>
          {active === 'dashboard' && renderDashboard()}
          {active === 'appointments' && <DoctorAppointments />}
          {active === 'patients' && <MyPatients />}
          {active === 'prescriptions' && <Prescriptions />}
          {active === 'create-prescription' && <CreatePrescription />}
          {active === 'schedule' && <MySchedule />}
          {active === 'leave' && <Leave />}
          {active === 'notifications' && <NotificationsTab />}
          {active === 'profile' && <DoctorProfile />}
        </div>
      </main>

      <NotificationWidget />

      <style>{`@media (max-width: 1024px) { #sidebar-toggle-doc { display: flex !important; } }`}</style>
    </div>
  );
}
