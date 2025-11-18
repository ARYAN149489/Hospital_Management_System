// frontend/src/pages/doctor/Settings.jsx
import { useState } from 'react';
import { Shield, Bell, Lock, Eye, EyeOff, Globe, Moon, Sun } from 'lucide-react';
import Button from '../../components/common/Button';
import ChangePasswordModal from '../../components/common/ChangePasswordModal';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    leaveApprovalNotifications: true,
    
    // Privacy Settings
    showProfile: true,
    showContactInfo: false,
    
    // Appearance
    theme: 'light',
    language: 'en',
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('Setting updated');
  };

  const handleThemeChange = (theme) => {
    setSettings(prev => ({ ...prev, theme }));
    toast.success(`Theme changed to ${theme}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-600" />
            Settings
          </h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and settings</p>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Lock className="w-6 h-6 mr-2 text-blue-600" />
            Security
          </h2>
          <div className="space-y-4">
            <button
              onClick={() => setIsChangePasswordOpen(true)}
              className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">Change Password</p>
                <p className="text-sm text-gray-500">Update your password regularly for security</p>
              </div>
              <Lock className="w-5 h-5 text-gray-400" />
            </button>

            <div className="px-4 py-3 border border-gray-300 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                  Enable
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Bell className="w-6 h-6 mr-2 text-blue-600" />
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive updates via email</p>
              </div>
              <button
                onClick={() => handleToggle('emailNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-500">Receive text messages for urgent updates</p>
              </div>
              <button
                onClick={() => handleToggle('smsNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.smsNotifications ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Appointment Reminders</p>
                <p className="text-sm text-gray-500">Get notified before appointments</p>
              </div>
              <button
                onClick={() => handleToggle('appointmentReminders')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.appointmentReminders ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.appointmentReminders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Leave Approval Notifications</p>
                <p className="text-sm text-gray-500">Get notified about leave request status</p>
              </div>
              <button
                onClick={() => handleToggle('leaveApprovalNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.leaveApprovalNotifications ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.leaveApprovalNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Eye className="w-6 h-6 mr-2 text-blue-600" />
            Privacy
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Show Profile to Patients</p>
                <p className="text-sm text-gray-500">Allow patients to view your profile</p>
              </div>
              <button
                onClick={() => handleToggle('showProfile')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.showProfile ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showProfile ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Show Contact Information</p>
                <p className="text-sm text-gray-500">Display phone and email publicly</p>
              </div>
              <button
                onClick={() => handleToggle('showContactInfo')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.showContactInfo ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showContactInfo ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Sun className="w-6 h-6 mr-2 text-blue-600" />
            Appearance
          </h2>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-gray-900 mb-3">Theme</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`p-4 border-2 rounded-lg transition ${
                    settings.theme === 'light'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Sun className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                  <p className="text-sm font-medium">Light</p>
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`p-4 border-2 rounded-lg transition ${
                    settings.theme === 'dark'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Moon className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
                  <p className="text-sm font-medium">Dark</p>
                </button>
                <button
                  onClick={() => handleThemeChange('auto')}
                  className={`p-4 border-2 rounded-lg transition ${
                    settings.theme === 'auto'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Globe className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm font-medium">Auto</p>
                </button>
              </div>
            </div>

            <div>
              <p className="font-medium text-gray-900 mb-3">Language</p>
              <select
                value={settings.language}
                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="es">Español (Spanish)</option>
                <option value="fr">Français (French)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-4">Danger Zone</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition">
              <p className="font-medium text-red-900">Deactivate Account</p>
              <p className="text-sm text-red-700">Temporarily disable your account</p>
            </button>
            <button className="w-full text-left px-4 py-3 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition">
              <p className="font-medium text-red-900">Delete Account</p>
              <p className="text-sm text-red-700">Permanently delete your account and data</p>
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
};

export default Settings;
