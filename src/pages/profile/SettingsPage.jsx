import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MergedServiceForm from '../../components/forms/MergedServiceForm';
import BottomCarouselPages from '../../components/carousel/BottomCarouselPages';

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  
  // Notification settings states
  const [notificationSettings, setNotificationSettings] = useState({
    emailAppointments: true,
    emailCoaching: true,
    emailMarketing: false,
    pushNotifications: true
  });
  
  // Privacy settings states
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    shareAnalytics: true,
    chatRetention: '6months'
  });
  
  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    language: 'english',
    textSize: 'medium',
    highContrast: false
  });
  
  // Session preferences
  const [sessionPreferences, setSessionPreferences] = useState({
    defaultDuration: '60',
    recordSessions: true,
    autoJoin: true
  });
  
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      setProfile(data);
      
      // In a real app, you would fetch these settings from your database
      // For now we'll use our default state values
      
    } catch (error) {
      console.error('Error fetching settings:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handlePrivacyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPrivacySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleAppearanceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAppearanceSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSessionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSessionPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const saveSettings = async (section) => {
    // In a real app, you would save these settings to your database
    alert(`${section} settings saved!`);
    setActiveSection(null); // Close the section after saving
  };

  // Helper component for toggle switch
  const ToggleSwitch = ({ name, isChecked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-200">
      <div>
        <h3 className="font-semibold text-gray-700">{label}</h3>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          name={name}
          checked={isChecked} 
          onChange={onChange}
          className="sr-only peer" 
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-oxfordBlue"></div>
      </label>
    </div>
  );

  // Helper component for select input
  const SelectInput = ({ name, value, onChange, label, description, options }) => (
    <div className="py-4 border-b border-gray-200">
      <div className="mb-2">
        <h3 className="font-semibold text-gray-700">{label}</h3>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <select 
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-oxfordBlue bg-white"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-oxfordBlue"></div>
      </div>
    );
  }

  // Privacy Policy Content
  const renderPrivacyPolicy = () => (
    <div className="prose prose-sm max-w-none">
      <h3 className="text-xl font-bold text-oxfordBlue mb-4">Privacy Policy</h3>
      <p className="mb-4">Last updated: April 26, 2025</p>

      <p className="mb-2">At DaGalow, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services.</p>
      
      <h4 className="font-bold text-lg mt-6 mb-2">1. Information We Collect</h4>
      <p className="mb-2">We collect information you provide directly to us, including:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Personal information (name, email address, phone number)</li>
        <li>Profile information</li>
        <li>Payment and transaction information</li>
        <li>Communications you send to us</li>
        <li>Usage information and interaction with our services</li>
      </ul>
      
      <h4 className="font-bold text-lg mt-6 mb-2">2. How We Use Your Information</h4>
      <p className="mb-2">We use your information to:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Provide, maintain, and improve our services</li>
        <li>Process transactions and send related information</li>
        <li>Send you technical notices, updates, and support messages</li>
        <li>Respond to your comments and questions</li>
        <li>Personalize your experience</li>
        <li>Monitor and analyze trends and usage</li>
      </ul>
      
      <h4 className="font-bold text-lg mt-6 mb-2">3. Sharing of Information</h4>
      <p className="mb-2">We may share your information with:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Service providers who perform services on our behalf</li>
        <li>Payment processors</li>
        <li>Professional advisors</li>
        <li>When required by law or to protect rights</li>
      </ul>
      
      <h4 className="font-bold text-lg mt-6 mb-2">4. Your Rights</h4>
      <p className="mb-2">Depending on your location, you may have rights to:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Access personal data we hold about you</li>
        <li>Request correction of your personal data</li>
        <li>Request deletion of your personal data</li>
        <li>Object to processing of your personal data</li>
        <li>Request restriction of processing your personal data</li>
        <li>Request transfer of your personal data</li>
        <li>Withdraw consent</li>
      </ul>
      
      <h4 className="font-bold text-lg mt-6 mb-2">5. Contact Us</h4>
      <p className="mb-4">If you have any questions about this Privacy Policy, please contact us at privacy@dagalow.com</p>
    </div>
  );

  // Terms of Service Content
  const renderTermsOfService = () => (
    <div className="prose prose-sm max-w-none">
      <h3 className="text-xl font-bold text-oxfordBlue mb-4">Terms of Service</h3>
      <p className="mb-4">Last updated: April 26, 2025</p>

      <p className="mb-2">Please read these Terms of Service ("Terms") carefully before using the DaGalow website and services operated by DaGalow ("we," "us," or "our").</p>
      
      <h4 className="font-bold text-lg mt-6 mb-2">1. Acceptance of Terms</h4>
      <p className="mb-4">By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>
      
      <h4 className="font-bold text-lg mt-6 mb-2">2. User Accounts</h4>
      <p className="mb-4">When you create an account with us, you must provide accurate, complete, and up-to-date information. You are responsible for safeguarding the password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>
      
      <h4 className="font-bold text-lg mt-6 mb-2">3. Payments and Subscriptions</h4>
      <p className="mb-2">For paid services:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>You agree to pay all fees or charges to your account based on the fees, charges, and billing terms in effect at the time a fee or charge is due and payable.</li>
        <li>You must provide a valid payment method for paying all fees.</li>
        <li>Subscriptions will automatically renew until cancelled.</li>
        <li>Cancellations must be made at least 24 hours before the end of the current billing period.</li>
      </ul>
      
      <h4 className="font-bold text-lg mt-6 mb-2">4. Coaching Services</h4>
      <p className="mb-4">Our coaching services are provided for informational and educational purposes only. We do not guarantee specific results. Implementation of advice and recommendations is at your own risk and discretion.</p>
      
      <h4 className="font-bold text-lg mt-6 mb-2">5. Intellectual Property</h4>
      <p className="mb-4">The Service and its original content, features, and functionality are and will remain the exclusive property of DaGalow. Our service is protected by copyright, trademark, and other laws. Our trademarks may not be used in connection with any product or service without our prior written consent.</p>
      
      <h4 className="font-bold text-lg mt-6 mb-2">6. Termination</h4>
      <p className="mb-4">We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.</p>
      
      <h4 className="font-bold text-lg mt-6 mb-2">7. Limitation of Liability</h4>
      <p className="mb-4">In no event shall DaGalow, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>
      
      <h4 className="font-bold text-lg mt-6 mb-2">8. Changes to Terms</h4>
      <p className="mb-4">We reserve the right to modify or replace these Terms at any time. It is your responsibility to review these Terms periodically for changes.</p>
      
      <h4 className="font-bold text-lg mt-6 mb-2">9. Contact Us</h4>
      <p className="mb-4">If you have any questions about these Terms, please contact us at terms@dagalow.com</p>
    </div>
  );

  // Helper function to render the appropriate settings content
  const renderSettingsContent = () => {
    switch(activeSection) {
      case 'account':
        return (
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Email Address</h3>
                <div className="flex items-center justify-between">
                  <p className="text-gray-500">{user.email}</p>
                  <button className="text-oxfordBlue hover:underline text-sm px-3 py-1 border border-oxfordBlue rounded">
                    Change Email
                  </button>
                </div>
              </div>
              
              <div className="py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Password</h3>
                <div className="flex items-center justify-between">
                  <p className="text-gray-500">••••••••••••</p>
                  <Link to="/forgot-password" className="text-oxfordBlue hover:underline text-sm px-3 py-1 border border-oxfordBlue rounded">
                    Reset Password
                  </Link>
                </div>
              </div>
              
              <div className="py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Profile Information</h3>
                <Link to="/edit-profile" className="bg-oxfordBlue text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors inline-block">
                  Edit Profile
                </Link>
              </div>
              
              <div className="py-4">
                <h3 className="font-semibold text-gray-700 mb-3">Account Actions</h3>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={handleSignOut}
                    className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Sign Out
                  </button>
                  <button className="text-red-600 hover:bg-red-50 py-2 px-4 border border-red-600 rounded-lg">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setActiveSection(null)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors mr-4"
              >
                Back
              </button>
              <button 
                onClick={() => saveSettings('account')}
                className="bg-oxfordBlue text-white py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        );
        
      case 'notifications':
        return (
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Email Notifications</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ToggleSwitch
                    name="emailAppointments"
                    isChecked={notificationSettings.emailAppointments}
                    onChange={handleNotificationChange}
                    label="Appointment Reminders"
                    description="Receive emails about your upcoming appointments"
                  />
                  
                  <ToggleSwitch
                    name="emailCoaching"
                    isChecked={notificationSettings.emailCoaching}
                    onChange={handleNotificationChange}
                    label="Coaching Updates"
                    description="Receive emails about your coaching sessions"
                  />
                  
                  <ToggleSwitch
                    name="emailMarketing"
                    isChecked={notificationSettings.emailMarketing}
                    onChange={handleNotificationChange}
                    label="Marketing Communications"
                    description="Receive promotional emails and special offers"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Other Notifications</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ToggleSwitch
                    name="pushNotifications"
                    isChecked={notificationSettings.pushNotifications}
                    onChange={handleNotificationChange}
                    label="Push Notifications"
                    description="Receive push notifications in your browser"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setActiveSection(null)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors mr-4"
              >
                Back
              </button>
              <button 
                onClick={() => saveSettings('notification')}
                className="bg-oxfordBlue text-white py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        );
        
      case 'privacy':
        return (
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Privacy Controls</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <SelectInput
                    name="profileVisibility"
                    value={privacySettings.profileVisibility}
                    onChange={handlePrivacyChange}
                    label="Profile Visibility"
                    description="Control who can see your profile information"
                    options={[
                      { value: "public", label: "Public" },
                      { value: "contacts", label: "Contacts Only" },
                      { value: "private", label: "Private" }
                    ]}
                  />
                  
                  <ToggleSwitch
                    name="shareAnalytics"
                    isChecked={privacySettings.shareAnalytics}
                    onChange={handlePrivacyChange}
                    label="Data Analytics"
                    description="Allow us to use anonymous data to improve our services"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Data Management</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <SelectInput
                    name="chatRetention"
                    value={privacySettings.chatRetention}
                    onChange={handlePrivacyChange}
                    label="Chat History Retention"
                    description="Choose how long to keep your chat history"
                    options={[
                      { value: "forever", label: "Keep Forever" },
                      { value: "1year", label: "1 Year" },
                      { value: "6months", label: "6 Months" },
                      { value: "3months", label: "3 Months" },
                      { value: "1month", label: "1 Month" }
                    ]}
                  />
                  
                  <div className="py-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-700 mb-2">Your Data</h3>
                    <div className="flex flex-wrap gap-4">
                      <button className="text-oxfordBlue border border-oxfordBlue hover:bg-oxfordBlue/10 py-2 px-4 rounded-lg transition-colors flex items-center">
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        Download My Data
                      </button>
                      <button className="text-oxfordBlue border border-oxfordBlue hover:bg-oxfordBlue/10 py-2 px-4 rounded-lg transition-colors flex items-center">
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Clear Chat History
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setActiveSection(null)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors mr-4"
              >
                Back
              </button>
              <button 
                onClick={() => saveSettings('privacy')}
                className="bg-oxfordBlue text-white py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        );
        
      case 'appearance':
        return (
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <SelectInput
                  name="language"
                  value={appearanceSettings.language}
                  onChange={handleAppearanceChange}
                  label="Interface Language"
                  description="Select your preferred language for the application"
                  options={[
                    { value: "english", label: "English" },
                    { value: "portuguese", label: "Portuguese" },
                    { value: "spanish", label: "Spanish" },
                    { value: "french", label: "French" },
                    { value: "german", label: "German" }
                  ]}
                />
                
                <SelectInput
                  name="textSize"
                  value={appearanceSettings.textSize}
                  onChange={handleAppearanceChange}
                  label="Text Size"
                  description="Adjust the size of text throughout the application"
                  options={[
                    { value: "small", label: "Small" },
                    { value: "medium", label: "Medium" },
                    { value: "large", label: "Large" },
                    { value: "xlarge", label: "Extra Large" }
                  ]}
                />
                
                <ToggleSwitch
                  name="highContrast"
                  isChecked={appearanceSettings.highContrast}
                  onChange={handleAppearanceChange}
                  label="High Contrast Mode"
                  description="Increase contrast for better readability"
                />
              </div>
              
              <div className="py-4">
                <h3 className="font-semibold text-gray-700 mb-2">Preview</h3>
                <div className={`p-4 border rounded-lg ${appearanceSettings.highContrast ? 'bg-white text-black border-black' : 'bg-gray-50 text-gray-800 border-gray-200'}`}>
                  <p className={`${appearanceSettings.textSize === 'small' ? 'text-sm' : 
                                 appearanceSettings.textSize === 'medium' ? 'text-base' : 
                                 appearanceSettings.textSize === 'large' ? 'text-lg' : 'text-xl'}`}>
                    This is a preview of how text will appear with your selected settings.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setActiveSection(null)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors mr-4"
              >
                Back
              </button>
              <button 
                onClick={() => saveSettings('appearance')}
                className="bg-oxfordBlue text-white py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        );
        
      case 'sessions':
        return (
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Session Preferences</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <SelectInput
                    name="defaultDuration"
                    value={sessionPreferences.defaultDuration}
                    onChange={handleSessionChange}
                    label="Default Session Duration"
                    description="Choose your preferred session length for new bookings"
                    options={[
                      { value: "45", label: "45 minutes" },
                      { value: "60", label: "60 minutes" },
                      { value: "75", label: "75 minutes" },
                      { value: "90", label: "90 minutes" }
                    ]}
                  />
                  
                  <ToggleSwitch
                    name="recordSessions"
                    isChecked={sessionPreferences.recordSessions}
                    onChange={handleSessionChange}
                    label="Record Sessions"
                    description="Automatically record all consultation sessions"
                  />
                  
                  <ToggleSwitch
                    name="autoJoin"
                    isChecked={sessionPreferences.autoJoin}
                    onChange={handleSessionChange}
                    label="Auto-Join Sessions"
                    description="Automatically join consultation sessions when they begin"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Payment & Subscriptions</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-700">Payment Methods</h3>
                      <button className="text-oxfordBlue border border-oxfordBlue hover:bg-oxfordBlue/10 py-1 px-3 rounded-lg transition-colors text-sm">
                        Manage
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Add, remove, or update your payment methods</p>
                  </div>
                  
                  <div className="py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-700">Billing History</h3>
                      <button className="text-oxfordBlue border border-oxfordBlue hover:bg-oxfordBlue/10 py-1 px-3 rounded-lg transition-colors text-sm">
                        View
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">See your past invoices and payment details</p>
                  </div>
                  
                  <div className="py-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-700">Active Subscriptions</h3>
                      <button className="text-oxfordBlue border border-oxfordBlue hover:bg-oxfordBlue/10 py-1 px-3 rounded-lg transition-colors text-sm">
                        Manage
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Review and manage your current subscriptions</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setActiveSection(null)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors mr-4"
              >
                Back
              </button>
              <button 
                onClick={() => saveSettings('session')}
                className="bg-oxfordBlue text-white py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        );

      case 'others':
        return (
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="space-y-4">
                {/* Privacy Policy Link */}
                <div 
                  className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all mb-3 flex justify-between items-center"
                  onClick={() => setActiveSection('privacy-policy')}
                >
                  <div className="flex items-center">
                    <div className="bg-oxfordBlue/10 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                      </svg>
                    </div>
                    <span className="font-medium">Privacy Policy</span>
                  </div>
                  <svg className="w-5 h-5 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
                
                {/* Terms of Service Link */}
                <div 
                  className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all flex justify-between items-center"
                  onClick={() => setActiveSection('terms-of-service')}
                >
                  <div className="flex items-center">
                    <div className="bg-oxfordBlue/10 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <span className="font-medium">Terms of Service</span>
                  </div>
                  <svg className="w-5 h-5 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setActiveSection(null)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors mr-4"
              >
                Back
              </button>
            </div>
          </div>
        );

      case 'privacy-policy':
        return (
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {renderPrivacyPolicy()}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setActiveSection('others')}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        );

      case 'terms-of-service':
        return (
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {renderTermsOfService()}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setActiveSection('others')}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6 text-white">{t('settings.title')}</h1>
        
        {activeSection ? (
          // Show detailed settings for active section
          <div className="bg-gentleGray rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-oxfordBlue mb-6">
              {activeSection === 'privacy-policy' ? t('settings.privacy_policy.title') : 
               activeSection === 'terms-of-service' ? t('settings.terms_of_service.title') : 
               activeSection === 'others' ? t('settings.sections.others.title') :
               t(`settings.sections.${activeSection}.title`)}
            </h2>
            {renderSettingsContent()}
          </div>
        ) : (
          // Show settings categories
          <div className="space-y-4">
            {/* Account Settings */}
            <div 
              className="bg-gentleGray rounded-xl shadow-md p-6 cursor-pointer transition-all hover:shadow-lg"
              onClick={() => setActiveSection('account')}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-oxfordBlue/10 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-oxfordBlue">{t('settings.sections.account.title')}</h2>
                    <p className="text-gray-600 mt-1">{t('settings.sections.account.description')}</p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
            
            {/* Notification Settings */}
            <div 
              className="bg-gentleGray rounded-xl shadow-md p-6 cursor-pointer transition-all hover:shadow-lg"
              onClick={() => setActiveSection('notifications')}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-oxfordBlue/10 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-oxfordBlue">{t('settings.sections.notifications.title')}</h2>
                    <p className="text-gray-600 mt-1">{t('settings.sections.notifications.description')}</p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
            
            {/* Privacy Settings */}
            <div 
              className="bg-gentleGray rounded-xl shadow-md p-6 cursor-pointer transition-all hover:shadow-lg"
              onClick={() => setActiveSection('privacy')}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-oxfordBlue/10 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-oxfordBlue">{t('settings.sections.privacy.title')}</h2>
                    <p className="text-gray-600 mt-1">{t('settings.sections.privacy.description')}</p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
            
            {/* Appearance Settings */}
            <div 
              className="bg-gentleGray rounded-xl shadow-md p-6 cursor-pointer transition-all hover:shadow-lg"
              onClick={() => setActiveSection('appearance')}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-oxfordBlue/10 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-oxfordBlue">{t('settings.sections.appearance.title')}</h2>
                    <p className="text-gray-600 mt-1">{t('settings.sections.appearance.description')}</p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
            
            {/* Session Settings */}
            <div 
              className="bg-gentleGray rounded-xl shadow-md p-6 cursor-pointer transition-all hover:shadow-lg"
              onClick={() => setActiveSection('sessions')}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-oxfordBlue/10 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-oxfordBlue">{t('settings.sections.sessions.title')}</h2>
                    <p className="text-gray-600 mt-1">{t('settings.sections.sessions.description')}</p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>

            {/* Others Section */}
            <div 
              className="bg-gentleGray rounded-xl shadow-md p-6 cursor-pointer transition-all hover:shadow-lg"
              onClick={() => setActiveSection('others')}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-oxfordBlue/10 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-oxfordBlue">{t('settings.sections.others.title')}</h2>
                    <p className="text-gray-600 mt-1">{t('settings.sections.others.description')}</p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;