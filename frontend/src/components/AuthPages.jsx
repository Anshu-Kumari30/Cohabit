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
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Airbnb-style centered card */}
        <div className="bg-white rounded-air shadow-air overflow-hidden">
          {/* Header — no gradient, just icon badge + text */}
          <div className="px-8 pt-10 pb-6 text-center">
            <div className="badge-air mx-auto mb-4">
              <Home className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-[#222222] tracking-tight">Cohabit</h1>
            <p className="text-[#717171] text-sm mt-1.5">
              {currentPage === 'login'
                ? 'Welcome back! Sign in to your account'
                : 'Create your account to get started'}
            </p>
          </div>

          {/* Tab Navigation - Pill style */}
          <div className="flex mx-6 p-1 bg-[#F7F7F7] rounded-pill border border-[#DDDDDD]">
            <button
              onClick={() => setCurrentPage('login')}
              className={`relative flex-1 py-2.5 px-4 text-sm font-semibold rounded-pill transition-all duration-200 ${
                currentPage === 'login'
                  ? 'bg-white text-[#222222] shadow-air-sm'
                  : 'text-[#717171] hover:text-[#222222]'
              }`}
            >
              <span className="relative z-10 flex items-center justify-center">
                <LogIn className="h-4 w-4 mr-1.5" />
                Sign In
              </span>
            </button>
            <button
              onClick={() => setCurrentPage('signup')}
              className={`relative flex-1 py-2.5 px-4 text-sm font-semibold rounded-pill transition-all duration-200 ${
                currentPage === 'signup'
                  ? 'bg-white text-[#222222] shadow-air-sm'
                  : 'text-[#717171] hover:text-[#222222]'
              }`}
            >
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

                    {errors.submit && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-red-500 text-sm text-center p-3 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center"
                      >
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        {errors.submit}
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-3 px-4 rounded-pill font-semibold text-sm tracking-wide transition-all duration-200 ${
                        isLoading
                          ? 'bg-gray-200 cursor-not-allowed text-gray-400'
                          : 'bg-coral-500 hover:bg-coral-600 text-white shadow-air-sm hover:shadow-air active:scale-[0.97]'
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
                    </button>
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
                            <span className="text-[#717171]">Password strength</span>
                            <span className={`font-medium ${
                              passwordStrength <= 2 ? 'text-red-500' :
                              passwordStrength === 3 ? 'text-yellow-600' :
                              passwordStrength >= 4 ? 'text-emerald-600' : 'text-emerald-600'
                            }`}>
                              {getPasswordStrengthText()}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                              className={`h-full rounded-full bg-gradient-to-r ${getPasswordStrengthColor()}`}
                              transition={{ duration: 0.4 }}
                            />
                          </div>
                          <div className="flex gap-1.5 flex-wrap">
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
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-gray-50 text-gray-400 border border-gray-200';
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
                          className="text-emerald-600 text-xs mt-1.5 flex items-center"
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
                        className="text-red-500 text-sm text-center p-3 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center"
                      >
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        {errors.submit}
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-3 px-4 rounded-pill font-semibold text-sm tracking-wide transition-all duration-200 ${
                        isLoading
                          ? 'bg-gray-200 cursor-not-allowed text-gray-400'
                          : 'bg-coral-500 hover:bg-coral-600 text-white shadow-air-sm hover:shadow-air active:scale-[0.97]'
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
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create Account
                        </span>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-[#DDDDDD]"></div>
              <span className="text-xs text-[#717171] font-medium tracking-wider uppercase">or continue with</span>
              <div className="flex-1 h-px bg-[#DDDDDD]"></div>
            </div>

            {/* Google Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center"
            >
              {process.env.REACT_APP_GOOGLE_CLIENT_ID ? (
                <div className="origin-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    size="large"
                    shape="pill"
                    text="continue_with"
                    theme="outline"
                    logo_alignment="center"
                  />
                </div>
              ) : (
                <div className="text-center px-4 py-3 rounded-xl bg-[#F7F7F7] border border-[#DDDDDD]">
                  <p className="text-[#717171] text-xs">
                    Google sign-in requires a Client ID. Set{' '}
                    <code className="text-coral-500 bg-coral-50 px-1 py-0.5 rounded">REACT_APP_GOOGLE_CLIENT_ID</code>
                    {' '}in your frontend .env
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-[#717171] text-xs">
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
      <label className="block text-xs font-medium text-[#717171] mb-1.5 tracking-wide uppercase">
        {label}
      </label>
      <div className="relative group">
        <div className={`relative flex items-center border-2 rounded-xl transition-all duration-200 ${
          error
            ? 'border-red-300 bg-red-50'
            : isFocused
              ? 'border-[#222222] bg-white'
              : hasValue
                ? 'border-[#DDDDDD] bg-white'
                : 'border-[#DDDDDD] bg-white hover:border-gray-300'
        }`}>
          <Icon className={`absolute left-3 h-4 w-4 transition-colors duration-200 ${
            error ? 'text-red-400' : isFocused ? 'text-[#222222]' : 'text-[#717171]'
          }`} />
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => setFocusedField(name)}
            onBlur={() => setFocusedField(null)}
            className="w-full pl-10 pr-10 py-3 bg-transparent rounded-xl focus:outline-none text-[#222222] text-sm placeholder-[#999999]"
            placeholder={placeholder}
            autoComplete={name === 'password' || name === 'confirmPassword' ? 'new-password' : 'off'}
          />
          {RightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className="absolute right-2 p-1.5 rounded-lg text-[#717171] hover:text-[#222222] transition-all"
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
          className="text-red-500 text-xs mt-1.5 flex items-center"
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