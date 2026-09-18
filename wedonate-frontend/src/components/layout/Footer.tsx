import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

export default function Footer() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const year = new Date().getFullYear();

  return (
    <footer className={cn('transition-colors duration-300', 'bg-[var(--color-surface)] text-[var(--color-text-ivory)]')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* ── Brand ─────────────────────────────────── */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[var(--color-border-strong)] group-hover:border-[var(--color-amber-cta)] transition-colors shadow-md">
                <img
                  src="/adama_logo.webp"
                  alt="Adama City Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-extrabold text-xl text-[var(--text-main)]">
                  We<span className="text-[var(--color-amber-cta)]">Donate</span>
                </span>
                <p className="text-xs text-[var(--text-muted)] leading-none">Adama City</p>
              </div>
            </Link>
            <p className={cn('text-sm leading-relaxed mb-5 text-[var(--text-secondary)]')}>
              {t('footer.description')}
            </p>
            {/* Social placeholders */}
            <div className="flex gap-3">
              {[
                { label: 'f',  title: 'Facebook',  href: 'https://facebook.com' },
                { label: 'x',  title: 'X / Twitter', href: 'https://x.com' },
                { label: 'in', title: 'LinkedIn',  href: 'https://linkedin.com' },
                { label: 'yt', title: 'YouTube',   href: 'https://youtube.com' },
              ].map((s, i) => (
                <a key={i} href={s.href} title={s.title} target="_blank" rel="noopener noreferrer"
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-colors',
                    'bg-[var(--color-surface-container-low)] hover:bg-[var(--color-civic-emerald-deep)] text-[var(--text-secondary)]',
                  )}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* ── Quick Links ───────────────────────────── */}
          <div>
            <h3 className="text-[var(--text-main)] font-semibold mb-5">{t('footer.quick_links')}</h3>
            <ul className="space-y-3 text-sm">
              {[
                { to: '/',         label: t('nav.home') },
                { to: '/about',    label: t('nav.about') },
                { to: '/donate',   label: t('nav.donate') },
                { to: '/register', label: t('nav.register') },
                { to: '/login',    label: t('nav.login') },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to}
                    className={cn('transition-colors text-[var(--text-secondary)] hover:text-[var(--color-civic-emerald)]')}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Donation Types ────────────────────────── */}
          <div>
            <h3 className="text-[var(--text-main)] font-semibold mb-5">{t('home.categories_title')}</h3>
            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
              {['category_money','category_food','category_clothes','category_medicine','category_other'].map(k => (
                <li key={k} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-amber-cta)] shrink-0" />
                  {t(`home.${k}`)}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ───────────────────────────────── */}
          <div>
            <h3 className="text-[var(--text-main)] font-semibold mb-5">{t('footer.contact')}</h3>
            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[var(--color-civic-emerald)] mt-0.5 shrink-0" />
                <span>{t('footer.address')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[var(--color-civic-emerald)] shrink-0" />
                <a href="mailto:info@wedonate.et" className="hover:text-[var(--color-civic-emerald)] transition-colors">
                  info@wedonate.et
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[var(--color-civic-emerald)] shrink-0" />
                <a href="tel:+251222110011" className="hover:text-[var(--color-civic-emerald)] transition-colors">
                  +251 222 110 011
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom ────────────────────────────────── */}
        <div className={cn('border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm',
          'border-[var(--border)] text-[var(--text-muted)]')}>
          <p>© {year} WeDonate — Adama City Administration. {t('footer.rights')}</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <span className="text-[var(--color-accent)] mx-1">♥</span>
            <span>for Adama Community</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
