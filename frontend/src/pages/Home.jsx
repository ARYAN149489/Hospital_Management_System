import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Calendar, FileText, Video, Users,
  Shield, Clock, Award, Activity, CheckCircle, Play,
  Stethoscope, Heart, TestTube, MessageSquare
} from 'lucide-react';
import Footer from '../components/common/Footer';

export default function Home() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState('patient');
  const [counters, setCounters] = useState({ clinicians: 0, patients: 0, appointments: 0 });

  // Animated counters
  useEffect(() => {
    const targets = { clinicians: 5000, patients: 10000, appointments: 50000 };
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounters({
        clinicians: Math.floor(targets.clinicians * ease),
        patients: Math.floor(targets.patients * ease),
        appointments: Math.floor(targets.appointments * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, []);

  const features = {
    patient: [
      { icon: Users, title: 'Find Doctors', desc: 'Search by specialty, name, or department. View ratings and availability.' },
      { icon: Calendar, title: 'Book Appointments', desc: 'Easy online scheduling with real-time slot availability.' },
      { icon: MessageSquare, title: 'AI Chatbot', desc: 'Bilingual support in Hindi & English, available 24/7.' },
      { icon: TestTube, title: 'Lab Tests', desc: 'Book lab tests conveniently and track your results.' },
    ],
    doctor: [
      { icon: Users, title: 'Patient Management', desc: 'Access complete patient data, history and medical records.' },
      { icon: Calendar, title: 'Smart Schedule', desc: 'AI-optimized daily clinical routing and appointment management.' },
      { icon: Clock, title: 'Leave Management', desc: 'Apply for full/half/custom leave days with instant approval.' },
      { icon: FileText, title: 'Prescriptions', desc: 'Create and manage digital prescriptions securely.' },
    ],
    admin: [
      { icon: Shield, title: 'User Management', desc: 'Full control over doctors and patient accounts.' },
      { icon: Award, title: 'Leave Approvals', desc: 'Review and approve doctor leave requests with context.' },
      { icon: Activity, title: 'Analytics', desc: 'Real-time platform analytics and hospital performance metrics.' },
      { icon: Stethoscope, title: 'Department Control', desc: 'Manage departments and medical staff at scale.' },
    ],
  };

  const steps = [
    { num: '01', title: 'Create Account', desc: 'Sign up as a patient or doctor in seconds. No paperwork needed.', icon: Users },
    { num: '02', title: 'Complete Profile', desc: 'Add your medical information, specialty, and preferences.', icon: FileText },
    { num: '03', title: 'Start Using', desc: 'Book appointments, manage patients, or access your dashboard.', icon: Activity },
  ];

  return (
    <div className="bg-mesh-hero" style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{ paddingTop: '120px', paddingBottom: '80px', padding: '120px 0 80px' }}>
        <div className="container" style={{ padding: '0 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            
            {/* Left */}
            <div className="animate-fadeInUp">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(0,106,106,0.08)', border: '1px solid rgba(0,106,106,0.2)',
                borderRadius: '999px', padding: '6px 16px', marginBottom: '28px'
              }}>
                <div className="status-dot stable pulse" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--secondary)', letterSpacing: '0.04em' }}>
                  SPATIAL HEALTHCARE SYSTEM
                </span>
              </div>

              <h1 className="headline-xl" style={{ marginBottom: '24px', color: 'var(--primary)' }}>
                The future of<br />
                clinical precision<br />
                is <span style={{ color: 'var(--secondary)' }}>here.</span>
              </h1>

              <p style={{ fontSize: '18px', lineHeight: '1.7', color: 'var(--on-surface-var)', marginBottom: '40px', maxWidth: '480px' }}>
                Experience a new dimension of healthcare management. Intuitive spatial interfaces designed for speed, clarity, and patient-first outcomes.
              </p>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '48px', flexWrap: 'wrap' }}>
                <Link to="/signup" className="btn btn-primary btn-lg" style={{ gap: '10px' }}>
                  Access Portal <ArrowRight size={20} />
                </Link>
                <button type="button" className="btn btn-ghost btn-lg" style={{ gap: '10px' }}
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Play size={12} color="white" fill="white" />
                  </div>
                  Watch Demo
                </button>
              </div>

              {/* Social Proof */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex' }}>
                  {['#0c2461', '#006a6a', '#1b004a'].map((color, i) => (
                    <div key={i} style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: color, border: '2px solid white',
                      marginLeft: i > 0 ? '-10px' : '0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '12px', fontWeight: 700,
                    }}>
                      {['D', 'P', 'A'][i]}
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--on-surface-var)' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 800 }}>5,000+</span> clinicians onboarded
                </span>
              </div>
            </div>

            {/* Right — Glass Feature Preview */}
            <div style={{ position: 'relative' }} className="animate-fadeInUp" >
              {/* Background orbs */}
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,106,106,0.12), transparent)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(27,0,74,0.08), transparent)', pointerEvents: 'none' }} />

              <div className="glass-card" style={{ padding: '32px', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--outline-var)' }}>
                  <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #0c2461, #006a6a)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={22} color="white" />
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--on-surface)' }}>Platform Overview</p>
                    <p style={{ fontSize: '13px', color: 'var(--on-surface-var)' }}>Real-time metrics</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  {[
                    { label: 'Active Patients', value: counters.patients.toLocaleString() + '+', color: 'var(--secondary)', bg: 'rgba(0,106,106,0.08)' },
                    { label: 'Expert Doctors', value: '500+', color: 'var(--primary)', bg: 'rgba(0,16,62,0.06)' },
                    { label: 'Appointments', value: counters.appointments.toLocaleString() + '+', color: '#5420b5', bg: 'rgba(84,32,181,0.08)' },
                    { label: 'Departments', value: '24', color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} style={{ background: bg, borderRadius: '12px', padding: '16px' }}>
                      <p style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: 800, color }}>{value}</p>
                      <p style={{ fontSize: '12px', color: 'var(--on-surface-var)', marginTop: '4px' }}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* Feature Cards */}
                {[
                  { icon: Calendar, label: 'Smart Schedule', desc: 'AI-optimized clinical routing', color: 'var(--secondary)', bg: 'rgba(0,106,106,0.08)' },
                  { icon: FileText, label: 'Patient Records', desc: 'Secure & instant access', color: 'var(--primary)', bg: 'rgba(0,16,62,0.06)' },
                ].map(({ icon: Icon, label, desc, color, bg }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: bg, borderRadius: '12px', marginBottom: '10px' }}>
                    <div style={{ width: 38, height: 38, background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      <Icon size={18} color={color} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--on-surface)' }}>{label}</p>
                      <p style={{ fontSize: '12px', color: 'var(--on-surface-var)' }}>{desc}</p>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <div className="status-dot stable pulse" />
                      <span style={{ fontSize: '10px', color: 'var(--secondary)', fontWeight: 600, marginLeft: '5px' }}>Live</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '80px 0', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)' }}>
        <div className="container" style={{ padding: '0 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '12px' }}>PLATFORM CAPABILITIES</p>
            <h2 className="headline-lg" style={{ marginBottom: '16px' }}>Powerful Features for Everyone</h2>
            <p style={{ fontSize: '18px', color: 'var(--on-surface-var)' }}>Tailored solutions for patients, doctors, and administrators</p>
          </div>

          {/* Role Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'flex', background: 'var(--surface-container)', borderRadius: '14px', padding: '6px', gap: '4px' }}>
              {['patient', 'doctor', 'admin'].map(role => (
                <button type="button" key={role} onClick={() => setActiveRole(role)}
                  style={{
                    padding: '10px 28px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'capitalize',
                    transition: 'background-color 0.2s, color 0.2s, box-shadow 0.2s',
                    background: activeRole === role ? 'white' : 'transparent',
                    color: activeRole === role ? 'var(--primary)' : 'var(--on-surface-var)',
                    boxShadow: activeRole === role ? '0 2px 10px rgba(0,16,62,0.12)' : 'none',
                  }}>
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="grid-4 stagger-children">
            {features[activeRole].map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="glass-card-sm animate-fadeInUp" style={{ animationDelay: `${i * 60}ms` }}>
                <div style={{
                  width: 52, height: 52,
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  borderRadius: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: '0 4px 16px rgba(0,106,106,0.25)',
                }}>
                  <Icon size={24} color="white" />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', marginBottom: '8px', color: 'var(--on-surface)' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--on-surface-var)', lineHeight: '1.6' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '80px 0' }}>
        <div className="container" style={{ padding: '0 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '12px' }}>GET STARTED</p>
            <h2 className="headline-lg" style={{ marginBottom: '16px' }}>How It Works</h2>
            <p style={{ fontSize: '18px', color: 'var(--on-surface-var)' }}>Up and running in three simple steps</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', position: 'relative' }}>
            {steps.map(({ num, title, desc, icon: Icon }, i) => (
              <div key={num} style={{ textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: 72, height: 72,
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    borderRadius: '20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(0,16,62,0.25)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '22px',
                    color: 'white',
                  }}>{num}</div>
                  <Icon size={32} color="var(--secondary)" />
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', color: 'var(--on-surface)' }}>{title}</h3>
                  <p style={{ fontSize: '15px', color: 'var(--on-surface-var)', lineHeight: '1.6' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Chatbot Section */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
        <div className="container" style={{ padding: '0 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', padding: '6px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', marginBottom: '24px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>🤖 AI-Powered Assistant</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '36px', color: 'white', lineHeight: '1.2', marginBottom: '20px' }}>
                Bilingual AI Chatbot
              </h2>
              <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.7', marginBottom: '28px' }}>
                Get instant answers to your healthcare queries in both Hindi and English. Our intelligent chatbot supports text and voice input, available 24/7.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Bilingual support (Hindi & English)', 'Voice and text input options', '24/7 instant responses'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CheckCircle size={18} color="var(--secondary-light)" />
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '28px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px' }}>
                {[
                  { msg: 'How can I book an appointment?', sender: 'user' },
                  { msg: 'You can book an appointment by searching for a doctor by name or department, then selecting an available time slot!', sender: 'bot' },
                ].map(({ msg, sender }, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexDirection: sender === 'user' ? 'row' : 'row-reverse' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: sender === 'user' ? 'var(--surface-container)' : 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {sender === 'user' ? <Users size={16} color="var(--on-surface-var)" /> : <Activity size={16} color="white" />}
                    </div>
                    <div style={{ background: sender === 'user' ? 'var(--surface-container)' : 'linear-gradient(135deg, var(--primary), var(--secondary))', color: sender === 'user' ? 'var(--on-surface)' : 'white', padding: '12px 16px', borderRadius: sender === 'user' ? '16px 16px 16px 4px' : '16px 16px 4px 16px', fontSize: '14px', maxWidth: '80%' }}>
                      {msg}
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--surface-high)' }}>
                  <input className="input-glass" placeholder="Type your message..." style={{ fontSize: '13px' }} readOnly />
                  <button type="button" className="btn btn-primary btn-sm">Send</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="about" style={{ padding: '80px 0', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)' }}>
        <div className="container" style={{ padding: '0 40px', textAlign: 'center' }}>
          <h2 className="headline-lg" style={{ marginBottom: '20px' }}>Ready to Transform Your Healthcare Experience?</h2>
          <p style={{ fontSize: '18px', color: 'var(--on-surface-var)', marginBottom: '40px', maxWidth: '560px', margin: '0 auto 40px' }}>
            Join thousands of patients and doctors using MediCare Plus for better healthcare management.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/signup" className="btn btn-primary btn-lg">Get Started Now <ArrowRight size={20} /></Link>
            <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 1024px) {
          section > .container > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          section > .container > div[style*="grid-template-columns: repeat(3, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
