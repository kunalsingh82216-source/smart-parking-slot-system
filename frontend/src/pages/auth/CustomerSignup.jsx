import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaLock, 
  FaCar,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaIdCard,
  FaCalendarAlt,
  FaCity,
  FaMapMarkerAlt,
  FaCreditCard,
  FaShieldAlt,
  FaKey,
  FaUserPlus,
  FaMotorcycle,
  FaTruck,
  FaGoogle,
  FaFacebook,
  FaApple,
  FaMobile
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const API_URL = "http://localhost:5000/api/auth";

const CustomerSignup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    vehicleNumber: '',
    vehicleType: 'Car',
    city: '',
    address: '',
    dateOfBirth: ''
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  // Modern color palette
  const colors = {
    primary: {
      from: '#0f172a',
      to: '#1e293b',
      light: '#f8fafc',
      dark: '#020617'
    },
    accent: {
      green: '#059669',
      blue: '#2563eb',
      purple: '#7c3aed',
      orange: '#ea580c',
      red: '#dc2626',
      yellow: '#d97706',
      teal: '#0d9488'
    }
  };

  // Check password strength
  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    const errors = [];

    if (password.length >= 8) {
      strength += 25;
    } else {
      errors.push("At least 8 characters");
    }

    if (/[A-Z]/.test(password)) {
      strength += 25;
    } else {
      errors.push("One uppercase letter");
    }

    if (/[0-9]/.test(password)) {
      strength += 25;
    } else {
      errors.push("One number");
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 25;
    } else {
      errors.push("One special character");
    }

    setPasswordStrength(strength);
    setPasswordErrors(errors);
  }, [formData.password]);

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name) newErrors.name = "Full name is required";
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
      if (!formData.phone) {
        newErrors.phone = "Phone number is required";
      } else if (formData.phone.length < 10) {
        newErrors.phone = "Invalid phone number";
      }
    }

    if (step === 2) {
      if (!formData.vehicleNumber) newErrors.vehicleNumber = "Vehicle number is required";
      if (!formData.city) newErrors.city = "City is required";
    }

    if (step === 3) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (passwordStrength < 100) {
        newErrors.password = "Password is not strong enough";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePhoneChange = (value) => {
    setFormData(prev => ({
      ...prev,
      phone: value
    }));
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(3)) return;
    if (!termsAccepted) {
      toast.error("Please accept terms and conditions");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(`${API_URL}/signup`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        vehicleNumber: formData.vehicleNumber,
        vehicleType: formData.vehicleType,
        city: formData.city,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        role: "customer"
      });

      toast.success(
        <div className="flex items-center">
          <FaCheckCircle className="text-green-500 mr-2" size={20} />
          <div>
            <p className="font-semibold">Registration Successful! 🎉</p>
            <p className="text-xs">Welcome to EZPark</p>
          </div>
        </div>
      );

      setTimeout(() => {
        navigate('/customer-login');
      }, 2000);

    } catch (error) {
      toast.error(
        <div className="flex items-center">
          <FaTimesCircle className="text-red-500 mr-2" size={20} />
          <div>
            <p className="font-semibold">Registration Failed</p>
            <p className="text-xs">{error.response?.data?.message || "Server error"}</p>
          </div>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  const getVehicleIcon = (type) => {
    switch(type) {
      case 'Car': return <FaCar />;
      case 'Bike': return <FaMotorcycle />;
      case 'Truck': return <FaTruck />;
      default: return <FaCar />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, #667eea 0%, #764ba2 50%, #059669 100%)` }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-green-500/20 to-teal-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl relative z-10"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
          
          {/* Header with Steps */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaCar className="text-white text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Create Account</h2>
                  <p className="text-indigo-100 text-sm">Join EZPark today</p>
                </div>
              </div>
              <div className="text-right text-white">
                <p className="text-sm">Step {currentStep} of 3</p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-between mt-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex-1 flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${currentStep >= step ? 'bg-white text-indigo-600' : 'bg-white/20 text-white'}`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`flex-1 h-1 mx-2 rounded
                      ${currentStep > step ? 'bg-white' : 'bg-white/20'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-white/70 mt-2">
              <span>Personal Info</span>
              <span>Vehicle Details</span>
              <span>Security</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                  
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaUser className="inline mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                        errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <FaTimesCircle className="mr-1" /> {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaEnvelope className="inline mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                        errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <FaTimesCircle className="mr-1" /> {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaPhone className="inline mr-2" />
                      Phone Number
                    </label>
                    <PhoneInput
                      country={'in'}
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      inputClass="!w-full !px-10 !py-3 !border !rounded-xl"
                      containerClass="!w-full"
                      buttonClass="!border-0 !bg-transparent !pl-3"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <FaTimesCircle className="mr-1" /> {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaCalendarAlt className="inline mr-2" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Details</h3>

                  {/* Vehicle Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Car', 'Bike', 'Truck'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({...formData, vehicleType: type})}
                          className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${
                            formData.vehicleType === type
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          <span className="text-2xl mb-2" style={{ 
                            color: formData.vehicleType === type ? '#4f46e5' : '#6b7280'
                          }}>
                            {getVehicleIcon(type)}
                          </span>
                          <span className="text-sm font-medium">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vehicle Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaCar className="inline mr-2" />
                      Vehicle Number
                    </label>
                    <input
                      type="text"
                      name="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.vehicleNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="MH12AB1234"
                      style={{ textTransform: 'uppercase' }}
                    />
                    {errors.vehicleNumber && (
                      <p className="text-red-500 text-xs mt-1">{errors.vehicleNumber}</p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaCity className="inline mr-2" />
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Mumbai"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaMapMarkerAlt className="inline mr-2" />
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Your full address"
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Security</h3>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaLock className="inline mr-2" />
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10 ${
                          errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Password Strength:</span>
                          <span className="text-xs font-semibold" style={{
                            color: passwordStrength < 50 ? '#dc2626' : passwordStrength < 75 ? '#d97706' : '#059669'
                          }}>
                            {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Medium' : 'Strong'}
                          </span>
                        </div>
                        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${passwordStrength}%` }}
                            className="h-full rounded-full"
                            style={{
                              background: passwordStrength < 50 ? '#dc2626' : passwordStrength < 75 ? '#d97706' : '#059669'
                            }}
                          />
                        </div>
                        {passwordErrors.length > 0 && (
                          <div className="mt-2 text-xs text-gray-600">
                            <p className="font-medium mb-1">Password must contain:</p>
                            <ul className="space-y-1">
                              {passwordErrors.map((err, idx) => (
                                <li key={idx} className="flex items-center text-red-500">
                                  <FaTimesCircle className="mr-1" size={10} />
                                  {err}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaKey className="inline mr-2" />
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10 ${
                          errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Re-enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <FaTimesCircle className="mr-1" /> Passwords do not match
                      </p>
                    )}
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-center mt-4">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                      I accept the{' '}
                      <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center"
                >
                  Next
                  <FaArrowRight className="ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !termsAccepted}
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="mr-2" />
                      Create Account
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="px-8 pb-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/customer-login" className="text-indigo-600 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
            
            {/* Social Signup */}
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-3">Or sign up with</p>
              <div className="flex justify-center space-x-4">
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <FaGoogle className="text-red-500" />
                </button>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <FaFacebook className="text-blue-600" />
                </button>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <FaApple className="text-gray-800" />
                </button>
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-400 mt-4">
              <FaShieldAlt className="text-green-500" />
              <span>256-bit SSL Encrypted</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerSignup;