import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, TrendingUp, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import api from '../../lib/api';
import { useTheme } from '../../context/ThemeContext';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import Card from '../../components/ui/Card';
import Badge, { statusVariant } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

type StatusTab = 'ALL' | 'PENDING' | 'SUCCESS' | 'FAILED';

export default function KebeleDonationsPage() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [statusTab, setStatusTab] = useState<StatusTab>('ALL');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const qc = useQueryClient();

  const { data: donations, isLoading } = useQuery({
    queryKey: ['kebele-donations', statusTab],
    queryFn: () => api.get('/admin/donations', { params: { status: statusTab === 'ALL' ? undefined : statusTab, limit: 100 } }).then(r => r.data.data),
  });

  const verifyDonation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/donations/${id}/verify`),
    onSuccess: () => { toast.success('Donation verified'); qc.invalidateQueries({ queryKey: ['kebele-donations'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  const rejectDonation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.patch(`/admin/donations/${id}/reject`, { reason }),
    onSuccess: () => { toast.success('Donation rejected'); qc.invalidateQueries({ queryKey: ['kebele-donations'] }); setRejectId(null); setRejectReason(''); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  const total = donations?.reduce((s: number, d: any) => s + (d.amount || 0), 0) ?? 0;

  const exportCSV = () => {
    if (!donations?.length) return;
    const headers = ['Donor', 'Target', 'Amount', 'Currency', 'Type', 'Payment Method', 'Reference Code', 'Status', 'Date'];
    const rows = donations.map((d: any) => [
      d.isAnonymous ? 'Anonymous' : `${d.donor?.firstName} ${d.donor?.lastName}`,
      d.campaign ? `Campaign: ${d.campaign.title}` : (d.supportRequest ? `Support Request: ${d.supportRequest.title}` : 'General'),
      d.amount || 0, d.currency, d.donationType, d.paymentMethod || 'N/A',
      d.referenceCode || d.chapaRef || 'N/A', d.paymentStatus,
      new Date(d.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.map((c: any) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `donations-${statusTab}-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={cn('text-2xl font-extrabold', isDark ? 'text-white' : 'text-gray-900')}>Kebele Donation Management</h1>
          <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-gray-500')}>{donations?.length ?? 0} Direct Support donations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn('flex items-center gap-2 rounded-2xl px-5 py-3',
            isDark ? 'bg-green-900/30 border border-green-800' : 'bg-green-50 border border-green-100')}>
            <TrendingUp className="w-5 h-5 text-[var(--color-civic-emerald)]" />
            <div>
              <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-gray-500')}>{t('admin.total_raised_label')}</p>
              <p className="text-lg font-extrabold text-[var(--color-civic-emerald)]">{formatCurrency(total)}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={exportCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2">
        {(['ALL','PENDING','SUCCESS','FAILED'] as StatusTab[]).map(s => (
          <button key={s} onClick={() => setStatusTab(s)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
              statusTab === s
                ? 'bg-[var(--color-civic-emerald)] text-white'
                : (isDark ? 'bg-slate-700 text-slate-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-800'))}>
            {s}
          </button>
        ))}
      </div>

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRejectId(null)} />
          <Card className="relative z-10 w-full max-w-md p-6">
            <h3 className={cn('text-lg font-bold mb-4', isDark ? 'text-white' : 'text-gray-900')}>Reject Donation</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="Reason for rejection..."
              className={cn('w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 mb-4',
                isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-200')} />
            <div className="flex gap-2">
              <Button variant="danger" onClick={() => rejectDonation.mutate({ id: rejectId, reason: rejectReason })}
                isLoading={rejectDonation.isPending} disabled={!rejectReason.trim()}>
                Confirm Reject
              </Button>
              <Button variant="ghost" onClick={() => { setRejectId(null); setRejectReason(''); }}>Cancel</Button>
            </div>
          </Card>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-[var(--color-civic-emerald)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !donations?.length ? (
        <Card className="text-center py-16">
          <Heart className={cn('w-12 h-12 mx-auto mb-3', isDark ? 'text-slate-600' : 'text-gray-200')} />
          <p className={cn('font-medium', isDark ? 'text-slate-400' : 'text-gray-400')}>{t('admin.no_donations')}</p>
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden divide-y shadow-sm">
          {donations.map((d: any) => (
            <div key={d.id} className={cn('p-5 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4', isDark ? 'hover:bg-slate-800/30' : 'hover:bg-gray-50/50')}>
              {/* Left Column: Donor & Date */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0',
                  isDark ? 'bg-[var(--color-civic-emerald)]/20 text-[var(--color-civic-emerald)]' : 'bg-green-100 text-[var(--color-civic-emerald)]')}>
                  {d.isAnonymous ? '?' : d.donor?.firstName?.[0] || 'D'}
                </div>
                <div className="min-w-0">
                  <h3 className={cn('text-sm font-bold truncate', isDark ? 'text-white' : 'text-gray-900')}>
                    {d.isAnonymous ? t('admin.anonymous') : `${d.donor?.firstName ?? ''} ${d.donor?.lastName ?? ''}`}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn('text-xs font-medium', isDark ? 'text-slate-400' : 'text-gray-500')}>{formatDate(d.createdAt)}</span>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 font-medium', isDark ? 'text-slate-300' : 'text-gray-600')}>
                      {d.donationType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle Column: Target Info */}
              <div className="flex-1 min-w-0 px-2 border-l border-r border-transparent lg:border-gray-100 lg:dark:border-slate-800">
                {d.campaign ? (
                  <div className="flex flex-col">
                    <span className={cn('text-[10px] font-bold uppercase tracking-wider', isDark ? 'text-indigo-400' : 'text-indigo-600')}>Campaign</span>
                    <span className={cn('font-medium text-sm truncate', isDark ? 'text-slate-300' : 'text-gray-700')} title={d.campaign.title}>{d.campaign.title}</span>
                  </div>
                ) : d.supportRequest ? (
                  <div className="flex flex-col">
                    <span className={cn('text-[10px] font-bold uppercase tracking-wider', isDark ? 'text-blue-400' : 'text-blue-600')}>Support Request</span>
                    <span className={cn('font-medium text-sm truncate', isDark ? 'text-slate-300' : 'text-gray-700')} title={d.supportRequest.title}>{d.supportRequest.title}</span>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <span className={cn('text-[10px] font-bold uppercase tracking-wider', isDark ? 'text-slate-500' : 'text-gray-400')}>General Donation</span>
                    <span className={cn('font-medium text-sm italic', isDark ? 'text-slate-400' : 'text-gray-500')}>Unrestricted</span>
                  </div>
                )}
              </div>

              {/* Right Column: Amount & Payment */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-extrabold text-[var(--color-civic-emerald)]">{d.amount ? formatCurrency(d.amount) : 'Item/Other'}</span>
                </div>
                <div className={cn('text-xs font-medium mt-1 flex flex-col', isDark ? 'text-slate-400' : 'text-gray-500')}>
                  <span>Method: <span className={isDark ? 'text-slate-300' : 'text-gray-700'}>{d.paymentMethod || 'N/A'}</span></span>
                  <span className="truncate" title={d.referenceCode || d.chapaRef || 'N/A'}>Ref: <span className={cn('font-mono', isDark ? 'text-slate-300' : 'text-gray-700')}>{d.referenceCode || d.chapaRef || '—'}</span></span>
                </div>
              </div>

              {/* Actions Column */}
              <div className="flex flex-col items-end gap-3 shrink-0">
                <Badge variant={statusVariant(d.paymentStatus)}>{d.paymentStatus}</Badge>
                
                <div className="flex items-center gap-2">
                  {d.paymentStatus !== 'SUCCESS' && (
                    <Button size="sm" onClick={() => verifyDonation.mutate(d.id)} isLoading={verifyDonation.isPending}>
                      Verify
                    </Button>
                  )}
                  {d.paymentStatus !== 'FAILED' && (
                    <Button size="sm" variant="danger" onClick={() => setRejectId(d.id)}>
                      Reject
                    </Button>
                  )}
                </div>

                {d.paymentStatus === 'FAILED' && d.rejectionReason && (
                  <p className={cn('text-[10px] text-right max-w-[150px] leading-tight', isDark ? 'text-red-400' : 'text-red-500')} title={d.rejectionReason}>
                    <span className="font-semibold">Reason:</span> {d.rejectionReason}
                  </p>
                )}
                {d.paymentStatus === 'SUCCESS' && d.verifiedAt && (
                  <p className={cn('text-[10px]', isDark ? 'text-emerald-400' : 'text-emerald-600')}>
                    Verified {formatDate(d.verifiedAt)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
