import React, { useState, useEffect } from 'react';
import { Home, Eye, EyeOff, Mail, User, Lock, AlertCircle, CheckCircle2, LogIn, UserPlus } from 'lucide-react';

const AuthPages = ({ setIsAuthenticated }) => {
  const [currentPage, setCurrentPage] = useState('login');
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store user data (in real app, this would come from backend)
      const userData = {
        email: formData.email,
        name: formData.email.split('@')[0]
      };
      
      // Set authentication to true
      setIsAuthenticated(true);
      
    } catch (error) {
      setErrors({ submit: 'Login failed. Please check your credentials and try again.' });
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store user data (in real app, this would come from backend)
      const userData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`
      };
      
      // Set authentication to true
      setIsAuthenticated(true);
      
    } catch (error) {
      setErrors({ submit: 'Account creation failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    alert('Google authentication coming soon!');
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
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-64 h-64 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-blob animation-delay-4000"></div>
      </div>

      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-blue-500" style={{ boxShadow: '0 0 40px rgba(59, 130, 246, 0.5)' }}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-8 text-center">
          <div className="flex items-center justify-center mb-3">
            <Home className="h-10 w-10 text-white mr-3" />
            <h1 className="text-3xl font-bold text-white">Roommate Tracker</h1>
          </div>
          <p className="text-blue-100 text-sm">
            {currentPage === 'login' ? 'Welcome back! Please sign in to continue' : 'Create your account to get started'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 bg-gray-800">
          <button
            onClick={() => setCurrentPage('login')}
            className={`flex-1 py-4 px-4 text-sm font-medium transition-all ${
              currentPage === 'login'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-900'
                : 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
            }`}
          >
            <LogIn className="h-4 w-4 inline mr-2" />
            Sign In
          </button>
          <button
            onClick={() => setCurrentPage('signup')}
            className={`flex-1 py-4 px-4 text-sm font-medium transition-all ${
              currentPage === 'signup'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-900'
                : 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
            }`}
          >
            <UserPlus className="h-4 w-4 inline mr-2" />
            Sign Up
          </button>
        </div>

        <div className="p-8 bg-gray-900">
          {currentPage === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-800 border-2 ${
                        errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-lg focus:outline-none focus:ring-2 transition-all text-white placeholder-gray-500`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 bg-gray-800 border-2 ${
                        errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-lg focus:outline-none focus:ring-2 transition-all text-white placeholder-gray-500`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-800" />
                    <span className="ml-2 text-sm text-gray-300">Remember me</span>
                  </label>
                  <button type="button" className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                    Forgot password?
                  </button>
                </div>

                {errors.submit && (
                  <div className="text-red-500 text-sm text-center p-3 rounded-lg bg-red-900 bg-opacity-20 border border-red-500 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.submit}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                    isLoading
                      ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-blue-500/50 transform hover:-translate-y-0.5'
                  }`}
                  style={{ boxShadow: isLoading ? 'none' : '0 0 20px rgba(59, 130, 246, 0.4)' }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-800 border-2 ${
                          errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-lg focus:outline-none focus:ring-2 transition-all text-white placeholder-gray-500`}
                        placeholder="John"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-800 border-2 ${
                          errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-lg focus:outline-none focus:ring-2 transition-all text-white placeholder-gray-500`}
                        placeholder="Doe"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-800 border-2 ${
                        errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-lg focus:outline-none focus:ring-2 transition-all text-white placeholder-gray-500`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 bg-gray-800 border-2 ${
                        errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-lg focus:outline-none focus:ring-2 transition-all text-white placeholder-gray-500`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Password strength:</span>
                        <span className={`font-medium ${
                          passwordStrength <= 2 ? 'text-red-400' :
                          passwordStrength === 3 ? 'text-yellow-400' :
                          passwordStrength === 4 ? 'text-cyan-400' : 'text-blue-400'
                        }`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1 overflow-hidden">
                        <div
                          className={`h-2 bg-gradient-to-r ${getPasswordStrengthColor()} transition-all duration-500`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 bg-gray-800 border-2 ${
                        errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-lg focus:outline-none focus:ring-2 transition-all text-white placeholder-gray-500`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <p className="text-blue-400 text-sm mt-1 flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Passwords match
                    </p>
                  )}
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {errors.submit && (
                  <div className="text-red-500 text-sm text-center p-3 rounded-lg bg-red-900 bg-opacity-20 border border-red-500 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.submit}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                    isLoading
                      ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-blue-500/50 transform hover:-translate-y-0.5'
                  }`}
                  style={{ boxShadow: isLoading ? 'none' : '0 0 20px rgba(59, 130, 246, 0.4)' }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="px-4 text-sm text-gray-500">or continue with</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          <button
            onClick={handleGoogleAuth}
            className="w-full bg-gray-800 border-2 border-gray-700 text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-700 hover:border-blue-500 transition-all duration-300 flex items-center justify-center font-medium shadow-sm"
          >
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default AuthPages;