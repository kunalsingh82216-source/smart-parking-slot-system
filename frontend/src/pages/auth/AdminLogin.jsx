import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaEnvelope, 
  FaLock, 
  FaUserShield, 
  FaUsers,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaShieldAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaSignInAlt,
  FaKey
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import '../../styles/auth.css';

// ============================================================================
// PROJECT: Parking Management System
// MODULE: Admin Authentication
// FILE: AdminLogin.jsx
// DESCRIPTION: Secure admin login component with advanced security features
// ============================================================================

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

/**
 * Security configuration constants
 * @constant
 */
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 60, // seconds
  MIN_PASSWORD_LENGTH: 6,
  TOAST_DURATION: 3000,
  ERROR_TOAST_DURATION: 4000
};

/**
 * Local storage keys for data persistence
 * @constant
 */
const STORAGE_KEYS = {
  ADMIN_EMAIL: 'adminEmail',
  USER: 'user',
  TOKEN: 'token',
  LOGIN_TIME: 'loginTime'
};

/**
 * Application routes
 * @constant
 */
const ROUTES = {
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_FORGOT_PASSWORD: '/admin/forgot-password',
  CUSTOMER_LOGIN: '/customer/login',
  MANAGER_LOGIN: '/manager/login'
};

/**
 * API endpoints
 * @constant
 */
const API_ENDPOINTS = {
  ADMIN_LOGIN: '/auth/admin/login'
};

// ============================================================================
// ANIMATION CONFIGURATION
// ============================================================================

/**
 * Animation variants for Framer Motion
 * @constant
 */
const ANIMATIONS = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  staggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  scaleIn: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { delay: 0.2, type: "spring", stiffness: 260, damping: 20 }
  },
  backgroundAnimation1: {
    scale: [1, 1.2, 1],
    rotate: [0, 90, 0],
    opacity: [0.1, 0.2, 0.1]
  },
  backgroundAnimation2: {
    scale: [1, 1.3, 1],
    rotate: [0, -90, 0],
    opacity: [0.1, 0.15, 0.1]
  },
  slideIn: {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: 'auto' },
    exit: { opacity: 0, height: 0 }
  }
};

// ============================================================================
// STYLES & THEME
// ============================================================================

/**
 * CSS class names for consistent styling
 * @constant
 */
