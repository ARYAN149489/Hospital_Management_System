// frontend/src/components/common/Navbar.jsx
import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../utils/constants';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const userMenuRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDashboardClick = (e) => {
    e.preventDefault();
    const dashboardLink = getDashboardLink();
    // Force navigation with a timestamp to trigger useEffect
    navigate(`${dashboardLink}?t=${Date.now()}`);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case USER_ROLES.PATIENT:
        return '/patient/dashboard';
      case USER_ROLES.DOCTOR:
        return '/doctor/dashboard';
      case USER_ROLES.ADMIN:
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  const isHomePage = location.pathname === '/';

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MediCare Plus
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <a 
                  href={getDashboardLink()} 
                  onClick={handleDashboardClick}
                  className="text-gray-700 hover:text-blue-600 transition font-medium cursor-pointer"
                >
                  Dashboard
                </a>
                
                {user?.role === USER_ROLES.PATIENT && (
                  <>
                    <Link to="/patient/find-doctors" className="text-gray-700 hover:text-blue-600 transition font-medium">
                      Find Doctors
                    </Link>
                    <Link to="/patient/appointments" className="text-gray-700 hover:text-blue-600 transition font-medium">
                      Appointments
                    </Link>
                  </>
                )}

                {user?.role === USER_ROLES.DOCTOR && (
                  <>
                    <Link to="/doctor/appointments" className="text-gray-700 hover:text-blue-600 transition font-medium">
                      Appointments
                    </Link>
                    <Link to="/doctor/my-patients" className="text-gray-700 hover:text-blue-600 transition font-medium">
                      Patients
                    </Link>
                  </>
                )}

                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="font-medium">{user?.name}</span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      
                      {user?.role !== USER_ROLES.ADMIN && (
                        <Link to={`/${user?.role}/profile`} className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition" onClick={() => setUserMenuOpen(false)}>
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                      )}
                      
                      <button onClick={handleLogout} className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition">
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {isHomePage ? (
                  <>
                    <a href="#features" className="text-gray-700 hover:text-blue-600 transition font-medium">
                      Features
                    </a>
                    <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition font-medium">
                      How It Works
                    </a>
                    <a href="#about" className="text-gray-700 hover:text-blue-600 transition font-medium">
                      About
                    </a>
                    <a href="#contact" className="text-gray-700 hover:text-blue-600 transition font-medium">
                      Contact
                    </a>
                  </>
                ) : (
                  <Link to="/" className="text-gray-700 hover:text-blue-600 transition font-medium">
                    Home
                  </Link>
                )}
                <Link to="/login" className="text-gray-700 hover:text-blue-600 transition font-medium">
                  Login
                </Link>
                <Link to="/signup" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700 hover:text-blue-600">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-3">
            {isAuthenticated ? (
              <>
                <a 
                  href={getDashboardLink()} 
                  onClick={(e) => {
                    handleDashboardClick(e);
                    setMobileMenuOpen(false);
                  }}
                  className="block text-gray-700 hover:text-blue-600 transition font-medium cursor-pointer"
                >
                  Dashboard
                </a>
                
                {user?.role === USER_ROLES.PATIENT && (
                  <>
                    <Link to="/patient/find-doctors" className="block text-gray-700 hover:text-blue-600 transition font-medium" onClick={() => setMobileMenuOpen(false)}>
                      Find Doctors
                    </Link>
                    <Link to="/patient/appointments" className="block text-gray-700 hover:text-blue-600 transition font-medium" onClick={() => setMobileMenuOpen(false)}>
                      Appointments
                    </Link>
                  </>
                )}

                {user?.role !== USER_ROLES.ADMIN && (
                  <Link to={`/${user?.role}/profile`} className="block text-gray-700 hover:text-blue-600 transition font-medium" onClick={() => setMobileMenuOpen(false)}>
                    Profile
                  </Link>
                )}
                
                <button onClick={handleLogout} className="block w-full text-left text-red-600 hover:text-red-700 transition font-medium">
                  Logout
                </button>
              </>
            ) : (
              <>
                {isHomePage ? (
                  <>
                    <a href="#features" className="block text-gray-700 hover:text-blue-600 transition font-medium" onClick={() => setMobileMenuOpen(false)}>
                      Features
                    </a>
                    <a href="#how-it-works" className="block text-gray-700 hover:text-blue-600 transition font-medium" onClick={() => setMobileMenuOpen(false)}>
                      How It Works
                    </a>
                    <a href="#about" className="block text-gray-700 hover:text-blue-600 transition font-medium" onClick={() => setMobileMenuOpen(false)}>
                      About
                    </a>
                    <a href="#contact" className="block text-gray-700 hover:text-blue-600 transition font-medium" onClick={() => setMobileMenuOpen(false)}>
                      Contact
                    </a>
                  </>
                ) : (
                  <Link to="/" className="block text-gray-700 hover:text-blue-600 transition font-medium" onClick={() => setMobileMenuOpen(false)}>
                    Home
                  </Link>
                )}
                <Link to="/login" className="block text-gray-700 hover:text-blue-600 transition font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/signup" className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg text-center font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;