import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.returnTo || '/dashboard';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    const success = login(formData.email, formData.password);
    if (success) {
      navigate(from);
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-main-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-card-bg rounded-2xl shadow-premium-xl border border-border-gray p-8">
          {/* Logo Only */}
          <div className="flex justify-center mb-8">
            <img 
              src="/optinyxuslogo.png" 
              alt="OptiNyxus"
              className="h-20 w-auto"
            />
          </div>

          <h2 className="text-2xl font-bold text-primary-text mb-2 text-center">Welcome Back</h2>
          <p className="text-sm text-muted-text mb-6 text-center">Sign in to access your dashboard</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-primary-text mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-text" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-border-gray rounded-xl text-sm focus:outline-none focus:border-secondary-text focus:shadow-premium transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-primary-text mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-text" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-11 py-3 bg-white border border-border-gray rounded-xl text-sm focus:outline-none focus:border-secondary-text focus:shadow-premium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-text hover:text-primary-text transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-dark text-white rounded-xl font-semibold hover:shadow-premium-lg transition-all duration-300 transform hover:scale-[1.02]"
            >
              Sign In
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-muted-text">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-text font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
