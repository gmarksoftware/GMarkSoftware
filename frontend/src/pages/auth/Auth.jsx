import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { useAuth } from '../../lib/AuthContext.jsx';
import gmarkLogo from '@/assets/G Mark.png';

/** One page for everybody: visitors and the admin sign in here. The admin is sent on to /admin automatically. */
export default function Auth({ initialView = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, login, register, loginWithGoogle } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const from = location.state?.from || redirectParam; // set when a protected page (e.g. /admin) or course redirect sent the visitor here

  const [view, setView] = useState(initialView);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [googleBusy, setGoogleBusy] = useState(false);
  const [googleAccount, setGoogleAccount] = useState(null); // { name, email, picture }
  const [showGooglePasswordModal, setShowGooglePasswordModal] = useState(false);
  const [googlePassword, setGooglePassword] = useState('');
  const [googleConfirmPassword, setGoogleConfirmPassword] = useState('');
  const [showGooglePass, setShowGooglePass] = useState(false);
  const [googleModalError, setGoogleModalError] = useState('');

  // Parse Google Credential JWT
  const parseGoogleJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const handleGoogleSuccess = (name, email, picture) => {
    setError('');
    setGoogleBusy(false);
    setGoogleAccount({ name: name || email.split('@')[0], email, picture });
    setGooglePassword('');
    setGoogleConfirmPassword('');
    setGoogleModalError('');
    setShowGooglePasswordModal(true);
  };

  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
  const PASSWORD_REQUIREMENTS_MSG = 'Password must be at least 8 characters and contain at least 1 uppercase letter (A-Z), 1 lowercase letter (a-z), 1 number (0-9), and 1 special character.';

  const handleGooglePasswordSubmit = async (e) => {
    e.preventDefault();
    setGoogleModalError('');
    if (!PASSWORD_REGEX.test(googlePassword)) {
      setGoogleModalError(PASSWORD_REQUIREMENTS_MSG);
      return;
    }
    if (googleConfirmPassword && googlePassword !== googleConfirmPassword) {
      setGoogleModalError('Passwords do not match');
      return;
    }
    setGoogleBusy(true);
    try {
      const u = await loginWithGoogle(
        googleAccount.name,
        googleAccount.email,
        googlePassword
      );
      setShowGooglePasswordModal(false);
      navigate(destination(u), { replace: true });
    } catch (err) {
      const isNetworkFailure =
        err?.isNetworkError === true ||
        (!err?.status &&
          (err?.name === 'TypeError' ||
            err?.message === 'Failed to fetch' ||
            err?.message?.includes('NetworkError') ||
            err?.message?.includes('fetch failed') ||
            err?.message?.includes('Load failed')));

      if (isNetworkFailure) {
        setGoogleModalError('Cannot reach the backend server. Please verify your backend server is running and accessible.');
      } else {
        setGoogleModalError(err.message || 'Authentication failed');
      }
      setGoogleBusy(false);
    }
  };

  // Initialize Google Identity Services safely once across the application
  useEffect(() => {
    let unmounted = false;
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '489147760897-tvv0125nieo3vmdnukoe4bmuvmjnp2k2.apps.googleusercontent.com';

    const initGoogle = () => {
      if (unmounted) return;
      if (!window.google?.accounts?.id) return;

      // Ensure google.accounts.id.initialize is called ONLY ONCE
      if (!window.__gramguru_gsi_initialized) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response) => {
              if (response?.credential) {
                const payload = parseGoogleJwt(response.credential);
                if (payload?.email) {
                  await handleGoogleSuccess(payload.name || payload.given_name, payload.email, payload.picture);
                }
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          window.__gramguru_gsi_initialized = true;
        } catch (err) {
          console.warn('Google Identity initialization notice:', err);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGoogle();
        }
      }, 200);
      return () => {
        unmounted = true;
        clearInterval(interval);
        try {
          window.google?.accounts?.id?.cancel();
        } catch { /* ignore */ }
      };
    }

    return () => {
      unmounted = true;
      try {
        window.google?.accounts?.id?.cancel();
      } catch { /* ignore */ }
    };
  }, []);

  // Triggered when user clicks "Sign in with Google" / "Register with Google"
  const handleGoogleSignInClick = () => {
    if (busy || googleBusy) return; // Prevent multiple simultaneous Google credential requests
    setError('');

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '489147760897-tvv0125nieo3vmdnukoe4bmuvmjnp2k2.apps.googleusercontent.com';

    if (window.google?.accounts?.oauth2) {
      setGoogleBusy(true);
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse?.error) {
              setGoogleBusy(false);
              if (tokenResponse.error !== 'popup_closed_by_user') {
                setError(`Google Sign-In notice: ${tokenResponse.error_description || tokenResponse.error}`);
              }
              return;
            }
            if (tokenResponse?.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const info = await res.json();
                if (info?.email) {
                  await handleGoogleSuccess(info.name || info.given_name, info.email, info.picture);
                } else {
                  throw new Error('Unable to retrieve Google account info');
                }
              } catch (err) {
                setError(err.message || 'Failed to fetch Google profile');
              } finally {
                setGoogleBusy(false);
              }
            } else {
              setGoogleBusy(false);
            }
          },
          error_callback: (err) => {
            setGoogleBusy(false);
            if (err?.type === 'popup_failed_to_open') {
              setError('Google popup was blocked. Please allow popups for this site and try again.');
            } else if (err?.type !== 'popup_closed') {
              console.warn('Google OAuth error:', err);
            }
          },
        });
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        setGoogleBusy(false);
        console.warn('OAuth2 token client trigger error, falling back to prompt:', err);
      }
    }

    if (window.google?.accounts?.id) {
      setGoogleBusy(true);
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setGoogleBusy(false);
            const reason = notification.getNotDisplayedReason?.() || 'unavailable';
            console.log('Google prompt not displayed:', reason);
            if (reason === 'opt_out_or_no_session') {
              setError('Please sign into your Google account in this browser, or use email and password.');
            } else {
              setError('Google One-Tap is unavailable in your browser. Please use email and password or allow Google popups.');
            }
          }
        });
      } catch (err) {
        setGoogleBusy(false);
        setError('Google Sign-In failed to prompt. Please try again.');
      }
    } else {
      setError('Google Sign-In is still loading. Please check your internet connection and try again in a few moments.');
    }
  };

  const destination = (u) => {
    if (u?.role === 'admin' || u?.role === 'super_admin') return from && from.startsWith('/admin') ? from : '/admin';
    // If the user was specifically redirected from a content page (e.g. /courses/xyz), return there; otherwise default to Home page ('/')
    if (from && !from.startsWith('/admin') && from !== '/login' && from !== '/register' && from !== '/dashboard') {
      return from;
    }
    return '/';
  };

  // Already signed in -> redirect
  if (!loading && user) return <Navigate to={destination(user)} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      let u;
      if (view === 'register') {
        if (!PASSWORD_REGEX.test(password)) {
          throw new Error('Password must be at least 8 characters and contain at least 1 uppercase letter (A-Z), 1 lowercase letter (a-z), 1 number (0-9), and 1 special character.');
        }
        if (password !== confirmPassword) throw new Error('Passwords do not match');
        u = await register(name, email, password);
      } else {
        u = await login(email, password);
      }
      navigate(destination(u), { replace: true });
    } catch (err) {
      const isNetworkFailure =
        err?.isNetworkError === true ||
        (!err?.status &&
          (err?.name === 'TypeError' ||
            err?.message === 'Failed to fetch' ||
            err?.message?.includes('NetworkError') ||
            err?.message?.includes('fetch failed') ||
            err?.message?.includes('Load failed')));

      if (isNetworkFailure) {
        setError('Cannot reach the backend server. Please verify your backend server is running and accessible.');
      } else {
        setError(err.message || 'Authentication failed');
      }
      setBusy(false);
    }
  }

  function switchView() {
    const next = view === 'login' ? 'register' : 'login';
    setView(next);
    setError('');
    navigate(`/${next}`, { replace: true, state: location.state });
  }

  function selectView(target) {
    if (view === target) return;
    setView(target);
    setError('');
    navigate(`/${target}`, { replace: true, state: location.state });
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-[#F8FAFC] text-[#0F172A] relative overflow-hidden">

      {/* Left Side: Welcoming Soft Sky-Blue & Indigo Showcase Panel */}
      <div className="relative w-full lg:w-[52%] flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200 bg-gradient-to-br from-[#EFF6FF] via-sky-50 to-indigo-100/70 p-8 sm:p-10 lg:p-14">
        {/* Soft Ambient Pastel Blobs */}
        <div className="pointer-events-none -top-24 -left-24 w-96 h-96 rounded-full bg-blue-300/25 blur-3xl absolute" />
        <div className="pointer-events-none -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-300/25 blur-3xl absolute" />

        <div className="relative z-10 max-w-xl mx-auto lg:mx-0 w-full">
          {/* Brand Logo */}
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="bg-[#0F172A] px-3.5 py-2 rounded-xl border border-slate-800 shadow-sm group-hover:shadow-md transition">
              <img src={gmarkLogo} alt="G-Mark Software" className="h-9 sm:h-10 object-contain" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-extrabold text-[#0F172A] tracking-tight">G-Mark Software</span>
              <span className="text-[11px] font-semibold text-[#2563EB]">Enterprise &amp; Academy Portal</span>
            </div>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-blue-200 text-[#2563EB] text-xs font-bold shadow-2xs mb-4">
            <Icon name="verified" className="text-sm text-[#0D9488]" />
            <span>Trusted Industrial &amp; Learning Ecosystem</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] mb-4 leading-tight tracking-tight">
            Engineering skills for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#4F46E5]">
              modern industry
            </span>
          </h2>
          <p className="text-sm sm:text-base font-medium text-[#475569] leading-relaxed mb-8">
            Access enterprise software suites, cloud telemetry, and G-Mark Software&apos;s certified video academy—all from one unified workspace.
          </p>

          {/* 3 Clean Feature Cards */}
          <div className="space-y-3.5">
            {[
              {
                icon: 'settings_suggest',
                title: 'Enterprise ERP Suite',
                desc: 'Streamline 4M CMMS maintenance, asset tracking, and plant operations in real time.',
                badgeCls: 'bg-blue-50 text-[#2563EB] border-blue-200',
              },
              {
                icon: 'sensors',
                title: 'IoT & Logistics Cloud',
                desc: 'Connect smart factory sensors and GramUnnati supply chains with live analytics.',
                badgeCls: 'bg-teal-50 text-[#0D9488] border-teal-200',
              },
              {
                icon: 'school',
                title: 'Certified Video Academy',
                desc: 'Learn through structured playlists, downloadable chapter notes, tasks, and quizzes.',
                badgeCls: 'bg-indigo-50 text-[#4F46E5] border-indigo-200',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-start gap-4"
              >
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${item.badgeCls}`}>
                  <Icon name={item.icon} className="text-xl" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0F172A]">{item.title}</h3>
                  <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-8 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-[#475569] flex-wrap gap-2 max-w-xl mx-auto lg:mx-0 w-full">
          <span className="font-semibold">G Mark Software Private Limited</span>
          <span className="inline-flex items-center gap-1 font-semibold text-[#0D9488]">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Secure SSO &amp; Encrypted Access
          </span>
        </div>
      </div>

      {/* Right Side: Clean Pure-White Form Card */}
      <div className="w-full lg:w-[48%] flex flex-col justify-center items-center p-6 sm:p-10 md:p-14 bg-[#F8FAFC]">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-7 sm:p-9 shadow-xl">
          {/* Pill Toggle between Sign In & Create Account */}
          <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-2 gap-1 mb-6 border border-slate-200/70">
            <button
              type="button"
              onClick={() => selectView('login')}
              className={`py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                view === 'login'
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => selectView('register')}
              className={`py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                view === 'register'
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mb-1.5 tracking-tight">
              {view === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-[#475569] text-xs sm:text-sm">
              {view === 'login'
                ? 'Sign in to your G-Mark Software account to continue.'
                : 'Register to access free training courses and workspace tools.'}
            </p>
          </div>

          {/* Google Account Authentication Button */}
          <div className="mb-5">
            <button
              type="button"
              disabled={busy || googleBusy}
              onClick={handleGoogleSignInClick}
              className="w-full bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-[#0F172A] rounded-xl py-3 px-4 font-bold text-sm flex items-center justify-center gap-3 shadow-2xs transition-all duration-200 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {googleBusy ? (
                <Icon name="sync" className="animate-spin text-[#2563EB] text-xl" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>
                {googleBusy
                  ? 'Connecting to Google...'
                  : view === 'register'
                    ? 'Register with Google Account'
                    : 'Sign in with Google Account'}
              </span>
            </button>

            <div className="relative flex items-center justify-center my-5">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                OR WITH EMAIL
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {view === 'register' && (
              <div className="space-y-1.5">
                <label htmlFor="auth-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                <div className="relative flex items-center">
                  <Icon name="person" className="absolute left-3.5 text-slate-400 text-xl pointer-events-none" />
                  <input
                    id="auth-name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="auth-email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
              <div className="relative flex items-center">
                <Icon name="mail" className="absolute left-3.5 text-slate-400 text-xl pointer-events-none" />
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="auth-password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
              <div className="relative flex items-center">
                <Icon name="lock" className="absolute left-3.5 text-slate-400 text-xl pointer-events-none" />
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                  minLength={view === 'register' ? 8 : undefined}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-11 py-3 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 text-slate-400 hover:text-[#0F172A] cursor-pointer transition-colors"
                >
                  <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-xl" />
                </button>
              </div>
              {view === 'login' && (
                <div className="flex justify-end pt-1">
                  <a href="#" className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline">Forgot Password?</a>
                </div>
              )}
              {view === 'register' && (
                <div className="grid grid-cols-2 gap-1.5 pt-2 text-[11px] bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                  <span className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-[#0D9488] font-bold' : 'text-slate-500'}`}>
                    <Icon name={password.length >= 8 ? "check_circle" : "radio_button_unchecked"} className="text-xs shrink-0" /> 8+ Characters
                  </span>
                  <span className={`flex items-center gap-1.5 ${/[a-z]/.test(password) ? 'text-[#0D9488] font-bold' : 'text-slate-500'}`}>
                    <Icon name={/[a-z]/.test(password) ? "check_circle" : "radio_button_unchecked"} className="text-xs shrink-0" /> Lowercase (a-z)
                  </span>
                  <span className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? 'text-[#0D9488] font-bold' : 'text-slate-500'}`}>
                    <Icon name={/[A-Z]/.test(password) ? "check_circle" : "radio_button_unchecked"} className="text-xs shrink-0" /> Uppercase (A-Z)
                  </span>
                  <span className={`flex items-center gap-1.5 ${/\d/.test(password) ? 'text-[#0D9488] font-bold' : 'text-slate-500'}`}>
                    <Icon name={/\d/.test(password) ? "check_circle" : "radio_button_unchecked"} className="text-xs shrink-0" /> Number (0-9)
                  </span>
                  <span className={`col-span-2 flex items-center gap-1.5 ${/[^a-zA-Z0-9]/.test(password) ? 'text-[#0D9488] font-bold' : 'text-slate-500'}`}>
                    <Icon name={/[^a-zA-Z0-9]/.test(password) ? "check_circle" : "radio_button_unchecked"} className="text-xs shrink-0" /> Special character (@, #, $, !, etc.)
                  </span>
                </div>
              )}
            </div>

            {view === 'register' && (
              <div className="space-y-1.5">
                <label htmlFor="auth-confirm-password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Confirm Password</label>
                <div className="relative flex items-center">
                  <Icon name="lock" className="absolute left-3.5 text-slate-400 text-xl pointer-events-none" />
                  <input
                    id="auth-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-11 py-3 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    className="absolute right-3.5 text-slate-400 hover:text-[#0F172A] cursor-pointer transition-colors"
                  >
                    <Icon name={showConfirmPassword ? "visibility_off" : "visibility"} className="text-xl" />
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl text-xs sm:text-sm font-medium flex items-start gap-2">
                <Icon name="error_outline" className="text-base text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              disabled={busy || googleBusy}
              className="w-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-[#1D4ED8] hover:to-[#4338CA] text-white rounded-xl py-3.5 font-bold text-sm sm:text-base active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer"
            >
              {busy ? (
                <><Icon name="sync" className="animate-spin" /> Processing...</>
              ) : (
                <>{view === 'register' ? 'Create Account' : 'Sign In'} <Icon name="arrow_forward" /></>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-xs sm:text-sm text-[#475569]">
              {view === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={switchView} className="font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer">
                {view === 'login' ? 'Create Account' : 'Sign In'}
              </button>
            </p>
            <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-[#2563EB] transition-colors flex items-center justify-center gap-1 mx-auto w-fit">
              <Icon name="arrow_back" className="text-[14px]" /> Back to website
            </Link>
          </div>

        </div>
      </div>

      {/* Google Password Setup / Verification Modal */}
      {showGooglePasswordModal && googleAccount && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-slate-200 text-[#0F172A]">
            <button
              type="button"
              onClick={() => setShowGooglePasswordModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Icon name="close" className="text-xl" />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-[#0F172A]">Set Account Password</h3>
              <div className="mt-2.5 inline-flex items-center gap-2 bg-emerald-50 text-[#0D9488] px-3.5 py-1.5 rounded-full text-xs font-bold border border-emerald-200">
                <Icon name="check_circle" filled className="text-[#10B981] text-[16px]" />
                <span>{googleAccount.email}</span>
              </div>
              <p className="text-xs text-[#475569] mt-2">
                Welcome <strong className="text-[#0F172A]">{googleAccount.name}</strong>! Please enter a password for your G-Mark Software account.
              </p>
            </div>

            <form onSubmit={handleGooglePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="google-account-password" className="text-xs font-bold text-slate-700 block mb-1">Account Password *</label>
                <div className="relative flex items-center">
                  <Icon name="lock" className="absolute left-3.5 text-slate-400 text-lg pointer-events-none" />
                  <input
                    id="google-account-password"
                    name="googlePassword"
                    type={showGooglePass ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={googlePassword}
                    onChange={(e) => setGooglePassword(e.target.value)}
                    placeholder="Enter password (min 8 chars)"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGooglePass(!showGooglePass)}
                    className="absolute right-3 text-slate-400 hover:text-[#0F172A] cursor-pointer"
                  >
                    <Icon name={showGooglePass ? "visibility_off" : "visibility"} className="text-lg" />
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="google-confirm-password" className="text-xs font-bold text-slate-700 block mb-1">Confirm Password *</label>
                <div className="relative flex items-center">
                  <Icon name="lock" className="absolute left-3.5 text-slate-400 text-lg pointer-events-none" />
                  <input
                    id="google-confirm-password"
                    name="googleConfirmPassword"
                    type={showGooglePass ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={googleConfirmPassword}
                    onChange={(e) => setGoogleConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  />
                </div>
              </div>

              {googleModalError && (
                <div className="text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-lg text-xs font-semibold">
                  {googleModalError}
                </div>
              )}

              <button
                type="submit"
                disabled={googleBusy || !googlePassword}
                className="w-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-[#1D4ED8] hover:to-[#4338CA] text-white rounded-xl py-3 font-bold text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {googleBusy ? <Icon name="sync" className="animate-spin text-sm" /> : <Icon name="arrow_forward" className="text-sm" />}
                Complete Sign-In &amp; Continue
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
