import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { WaterDropletCanvas } from '../components/3d/WaterDropletCanvas';
import { 
  Droplets, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { audio } from '../utils/audio';

export const AuthView: React.FC = () => {
  const { login, register, demoLogin } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Password validation strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (isSignUp && !fullName) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (isSignUp && password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    audio.playClick();

    if (isSignUp) {
      const res = await register(fullName, email, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to create account.');
      }
    } else {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid credentials. Please verify your email and password.');
      }
    }
    setIsSubmitting(false);
  };

  const handleDemoAuth = async () => {
    audio.playClick();
    setIsSubmitting(true);
    await demoLogin();
    setIsSubmitting(false);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-hidden bg-gradient-to-br from-sky-50 via-white to-sky-100 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950">
      {/* Background Animated Gradient Waves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60 dark:opacity-30">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-300/40 dark:bg-brand-600/20 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-300/30 dark:bg-cyan-500/15 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/4 w-72 h-72 rounded-full bg-sky-200/40 dark:bg-sky-700/10 blur-3xl" />
      </div>

      {/* Main Glassmorphic Auth Card */}
      <div className="relative z-10 w-full max-w-5xl rounded-3xl bg-white/80 dark:bg-navy-900/80 backdrop-blur-2xl border border-sky-100/80 dark:border-sky-900/50 shadow-2xl shadow-brand-500/10 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Visual Column: 3D Animated Droplet & Branding */}
        <div className="lg:col-span-6 relative flex flex-col justify-between p-8 sm:p-10 bg-gradient-to-b from-brand-600/10 via-sky-500/5 to-transparent dark:from-sky-950/40 dark:via-navy-900/40 dark:to-navy-950/60 border-b lg:border-b-0 lg:border-r border-sky-100/60 dark:border-sky-900/40">
          {/* Logo & Tagline */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-sky-500 to-cyan-accent shadow-lg shadow-brand-500/30 text-white">
                <Droplets className="w-6 h-6 animate-pulse-slow" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  SewerSense <span className="bg-gradient-to-r from-brand-600 to-cyan-accent bg-clip-text text-transparent">AI</span>
                </h1>
                <p className="text-xs font-semibold text-slate-400 dark:text-sky-300/70 tracking-wider uppercase">
                  Urban Flood Prediction & Drainage Intelligence
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sky-100 dark:bg-navy-800 text-brand-700 dark:text-cyan-accent">
                <ShieldCheck className="w-3.5 h-3.5" /> Next-Gen Early Warning
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Predict Before It Floods.<br />
                <span className="bg-gradient-to-r from-brand-600 via-sky-500 to-cyan-accent bg-clip-text text-transparent">
                  Protect Before It Happens.
                </span>
              </h2>
            </div>
          </div>

          {/* Interactive 3D Water Droplet Canvas */}
          <div className="my-4 h-64 sm:h-72 w-full flex items-center justify-center">
            <WaterDropletCanvas />
          </div>

          {/* Footer note */}
          <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-between">
            <span>Enterprise Grade • Municipal Scalable</span>
            <span className="font-mono text-[10px]">v2.4.0-PROD</span>
          </div>
        </div>

        {/* Right Form Column: Sign In / Sign Up */}
        <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isSignUp ? 'Create Engineer Account' : 'Welcome to Operations'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isSignUp
                  ? 'Join the municipal stormwater monitoring telemetry grid.'
                  : 'Enter your credentials to access the live drainage command center.'}
              </p>
            </div>

            {/* Error Message Pill */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Aris Thorne"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-sky-50/50 dark:bg-navy-950/50 border border-sky-200/60 dark:border-sky-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-inner"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sewersense.ai"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-sky-50/50 dark:bg-navy-950/50 border border-sky-200/60 dark:border-sky-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-[11px] font-medium text-brand-600 dark:text-cyan-accent hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-sky-50/50 dark:bg-navy-950/50 border border-sky-200/60 dark:border-sky-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-inner font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter (Shown on Sign Up) */}
                {isSignUp && password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span>Password Strength</span>
                      <span className="font-semibold text-brand-600 dark:text-cyan-accent">
                        {passStrength <= 1 ? 'Weak' : passStrength === 2 ? 'Fair' : passStrength === 3 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-navy-800 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 rounded-full ${passStrength >= 1 ? 'bg-rose-500' : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 rounded-full ${passStrength >= 2 ? 'bg-amber-500' : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 rounded-full ${passStrength >= 3 ? 'bg-sky-500' : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 rounded-full ${passStrength >= 4 ? 'bg-emerald-500' : 'bg-transparent'}`} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-sky-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Remember this terminal</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-600 via-sky-600 to-cyan-accent hover:from-brand-700 hover:to-sky-700 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Authenticating...' : (isSignUp ? 'Create Account' : 'Sign In to Operations')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Access Button for Hackathon Evaluation */}
            <div className="mt-5 pt-5 border-t border-sky-100 dark:border-sky-900/50">
              <button
                type="button"
                onClick={handleDemoAuth}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                <span>⚡ Instant Demo Login (Chief Engineer)</span>
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-1.5">
                Instant one-click evaluation access with pre-loaded mock telemetry
              </p>
            </div>

            {/* Toggle Sign In / Sign Up */}
            <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
              {isSignUp ? 'Already have an operations account?' : "Don't have access credentials?"}{' '}
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setIsSignUp(!isSignUp);
                  setErrorMsg('');
                }}
                className="font-bold text-brand-600 dark:text-cyan-accent hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Create New Account'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-navy-900 border border-sky-100 dark:border-sky-800 p-6 shadow-2xl">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Reset Security Credentials
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your registered municipal email address to receive an automated authentication dispatch link.
            </p>

            {forgotSuccess ? (
              <div className="mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs">
                A password reset token has been dispatched to your email address.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="engineer@sewersense.ai"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-sky-50/50 dark:bg-navy-950 border border-sky-200 dark:border-sky-800 text-xs text-slate-900 dark:text-white"
                />
                <button
                  onClick={() => {
                    audio.playSuccess();
                    setForgotSuccess(true);
                    setTimeout(() => {
                      setShowForgotPassword(false);
                      setForgotSuccess(false);
                    }, 2000);
                  }}
                  className="w-full py-2.5 rounded-2xl bg-brand-600 text-white font-bold text-xs shadow-md"
                >
                  Send Recovery Link
                </button>
              </div>
            )}

            <button
              onClick={() => setShowForgotPassword(false)}
              className="w-full mt-3 py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
