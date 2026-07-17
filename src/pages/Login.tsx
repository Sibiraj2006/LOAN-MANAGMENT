import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import {
  Building2,
  Lock,
  Eye,
  EyeOff,
  Phone,
  ShieldCheck,
  User,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.success && data.token) {
        localStorage.setItem('auth_token', data.token);
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Login failed.');
      }
    },
    onError: (err) => {
      setError(err.message || 'Login failed. Please try again.');
    },
  });

  // Seed admin on first load
  const seedAdminMutation = trpc.auth.seedAdmin.useMutation();
  useEffect(() => {
    seedAdminMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
            <Building2 className="w-10 h-10 text-blue-400" />
          </div>
        
          <h1 className="text-2xl font-bold text-white tracking-wide uppercase">
            AURA LOAN MANAGEMENT
          </h1>
          <p className="text-blue-300 mt-1 text-sm">
            Collect. Connect. Empower Businesses.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">STAFF LOGIN</h2>
            <p className="text-sm text-slate-500 mt-1">Login to access your dashboard</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <Lock className="w-4 h-4 mr-2" />
              {loginMutation.isPending ? 'Logging in...' : 'LOGIN'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">Secure & Protected</p>
            <p className="text-xs text-slate-400">Your data is safe with us</p>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">Need Help?</p>
          <div className="flex items-center justify-center gap-2 mt-1 text-sm text-blue-300">
            <Phone className="w-4 h-4" />
            
            <span>Contact Support: +91 90802 09684</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Secure Authentication</span>
          </div>
          
          <p>&copy; 2026 Aura Loan Management. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}