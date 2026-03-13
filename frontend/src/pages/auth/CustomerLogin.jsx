import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaEnvelope, 
  FaLock, 
  FaCar, 
  FaHome, 
  FaUserTie, 
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaFacebook,
  FaApple,
  FaArrowRight,
  FaCheckCircle,
  FaTimesCircle,
  FaMobile,
  FaQrcode,
  FaHeadphones,
  FaShieldVirus,
  FaFingerprint,
  FaClock,
  FaHistory
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const CustomerLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

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

  // Check for saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('customerEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Check login attempts
    if (loginAttempts >= 5) {
      toast.error(
        <div className="flex items-center">
          <FaClock className="mr-2 text-yellow-500" />
          <div>
            <p className="font-semibold">Too many attempts!</p>
            <p className="text-xs">Please try again after 5 minutes</p>
          </div>
        </div>
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      if (response.data.success) {
        // Reset login attempts on success
        setLoginAttempts(0);
        
        // Save email if remember me is checked
        if (rememberMe) {
          localStorage.setItem('customerEmail', formData.email);
        } else {
          localStorage.removeItem('customerEmail');
        }

        // Save user data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify({
          ...response.data.user,
          lastLogin: new Date().toISOString()
        }));

        toast.success(
          <div className="flex items-center">
            <FaCheckCircle className="text-green-500 mr-2" size={20} />
            <div>
              <p className="font-semibold">Welcome back! 🎉</p>
              <p className="text-xs">Login successful</p>
            </div>
          </div>
        );

        // Redirect with animation delay
        setTimeout(() => {
          navigate("/customer/dashboard");
        }, 1000);
      }

    } catch (error) {
      // Increment login attempts on failure
      setLoginAttempts(prev => prev + 1);

      toast.error(
        <div className="flex items-center">
          <FaTimesCircle className="text-red-500 mr-2" size={20} />
          <div>
            <p className="font-semibold">Login Failed</p>
            <p className="text-xs">{error.response?.data?.message || "Invalid credentials"}</p>
            <p className="text-xs mt-1">Attempts left: {4 - loginAttempts}</p>
          </div>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      // Simulate password reset
      setResetSent(true);
      toast.success(
        <div className="flex items-center">
          <FaCheckCircle className="text-green-500 mr-2" />
          <div>
            <p className="font-semibold">Reset link sent!</p>
            <p className="text-xs">Check your email inbox</p>
          </div>
        </div>
      );
      
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetSent(false);
        setResetEmail('');
      }, 3000);
    } catch (error) {
      toast.error("Failed to send reset link");
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
        
        {/* Floating Cars */}
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-20 left-10 text-white/10 text-6xl"
        >
          <FaCar />
        </motion.div>
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute bottom-20 right-10 text-white/10 text-6xl"
        >
          <FaCar />
        </motion.div>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
          
          {/* Header with Icon */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl border-4 border-white"
            >
              <FaCar className="text-5xl text-indigo-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white">Welcome Back!</h2>
            <p className="text-indigo-100 text-sm mt-1">Sign in to your parking account</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2 text-gray-400" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all pr-10 ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="customer@example.com"
                  />
                  {formData.email && !errors.email && (
                    <FaCheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                  )}
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-xs mt-1 flex items-center"
                  >
                    <FaTimesCircle className="mr-1" size={10} />
                    {errors.email}
                  </motion.p>
                )}
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaLock className="inline mr-2 text-gray-400" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all pr-10 ${
                      errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-xs mt-1 flex items-center"
                  >
                    <FaTimesCircle className="mr-1" size={10} />
                    {errors.password}
                  </motion.p>
                )}
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-between"
              >
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Forgot Password?
                </button>
              </motion.div>

              {/* Login Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging in...
                  </>
                ) : (
                  <>
                    Sign In
                    <FaArrowRight className="ml-2" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Sign Up Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-center"
            >
              <p className="text-gray-600">
                New to EZPark?{' '}
                <Link to="/customer-signup" className="text-indigo-600 font-semibold hover:underline">
                  Create Account
                </Link>
              </p>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 space-y-4"
            >
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Quick actions:</span>
                <div className="flex space-x-3">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <FaQrcode className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <FaMobile className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <FaHeadphones className="text-gray-600" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-3 gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
              >
                <FaGoogle className="text-red-500 text-xl mx-auto" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
              >
                <FaFacebook className="text-blue-600 text-xl mx-auto" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
              >
                <FaApple className="text-gray-800 text-xl mx-auto" />
              </motion.button>
            </div>

            {/* Other Portals */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600 mb-3">Access other portals</p>
              <div className="flex justify-center space-x-4">
                <Link 
                  to="/admin-login" 
                  className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all text-sm"
                >
                  <FaShieldAlt className="mr-2" />
                  Admin
                </Link>
                <Link 
                  to="/manager-login" 
                  className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm"
                >
                  <FaUserTie className="mr-2" />
                  Manager
                </Link>
                <Link 
                  to="/" 
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm"
                >
                  <FaHome className="mr-2" />
                  Home
                </Link>
              </div>
            </div>

            {/* Security Badges */}
            <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-400">
              <div className="flex items-center">
                <FaShieldVirus className="mr-1 text-green-500" />
                <span>SSL Secure</span>
              </div>
              <div className="flex items-center">
                <FaFingerprint className="mr-1 text-purple-500" />
                <span>2FA Ready</span>
              </div>
              <div className="flex items-center">
                <FaHistory className="mr-1 text-blue-500" />
                <span>Activity Log</span>
              </div>
            </div>
          </div>
        </div>

        {/* Forgot Password Modal */}
        <AnimatePresence>
          {showForgotPassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowForgotPassword(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">Reset Password</h3>
                
                {resetSent ? (
                  <div className="text-center py-4">
                    <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-3" />
                    <p className="text-gray-600">Reset link sent to your email!</p>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600 mb-4">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowForgotPassword(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleForgotPassword}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Send Reset Link
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CustomerLogin;