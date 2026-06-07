import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Activity, Calendar, Stethoscope, Pill, TestTube, MessageSquare,
  User, LogOut, Menu, X, Heart, ChevronRight, Bell, Search,
  TrendingUp, Clock, MapPin, Download, Plus, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { patientAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import FindDoctors from './FindDoctors';
import Appointments from './Appointments';
import Prescriptions from './Prescriptions';
import LabTests from './LabTests';
import Chatbot from './Chatbot';
import Profile from './Profile';
import BookLabTest from './BookLabTest';
import MedicalRecords from './MedicalRecords';
import BookAppointment from './BookAppointment';
import NotificationsTab from '../../components/common/NotificationsTab';
import NotificationWidget from '../../components/common/NotificationWidget';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'doctors', label: 'Find Doctors', icon: Stethoscope },
  { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
  { id: 'lab-tests', label: 'Lab Tests', icon: TestTube },
  { id: 'records', label: 'Medical Records', icon: Download },
  { id: 'chatbot', label: 'AI Assistant', icon: MessageSquare },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState('dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sec = params.get('section');
    setActive(sec || 'dashboard');
  }, [location.search]);

  useEffect(() => {
    if (active === 'dashboard') fetchDashboard();
  }, [active]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await patientAPI.getDashboard();
      if (res.success) setData(res.data);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  const handleLogout = async () => { await logout(); navigate('/'); };
  const navigate_ = (section) => { navigate(`?section=${section}`); setSidebarOpen(false); };

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Patient';
  const initials = firstName[0]?.toUpperCase() || 'P';
  const stats = data?.statistics || {};
  const upcoming = data?.upcomingAppointments || [];
  const prescriptions = data?.recentPrescriptions || [];

  const renderDashboard = () => (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '24px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', right: '40px', bottom: '-30px', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '26px', marginBottom: '8px' }}>
          Welcome back, {firstName}! 👋
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '24px', fontSize: '15px' }}>
          Here is a quick overview of your health status and upcoming activities.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { label: 'Upcoming Appts', value: stats.upcomingAppointmentsCount || 0, icon: Calendar },
            { label: 'Active Prescriptions', value: stats.prescriptionsCount || 0, icon: Pill },
            { label: 'Pending Lab Tests', value: stats.pendingLabTestsCount || 0, icon: TestTube },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color="white" />
              </div>
              <div>
                <p style={{ fontSize: '24px', fontFamily: 'var(--font-display)', fontWeight: 800 }}>{value}</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Metrics */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="headline-sm">Health Metrics</h2>
          <span className="badge badge-stable">All Normal</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { label: 'Heart Rate', value: '72', unit: 'bpm', icon: Heart, status: 'Stable', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
            { label: 'Blood Pressure', value: '118/76', unit: 'mmHg', icon: Activity, status: 'Optimal', color: 'var(--secondary)', bg: 'rgba(0,106,106,0.08)' },
            { label: 'BMI', value: '24.5', unit: 'kg/m²', icon: TrendingUp, status: 'Normal', color: '#5420b5', bg: 'rgba(84,32,181,0.08)' },
            { label: 'Temperature', value: '98.6', unit: '°F', icon: Activity, status: 'Normal', color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
          ].map(({ label, value, unit, icon: Icon, status, color, bg }) => (
            <div key={label} className="glass-card-sm">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ width: 40, height: 40, background: bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={color} />
                </div>
                <span className="badge badge-stable" style={{ fontSize: '11px' }}>{status}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--on-surface)' }}>{value}</p>
              <p style={{ fontSize: '12px', color: 'var(--on-surface-var)' }}>{label}</p>
              <p style={{ fontSize: '11px', color: 'var(--outline)', marginTop: '2px' }}>{unit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Book Appointment', icon: Calendar, action: 'doctors', color: 'linear-gradient(135deg, #0c2461, #1a3c78)' },
          { label: 'Chat with AI', icon: MessageSquare, action: 'chatbot', color: 'linear-gradient(135deg, #1b004a, #5420b5)' },
          { label: 'Book Lab Test', icon: TestTube, action: 'lab-tests', color: 'linear-gradient(135deg, #006a6a, #009999)' },
        ].map(({ label, icon: Icon, action, color }) => (
          <button key={label} onClick={() => navigate_(action)}
            style={{ background: color, border: 'none', borderRadius: '16px', padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', color: 'white', transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(0,16,62,0.2)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,16,62,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,16,62,0.2)'; }}
          >
            <Icon size={22} />
            <span style={{ fontWeight: 700, fontSize: '15px', fontFamily: 'var(--font-display)' }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="glass-card-sm" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="headline-sm">Next Appointment</h2>
          <button onClick={() => navigate_('appointments')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All <ChevronRight size={16} />
          </button>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}><div className="spinner" /></div>
        ) : upcoming.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <Calendar size={40} color="var(--outline)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--on-surface-var)', marginBottom: '16px' }}>No upcoming appointments</p>
            <button onClick={() => navigate_('doctors')} className="btn btn-secondary btn-sm">Book Appointment</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcoming.slice(0, 3).map(apt => {
              const doctorName = `Dr. ${apt.doctor?.user?.firstName || ''} ${apt.doctor?.user?.lastName || ''}`.trim() || 'Doctor';
              const specialty = apt.doctor?.specialization || 'General';
              const date = apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
              return (
                <div key={apt._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--surface-low)', borderRadius: '12px' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '18px', fontFamily: 'var(--font-display)' }}>
                    {doctorName.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--on-surface)' }}>{doctorName}</p>
                    <p style={{ fontSize: '13px', color: 'var(--on-surface-var)', marginBottom: '6px' }}>{specialty}</p>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: 'var(--outline)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} />{date}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} />{apt.appointmentTime || 'TBD'}</span>
                    </div>
                  </div>
                  <button onClick={() => navigate_('appointments')} className="btn btn-primary btn-sm">View Details</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Prescriptions */}
      <div className="glass-card-sm">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="headline-sm">Recent Prescriptions</h2>
          <button onClick={() => navigate_('prescriptions')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All <ChevronRight size={16} />
          </button>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}><div className="spinner" /></div>
        ) : prescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <Pill size={36} color="var(--outline)" style={{ margin: '0 auto 10px' }} />
            <p style={{ color: 'var(--on-surface-var)' }}>No prescriptions yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {prescriptions.slice(0, 3).map(rx => {
              const meds = rx.medications || [];
              const date = rx.prescriptionDate ? new Date(rx.prescriptionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A';
              return (
                <div key={rx._id} 
                  onClick={() => navigate_('prescriptions')}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'var(--surface-low)', borderRadius: '12px', cursor: 'pointer' }}
                >
                  <div style={{ width: 40, height: 40, background: 'rgba(84,32,181,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Pill size={20} color="#5420b5" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '14px' }}>{meds[0]?.name || rx.diagnosis || 'Prescription'}</p>
                    <p style={{ fontSize: '12px', color: 'var(--on-surface-var)' }}>{meds.length} medication{meds.length !== 1 ? 's' : ''} · {date}</p>
                  </div>
                  {meds[0]?.dosage && <span className="badge badge-teal">{meds[0].dosage}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-mesh" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <aside className={`page-sidebar sidebar-light ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Logo */}
          <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--surface-high)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #0c2461, #006a6a)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={18} color="white" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '17px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MediCare Plus</span>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--outline)', textTransform: 'uppercase', padding: '8px 10px 4px', marginBottom: '4px' }}>Patient Portal</p>
            {NAV.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => navigate_(id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  marginBottom: '2px', transition: 'all 0.2s', textAlign: 'left',
                  background: active === id ? 'linear-gradient(135deg, rgba(0,16,62,0.08), rgba(0,106,106,0.06))' : 'transparent',
                  color: active === id ? 'var(--primary)' : 'var(--on-surface-var)',
                  fontWeight: active === id ? 700 : 500,
                  fontSize: '14px',
                  boxShadow: active === id ? 'inset 3px 0 0 var(--secondary)' : 'none',
                  fontFamily: 'var(--font-body)',
                }}
                onMouseEnter={e => { if (active !== id) e.currentTarget.style.background = 'rgba(0,16,62,0.04)'; }}
                onMouseLeave={e => { if (active !== id) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={18} color={active === id ? 'var(--secondary)' : 'var(--on-surface-var)'} />
                {label}
              </button>
            ))}
          </nav>

          {/* AI Help Card */}
          <div style={{ padding: '16px 12px' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(0,16,62,0.06), rgba(0,106,106,0.06))', border: '1px solid rgba(0,106,106,0.15)', borderRadius: '14px', padding: '16px', marginBottom: '12px' }}>
              <MessageSquare size={24} color="var(--secondary)" style={{ marginBottom: '8px' }} />
              <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>Need Help?</p>
              <p style={{ fontSize: '12px', color: 'var(--on-surface-var)', marginBottom: '12px' }}>Chat with our AI assistant</p>
              <button onClick={() => navigate_('chatbot')} className="btn btn-secondary btn-sm btn-full">Start Chat</button>
            </div>
            <button onClick={handleLogout}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--error)', fontWeight: 600, fontSize: '14px', fontFamily: 'var(--font-body)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--error-container)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>

          {/* User card */}
          <div style={{ padding: '16px', borderTop: '1px solid var(--surface-high)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar avatar-sm avatar-gradient">{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontWeight: 700, fontSize: '13px', color: 'var(--on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.firstName} {user?.lastName}</p>
              <p style={{ fontSize: '11px', color: 'var(--outline)' }}>Patient</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="sidebar-overlay show" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="page-main">
        {/* Top Bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(246,250,254,0.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--surface-high)', padding: '0 28px', height: '64px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn-icon" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'none' }} id="sidebar-toggle">
            <Menu size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'var(--on-surface)' }}>
              {NAV.find(n => n.id === active)?.label || 'Dashboard'}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar avatar-sm avatar-gradient">{initials}</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '13px', lineHeight: '1.2' }}>{user?.firstName} {user?.lastName}</p>
              <p style={{ fontSize: '11px', color: 'var(--outline)' }}>Patient</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '28px', maxWidth: '1200px' }}>
          {active === 'dashboard' && renderDashboard()}
          {active === 'appointments' && <Appointments />}
          {active === 'doctors' && <FindDoctors />}
          {active === 'prescriptions' && <Prescriptions />}
          {active === 'lab-tests' && <LabTests />}
          {active === 'records' && <MedicalRecords />}
          {active === 'book-lab-test' && <BookLabTest />}
          {active === 'book-appointment' && <BookAppointment />}
          {active === 'chatbot' && <Chatbot />}
          {active === 'notifications' && <NotificationsTab />}
          {active === 'profile' && <Profile />}
        </div>
      </main>

      <NotificationWidget />

      <style>{`
        @media (max-width: 1024px) {
          #sidebar-toggle { display: flex !important; }
        }
        @media (max-width: 640px) {
          .grid-4-health { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