const STYLES = {
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
  input: {
    base: 'w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all',
    error: 'border-red-500 bg-red-50',
    normal: 'border-gray-300',
    withIcon: 'pl-10'
  },
  button: {
    base: 'w-full py-4 px-4 rounded-xl font-semibold text-white shadow-lg flex items-center justify-center transition-all',
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
    disabled: 'bg-gray-400 cursor-not-allowed'
  },
  card: 'bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200',
  iconContainer: 'absolute -bottom-12 w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-white'
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * AdminLogin Component
 * 
 * Provides secure authentication interface for administrators with:
 * - Form validation
 * - Account lockout after failed attempts
 * - Remember me functionality
 * - Password visibility toggle
 * - Animated UI feedback
 * 
 * @component
 * @example
 * return (
 *   <AdminLogin />
 * )
 */
const AdminLogin = () => {
  const navigate = useNavigate();
  
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  
  /** Form data state */
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });
  
  /** UI state */
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  /** Validation state */
  const [errors, setErrors] = useState({});
  
  /** Security state */
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  // ==========================================================================
  // LIFECYCLE METHODS
  // ==========================================================================

  /**
   * Check for saved credentials on component mount
   * Implements "Remember Me" functionality
   */
  useEffect(() => {
    const savedEmail = localStorage.getItem(STORAGE_KEYS.ADMIN_EMAIL);
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  /**
   * Handle account lockout timer countdown
   * Automatically unlocks account after duration expires
   */
  useEffect(() => {
    let timer;
    
    if (isLocked && lockTimer > 0) {
      timer = setInterval(() => {
        setLockTimer(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setLoginAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLocked, lockTimer]);

  // ==========================================================================
  // VALIDATION FUNCTIONS
  // ==========================================================================

  /**
   * Validates the login form inputs
   * Checks email format and password length
   * 
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = useCallback(() => {
    const validationErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      validationErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      validationErrors.password = 'Password is required';
    } else if (formData.password.length < SECURITY_CONFIG.MIN_PASSWORD_LENGTH) {
      validationErrors.password = `Password must be at least ${SECURITY_CONFIG.MIN_PASSWORD_LENGTH} characters`;
    }
    
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [formData]);

  // ==========================================================================
  // EVENT HANDLERS
  // ==========================================================================

  /**
   * Handles input field changes
   * Clears validation error for the field being edited
   * 
   * @param {Object} e - Input change event
   */
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  /**
   * Handles form submission
   * Implements security checks and API integration
   * 
   * @param {Object} e - Form submit event
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Check if account is locked
    if (isLocked) {
      toast.error(`Account locked. Please try again in ${lockTimer} seconds`);
      return;
    }

    // Validate form inputs
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await api.post(API_ENDPOINTS.ADMIN_LOGIN, formData);

      if (response?.data?.success) {
        handleLoginSuccess(response.data);
      } else {
        throw new Error('Login failed');
      }

    } catch (error) {
      handleLoginError(error);
    } finally {
      setLoading(false);
    }
  }, [formData, isLocked, lockTimer, validateForm]);

  /**
   * Handles successful login
   * Stores user data and redirects to dashboard
   * 
   * @param {Object} data - Login response data
   */
  const handleLoginSuccess = useCallback((data) => {
    // Reset login attempts on success
    setLoginAttempts(0);
    
    // Save email if remember me is checked
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_EMAIL, formData.email);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_EMAIL);
    }

    // Prepare admin data with additional metadata
    const adminData = {
      ...data.admin,
      role: 'admin',
      lastLogin: new Date().toISOString(),
      loginTime: Date.now()
    };

    // Save authentication data
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(adminData));
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(STORAGE_KEYS.LOGIN_TIME, new Date().toISOString());

    // Show success notification
    toast.success(
      <div className="flex items-center">
        <FaCheckCircle className="text-green-500 mr-2" size={20} />
        <div>
          <p className="font-semibold">Welcome back, Administrator! 🎉</p>
          <p className="text-xs opacity-90">Successfully logged in to dashboard</p>
        </div>
      </div>,
      { duration: SECURITY_CONFIG.TOAST_DURATION }
    );

    // Navigate to admin dashboard
    navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
  }, [rememberMe, formData.email, navigate]);

  /**
   * Handles login errors
   * Implements account lockout after max attempts
   * 
   * @param {Object} error - Error object from API
   */
  const handleLoginError = useCallback((error) => {
    // Increment login attempts on failure
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    
    // Lock account after max attempts
    if (newAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      setIsLocked(true);
      setLockTimer(SECURITY_CONFIG.LOCKOUT_DURATION);
      
      toast.error(
        <div className="flex items-center">
          <FaExclamationTriangle className="text-yellow-500 mr-2" size={20} />
          <div>
            <p className="font-semibold">Account Temporarily Locked</p>
            <p className="text-xs">Too many failed attempts. Try again in {SECURITY_CONFIG.LOCKOUT_DURATION} seconds</p>
          </div>
        </div>
      );
    } else {
      const remainingAttempts = SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - newAttempts;
      const errorMessage = error.response?.data?.message || 'Invalid email or password';
      
      toast.error(
        <div className="flex items-center">
          <FaTimesCircle className="text-red-500 mr-2" size={20} />
          <div>
            <p className="font-semibold">Authentication Failed</p>
            <p className="text-xs">{errorMessage}</p>
            <p className="text-xs mt-1">Attempts remaining: {remainingAttempts}</p>
          </div>
        </div>,
        { duration: SECURITY_CONFIG.ERROR_TOAST_DURATION }
      );
    }
  }, [loginAttempts]);

  // ==========================================================================
  // RENDER METHODS
  // ==========================================================================

  /**
   * Renders lockout notification when account is locked
   */
  const renderLockoutNotification = useCallback(() => (
    <AnimatePresence>
      {isLocked && (
        <motion.div
          variants={ANIMATIONS.slideIn}
          initial="initial"
          animate="animate"
          exit="exit"
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl overflow-hidden"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center text-red-600">
            <FaLock className="mr-2" />
            <span className="font-medium">Account Temporarily Locked</span>
          </div>
          <p className="text-sm text-red-500 mt-1">
            For security reasons, please wait {lockTimer} seconds before trying again
          </p>
          <div className="w-full bg-red-200 h-1 mt-2 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: lockTimer, ease: "linear" }}
              className="h-full bg-red-600"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  ), [isLocked, lockTimer]);

  /**
   * Renders email input field with validation
   */
  const renderEmailField = useCallback(() => (
    <motion.div variants={ANIMATIONS.fadeInUp}>
      <label 
        htmlFor="email"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Email Address
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaEnvelope className="text-gray-400" />
        </div>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`${STYLES.input.base} ${
            errors.email ? STYLES.input.error : STYLES.input.normal
          }`}
          placeholder="admin@example.com"
          disabled={isLocked}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          autoComplete="email"
          autoFocus
        />
        {formData.email && !errors.email && (
          <FaCheckCircle 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" 
            aria-hidden="true"
          />
        )}
      </div>
      {errors.email && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xs mt-1 flex items-center"
          id="email-error"
          role="alert"
        >
          <FaExclamationTriangle className="mr-1" size={10} aria-hidden="true" />
          {errors.email}
        </motion.p>
      )}
    </motion.div>
  ), [formData.email, errors.email, handleInputChange, isLocked]);

  /**
   * Renders password input field with visibility toggle
   */
  const renderPasswordField = useCallback(() => (
    <motion.div variants={ANIMATIONS.fadeInUp}>
      <label 
        htmlFor="password"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Password
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaLock className="text-gray-400" />
        </div>
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className={`${STYLES.input.base} pr-10 ${
            errors.password ? STYLES.input.error : STYLES.input.normal
          }`}
          placeholder="••••••••"
          disabled={isLocked}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(prev => !prev)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {errors.password && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xs mt-1 flex items-center"
          id="password-error"
          role="alert"
        >
          <FaExclamationTriangle className="mr-1" size={10} aria-hidden="true" />
          {errors.password}
        </motion.p>
      )}
    </motion.div>
  ), [formData.password, errors.password, showPassword, handleInputChange, isLocked]);

  /**
   * Renders remember me checkbox and forgot password link
   */
  const renderOptions = useCallback(() => (
    <motion.div 
      variants={ANIMATIONS.fadeInUp} 
      className="flex items-center justify-between"
    >
      <label className="flex items-center cursor-pointer group">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2 focus:ring-offset-2"
          aria-label="Remember me on this device"
        />
        <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
          Remember me
        </span>
      </label>
      <Link 
        to={ROUTES.ADMIN_FORGOT_PASSWORD}
        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
      >
        Forgot Password?
      </Link>
    </motion.div>
  ), [rememberMe]);

  /**
   * Renders submit button with loading state
   */
  const renderSubmitButton = useCallback(() => (
    <motion.button
      type="submit"
      disabled={loading || isLocked}
      whileHover={{ scale: loading || isLocked ? 1 : 1.02 }}
      whileTap={{ scale: loading || isLocked ? 1 : 0.98 }}
      className={`${STYLES.button.base} ${
        loading || isLocked ? STYLES.button.disabled : STYLES.button.primary
      }`}
      aria-busy={loading}
    >
      {loading ? (
        <>
          <svg 
            className="animate-spin h-5 w-5 mr-3" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
              fill="none" 
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
            />
          </svg>
          <span>Authenticating...</span>
        </>
      ) : (
        <>
          <FaSignInAlt className="mr-2" aria-hidden="true" />
          <span>Login to Dashboard</span>
        </>
      )}
    </motion.button>
  ), [loading, isLocked]);

  /**
   * Renders portal switcher for different user types
   */
  const renderPortalSwitcher = useCallback(() => (
    <motion.div 
      variants={ANIMATIONS.fadeInUp} 
      className="mt-8 pt-6 border-t border-gray-200"
    >
      <p className="text-center text-sm text-gray-500 mb-4">
        Switch to other portals
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Link
          to={ROUTES.CUSTOMER_LOGIN}
          className="flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-all group focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <FaUsers className="mr-2 text-blue-500" aria-hidden="true" />
          <span className="text-sm font-medium">Customer</span>
          <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-all text-xs" aria-hidden="true" />
        </Link>
        <Link
          to={ROUTES.MANAGER_LOGIN}
          className="flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-all group focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <FaUserShield className="mr-2 text-purple-500" aria-hidden="true" />
          <span className="text-sm font-medium">Manager</span>
          <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-all text-xs" aria-hidden="true" />
        </Link>
      </div>
    </motion.div>
  ), []);

  /**
   * Renders security footer with encryption info
   */
  const renderSecurityFooter = useCallback(() => (
    <motion.div variants={ANIMATIONS.fadeInUp} className="mt-6 text-center">
      <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
        <FaShieldAlt className="text-green-500" aria-hidden="true" />
        <span>256-bit SSL Encrypted</span>
        <span className="mx-2" aria-hidden="true">•</span>
        <FaKey className="text-yellow-500" aria-hidden="true" />
        <span>Secure Authentication</span>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        ⚡ Authorized personnel only • All activities are logged
      </p>
    </motion.div>
  ), []);

  /**
   * Renders system status badge
   */
  const renderSystemStatus = useCallback(() => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9 }}
      className="mt-4 text-center"
    >
      <span 
        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
        role="status"
        aria-label="System status: online"
      >
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" aria-hidden="true"></span>
        System Status: Online
      </span>
    </motion.div>
  ), []);

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: STYLES.background }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          animate={ANIMATIONS.backgroundAnimation1}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={ANIMATIONS.backgroundAnimation2}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-green-500/10 to-teal-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Main Login Card */}
      <motion.div
        variants={ANIMATIONS.staggerChildren}
        initial="initial"
        animate="animate"
        className="w-full max-w-md relative z-10"
      >
        <div className={STYLES.card}>
          
          {/* Header with Icon */}
          <div className="relative h-32 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
            <motion.div
              variants={ANIMATIONS.scaleIn}
              className={STYLES.iconContainer}
            >
              <FaUserShield className="text-5xl text-indigo-600" aria-hidden="true" />
            </motion.div>
          </div>

          {/* Form Container */}
          <div className="pt-16 px-8 pb-8">
            
            {/* Title Section */}
            <motion.div variants={ANIMATIONS.fadeInUp} className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Admin <span className="text-indigo-600">Login</span>
              </h1>
              <p className="text-gray-500 text-sm">
                Secure access to parking management system
              </p>
            </motion.div>

            {/* Lock Status Notification */}
            {renderLockoutNotification()}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {renderEmailField()}
              {renderPasswordField()}
              {renderOptions()}
              {renderSubmitButton()}
            </form>

            {/* Portal Switcher */}
            {renderPortalSwitcher()}

            {/* Security Footer */}
            {renderSecurityFooter()}
          </div>
        </div>

        {/* System Status Badge */}
        {renderSystemStatus()}
      </motion.div>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default AdminLogin;