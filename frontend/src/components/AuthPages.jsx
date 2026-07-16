import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { Home, Eye, EyeOff, Mail, User, Lock, AlertCircle, CheckCircle2, LogIn, UserPlus, Sparkles } from 'lucide-react';
import { authAPI } from '../services/api';

const AuthPages = ({ setIsAuthenticated, initialPage = 'login' }) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    setPasswordStrength(0);
  }, [currentPage]);

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateLoginForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignupForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength < 3) {
      newErrors.password = 'Please create a stronger password';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleLogin = async (e) => {
  e?.preventDefault?.();
  
  if (!validateLoginForm()) {
    return;
  }

  setIsLoading(true);

  try {
    const data = await authAPI.login(formData.email, formData.password);

    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setIsAuthenticated(true);
    } else {
      setErrors({ submit: data.message || 'Login failed' });
    }
  } catch (error) {
    console.error('Login error:', error);
    const msg = error?.response?.data?.message || 'Login failed. Please try again.';
    setErrors({ submit: msg });
  } finally {
    setIsLoading(false);
  }
};

  const handleSignup = async (e) => {
  e?.preventDefault?.();
  
  if (!validateSignupForm()) {
    return;
  }

  setIsLoading(true);

  try {
    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    const data = await authAPI.register(userData);

    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setIsAuthenticated(true);
    } else {
      setErrors({ submit: data.message || 'Signup failed' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    const msg = error?.response?.data?.message || 'Account creation failed. Please try again.';
    setErrors({ submit: msg });
  } finally {
    setIsLoading(false);
  }
};

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      setErrors({});
      const data = await authAPI.googleLogin(credentialResponse.credential);
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsAuthenticated(true);
      } else {
        setErrors({ submit: data.message || 'Google sign-in failed' });
      }
    } catch (error) {
      console.error('Google auth error:', error);
      const msg = error?.response?.data?.message || 'Google sign-in failed. Please try again.';
      setErrors({ submit: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrors({ submit: 'Google sign-in was cancelled or failed. Please try again.' });
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'from-red-500 to-red-600';
    if (passwordStrength === 3) return 'from-yellow-400 to-orange-500';
    if (passwordStrength === 4) return 'from-emerald-400 to-emerald-600';
    return 'from-green-500 to-emerald-600';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength === 3) return 'Fair';
    if (passwordStrength === 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDuration: '6s' }}></div>
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glass card container */}
        <div className="backdrop-blur-xl bg-gray-900/80 rounded-3xl shadow-2xl overflow-hidden border border-blue-500/20"
          style={{ boxShadow: '0 0 60px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(59, 130, 246, 0.1)' }}
        >
          {/* Animated gradient header */}
          <div className="relative overflow-hidden px-8 pt-10 pb-8 text-center bg-gradient-to-br from-blue-600/90 via-blue-700/50 to-cyan-600/30">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.3),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.2),transparent_50%)]"></div>
            
            {/* Logo icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4"
            >
              <Home className="h-8 w-8 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white tracking-tight"
            >
              Cohabit
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-blue-200/80 text-sm mt-1.5 font-light"
            >
              {currentPage === 'login'
                ? 'Welcome back! Sign in to your account'
                : 'Create your account to get started'}
            </motion.p>
          </div>

          {/* Tab Navigation - Pill style */}
          <div className="flex mx-6 mt-6 p-1 bg-gray-800/80 rounded-2xl border border-gray-700/50">
            <button
              onClick={() => setCurrentPage('login')}
              className={`relative flex-1 py-2.5 px-4 text-sm font-medium rounded-xl transition-all duration-300 ${
                currentPage === 'login'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {currentPage === 'login' && (
                <motion.div
                  layoutId="auth-tab-bg"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center">
                <LogIn className="h-4 w-4 mr-1.5" />
                Sign In
              </span>
            </button>
            <button
              onClick={() => setCurrentPage('signup')}
              className={`relative flex-1 py-2.5 px-4 text-sm font-medium rounded-xl transition-all duration-300 ${
                currentPage === 'signup'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {currentPage === 'signup' && (
                <motion.div
                  layoutId="auth-tab-bg"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center">
                <UserPlus className="h-4 w-4 mr-1.5" />
                Sign Up
              </span>
            </button>
          </div>

          {/* Form container */}
          <div className="px-6 pb-8 pt-6">
            <AnimatePresence mode="wait">
              {currentPage === 'login' ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleLogin}
                >
                  <div className="space-y-4">
                    <InputField
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={errors.email}
                      icon={Mail}
                      placeholder="you@example.com"
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />
                    <InputField
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      error={errors.password}
                      icon={Lock}
                      placeholder="Enter your password"
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                      rightIcon={showPassword ? EyeOff : Eye}
                      onRightIconClick={() => setShowPassword(!showPassword)}
                    />

                    <div className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer group">
                        <div className="relative">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-4 h-4 rounded border border-gray-600 bg-gray-800 peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all group-hover:border-gray-500"></div>
                          <CheckCircle2 className="absolute inset-0 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="ml-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
                      </label>
                      <button type="button" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                        Forgot password?
                      </button>
                    </div>

                    {errors.submit && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-red-400 text-sm text-center p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center"
                      >
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        {errors.submit}
                      </motion.div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={!isLoading ? { scale: 1.01 } : {}}
                      whileTap={!isLoading ? { scale: 0.99 } : {}}
                      className={`w-full py-3 px-4 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 relative overflow-hidden ${
                        isLoading
                          ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25'
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Signing in...
                        </div>
                      ) : (
                        <span className="flex items-center justify-center">
                          <LogIn className="h-4 w-4 mr-2" />
                          Sign In
                        </span>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSignup}
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <InputField
                        label="First Name"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        error={errors.firstName}
                        icon={User}
                        placeholder="First name"
                        focusedField={focusedField}
                        setFocusedField={setFocusedField}
                      />
                      <InputField
                        label="Last Name"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        error={errors.lastName}
                        icon={User}
                        placeholder="Last name"
                        focusedField={focusedField}
                        setFocusedField={setFocusedField}
                      />
                    </div>

                    <InputField
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={errors.email}
                      icon={Mail}
                      placeholder="you@example.com"
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />

                    <InputField
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      error={errors.password}
                      icon={Lock}
                      placeholder="Create a strong password"
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                      rightIcon={showPassword ? EyeOff : Eye}
                      onRightIconClick={() => setShowPassword(!showPassword)}
                    >
                      {formData.password && (
                        <div className="mt-2 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Password strength</span>
                            <span className={`font-medium ${
                              passwordStrength <= 2 ? 'text-red-400' :
                              passwordStrength === 3 ? 'text-yellow-400' :
                              passwordStrength === 4 ? 'text-emerald-400' : 'text-emerald-400'
                            }`}>
                              {getPasswordStrengthText()}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                              className={`h-full rounded-full bg-gradient-to-r ${getPasswordStrengthColor()}`}
                              transition={{ duration: 0.4 }}
                            />
                          </div>
                          <div className="flex gap-1.5">
                            {['Lowercase', 'Uppercase', 'Number', 'Symbol', '8+ chars'].map((label, i) => (
                              <span key={label} className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                (() => {
                                  const checks = [
                                    /[a-z]/.test(formData.password),
                                    /[A-Z]/.test(formData.password),
                                    /\d/.test(formData.password),
                                    /[^a-zA-Z0-9]/.test(formData.password),
                                    formData.password.length >= 8
                                  ];
                                  return checks[i]
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-gray-800 text-gray-600 border border-gray-700';
                                })()
                              }`}>{label}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </InputField>

                    <InputField
                      label="Confirm Password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      error={errors.confirmPassword}
                      icon={Lock}
                      placeholder="Confirm your password"
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                      rightIcon={showConfirmPassword ? EyeOff : Eye}
                      onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-emerald-400 text-xs mt-1.5 flex items-center"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Passwords match
                        </motion.p>
                      )}
                    </InputField>

                    {errors.submit && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-red-400 text-sm text-center p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center"
                      >
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        {errors.submit}
                      </motion.div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={!isLoading ? { scale: 1.01 } : {}}
                      whileTap={!isLoading ? { scale: 0.99 } : {}}
                      className={`w-full py-3 px-4 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 relative overflow-hidden ${
                        isLoading
                          ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25'
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Creating account...
                        </div>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Create Account
                        </span>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
              <span className="text-xs text-gray-500 font-medium tracking-wider uppercase">or continue with</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
            </div>

            {/* Google Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center"
            >
              {process.env.REACT_APP_GOOGLE_CLIENT_ID ? (
                <div className="scale-110 origin-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    size="large"
                    shape="pill"
                    text="continue_with"
                    theme="filled_black"
                  />
                </div>
              ) : (
                <div className="text-center px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50">
                  <p className="text-gray-500 text-xs">
                    Google sign-in requires a Client ID. Set{' '}
                    <code className="text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded">REACT_APP_GOOGLE_CLIENT_ID</code>
                    {' '}in your frontend .env
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-gray-600 text-xs">
          © 2026 Cohabit. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

// ─── Reusable Input Field Component ───
const InputField = ({ label, name, type, value, onChange, error, icon: Icon, placeholder, focusedField, setFocusedField, children, rightIcon: RightIcon, onRightIconClick }) => {
  const isFocused = focusedField === name;
  const hasValue = value.length > 0;

  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5 tracking-wide uppercase">
        {label}
      </label>
      <div className={`relative group transition-all duration-200 ${
        isFocused ? 'scale-[1.01]' : ''
      }`}>
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 transition-opacity duration-300 ${
          isFocused ? 'opacity-100' : ''
        }`}></div>
        <div className={`relative flex items-center border-2 rounded-xl transition-all duration-200 ${
          error
            ? 'border-red-500/60 bg-red-500/5'
            : isFocused
              ? 'border-blue-500/60 bg-gray-800/90'
              : hasValue
                ? 'border-gray-600/50 bg-gray-800/50'
                : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600/50'
        }`}>
          <Icon className={`absolute left-3 h-4 w-4 transition-colors duration-200 ${
            error ? 'text-red-400' : isFocused ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-400'
          }`} />
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => setFocusedField(name)}
            onBlur={() => setFocusedField(null)}
            className="w-full pl-10 pr-10 py-3 bg-transparent rounded-xl focus:outline-none text-white text-sm placeholder-gray-600"
            placeholder={placeholder}
            autoComplete={name === 'password' || name === 'confirmPassword' ? 'new-password' : 'off'}
          />
          {RightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className="absolute right-2 p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-gray-700/50 transition-all"
              tabIndex={-1}
            >
              <RightIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs mt-1.5 flex items-center"
        >
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </motion.p>
      )}
      {children}
    </div>
  );
};

export default AuthPages;