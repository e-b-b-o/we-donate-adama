import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Target, Globe, Shield, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';
import api from '../lib/api';

const schema = z.object({
  email:    z.string().email('Valid email required'),
  password: z.string().min(6, 'At least 6 characters'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate   = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('from') || '/dashboard';
  
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const r = await api.get('/donations/stats');
        if (r?.data?.data) {
          setStatsData(r.data.data);
        }
      } catch (err) {
        console.warn('Failed to load stats, falling back to static text.');
      }
    };
    fetchStats();
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate(redirectTo);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  const inputClass = cn(
    "w-full px-4 py-3.5 border rounded-xl text-sm transition-colors",
    isDark 
      ? "bg-[var(--color-surface-container)] border-[var(--border)] text-white placeholder-[var(--text-muted)] focus:border-[var(--color-civic-emerald)] focus:ring-1 focus:ring-[var(--color-civic-emerald)]/30"
      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[var(--color-civic-emerald)] focus:ring-1 focus:ring-[var(--color-civic-emerald)]/30 focus:bg-white"
  );
  
  const labelClass = cn("block text-sm font-semibold mb-1.5", isDark ? "text-white" : "text-[var(--text-main)]");

  return (
    <div className={cn("min-h-screen w-full flex flex-col lg:flex-row relative font-sans", 
      isDark ? "bg-[var(--color-surface)] text-white" : "bg-white text-[var(--text-main)]"
    )}>
      {/* ── LEFT COLUMN: Civic Branding & Value Proposition Hero Panel ── */}
      <div className={cn("relative hidden lg:flex w-full lg:w-[48%] xl:w-[45%] flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden border-b lg:border-b-0 lg:border-r", 
        isDark ? "border-[var(--border)]" : "border-gray-200"
      )}>
        {/* Background Ambient Cityscape with Civic Green Glow */}
        <div className="absolute inset-0 z-0 bg-[var(--color-surface-container-lowest)]">
          <img 
            src="/Adama_city2.webp" 
            alt="Adama City" 
            className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-105" 
          />
          {/* Deep Civic Gradient & Tint Overlays */}
          <div className={cn("absolute inset-0 bg-gradient-to-tr", 
            isDark ? "from-[var(--color-surface)] via-[var(--color-surface)]/90 to-[var(--color-civic-emerald-deep)]/20" 
                   : "from-white via-white/90 to-[var(--color-civic-emerald-glow)]/80"
          )} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[var(--color-civic-emerald)]/10 via-transparent to-[var(--color-surface-container-lowest)]/90" />
        </div>

        {/* Top Civic Header Anchor */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-container-highest)] border border-[var(--color-civic-emerald)]/30 flex items-center justify-center p-1.5 shadow-inner transition-transform duration-150 group-hover:scale-105">
              <img
                src="/adama_logo.webp"
                alt="Adama City Logo"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="flex flex-col">
              <span className={cn('font-bold text-lg tracking-tight leading-tight flex items-center gap-1.5 transition-colors', isDark ? 'text-white' : 'text-gray-900')}>
                WE DONATE <span className="text-[var(--color-amber-cta)] text-[10px]">●</span> <span className="font-normal text-sm opacity-80">Adama City</span>
              </span>
              <span className={cn('text-[10px] uppercase tracking-widest font-semibold transition-colors', isDark ? 'text-[var(--text-muted)]' : 'text-gray-500')}>
                Official Municipal Portal
              </span>
            </div>
          </Link>
          <div className={cn("hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold", 
            isDark ? "bg-[var(--color-surface-container-high)]/80 border-[var(--color-civic-emerald)]/20 text-[var(--color-civic-emerald)]" 
                   : "bg-white/80 border-[var(--color-civic-emerald)]/30 text-[var(--color-civic-emerald-deep)]"
          )}>
            <span className="w-2 h-2 rounded-full bg-[var(--color-civic-emerald)] animate-pulse" />
            <span>Verified Civic Portal</span>
          </div>
        </div>

        {/* Middle Core Brand Message & Value Cards */}
        <div className="relative z-10 my-10 lg:my-auto max-w-lg">

          <h1 className={cn("text-4xl lg:text-5xl font-extrabold tracking-tight", isDark ? "text-white" : "text-gray-900")}>
            Welcome Back
          </h1>
          <p className={cn("mt-2 text-lg leading-relaxed", isDark ? "text-[var(--text-muted)]" : "text-gray-600")}>
            Sign in to continue making a difference.
          </p>

          {/* 3 Value Proposition Civic Cards (Stats integration) */}
          <div className="mt-8 space-y-3.5">
            {/* Card 1: Direct Impact */}
            <div className={cn("rounded-2xl p-4 sm:p-4.5 border flex items-center gap-4 transition-all duration-300 hover:border-[var(--color-civic-emerald)]/40", 
              isDark ? "bg-[var(--color-surface-container)]/60 backdrop-blur-md border-[var(--border)] hover:bg-[var(--color-surface-container-high)]/60" 
                     : "bg-white/80 backdrop-blur-md border-[var(--border)] hover:bg-[var(--color-surface-container-low)]"
            )}>
              <div className="w-12 h-12 rounded-xl bg-[var(--color-amber-cta)]/20 border border-[var(--color-amber-cta)]/30 flex items-center justify-center flex-shrink-0 text-[var(--color-amber-cta)]">
                <Target className="w-6 h-6 text-[var(--color-amber-cta)]" />
              </div>
              <div>
                <h3 className={cn("font-bold text-base", isDark ? "text-white" : "text-gray-900")}>
                  {statsData?.totalDonations ? `${statsData.totalDonations.toLocaleString()} Donations` : 'Direct Impact'}
                </h3>
                <p className={cn("text-sm mt-0.5", isDark ? "text-[var(--text-muted)]" : "text-gray-500")}>Driving change in our city</p>
              </div>
            </div>

            {/* Card 2: Full Transparency */}
            <div className={cn("rounded-2xl p-4 sm:p-4.5 border flex items-center gap-4 transition-all duration-300 hover:border-[var(--color-civic-emerald)]/40", 
              isDark ? "bg-[var(--color-surface-container)]/60 backdrop-blur-md border-[var(--border)] hover:bg-[var(--color-surface-container-high)]/60" 
                     : "bg-white/80 backdrop-blur-md border-[var(--border)] hover:bg-[var(--color-surface-container-low)]"
            )}>
              <div className="w-12 h-12 rounded-xl bg-[var(--color-civic-emerald)]/20 border border-[var(--color-civic-emerald)]/30 flex items-center justify-center flex-shrink-0 text-[var(--color-civic-emerald)]">
                <Globe className="w-6 h-6 text-[var(--color-civic-emerald)]" />
              </div>
              <div>
                <h3 className={cn("font-bold text-base", isDark ? "text-white" : "text-gray-900")}>
                  {statsData?.totalUsers ? `${statsData.totalUsers.toLocaleString()} Members` : 'Full Transparency'}
                </h3>
                <p className={cn("text-sm mt-0.5", isDark ? "text-[var(--text-muted)]" : "text-gray-500")}>A growing community of givers</p>
              </div>
            </div>

            {/* Card 3: Trusted Platform */}
            <div className={cn("rounded-2xl p-4 sm:p-4.5 border flex items-center gap-4 transition-all duration-300 hover:border-[var(--color-civic-emerald)]/40", 
              isDark ? "bg-[var(--color-surface-container)]/60 backdrop-blur-md border-[var(--border)] hover:bg-[var(--color-surface-container-high)]/60" 
                     : "bg-white/80 backdrop-blur-md border-[var(--border)] hover:bg-[var(--color-surface-container-low)]"
            )}>
              <div className="w-12 h-12 rounded-xl bg-[var(--color-amber-cta)]/15 border border-[var(--color-amber-cta)]/30 flex items-center justify-center flex-shrink-0 text-[var(--color-amber-cta)]">
                <Shield className="w-6 h-6 text-[var(--color-amber-cta)]" />
              </div>
              <div>
                <h3 className={cn("font-bold text-base", isDark ? "text-white" : "text-gray-900")}>
                  {statsData?.fulfilledRequests ? `${statsData.fulfilledRequests.toLocaleString()} Verified Needs` : 'Trusted Platform'}
                </h3>
                <p className={cn("text-sm mt-0.5", isDark ? "text-[var(--text-muted)]" : "text-gray-500")}>Real help delivered safely</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Civic Trust Indicator */}
        <div className={cn("relative z-10 pt-6 border-t flex items-center justify-between text-sm font-semibold", 
          isDark ? "border-[var(--border)] text-[var(--text-muted)]" : "border-gray-200 text-gray-500"
        )}>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--color-civic-emerald)]" />
            <span>Municipal Charity Governance</span>
          </div>
          <span>Oromia, Ethiopia</span>
        </div>
      </div>

      {/* ── RIGHT COLUMN: Login Form Panel ── */}
      <div className={cn("w-full lg:w-[52%] xl:w-[55%] flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-y-auto", 
        isDark ? "bg-[var(--color-surface)]" : "bg-[var(--color-background)]"
      )}>
        <div className="max-w-[440px] w-full mx-auto my-auto">
          {/* Top Back Navigation Action */}
          <div className="flex items-center justify-between mb-10">
            <Link to="/" className={cn("inline-flex items-center gap-2 text-sm font-bold transition-colors duration-200 group", 
              isDark ? "text-[var(--text-muted)] hover:text-[var(--color-civic-emerald)]" : "text-gray-500 hover:text-[var(--color-civic-emerald)]"
            )}>
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Form Title & Subtitle */}
          <div className="mb-10">
            <h2 className={cn("text-3xl lg:text-4xl font-extrabold tracking-tight", isDark ? "text-white" : "text-gray-900")}>
              {t('auth.login_title')}
            </h2>
            <p className={cn("mt-2 text-base", isDark ? "text-[var(--text-muted)]" : "text-gray-600")}>
              {t('auth.login_subtitle')}
            </p>
          </div>

          {/* Login Form Elements */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Address */}
            <div>
              <label className={labelClass}>{t('auth.email')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  className={cn(inputClass, "pl-11", errors.email && (isDark ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/30" : "border-red-300 focus:border-red-500 focus:ring-red-500/30"))} 
                  placeholder="you@example.com" 
                  {...register('email')} 
                />
              </div>
              {errors.email && <p className="text-sm text-red-500 font-medium mt-1.5">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className={labelClass}>{t('auth.password')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showPw ? 'text' : 'password'} 
                  className={cn(inputClass, "pl-11 pr-12", !showPw && "tracking-widest", errors.password && (isDark ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/30" : "border-red-300 focus:border-red-500 focus:ring-red-500/30"))} 
                  placeholder="••••••••" 
                  {...register('password')} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)}
                  className={cn("absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors",
                    isDark ? "text-[var(--text-muted)] hover:text-white" : "text-gray-400 hover:text-gray-700"
                  )}
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500 font-medium mt-1.5">{errors.password.message}</p>}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button type="button" className="text-sm font-semibold text-[var(--color-civic-emerald)] hover:text-[var(--color-amber-cta)] transition-colors" title="Coming soon">
                {t('auth.forgot_password')}
              </button>
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button 
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full py-4 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors duration-200",
                  "bg-[var(--color-civic-emerald)] text-white hover:bg-[var(--color-civic-emerald-deep)]",
                  loading && "opacity-80 cursor-wait"
                )}
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeDashoffset="32" strokeLinecap="round" opacity="0.3"></circle>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="16" strokeDashoffset="16" strokeLinecap="round" className="opacity-100"></circle>
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>{t('auth.login_btn')}</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Bottom Auth Switcher */}
          <div className={cn("mt-10 text-center pt-8 border-t", isDark ? "border-[var(--border)]" : "border-gray-200")}>
            <p className={cn("text-base font-medium", isDark ? "text-[var(--text-muted)]" : "text-gray-600")}>
              {t('auth.no_account')} 
              <Link to={`/register?from=${encodeURIComponent(redirectTo)}`} className="text-[var(--color-civic-emerald)] hover:text-[var(--color-amber-cta)] font-extrabold transition-colors ml-1.5 inline-flex items-center gap-1 group">
                <span>Create free account</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </p>
          </div>

        </div>

        {/* Footer Micro Info */}
        <div className="mt-10 pt-4 text-center text-xs font-semibold text-[var(--text-muted)]/60">
          © 2026 WE DONATE Adama • Bulchiinsa Magaalaa Adaamaa. All rights reserved.
        </div>
      </div>
    </div>
  );
}
