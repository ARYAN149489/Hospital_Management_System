// frontend/src/components/common/Footer.jsx
import { Link } from 'react-router-dom';
import { Activity, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold">MediCare Plus</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your trusted healthcare companion. Providing quality medical services and connecting patients with the best doctors.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-500 transition"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 transition"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-white transition text-sm">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="text-gray-400 hover:text-white transition text-sm">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* For Patients */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Patients</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/patient/find-doctors" className="text-gray-400 hover:text-white transition text-sm">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link to="/patient/dashboard" className="text-gray-400 hover:text-white transition text-sm">
                  Patient Dashboard
                </Link>
              </li>
              <li>
                <Link to="/patient/prescriptions" className="text-gray-400 hover:text-white transition text-sm">
                  Prescriptions
                </Link>
              </li>
              <li>
                <Link to="/patient/lab-tests" className="text-gray-400 hover:text-white transition text-sm">
                  Lab Tests
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  123 Healthcare Avenue,<br />
                  Medical District, Patiala,<br />
                  Punjab 147001
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-400 text-sm">+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-400 text-sm">support@medicareplus.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} MediCare Plus. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition text-sm">
                Terms of Service
              </Link>
              <Link to="/faq" className="text-gray-400 hover:text-white transition text-sm">
                FAQ
              </Link>
              <Link to="/support" className="text-gray-400 hover:text-white transition text-sm">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;