import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users, Heart, TrendingUp, AlertCircle, BarChart3, Clock, CheckCircle, Eye, FileText,
  ArrowRight, ShieldCheck, Building2, ClipboardList, UserCheck, BadgeCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { formatCurrency, timeAgo } from '../../lib/utils';
import Card from '../../components/ui/Card';
import Badge, { statusVariant } from '../../components/ui/Badge';

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'text-blue-600 bg-blue-50',
  CREATE_USER: 'text-indigo-600 bg-indigo-50',
  ASSIGN_ROLE: 'text-purple-600 bg-purple-50',
  ACTIVATE_USER: 'text-green-600 bg-green-50',
  SUSPEND_USER: 'text-red-600 bg-red-50',
  VERIFY_DONATION: 'text-green-600 bg-green-50',
  REJECT_DONATION: 'text-red-600 bg-red-50',
  PAYMENT_SUCCESS: 'text-green-600 bg-green-50',
  PAYMENT_FAILED: 'text-red-600 bg-red-50',
  VERIFY_ORG: 'text-blue-600 bg-blue-50',
  PUBLISH_REQUEST: 'text-amber-600 bg-amber-50',
  PUBLISH_CAMPAIGN: 'text-amber-600 bg-amber-50',
};

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data.data),
  });

  const statCards = stats ? [
    { label: t('admin.total_users'),       value: stats.totalUsers,              icon: Users,       color: 'text-blue-500',   bg: 'bg-blue-50',   link: '/admin/users' },
    { label: t('admin.total_donations'),   value: stats.totalDonations,          icon: Heart,       color: 'text-green-500',  bg: 'bg-green-50',  link: '/admin/donations' },
    { label: t('admin.total_raised'),      value: formatCurrency(stats.totalAmount), icon: TrendingUp, color: 'text-amber-500',  bg: 'bg-amber-50',  link: '/admin/donations' },
    { label: t('admin.total_campaigns'),   value: stats.totalCampaigns,          icon: BarChart3,   color: 'text-indigo-500', bg: 'bg-indigo-50', link: '/admin/campaigns' },
    { label: t('admin.pending_requests'),  value: stats.pendingRequests,         icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50', link: '/admin/requests' },
    { label: t('admin.pending_campaigns'), value: stats.pendingCampaigns,        icon: Clock,       color: 'text-red-500',    bg: 'bg-red-50',    link: '/admin/campaigns' },
    { label: 'Fulfilled Requests',         value: stats.fulfilledRequests,       icon: CheckCircle, color: 'text-teal-500',   bg: 'bg-teal-50',   link: '/admin/requests' },
    { label: 'Pending Verifications',      value: stats.pendingVerifications,    icon: Eye,         color: 'text-yellow-500', bg: 'bg-yellow-50', link: '/admin/verification' },
  ] : [];

  const managementCards = [
    ...(user?.role === 'SYSTEM_ADMIN' || user?.role === 'CITY_ADMIN' || user?.role === 'KEBELE_ADMIN' ? [{
      title: 'Manage Users',
      description: 'View, create, and manage platform users and their roles',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      link: '/admin/users',
      badge: stats?.totalUsers,
      badgeLabel: 'total',
    }] : []),
    ...(user?.role === 'SYSTEM_ADMIN' || user?.role === 'CITY_ADMIN' ? [{
      title: 'Verify Organizations',
      description: 'Review pending registrations, approve or reject organizations',
      icon: Building2,
      color: 'from-amber-500 to-orange-500',
      link: '/admin/verification',
      badge: stats?.pendingVerifications,
      badgeLabel: 'pending',
      urgent: (stats?.pendingVerifications ?? 0) > 0,
    }] : []),
    ...(user?.role === 'CITY_ADMIN' || user?.role === 'SYSTEM_ADMIN' ? [{
      title: 'Manage Donations',
      description: 'Verify payments, reject invalid donations, export reports',
      icon: Heart,
      color: 'from-green-500 to-emerald-600',
      link: '/admin/donations',
      badge: stats?.totalDonations,
      badgeLabel: 'total',
    }] : []),
    ...(user?.role === 'KEBELE_ADMIN' || user?.role === 'SYSTEM_ADMIN' || user?.role === 'CITY_ADMIN' ? [{
      title: 'Approve Requests',
      description: 'Review and approve support requests',
      icon: ClipboardList,
      color: 'from-purple-500 to-indigo-600',
      link: '/admin/requests',
      badge: stats?.pendingRequests,
      badgeLabel: 'pending',
      urgent: (stats?.pendingRequests ?? 0) > 0,
    }] : []),
    ...(user?.role === 'CITY_ADMIN' || user?.role === 'SYSTEM_ADMIN' ? [{
      title: 'Approve Campaigns',
      description: 'Review and approve campaigns',
      icon: BarChart3,
      color: 'from-purple-500 to-indigo-600',
      link: '/admin/campaigns',
      badge: stats?.pendingCampaigns,
      badgeLabel: 'pending',
      urgent: (stats?.pendingCampaigns ?? 0) > 0,
    }] : []),
  ];

  const monthlyData = (stats?.monthlyDonations as any[]) || [];
  const maxMonthly = Math.max(...monthlyData.map((m: any) => m.total || 0), 1);

  const th = cn('text-left px-5 py-3.5 font-semibold text-sm', isDark ? 'text-slate-400' : 'text-gray-600');
  const td = cn('px-5 py-3.5 text-sm', isDark ? 'text-slate-300' : 'text-gray-700');

  const totalPending = (stats?.pendingRequests ?? 0) + (stats?.pendingCampaigns ?? 0) + (stats?.pendingVerifications ?? 0);

  return (
    <div className="space-y-8">
      {/* Hero Welcome */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className={cn("rounded-3xl p-7 relative overflow-hidden border",
          isDark ? "bg-[var(--color-surface-container)] border-[var(--border)]" : "bg-white border-gray-200 shadow-sm"
        )}>
        <div className="absolute inset-0 opacity-5 mix-blend-luminosity bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('/Adama-City.webp')" }} />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="" className="w-16 h-16 rounded-2xl object-cover border shadow-sm" />
            ) : (
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold border shadow-sm",
                isDark ? "bg-[var(--color-surface-container-high)] border-[var(--border)] text-white" : "bg-gray-50 border-gray-100 text-gray-800"
              )}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            <div>
              <p className={cn("text-sm font-semibold mb-1", isDark ? "text-[var(--text-muted)]" : "text-gray-500")}>Welcome back,</p>
              <h1 className={cn("text-2xl md:text-3xl font-extrabold tracking-tight mb-1", isDark ? "text-white" : "text-gray-900")}>
                {user?.firstName} {user?.lastName}
              </h1>
              <p className={cn("text-sm font-medium capitalize flex items-center gap-1.5", isDark ? "text-[var(--color-civic-emerald)]" : "text-[var(--color-civic-emerald-deep)]")}>
                <ShieldCheck className="w-4 h-4" />
                {user?.role?.toLowerCase().replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pending Alerts */}
      {totalPending > 0 && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className={cn('flex items-center gap-4 p-4 rounded-2xl border',
            isDark ? 'bg-amber-900/20 border-amber-700/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800')}>
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="flex-1 text-sm">
            <span className="font-semibold">{totalPending} item{totalPending > 1 ? 's' : ''} need your attention — </span>
            {stats?.pendingVerifications > 0 && <span>{stats.pendingVerifications} organization{stats.pendingVerifications > 1 ? 's' : ''} awaiting verification</span>}
            {stats?.pendingVerifications > 0 && (stats?.pendingRequests > 0 || stats?.pendingCampaigns > 0) && <span> · </span>}
            {(stats?.pendingRequests ?? 0) + (stats?.pendingCampaigns ?? 0) > 0 && <span>{(stats?.pendingRequests ?? 0) + (stats?.pendingCampaigns ?? 0)} request{(stats?.pendingRequests ?? 0) + (stats?.pendingCampaigns ?? 0) > 1 ? 's' : ''} pending review</span>}
          </div>
          <Link to={user?.role === 'CITY_ADMIN' ? '/admin/campaigns' : '/admin/requests'}>
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors cursor-pointer inline-block mt-2 sm:mt-0">
              Review Now
            </span>
          </Link>
        </motion.div>
      )}

      {/* Management Quick Actions */}
      <div>
        <h2 className={cn('text-lg font-bold mb-4', isDark ? 'text-white' : 'text-gray-900')}>Management Hub</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {managementCards.map((card, i) => (
            <motion.div key={card.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}>
              <Link to={card.link}>
                <Card hover className={cn("relative overflow-hidden h-full p-5 flex flex-col transition-colors border",
                  isDark ? "bg-[var(--color-surface-container)] border-[var(--border)] hover:border-[var(--color-civic-emerald)]/50" : "bg-white border-gray-200 hover:border-[var(--color-civic-emerald)]/30"
                )}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', 
                      isDark ? 'bg-[var(--color-surface-container-high)] border-[var(--border)] text-[var(--color-civic-emerald)]' : 'bg-green-50 border-green-100 text-[var(--color-civic-emerald-deep)]'
                    )}>
                      <card.icon className="w-5 h-5" />
                    </div>
                    {card.badge !== undefined && card.badge > 0 && (
                      <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full',
                        card.urgent
                          ? (isDark ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-700')
                          : (isDark ? 'bg-[var(--color-surface-container-high)] text-[var(--text-muted)]' : 'bg-gray-100 text-gray-600'))}>
                        {card.badge} {card.badgeLabel}
                      </span>
                    )}
                  </div>
                  <h3 className={cn('text-sm font-bold mb-1.5', isDark ? 'text-white' : 'text-gray-900')}>{card.title}</h3>
                  <p className={cn('text-xs leading-relaxed flex-1', isDark ? 'text-[var(--text-muted)]' : 'text-gray-500')}>{card.description}</p>
                  <div className={cn("flex items-center gap-1 mt-4 text-xs font-bold", isDark ? "text-[var(--color-civic-emerald)]" : "text-[var(--color-civic-emerald-deep)]")}>
                    Manage <ArrowRight className="w-3 h-3" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={cn('h-28 rounded-2xl animate-pulse border', isDark ? 'bg-[var(--color-surface-container)] border-[var(--border)]' : 'bg-gray-50 border-gray-100')} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}>
              <Link to={s.link}>
                <Card hover className={cn("p-5 flex flex-col justify-between h-full transition-colors border",
                  isDark ? "bg-[var(--color-surface-container)] border-[var(--border)] hover:border-[var(--color-civic-emerald)]/50" : "bg-white border-gray-200 hover:border-[var(--color-civic-emerald)]/30"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center border',
                      isDark ? 'bg-[var(--color-surface-container-high)] border-[var(--border)]' : 'bg-gray-50 border-gray-100'
                    )}>
                      <s.icon className={cn('w-4 h-4', s.color)} />
                    </div>
                    {Number(s.value) > 0 && (s.label.includes('Pending') || s.label.includes('Verif')) && (
                      <span className="w-2 h-2 bg-amber-500 rounded-full" />
                    )}
                  </div>
                  <div>
                    <p className={cn('text-2xl font-extrabold', isDark ? 'text-white' : 'text-gray-900')}>{s.value}</p>
                    <p className={cn('text-[11px] font-semibold uppercase tracking-wider mt-1', isDark ? 'text-[var(--text-muted)]' : 'text-gray-500')}>{s.label}</p>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Monthly Donations Chart */}
      {monthlyData.length > 0 && (
        <div>
          <h2 className={cn('text-lg font-bold mb-4', isDark ? 'text-white' : 'text-gray-900')}>Monthly Donations</h2>
          <Card className={cn("p-6 border", isDark ? "bg-[var(--color-surface-container)] border-[var(--border)]" : "bg-white border-gray-200")}>
            <div className="flex items-end gap-2 h-48">
              {monthlyData.map((m: any, i: number) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className={cn('text-[10px] font-bold', isDark ? 'text-[var(--text-muted)]' : 'text-gray-600')}>
                    {formatCurrency(m.total)}
                  </span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(m.total / maxMonthly) * 140}px` }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className={cn("w-full rounded-t-md min-h-[4px]", isDark ? "bg-[var(--color-civic-emerald)]/40" : "bg-[var(--color-civic-emerald)]/20")}
                  />
                  <span className={cn('text-[10px] font-medium uppercase tracking-wider', isDark ? 'text-[var(--text-muted)]/70' : 'text-gray-400')}>
                    {m.month.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Live Public Causes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-gray-900')}>Live Public Causes</h2>
          <Link to="/donate" className={cn("text-xs font-bold hover:underline flex items-center gap-1", isDark ? "text-[var(--color-civic-emerald)]" : "text-[var(--color-civic-emerald-deep)]")}>
            Browse Live Causes <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card hover className={cn("p-5 flex items-center gap-4 transition-colors border",
            isDark ? "bg-[var(--color-surface-container)] border-[var(--border)] hover:border-indigo-500/50" : "bg-white border-gray-200 hover:border-indigo-300"
          )}>
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center border', isDark ? 'bg-indigo-900/20 border-indigo-500/30 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600')}>
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className={cn('text-2xl font-extrabold', isDark ? 'text-white' : 'text-gray-900')}>{stats?.activeCampaigns || 0}</p>
              <p className={cn('text-[11px] font-semibold uppercase tracking-wider mt-1', isDark ? 'text-[var(--text-muted)]' : 'text-gray-500')}>Live Campaigns</p>
            </div>
          </Card>
          <Card hover className={cn("p-5 flex items-center gap-4 transition-colors border",
            isDark ? "bg-[var(--color-surface-container)] border-[var(--border)] hover:border-amber-500/50" : "bg-white border-gray-200 hover:border-amber-300"
          )}>
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center border', isDark ? 'bg-amber-900/20 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-100 text-amber-600')}>
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className={cn('text-2xl font-extrabold', isDark ? 'text-white' : 'text-gray-900')}>{stats?.publishedRequests || 0}</p>
              <p className={cn('text-[11px] font-semibold uppercase tracking-wider mt-1', isDark ? 'text-[var(--text-muted)]' : 'text-gray-500')}>Live Direct Support</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Donations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-gray-900')}>{t('admin.recent_donations')}</h2>
            <Link to="/admin/donations" className={cn("text-xs font-bold hover:underline flex items-center gap-1", isDark ? "text-[var(--color-civic-emerald)]" : "text-[var(--color-civic-emerald-deep)]")}>
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className={cn("rounded-2xl border overflow-hidden", isDark ? "bg-[var(--color-surface-container)] border-[var(--border)]" : "bg-white border-gray-200")}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className={cn('border-b', isDark ? 'bg-[var(--color-surface-container-high)] border-[var(--border)] text-[var(--text-muted)]' : 'bg-gray-50 border-gray-100 text-gray-500')}>
                  <tr>
                    <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">{t('admin.donor')}</th>
                    <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">{t('admin.amount')}</th>
                    <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">{t('admin.status')}</th>
                  </tr>
                </thead>
                <tbody className={cn('divide-y', isDark ? 'divide-[var(--border)]' : 'divide-gray-100')}>
                  {stats?.recentDonations?.map((d: any) => (
                    <tr key={d.id} className={cn('transition-colors', isDark ? 'hover:bg-[var(--color-surface-container-high)]' : 'hover:bg-gray-50')}>
                      <td className={cn('px-5 py-3.5', isDark ? 'text-white' : 'text-gray-900')}>
                        {d.isAnonymous ? <span className="italic opacity-50 text-xs">{t('admin.anonymous')}</span> : <span className="font-semibold text-sm">{d.donor?.firstName} {d.donor?.lastName}</span>}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-green-500">{d.amount ? formatCurrency(d.amount) : '—'}</td>
                      <td className="px-5 py-3.5"><Badge variant={statusVariant(d.paymentStatus)}>{d.paymentStatus}</Badge></td>
                    </tr>
                  )) ?? (
                    <tr><td colSpan={3} className={cn('text-center py-10', isDark ? 'text-[var(--text-muted)]' : 'text-gray-400')}>{t('admin.no_data')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className={cn('text-lg font-bold mb-4', isDark ? 'text-white' : 'text-gray-900')}>Recent Activity</h2>
          <div className={cn("rounded-2xl border overflow-hidden", isDark ? "bg-[var(--color-surface-container)] border-[var(--border)]" : "bg-white border-gray-200")}>
            <div className={cn("divide-y", isDark ? "divide-[var(--border)]" : "divide-gray-100")}>
              {stats?.recentActivity?.map((log: any) => (
                <div key={log.id} className={cn('flex items-start gap-3 p-4 transition-colors', isDark ? 'hover:bg-[var(--color-surface-container-high)]' : 'hover:bg-gray-50')}>
                  {log.user?.profileImage ? (
                    <img src={log.user.profileImage} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200" />
                  ) : (
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border',
                      isDark ? 'bg-[var(--color-surface-container-high)] border-[var(--border)] text-white' : 'bg-gray-100 border-gray-200 text-gray-700')}>
                      {log.user?.firstName?.[0]}{log.user?.lastName?.[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm', isDark ? 'text-white' : 'text-gray-900')}>
                      <span className="font-semibold">{log.user?.firstName} {log.user?.lastName}</span>
                      {' '}
                      <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ml-1',
                        ACTION_COLORS[log.action] || (isDark ? 'text-[var(--text-muted)] bg-[var(--color-surface-container-high)]' : 'text-gray-600 bg-gray-100'))}>
                        {log.action}
                      </span>
                    </p>
                    {log.details && (
                      <p className={cn('text-[11px] truncate mt-1', isDark ? 'text-[var(--text-muted)]' : 'text-gray-500')}>{log.details}</p>
                    )}
                  </div>
                  <span className={cn('text-[10px] shrink-0 font-medium whitespace-nowrap', isDark ? 'text-[var(--text-muted)]/70' : 'text-gray-400')}>{timeAgo(log.createdAt)}</span>
                </div>
              )) ?? (
                <div className={cn('text-center py-10 text-sm', isDark ? 'text-[var(--text-muted)]' : 'text-gray-400')}>No activity yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
