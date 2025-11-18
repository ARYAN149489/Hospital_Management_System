import React, { useState, useEffect } from 'react';
import { Calendar, MessageSquare, Users, UserCheck, ClipboardList, Shield, Clock, Award, ArrowRight, Menu, X, Stethoscope, Heart, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRole, setActiveRole] = useState('patient');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigate = useNavigate();

  const features = {
    patient: [
      { icon: Users, title: 'Find Doctors', desc: 'Search by name or department' },
      { icon: Calendar, title: 'Book Appointments', desc: 'Easy online scheduling' },
      { icon: MessageSquare, title: 'AI Chatbot', desc: 'Bilingual support (Hindi & English)' },
      { icon: ClipboardList, title: 'Test Scheduling', desc: 'Book lab tests conveniently' }
    ],
    doctor: [
      { icon: Users, title: 'Patient Management', desc: 'Access patient data & history' },
      { icon: Calendar, title: 'Appointments', desc: 'View and manage schedules' },
      { icon: Clock, title: 'Leave Requests', desc: 'Apply for full/half/custom days' },
      { icon: Activity, title: 'Dashboard', desc: 'Track your practice metrics' }
    ],
    admin: [
      { icon: UserCheck, title: 'Leave Approvals', desc: 'Manage doctor leave requests' },
      { icon: Shield, title: 'User Management', desc: 'Block/unblock doctors temporarily' },
      { icon: ClipboardList, title: 'History Access', desc: 'View patient & doctor records' },
      { icon: Award, title: 'System Control', desc: 'Full platform oversight' }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium">
                🏥 Advanced Healthcare Platform
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Healthcare Made
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Simple & Smart</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Connect patients with doctors seamlessly. Manage appointments, access medical records, and get instant support through our AI-powered bilingual chatbot.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 font-medium flex items-center justify-center space-x-2">
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all duration-300 font-medium">
                  Learn More
                </button>
              </div>
              <div className="flex items-center space-x-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900">10k+</div>
                  <div className="text-gray-600 text-sm">Active Patients</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">500+</div>
                  <div className="text-gray-600 text-sm">Expert Doctors</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">50k+</div>
                  <div className="text-gray-600 text-sm">Appointments</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 space-y-6">
                <div className="flex items-center space-x-4 pb-6 border-b">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Quick Access</h3>
                    <p className="text-gray-500">Login to your account</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-3"
                  >
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Login</span>
                  </button>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-6 -left-6 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features for Everyone</h2>
            <p className="text-xl text-gray-600">Tailored solutions for patients, doctors, and administrators</p>
          </div>

          {/* Role Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 rounded-xl p-2 inline-flex space-x-2">
              {['patient', 'doctor', 'admin'].map(role => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`px-8 py-3 rounded-lg font-medium transition-all capitalize ${
                    activeRole === role
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features[activeRole].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Create Account', desc: 'Sign up as a patient or doctor in seconds', icon: UserCheck },
              { num: '02', title: 'Complete Profile', desc: 'Add your information and preferences', icon: ClipboardList },
              { num: '03', title: 'Start Using', desc: 'Book appointments or manage patients', icon: Activity }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="text-center space-y-4">
                  <div className="inline-flex w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {step.num}
                  </div>
                  <step.icon className="w-12 h-12 mx-auto text-blue-600" />
                  <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 opacity-30 -z-10"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Chatbot Highlight */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                🤖 AI-Powered Assistant
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold">Bilingual AI Chatbot</h2>
              <p className="text-xl text-blue-100">
                Get instant answers to your healthcare queries in both Hindi and English. Our intelligent chatbot supports text and voice input, available 24/7 to assist you.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                  <span>Bilingual support (Hindi & English)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                  <span>Voice and text input options</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                  <span>24/7 instant responses</span>
                </li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <div className="bg-white rounded-2xl p-6 space-y-4 shadow-2xl">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3 text-gray-800">
                      How can I book an appointment?
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 justify-end">
                  <div className="flex-1">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-3 text-white text-right">
                      You can book an appointment by searching for a doctor by name or department, then selecting an available time slot!
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id='about' className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of patients and doctors using MediCare Plus for better healthcare management
          </p>
          <button className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-2xl transition-all duration-300 font-medium text-lg inline-flex items-center space-x-3">
            <span>Get Started Now</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-8 h-8 text-blue-500" />
                <span className="text-xl font-bold">MediCare Plus</span>
              </div>
              <p className="text-gray-400">
                Advanced healthcare management platform connecting patients and doctors.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: support@medicareplus.com</li>
                <li>Phone: +91 1800-123-4567</li>
                <li>Mon-Sat: 9AM - 6PM</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MediCare Plus. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;