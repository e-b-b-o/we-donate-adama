import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Eye, ExternalLink, BadgeCheck, Send, CheckSquare, Plus, X, FileText, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import api from '../../lib/api';
import { formatDate, formatCurrency } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import Card from '../../components/ui/Card';
import Badge, { statusVariant } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/ui/ImageUpload';

type ViewMode = 'requests' | 'campaigns';
type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED';

const URGENCY_MAP: Record<number, { label: string; color: string }> = {
  5: { label: 'Emergency', color: 'bg-red-100 text-red-700 border-red-200' },
  4: { label: 'Critical', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  3: { label: 'High', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  2: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  1: { label: 'Standard', color: 'bg-green-100 text-[var(--color-civic-emerald)] border-green-200' },
};

const REQUEST_CATEGORIES = [
  { value: 'FOOD', label: 'Food' },
  { value: 'MEDICINE', label: 'Medicine' },
  { value: 'CLOTHES', label: 'Clothing' },
  { value: 'MONEY', label: 'Financial Aid' },
  { value: 'OTHER', label: 'Other' },
];

const CAMPAIGN_CATEGORIES = [
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'HEALTH', label: 'Health & Medical' },
  { value: 'EMERGENCY', label: 'Emergency Relief' },
  { value: 'OTHER', label: 'Other' },
];

const EMPTY_REQUEST_FORM = {
  title: '', description: '', category: 'FOOD', urgencyLevel: '1',
  goalAmount: '', location: '', familySize: '1',
  imageUrl: '', telebirrAccount: '', cbeAccount: '', boaAccount: '', awashAccount: '',
  otherBankName: '', otherBankAccount: '',
  requesterPhone: '',
  supportLetterUrl: '', additionalNotes: '',
  beneficiaryName: '', beneficiaryIdType: 'NATIONAL_ID', beneficiaryIdNum: '',
  beneficiaryFrontIdUrl: '', beneficiaryBackIdUrl: '', beneficiaryFanNumber: '', beneficiaryPhone: '',
};

const EMPTY_CAMPAIGN_FORM = {
  title: '', description: '', category: 'INFRASTRUCTURE', goalAmount: '', deadline: '',
  imageUrl: '', telebirrAccount: '', cbeAccount: '', boaAccount: '', awashAccount: '',
  otherBankName: '', otherBankAccount: '',
  requesterPhone: '',
  supportLetterUrl: '', additionalNotes: '',
};

function DetailRow({ label, value, isDark }: { label: string; value?: string | null; isDark: boolean }) {
  if (!value) return null;
  return (
    <div className="flex gap-3">
      <span className={cn('text-xs font-semibold w-32 shrink-0', isDark ? 'text-slate-400' : 'text-gray-500')}>{label}</span>
      <span className={cn('text-xs flex-1', isDark ? 'text-slate-200' : 'text-gray-800')}>{value}</span>
    </div>
  );
}

function AccountInfo({ data, isDark }: { data: any; isDark: boolean }) {
  const { t } = useTranslation();
  const accounts = [
    { label: t('admin.telebirr'), value: data.telebirrAccount },
    { label: t('admin.cbe'), value: data.cbeAccount },
    { label: t('admin.boa'), value: data.boaAccount },
    { label: t('admin.awash'), value: data.awashAccount },
    { label: data.otherBankName || t('admin.other_bank'), value: data.otherBankAccount },
  ].filter(a => a.value);
  if (!accounts.length) return <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-gray-400')}>{t('admin.none_provided')}</span>;
  return (
    <div className="space-y-1">
      {accounts.map(a => (
        <div key={a.label} className={cn('text-xs px-2 py-1 rounded-lg flex justify-between',
          isDark ? 'bg-slate-700' : 'bg-gray-100')}>
          <span className="font-semibold">{a.label}:</span>
          <span className="font-mono">{a.value}</span>
        </div>
      ))}
    </div>
  );
}

function CreateForUserModal({ isOpen, onClose, isDark }: { isOpen: boolean; onClose: () => void; isDark: boolean }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [createType, setCreateType] = useState<'requests' | 'campaigns'>('requests');
  const [targetUserId, setTargetUserId] = useState('');
  const [reqForm, setReqForm] = useState(EMPTY_REQUEST_FORM);
  const [campForm, setCampForm] = useState(EMPTY_CAMPAIGN_FORM);

  const input = cn('w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-civic-emerald)] transition-colors',
    isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300');
  const label = cn('block text-xs font-medium mb-1', isDark ? 'text-slate-300' : 'text-gray-700');

  const { data: users } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => api.get('/admin/users').then(r => r.data.data),
    enabled: isOpen,
  });

  const createRequest = useMutation({
    mutationFn: (data: any) => api.post('/support-requests', data),
    onSuccess: () => {
      toast.success('Assisted support request created');
      qc.invalidateQueries({ queryKey: ['admin-requests'] });
      resetForm();
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  const createCampaign = useMutation({
    mutationFn: (data: any) => api.post('/campaigns', data),
    onSuccess: () => {
      toast.success('Campaign created for user');
      qc.invalidateQueries({ queryKey: ['admin-campaigns'] });
      resetForm();
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  const resetForm = () => {
    setReqForm(EMPTY_REQUEST_FORM);
    setCampForm(EMPTY_CAMPAIGN_FORM);
  };

  const handleSubmit = () => {
    if (!reqForm.beneficiaryName) { toast.error('Beneficiary name is required'); return; }
    if (!reqForm.title || !reqForm.description || !reqForm.category) { toast.error('Fill required request fields'); return; }
    
    if (parseFloat(reqForm.goalAmount) > 0) {
      const hasPaymentMethod = reqForm.telebirrAccount || reqForm.cbeAccount || reqForm.boaAccount || reqForm.awashAccount || (reqForm.otherBankName && reqForm.otherBankAccount);
      if (!hasPaymentMethod) {
        toast.error('At least one receiving method (Bank or Telebirr) must be supplied for financial requests.');
        return;
      }
    }
    
    // We send isAssisted = true to indicate this is an assisted request
    createRequest.mutate({ ...reqForm, isAssisted: true });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-gray-900')}>Create Assisted Request</h2>
          <button onClick={onClose} className={cn('p-1.5 rounded-lg', isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500')}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Beneficiary Snapshot */}
        <div className={cn('mb-6 rounded-xl p-4 space-y-3', isDark ? 'bg-slate-700/50 border border-slate-600' : 'bg-blue-50 border border-blue-200')}>
          <p className={cn('text-sm font-bold', isDark ? 'text-blue-400' : 'text-blue-700')}>Beneficiary Information</p>
          <div className="space-y-3">
            <div>
              <label className={label}>Full Name *</label>
              <input className={input} placeholder="Beneficiary's full name" value={reqForm.beneficiaryName}
                onChange={e => setReqForm(p => ({ ...p, beneficiaryName: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>ID Type</label>
                <select className={input} value={reqForm.beneficiaryIdType}
                  onChange={e => setReqForm(p => ({ ...p, beneficiaryIdType: e.target.value }))}>
                  <option value="NATIONAL_ID">National ID</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVER_LICENSE">Driver's License</option>
                  <option value="KEBELE_ID">Kebele ID</option>
                </select>
              </div>
              <div>
                <label className={label}>ID Number</label>
                <input className={input} placeholder="ID Number" value={reqForm.beneficiaryIdNum}
                  onChange={e => setReqForm(p => ({ ...p, beneficiaryIdNum: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Contact Phone</label>
                <input className={input} placeholder="Phone (if available)" value={reqForm.beneficiaryPhone}
                  onChange={e => setReqForm(p => ({ ...p, beneficiaryPhone: e.target.value }))} />
              </div>
              <div>
                <label className={label}>FAN Number (Optional)</label>
                <input className={input} placeholder="FAN Number" value={reqForm.beneficiaryFanNumber}
                  onChange={e => setReqForm(p => ({ ...p, beneficiaryFanNumber: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className={label}>Front ID Photo</label>
                <ImageUpload label="" value={reqForm.beneficiaryFrontIdUrl} onChange={v => setReqForm(p => ({ ...p, beneficiaryFrontIdUrl: v }))} accept="image/*" />
              </div>
              <div>
                <label className={label}>Back ID Photo</label>
                <ImageUpload label="" value={reqForm.beneficiaryBackIdUrl} onChange={v => setReqForm(p => ({ ...p, beneficiaryBackIdUrl: v }))} accept="image/*" />
              </div>
            </div>
          </div>
        </div>

        {/* Support Request Form */}
          <div className="space-y-3">
            <div>
              <label className={label}>Title *</label>
              <input className={input} placeholder="Support request title" value={reqForm.title}
                onChange={e => setReqForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Category *</label>
                <select className={input} value={reqForm.category}
                  onChange={e => setReqForm(p => ({ ...p, category: e.target.value }))}>
                  {REQUEST_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Urgency Level</label>
                <select className={input} value={reqForm.urgencyLevel}
                  onChange={e => setReqForm(p => ({ ...p, urgencyLevel: e.target.value }))}>
                  {Object.entries(URGENCY_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Target Amount (ETB)</label>
                <input type="number" className={input} placeholder="Optional" value={reqForm.goalAmount}
                  onChange={e => setReqForm(p => ({ ...p, goalAmount: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className={label}>Description *</label>
              <textarea className={cn(input, 'resize-none')} rows={3} placeholder="Describe the situation..."
                value={reqForm.description} onChange={e => setReqForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <label className={label}>Supporting Photo</label>
              <ImageUpload label="" value={reqForm.imageUrl} onChange={v => setReqForm(p => ({ ...p, imageUrl: v }))}
                hint="Optional photo" accept="image/*" />
            </div>
            <div className={cn('rounded-xl p-4 space-y-3', isDark ? 'bg-slate-700/50 border border-slate-600' : 'bg-[var(--color-surface)] border border-[var(--border)]')}>
              <p className={cn('text-xs font-bold', isDark ? 'text-[var(--color-civic-emerald)]' : 'text-[var(--color-civic-emerald)]')}>Payment Accounts</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={label}>TeleBirr</label><input className={input} value={reqForm.telebirrAccount} onChange={e => setReqForm(p => ({ ...p, telebirrAccount: e.target.value }))} /></div>
                <div><label className={label}>CBE</label><input className={input} value={reqForm.cbeAccount} onChange={e => setReqForm(p => ({ ...p, cbeAccount: e.target.value }))} /></div>
                <div><label className={label}>BOA</label><input className={input} value={reqForm.boaAccount} onChange={e => setReqForm(p => ({ ...p, boaAccount: e.target.value }))} /></div>
                <div><label className={label}>Awash</label><input className={input} value={reqForm.awashAccount} onChange={e => setReqForm(p => ({ ...p, awashAccount: e.target.value }))} /></div>
              </div>
              <div className={cn('pt-3 border-t', isDark ? 'border-slate-600' : 'border-green-200')}>
                <label className={label}>Contact Phone (for item donations)</label>
                <input className={input} placeholder="+251 9XX XXX XXX" value={reqForm.requesterPhone} onChange={e => setReqForm(p => ({ ...p, requesterPhone: e.target.value }))} />
              </div>
            </div>
            <div className={cn('rounded-xl p-4 space-y-3', isDark ? 'bg-amber-900/20 border border-amber-700/40' : 'bg-amber-50 border border-amber-200')}>
              <p className={cn('text-xs font-bold', isDark ? 'text-amber-400' : 'text-amber-700')}>Support Letter & Documents</p>
              <div><label className={label}>Support Letter *</label>
                <ImageUpload label="" value={reqForm.supportLetterUrl} onChange={v => setReqForm(p => ({ ...p, supportLetterUrl: v }))}
                  hint="Upload the support letter" accept=".pdf,image/*" /></div>
              <div><label className={label}>Additional Notes</label>
                <textarea className={cn(input, 'resize-none')} rows={2} value={reqForm.additionalNotes} onChange={e => setReqForm(p => ({ ...p, additionalNotes: e.target.value }))} /></div>
            </div>
          </div>

        <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-slate-700">
          <Button onClick={handleSubmit}
            isLoading={createRequest.isPending}>
            <Plus className="w-4 h-4 mr-1" /> Create Assisted Request
          </Button>
          <Button variant="ghost" onClick={() => { resetForm(); onClose(); }}>Cancel</Button>
        </div>
      </Card>
    </div>
  );
}

export default function AdminRequestsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const location = useLocation();
  const { isDark } = useTheme();
  const { user: currentUser } = useAuth();
  const isCampaignsPage = location.pathname.includes('/admin/campaigns');
  const view: ViewMode = isCampaignsPage ? 'campaigns' : 'requests';
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ item: any; type: ViewMode } | null>(null);

  const isKebeleAdmin = currentUser?.role === 'KEBELE_ADMIN';
  const isHighAdmin = currentUser?.role === 'CITY_ADMIN' || currentUser?.role === 'SYSTEM_ADMIN';

  const { data: requests, isLoading: loadingReqs } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: () => api.get('/support-requests/all').then(r => r.data.data),
    enabled: view === 'requests',
  });
  const { data: campaigns, isLoading: loadingCamps } = useQuery({
    queryKey: ['admin-campaigns'],
    queryFn: () => api.get('/campaigns/all').then(r => r.data.data),
    enabled: view === 'campaigns' && isHighAdmin,
  });

  const updateReq = useMutation({
    mutationFn: ({ id, status, adminNote }: any) => api.patch(`/support-requests/${id}/status`, { status, adminNote }),
    onSuccess: () => { toast.success(t('admin.updated')); qc.invalidateQueries({ queryKey: ['admin-requests'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || t('admin.failed')),
  });
  const updateCamp = useMutation({
    mutationFn: ({ id, status, adminNote }: any) => api.patch(`/campaigns/${id}/status`, { status, adminNote }),
    onSuccess: () => { toast.success(t('admin.updated')); qc.invalidateQueries({ queryKey: ['admin-campaigns'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || t('admin.failed')),
  });
  const publishReq = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/requests/${id}/publish`),
    onSuccess: () => { toast.success('Request published'); qc.invalidateQueries({ queryKey: ['admin-requests'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });
  const fulfillReq = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/requests/${id}/fulfill`),
    onSuccess: () => { toast.success('Request fulfilled'); qc.invalidateQueries({ queryKey: ['admin-requests'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });
  const publishCamp = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/campaigns/${id}/publish`),
    onSuccess: () => { toast.success('Campaign published'); qc.invalidateQueries({ queryKey: ['admin-campaigns'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });
  const deleteReq = useMutation({
    mutationFn: (id: string) => api.delete(`/support-requests/${id}`),
    onSuccess: () => {
      toast.success('Request deleted');
      qc.invalidateQueries({ queryKey: ['admin-requests'] });
      setDeletingItem(null);
      setExpanded(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to delete'),
  });
  const deleteCamp = useMutation({
    mutationFn: (id: string) => api.delete(`/campaigns/${id}`),
    onSuccess: () => {
      toast.success('Campaign deleted');
      qc.invalidateQueries({ queryKey: ['admin-campaigns'] });
      setDeletingItem(null);
      setExpanded(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to delete'),
  });

  const toggleExpand = (id: string) => setExpanded(prev => prev === id ? null : id);

  const handleReject = (id: string, type: 'requests' | 'campaigns') => {
    const reason = notes[id]?.trim();
    if (!reason) { toast.error(t('admin.rejection_reason_required')); return; }
    const mutate = type === 'requests' ? updateReq : updateCamp;
    mutate.mutate({ id, status: 'REJECTED', adminNote: reason });
  };

  const filterItems = (items: any[]) => {
    if (statusFilter === 'ALL') return items;
    if (statusFilter === 'PENDING') return items.filter((i: any) => ['PENDING_REVIEW', 'PENDING_CITY_APPROVAL', 'DRAFT'].includes(i.status));
    if (statusFilter === 'FULFILLED') return items.filter((i: any) => i.status === 'FULFILLED');
    return items.filter((i: any) => i.status === statusFilter);
  };

  const ItemCard = ({ item, type }: { item: any; type: 'requests' | 'campaigns' }) => {
    const isOpen = expanded === item.id;
    const mutate = type === 'requests' ? updateReq : updateCamp;
    const publishMutate = type === 'requests' ? publishReq : publishCamp;

    return (
      <div key={item.id} className={cn('transition-colors overflow-hidden', isDark ? 'hover:bg-slate-800/30' : 'hover:bg-gray-50/50')}>
        <div className="px-5 py-4 flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h3 className={cn('text-sm font-bold truncate', isDark ? 'text-white' : 'text-gray-900')}>{item.title}</h3>
              <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
              {item.category && (
                <span className={cn('text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded', isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500')}>
                  {item.category}
                </span>
              )}
              {item.urgencyLevel && (
                <span className={cn('text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border', URGENCY_MAP[item.urgencyLevel]?.color)}>
                  {URGENCY_MAP[item.urgencyLevel]?.label}
                </span>
              )}
              {item.isPublished && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Published</span>
              )}
              {item.source === 'ASSISTED' && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">Assisted</span>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-xs">
              {item.user ? (
                <span className={cn('flex items-center gap-1.5 font-medium', isDark ? 'text-slate-300' : 'text-gray-700')}>
                  {item.user.profileImage ? (
                    <img src={item.user.profileImage} className="w-4 h-4 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-[var(--color-civic-emerald)] flex items-center justify-center text-white font-bold text-[8px]">
                      {item.user.firstName?.[0]}
                    </div>
                  )}
                  {item.user.firstName} {item.user.lastName}
                  {item.user.verificationStatus === 'VERIFIED' && <BadgeCheck className="w-3 h-3 text-blue-500" />}
                </span>
              ) : (
                <span className={cn('flex items-center gap-1.5 font-medium', isDark ? 'text-slate-300' : 'text-gray-700')}>
                  <div className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[8px] font-bold">
                    {item.beneficiaryName?.[0] || '?'}
                  </div>
                  {item.beneficiaryName || 'Assisted Beneficiary'}
                </span>
              )}
              <span className={isDark ? 'text-slate-600' : 'text-gray-300'}>|</span>
              <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>{formatDate(item.createdAt)}</span>
              {item.location && (
                <>
                  <span className={isDark ? 'text-slate-600' : 'text-gray-300'}>|</span>
                  <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>{item.location}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {((isKebeleAdmin && type === 'requests' && item.status === 'PENDING_REVIEW') || (isHighAdmin && type === 'requests' && item.status === 'PENDING_CITY_APPROVAL') || (isHighAdmin && type === 'campaigns' && (item.status === 'PENDING_REVIEW' || item.status === 'DRAFT'))) && (
               <div className="hidden sm:flex items-center gap-2 mr-2 pr-4 border-r border-gray-200 dark:border-slate-700">
                 {!isOpen && (
                   <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Needs Review</span>
                 )}
               </div>
            )}
            
            <button
              onClick={() => setDeletingItem({ item, type })}
              title="Delete"
              className={cn('p-2 rounded-lg transition-colors',
                isDark ? 'text-slate-500 hover:text-red-400 hover:bg-red-900/20' : 'text-gray-400 hover:text-red-600 hover:bg-red-50')}>
              <Trash2 className="w-4 h-4" />
            </button>
            <Button variant="ghost" size="sm" onClick={() => toggleExpand(item.id)}
              className={cn('text-xs gap-1', isOpen && (isDark ? 'bg-slate-800' : 'bg-gray-100'))}>
              <Eye className="w-3.5 h-3.5" />
              {isOpen ? t('admin.hide') : t('admin.view_details')}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className={cn('px-5 pb-5 pt-3 border-t', isDark ? 'border-slate-800 bg-slate-900/20' : 'border-gray-100 bg-gray-50/50')}>
            {((isKebeleAdmin && type === 'requests' && item.status === 'PENDING_REVIEW') || (isHighAdmin && type === 'requests' && item.status === 'PENDING_CITY_APPROVAL') || (isHighAdmin && type === 'campaigns' && (item.status === 'PENDING_REVIEW' || item.status === 'DRAFT'))) && (
              <div className={cn('mb-6 p-4 rounded-xl border flex flex-col sm:flex-row gap-3', isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm')}>
                <textarea placeholder={t('admin.admin_note_placeholder')} value={notes[item.id] || ''} rows={1}
                  onChange={e => setNotes(p => ({ ...p, [item.id]: e.target.value }))}
                  className={cn('flex-1 rounded-lg border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-civic-emerald)]',
                    isDark ? 'bg-slate-900/50 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200')} />
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                    isLoading={mutate.isPending}
                    onClick={() => mutate.mutate({ id: item.id, status: type === 'campaigns' ? 'PUBLISHED' : 'APPROVED', adminNote: notes[item.id] })}>
                    {t('admin.approve')}
                  </Button>
                  <Button size="sm" variant="danger" leftIcon={<XCircle className="w-3.5 h-3.5" />}
                    onClick={() => handleReject(item.id, type)}>
                    {t('admin.reject')}
                  </Button>
                  {isHighAdmin && (item.status === 'PENDING_CITY_APPROVAL' || (type === 'campaigns' && (item.status === 'PENDING_REVIEW' || item.status === 'DRAFT'))) && (
                    <Button size="sm" variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-900/50 dark:hover:bg-amber-900/20"
                      onClick={() => {
                        if (!notes[item.id]?.trim()) { toast.error('Please provide a reason in the note'); return; }
                        mutate.mutate({ id: item.id, status: 'CHANGES_REQUESTED', adminNote: notes[item.id] });
                      }}>
                      Request Changes
                    </Button>
                  )}
                </div>
              </div>
            )}

            {(item.status === 'APPROVED' || item.status === 'PUBLISHED') && (
              <div className="mb-6 flex gap-2">
                {!item.isPublished && (
                  <Button size="sm" leftIcon={<Send className="w-3.5 h-3.5" />}
                    isLoading={publishMutate.isPending}
                    onClick={() => publishMutate.mutate(item.id)}>
                    Publish
                  </Button>
                )}
                {type === 'requests' && (
                  <Button size="sm" variant="secondary" leftIcon={<CheckSquare className="w-3.5 h-3.5" />}
                    isLoading={fulfillReq.isPending}
                    onClick={() => fulfillReq.mutate(item.id)}>
                    Mark Fulfilled
                  </Button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h4 className={cn('text-[10px] font-bold uppercase tracking-widest mb-2', isDark ? 'text-slate-500' : 'text-gray-400')}>Description</h4>
                  <p className={cn('text-sm leading-relaxed whitespace-pre-wrap', isDark ? 'text-slate-300' : 'text-gray-700')}>
                    {item.description}
                  </p>
                </div>

                {item.imageUrl && (
                  <div>
                    <h4 className={cn('text-[10px] font-bold uppercase tracking-widest mb-2', isDark ? 'text-slate-500' : 'text-gray-400')}>{t('admin.request_photo')}</h4>
                    <a href={item.imageUrl} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 group relative">
                      <img src={item.imageUrl} alt="Request" className="w-full max-h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-black text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1 transition-opacity">
                          <ExternalLink className="w-3 h-3" /> View Full Image
                        </span>
                      </div>
                    </a>
                  </div>
                )}
                
                {item.supportLetterUrl && (
                  <div>
                    <h4 className={cn('text-[10px] font-bold uppercase tracking-widest mb-2', isDark ? 'text-slate-500' : 'text-gray-400')}>Documents</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { label: t('admin.support_letter'), url: item.supportLetterUrl },
                        { label: 'Beneficiary Front ID', url: item.beneficiaryFrontIdUrl },
                        { label: 'Beneficiary Back ID', url: item.beneficiaryBackIdUrl },
                      ].filter(d => d.url).map(d => (
                        <a key={d.label} href={d.url} target="_blank" rel="noopener noreferrer"
                          className={cn('rounded-xl overflow-hidden border group relative block',
                            isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-white')}>
                          <img src={d.url} alt={d.label}
                            className="w-full h-24 object-cover group-hover:opacity-80 transition-opacity"
                            onError={e => (e.currentTarget.style.display = 'none')} />
                          <div className={cn('px-2 py-1.5 border-t text-[10px] font-semibold truncate', isDark ? 'border-slate-700 text-slate-300' : 'border-gray-100 text-gray-700')}>
                            {d.label} ↗
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {item.goalAmount && (
                  <div className={cn('rounded-xl p-4 border', isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200')}>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-xl font-extrabold text-[var(--color-civic-emerald)]">{formatCurrency(item.raisedAmount || 0)}</span>
                      <span className={cn('text-xs font-medium', isDark ? 'text-slate-400' : 'text-gray-500')}>of {formatCurrency(item.goalAmount)}</span>
                    </div>
                    <div className={cn('h-2 rounded-full overflow-hidden', isDark ? 'bg-slate-700' : 'bg-gray-100')}>
                      <div className="h-full bg-[var(--color-civic-emerald)] rounded-full transition-all"
                        style={{ width: `${Math.min(((item.raisedAmount || 0) / item.goalAmount) * 100, 100)}%` }} />
                    </div>
                  </div>
                )}

                <div className={cn('rounded-xl border divide-y', isDark ? 'bg-slate-800 border-slate-700 divide-slate-700' : 'bg-white border-gray-200 divide-gray-100')}>
                  <div className="p-3">
                    <h4 className={cn('text-[10px] font-bold uppercase tracking-widest mb-2', isDark ? 'text-slate-500' : 'text-gray-400')}>
                      {item.user ? 'Requester' : 'Assisted Beneficiary'}
                    </h4>
                    {item.user ? (
                      <div className="text-xs space-y-1">
                        <p className={isDark ? 'text-slate-300' : 'text-gray-700'}><span className={isDark ? 'text-slate-500' : 'text-gray-400'}>Email:</span> {item.user.email}</p>
                        <p className={isDark ? 'text-slate-300' : 'text-gray-700'}><span className={isDark ? 'text-slate-500' : 'text-gray-400'}>Phone:</span> {item.user.phone}</p>
                      </div>
                    ) : (
                      <div className="text-xs space-y-1">
                        <p className={isDark ? 'text-slate-300' : 'text-gray-700'}><span className={isDark ? 'text-slate-500' : 'text-gray-400'}>ID:</span> {item.beneficiaryIdType?.replace(/_/g, ' ')} {item.beneficiaryIdNum}</p>
                        <p className={isDark ? 'text-slate-300' : 'text-gray-700'}><span className={isDark ? 'text-slate-500' : 'text-gray-400'}>Phone:</span> {item.beneficiaryPhone || 'N/A'}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                     <h4 className={cn('text-[10px] font-bold uppercase tracking-widest mb-2', isDark ? 'text-slate-500' : 'text-gray-400')}>Details</h4>
                     <div className="text-xs space-y-1">
                       {item.familySize && <p className={isDark ? 'text-slate-300' : 'text-gray-700'}><span className={isDark ? 'text-slate-500' : 'text-gray-400'}>Family Size:</span> {item.familySize} people</p>}
                       {type === 'campaigns' && item.deadline && <p className={isDark ? 'text-slate-300' : 'text-gray-700'}><span className={isDark ? 'text-slate-500' : 'text-gray-400'}>Deadline:</span> {formatDate(item.deadline)}</p>}
                       {item.fanNumber && <p className={isDark ? 'text-slate-300' : 'text-gray-700'}><span className={isDark ? 'text-slate-500' : 'text-gray-400'}>FAN:</span> {item.fanNumber}</p>}
                     </div>
                  </div>

                  <div className="p-3">
                    <h4 className={cn('text-[10px] font-bold uppercase tracking-widest mb-2', isDark ? 'text-slate-500' : 'text-gray-400')}>Payment Accounts</h4>
                    <AccountInfo data={item} isDark={isDark} />
                  </div>
                </div>

                {item.adminNote && (
                  <div className={cn('text-xs px-3 py-2.5 rounded-lg border', isDark ? 'bg-blue-900/10 text-blue-300 border-blue-900/30' : 'bg-blue-50 text-blue-800 border-blue-100')}>
                    <span className="font-bold block mb-0.5 tracking-wide uppercase text-[10px] opacity-70">Admin Note</span>
                    {item.adminNote}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  const currentItems = view === 'requests' ? filterItems(requests || []) : filterItems(campaigns || []);

  return (
    <div className="space-y-6">
      <CreateForUserModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} isDark={isDark} />

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeletingItem(null)} />
          <Card className="relative z-10 w-full max-w-md p-6">
            <div className="flex items-start gap-4">
              <div className={cn('w-12 h-12 rounded-full flex items-center justify-center shrink-0',
                isDark ? 'bg-red-900/40' : 'bg-red-100')}>
                <Trash2 className={cn('w-6 h-6', isDark ? 'text-red-400' : 'text-red-600')} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                  Delete {deletingItem.type === 'requests' ? 'Support Request' : 'Campaign'}
                </h2>
                <p className={cn('text-sm mb-6', isDark ? 'text-slate-300' : 'text-gray-600')}>
                  Are you sure you want to delete{' '}
                  <span className={cn('font-semibold break-words', isDark ? 'text-white' : 'text-gray-800')}>
                    “{deletingItem.item.title}”
                  </span>{' '}
                  by {deletingItem.item.user ? `${deletingItem.item.user.firstName} ${deletingItem.item.user.lastName}` : (deletingItem.item.beneficiaryName || 'Assisted Beneficiary')}?
                </p>
                <p className={cn('text-xs mt-3 px-3 py-2 rounded-lg',
                  isDark ? 'bg-red-900/20 text-red-300 border border-red-700/40' : 'bg-red-50 text-red-700 border border-red-200')}>
                  All donations and inspection reports linked to it will also be removed, and the owner will be notified. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <Button variant="ghost" onClick={() => setDeletingItem(null)}>Cancel</Button>
              <Button variant="danger" leftIcon={<Trash2 className="w-4 h-4" />}
                isLoading={deleteReq.isPending || deleteCamp.isPending}
                onClick={() => deletingItem.type === 'requests'
                  ? deleteReq.mutate(deletingItem.item.id)
                  : deleteCamp.mutate(deletingItem.item.id)}>
                Delete Permanently
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={cn('text-2xl font-extrabold', isDark ? 'text-white' : 'text-gray-900')}>{t('admin.approvals_title')}</h1>
          <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-gray-500')}>{t('admin.approvals_subtitle')}</p>
        </div>
        <div className="flex gap-3">
          {isKebeleAdmin && view === 'requests' && (
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateModal(true)}>
              Create Assisted Request
            </Button>
          )}

        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'FULFILLED'] as StatusFilter[]).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
              statusFilter === s
                ? 'bg-[var(--color-civic-emerald)] text-white'
                : (isDark ? 'bg-slate-700 text-slate-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-800'))}>
            {s}
          </button>
        ))}
      </div>

      {view === 'requests' && (
        loadingReqs ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[var(--color-civic-emerald)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !currentItems.length ? (
          <Card className={cn('text-center py-16', isDark ? 'text-slate-400' : 'text-gray-400')}>{t('admin.no_support_requests')}</Card>
        ) : (
          <Card padding="none" className="divide-y overflow-hidden shadow-sm">
            {currentItems.map((req: any) => <ItemCard key={req.id} item={req} type="requests" />)}
          </Card>
        )
      )}

      {view === 'campaigns' && (
        loadingCamps ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[var(--color-civic-emerald)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !currentItems.length ? (
          <Card className={cn('text-center py-16', isDark ? 'text-slate-400' : 'text-gray-400')}>{t('admin.no_campaigns')}</Card>
        ) : (
          <Card padding="none" className="divide-y overflow-hidden shadow-sm">
            {currentItems.map((camp: any) => <ItemCard key={camp.id} item={camp} type="campaigns" />)}
          </Card>
        )
      )}
    </div>
  );
}
