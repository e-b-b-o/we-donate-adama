import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Menu, X, ChevronDown, Globe,
  User, LogOut, LayoutDashboard, Sun, Moon, Bell,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

const LANGUAGES = [
  { code: 'en', label: 'English',      flag: '🇬🇧' },
  { code: 'am', label: 'አማርኛ',         flag: '🇪🇹' },
  { code: 'or', label: 'Afaan Oromo',  flag: '🇪🇹' },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [langOpen,   setLangOpen]   = useState(false);
  const [userOpen,   setUserOpen]   = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMobileOpen(false); setLangOpen(false); setUserOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langOpen || userOpen) {
        // If clicking outside, we should close. Wait, we need refs.
        // I will implement refs to properly track clicks.
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [langOpen, userOpen]);

  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langOpen && langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (userOpen && userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [langOpen, userOpen]);

  const handleLogout = () => { logout(); navigate('/'); setUserOpen(false); };
  const currentLang  = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0];
  const isAdmin      = user && ['KEBELE_ADMIN', 'CITY_ADMIN', 'SYSTEM_ADMIN'].includes(user.role);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: async () => {
      const r = await api.get('/notifications');
      return r.data.data?.filter((n: any) => !n.isRead).length ?? 0;
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  /* background when scrolled differs between light/dark */
  const navBg = scrolled
    ? 'bg-[var(--color-surface-container-low)]/95 backdrop-blur-md shadow-lg shadow-black/20 border-b border-[var(--border)]'
    : 'bg-transparent';

  /* text colour on transparent nav (hero bg is always dark-green) */
  const onHero  = !scrolled;
  const txtBase = onHero ? 'text-white'      : 'text-[var(--text-main)]';
  const hoverBg = onHero ? 'hover:bg-white/10' : 'hover:bg-[var(--color-surface-container-mid)]';

  return (
    <nav className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-300', navBg)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* ── Logo ──────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-container-highest)] border border-[var(--color-civic-emerald)]/30 flex items-center justify-center p-1.5 shadow-inner transition-transform duration-150 group-hover:scale-105">
              <img
                src="/adama_logo.webp"
                alt="Adama City Logo"
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className={cn('font-bold text-lg tracking-tight leading-tight flex items-center gap-1.5 transition-colors',
                onHero ? 'text-white' : 'text-[var(--text-main)]')}>
                WE DONATE <span className="text-[var(--color-amber-cta)] text-[10px]">●</span> <span className="font-normal text-sm opacity-80">Adama City</span>
              </span>
              <span className={cn('text-[10px] uppercase tracking-widest font-semibold transition-colors',
                onHero ? 'text-white/70' : 'text-[var(--text-muted)]')}>
                Official Municipal Portal
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav Links ─────────────────────── */}
          <div className="hidden md:flex items-center gap-8 mr-6">
            {[
              { to: '/',       label: t('nav.home') },
              { to: '/about',  label: t('nav.about') },
              { to: '/donate', label: t('nav.donate') },
            ].map(link => {
              const active = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to}
                  className={cn(
                    'text-sm transition-colors duration-200 border-b-2 pb-1 hover:text-[var(--color-civic-emerald)] hover:border-[var(--color-civic-emerald)]',
                    active
                      ? (onHero ? 'text-white border-white font-bold' : 'text-[var(--color-civic-emerald)] border-[var(--color-civic-emerald)] font-bold')
                      : cn(txtBase, 'border-transparent font-medium')
                  )}>
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* ── Right Controls ────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">

            {/* Dark/Light toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-colors border',
                onHero 
                  ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white hover:border-white/40' 
                  : 'bg-[var(--color-surface-container)] text-[var(--text-muted)] hover:text-[var(--color-civic-emerald)] border-[var(--border)] hover:border-[var(--color-civic-emerald)]'
              )}>
              {isDark
                ? <Sun  className="w-5 h-5 text-amber-400" />
                : <Moon className="w-5 h-5" />}
            </button>

            {/* Language selector */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => { setLangOpen(!langOpen); setUserOpen(false); }}
                className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors border', 
                  onHero 
                    ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white hover:border-white/40' 
                    : 'bg-[var(--color-surface-container)] text-[var(--text-muted)] hover:text-[var(--text-main)] border-[var(--border)] hover:border-[var(--border-hover)]'
                )}>
                <Globe className={cn("w-4 h-4", !onHero && "text-[var(--color-civic-emerald)]")} />
                <span className="hidden lg:inline">{currentLang.label}</span>
                <span className="lg:hidden">{currentLang.flag}</span>
                <ChevronDown className={cn('w-3 h-3 transition-transform', langOpen && 'rotate-180')} />
              </button>
              {langOpen && (
                <div className={cn(
                  'absolute right-0 top-full mt-2 rounded-2xl shadow-2xl border py-2 min-w-[170px] z-50',
                  'bg-[var(--bg-card)] border-[var(--border)]'
                )}>
                  {LANGUAGES.map(lang => (
                    <button key={lang.code}
                      onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false); }}
                      className={cn(
                        'w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors',
                        i18n.language === lang.code
                          ? 'text-[var(--color-civic-emerald)] font-semibold bg-[var(--color-civic-emerald-glow)]'
                          : 'text-[var(--text-main)] hover:bg-[var(--color-surface-container-mid)]',
                      )}>
                      <span>{lang.flag}</span> {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth */}
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <Link to="/dashboard/notifications"
                  className={cn('relative p-2.5 rounded-xl transition-all', txtBase, hoverBg)}>
                  <Bell className="w-4.5 h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-[var(--color-accent)] text-white text-[10px] font-bold rounded-full px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                <div className="relative" ref={userRef}>
                <button
                  onClick={() => { setUserOpen(!userOpen); setLangOpen(false); }}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                    onHero
                      ? 'bg-white/15 hover:bg-white/25 text-white'
                      : 'bg-[var(--color-surface-container-mid)] hover:bg-[var(--color-surface-container-high)] text-[var(--text-main)]',
                  )}>
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[var(--color-civic-emerald-deep)] flex items-center justify-center text-white text-xs font-bold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                  )}
                  <span className="hidden lg:inline">{user?.firstName}</span>
                  <ChevronDown className={cn('w-3 h-3 transition-transform', userOpen && 'rotate-180')} />
                </button>
                {userOpen && (
                  <div className={cn(
                    'absolute right-0 top-full mt-2 rounded-2xl shadow-2xl border py-1 min-w-[210px] z-50',
                    'bg-[var(--bg-card)] border-[var(--border)]'
                  )}>
                    <div className={cn('px-4 py-3 border-b border-[var(--border)]')}>
                      <div className="flex items-center gap-3">
                        {user?.profileImage ? (
                          <img src={user.profileImage} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[var(--color-civic-emerald-deep)] flex items-center justify-center text-white text-sm font-bold">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </div>
                        )}
                        <div>
                          <p className={cn('text-sm font-semibold text-[var(--text-main)]')}>
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className={cn('text-xs text-[var(--text-muted)]')}>{user?.email}</p>
                          <span className="inline-block mt-1 text-xs bg-[var(--color-civic-emerald-glow)] text-[var(--color-civic-emerald)] border border-[rgba(16,185,129,0.3)] px-2 py-0.5 rounded-full font-medium">
                            {user?.role?.replace(/_/g,' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    {[
                      { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
                    ].map(({ to, icon: Icon, label }) => (
                      <Link key={to} to={to} onClick={() => setUserOpen(false)}
                        className={cn('flex items-center gap-2 px-4 py-2.5 text-sm transition-colors',
                          'text-[var(--text-main)] hover:bg-[var(--color-surface-container-mid)] hover:text-[var(--color-civic-emerald)]')}>
                        <Icon className="w-4 h-4" /> {label}
                      </Link>
                    ))}
                    <button onClick={handleLogout}
                      className={cn('w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors text-red-500',
                        'hover:bg-red-500/10 hover:text-red-400')}>
                      <LogOut className="w-4 h-4" /> {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link to="/login"
                  className={cn('px-4 py-2 rounded-xl text-sm font-semibold transition-all', txtBase, hoverBg)}>
                  {t('nav.login')}
                </Link>
                <Link to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--color-amber-cta)] hover:bg-[var(--color-amber-hover)] text-[#0b131b] shadow-md transition-all">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile: theme toggle + hamburger ─────── */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className={cn('p-2 rounded-xl transition-all', txtBase, hoverBg)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ───────────────────────────────── */}
      {mobileOpen && (
        <div className={cn(
          'md:hidden border-t shadow-xl',
          'bg-[var(--bg-card)] border-[var(--border)]'
        )}>
          <div className="px-4 py-4 space-y-1">
            {[
              { to: '/',       label: t('nav.home') },
              { to: '/about',  label: t('nav.about') },
              { to: '/donate', label: t('nav.donate') },
            ].map(link => (
              <Link key={link.to} to={link.to}
                className={cn('block px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                  'text-[var(--text-main)] hover:bg-[var(--color-surface-container-mid)] hover:text-[var(--color-civic-emerald)]')}>
                {link.label}
              </Link>
            ))}

            {/* Language */}
            <div className={cn('border-t pt-3 mt-3 space-y-1', 'border-[var(--border)]')}>
              <p className={cn('text-xs font-semibold px-4 mb-1 text-[var(--text-muted)]')}>LANGUAGE</p>
              {LANGUAGES.map(lang => (
                <button key={lang.code}
                  onClick={() => { i18n.changeLanguage(lang.code); setMobileOpen(false); }}
                  className={cn('w-full text-left px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors',
                    i18n.language === lang.code
                      ? 'bg-[var(--color-civic-emerald-glow)] text-[var(--color-civic-emerald)] font-semibold'
                      : 'text-[var(--text-main)] hover:bg-[var(--color-surface-container-mid)]')}>
                  {lang.flag} {lang.label}
                </button>
              ))}
            </div>

            {/* Auth */}
            <div className={cn('border-t pt-3 mt-3 space-y-2 border-[var(--border)]')}>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard"
                    className={cn('block px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                      'text-[var(--text-main)] hover:bg-[var(--color-surface-container-mid)]')}>
                    {t('nav.dashboard')}
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10">
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login"
                    className={cn('block px-4 py-3 rounded-xl text-sm font-medium',
                      'text-[var(--color-civic-emerald)] hover:bg-[var(--color-surface-container-mid)]')}>
                    {t('nav.login')}
                  </Link>
                  <Link to="/register"
                    className="block px-4 py-3 rounded-xl text-sm font-semibold bg-[var(--color-amber-cta)] text-[#0b131b] text-center">
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
