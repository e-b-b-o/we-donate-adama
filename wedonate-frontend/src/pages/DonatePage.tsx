import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import CampaignUpdates from '../components/CampaignUpdates';
import ImpactGallery from '../components/ImpactGallery';
import {
  Heart, Target, Users, ArrowRight, Lock, Plus,
  Search, Calendar, ChevronRight, X, Copy, Check,
  Smartphone, Building2, Package, CreditCard, Eye, BadgeCheck, Shield, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cn, formatCurrency, formatDate } from '../lib/utils';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ImageUpload from '../components/ui/ImageUpload';

type DonateTab = 'campaigns' | 'requests';

const CAMPAIGN_CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'INFRASTRUCTURE', label: '🏗️ Infrastructure' },
  { value: 'EDUCATION', label: '📚 Education' },
  { value: 'HEALTH', label: '🏥 Health' },
  { value: 'EMERGENCY', label: '🆘 Emergency' },
  { value: 'OTHER', label: '🤝 Other' },
];

const REQUEST_CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'FOOD', label: '🍞 Food' },
  { value: 'MEDICINE', label: '💊 Medicine' },
  { value: 'CLOTHES', label: '👕 Clothes' },
  { value: 'MONEY', label: '💰 Money' },
  { value: 'OTHER', label: '🤲 Other' },
];

function ProgressBar({ raised, goal, deadline, isDark, className }: { raised: number; goal: number; deadline?: string | null; isDark?: boolean; className?: string }) {
  const pct = Math.min((raised / goal) * 100, 100);
  const goalMet = raised >= goal;

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('h-2 rounded-full overflow-hidden', isDark ? 'bg-[var(--color-surface-container-high)]' : 'bg-gray-200')}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full', goalMet
            ? 'bg-gradient-to-r from-[var(--color-civic-emerald)] to-emerald-300'
            : 'bg-gradient-to-r from-[var(--color-amber-cta)] to-yellow-400')}
        />
      </div>
      <div className="flex justify-between items-end mt-2">
        <div>
          <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Raised</p>
          <p className={cn("text-xs font-extrabold", isDark ? "text-white" : "text-gray-900")}>{formatCurrency(raised)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Goal</p>
          <p className={cn("text-xs font-bold", isDark ? "text-white" : "text-gray-900")}>{formatCurrency(goal)}</p>
        </div>
      </div>
    </div>
  );
}

function ShareButton({ platform, label, color, url, title, isDark }: {
  platform: string; label: string; color: string; url: string; title: string; isDark: boolean;
}) {
  const shareUrls: Record<string, string> = {
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Check this out: ${title}`)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check this out: ${title}\n${url}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  };
  return (
    <a href={shareUrls[platform]} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-80 shadow-md"
      style={{ backgroundColor: color }}>
      {platform === 'telegram' && <span>✈</span>}
      {platform === 'whatsapp' && <span>💬</span>}
      {platform === 'facebook' && <span>f</span>}
      {label}
    </a>
  );
}

function CampaignCard({ camp, onDonate, onDetail, isDark }: { camp: any; onDonate: (id: string, title: string, data: any) => void; onDetail: (data: any) => void; isDark: boolean }) {
  const catColors: Record<string, string> = {
    INFRASTRUCTURE: 'bg-blue-900/20 text-blue-400 border-blue-500/30', EDUCATION: 'bg-purple-900/20 text-purple-400 border-purple-500/30',
    HEALTH: 'bg-red-900/20 text-red-400 border-red-500/30', EMERGENCY: 'bg-orange-900/20 text-orange-400 border-orange-500/30', OTHER: 'bg-gray-800/50 text-gray-400 border-gray-600/30',
  };
  const goalReached = camp.raisedAmount >= camp.goalAmount;
  const isCompleted = camp.status === 'COMPLETED';

  return (
    <article className={cn("rounded-3xl border overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl group",
      isDark ? "bg-[var(--color-surface-container)] border-[var(--border)] hover:border-[var(--color-civic-emerald)]/40" 
             : "bg-white border-gray-200 hover:border-[var(--color-civic-emerald)]/40 hover:shadow-[0_10px_40px_-15px_rgba(16,185,129,0.2)]"
    )}>
      {/* Image Area */}
      <div className="relative h-48 overflow-hidden bg-[var(--color-surface-container-highest)]">
        {camp.imageUrl
          ? <img src={camp.imageUrl} alt={camp.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          : <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-30">🏗️</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-container)] via-transparent to-transparent opacity-80" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={cn('text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full border backdrop-blur-md', catColors[camp.category] || catColors.OTHER)}>
            {camp.category.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1 relative z-10 -mt-6">
        {/* Title & Desc */}
        <div className="flex-1">
          <h3 className={cn('text-lg font-extrabold tracking-tight mb-2 line-clamp-2 transition-colors group-hover:text-[var(--color-civic-emerald)]', isDark ? 'text-white' : 'text-gray-900')}>
            {camp.title}
          </h3>
          <p className={cn('text-sm leading-relaxed mb-5 line-clamp-2', isDark ? 'text-[var(--text-muted)]' : 'text-gray-500')}>
            {camp.description}
          </p>
        </div>

        {/* Progress Section */}
        <div className={cn("p-4 rounded-2xl mb-5 border", 
          isDark ? "bg-[var(--color-surface-container-low)] border-[var(--border)]" : "bg-gray-50 border-gray-100"
        )}>
          <ProgressBar raised={camp.raisedAmount} goal={camp.goalAmount} deadline={camp.deadline} isDark={isDark} />
        </div>

        {/* Social Trust Row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-[var(--color-civic-emerald)] flex items-center justify-center border-2 border-[var(--color-surface-container)] z-20"><span className="text-[8px] font-bold text-[#0b131b]">A</span></div>
              <div className="w-6 h-6 rounded-full bg-[var(--color-amber-cta)] flex items-center justify-center border-2 border-[var(--color-surface-container)] z-10"><span className="text-[8px] font-bold text-[#0b131b]">B</span></div>
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center border-2 text-[8px] font-bold z-0", isDark ? "bg-[var(--color-surface-container-high)] border-[var(--color-surface-container)] text-white" : "bg-gray-200 border-white text-gray-700")}>+{camp._count?.donations ?? 0}</div>
            </div>
            <span className={cn("text-[10px] font-bold uppercase tracking-wide", isDark ? "text-[var(--text-muted)]" : "text-gray-500")}>Donors</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn("text-xs font-semibold", isDark ? "text-[var(--text-muted)]" : "text-gray-500")}>by {camp.user?.firstName}</span>
            {camp.user?.verificationStatus === 'VERIFIED' && <BadgeCheck className="w-4 h-4 text-blue-500" />}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <button onClick={() => onDetail(camp)}
            className={cn("flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border", 
              isDark ? "bg-[var(--color-surface-container-high)] text-white border-[var(--border)] hover:bg-[var(--color-surface-container-highest)] hover:border-[var(--color-civic-emerald)]/50" 
                     : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            )}>
            <Eye className="w-4 h-4" /> Details
          </button>
          {isCompleted || goalReached ? (
             <button disabled className="flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-gray-500/20 text-gray-500 cursor-not-allowed border border-gray-500/20">
               <Check className="w-4 h-4" /> Reached
             </button>
          ) : (
            <button onClick={() => onDonate(camp.id, camp.title, camp)}
              className={cn("flex-[1.5] py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95", 
                isDark ? "bg-[var(--color-civic-emerald-glow)] text-[var(--color-civic-emerald)] border border-[var(--color-civic-emerald)]/30 hover:bg-[var(--color-civic-emerald)] hover:text-[#0b131b]" 
                       : "bg-[var(--color-civic-emerald)] text-white border border-transparent hover:bg-[var(--color-civic-emerald-deep)]"
              )}>
              <Heart className="w-4 h-4" /> Donate Now
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function RequestCard({ req, onDonate, onDetail, isDark }: { req: any; onDonate: (id: string, title: string, data: any) => void; onDetail: (data: any) => void; isDark: boolean }) {
  const urgencyMap: Record<number, { label: string; color: string }> = {
    5: { label: '🚨 Emergency', color: 'bg-red-900/20 text-red-400 border-red-500/30' },
    4: { label: '🔴 Critical', color: 'bg-orange-900/20 text-orange-400 border-orange-500/30' },
    3: { label: '🟠 High', color: 'bg-amber-900/20 text-amber-400 border-amber-500/30' },
    2: { label: '🟡 Medium', color: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30' },
    1: { label: '🟢 Standard', color: 'bg-green-900/20 text-green-400 border-green-500/30' },
  };
  const urgency = urgencyMap[req.urgencyLevel] || urgencyMap[1];
  const goalReached = req.goalAmount && req.raisedAmount >= req.goalAmount;
  const isFulfilled = req.status === 'FULFILLED';

  return (
    <article className={cn("rounded-3xl border overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl group",
      isDark ? "bg-[var(--color-surface-container)] border-[var(--border)] hover:border-[var(--color-civic-emerald)]/40" 
             : "bg-white border-gray-200 hover:border-[var(--color-civic-emerald)]/40 hover:shadow-[0_10px_40px_-15px_rgba(16,185,129,0.2)]"
    )}>
      {/* Image Area */}
      <div className="relative h-48 overflow-hidden bg-[var(--color-surface-container-highest)]">
        {req.imageUrl
          ? <img src={req.imageUrl} alt={req.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          : <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-30">🤲</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-container)] via-transparent to-transparent opacity-80" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className={cn('text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full border backdrop-blur-md w-fit', urgency.color)}>
            {urgency.label}
          </span>
          <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full border bg-black/40 border-white/20 text-white backdrop-blur-md w-fit">
            {req.category}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1 relative z-10 -mt-6">
        {/* Title & Desc */}
        <div className="flex-1">
          <h3 className={cn('text-lg font-extrabold tracking-tight mb-2 line-clamp-2 transition-colors group-hover:text-[var(--color-civic-emerald)]', isDark ? 'text-white' : 'text-gray-900')}>
            {req.title}
          </h3>
          <p className={cn('text-sm leading-relaxed mb-5 line-clamp-2', isDark ? 'text-[var(--text-muted)]' : 'text-gray-500')}>
            {req.description}
          </p>
        </div>

        {req.goalAmount && (
          <div className={cn("p-4 rounded-2xl mb-5 border", 
            isDark ? "bg-[var(--color-surface-container-low)] border-[var(--border)]" : "bg-gray-50 border-gray-100"
          )}>
            <ProgressBar raised={req.raisedAmount} goal={req.goalAmount} isDark={isDark} />
          </div>
        )}

        {/* Trust Row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1.5">
            <span className={cn("text-xs font-semibold flex items-center gap-1", isDark ? "text-[var(--text-muted)]" : "text-gray-500")}>
              By {req.user?.firstName}
              {req.user?.verificationStatus === 'VERIFIED' && <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />}
            </span>
          </div>
          <span className={cn("text-xs", isDark ? "text-slate-500" : "text-gray-400")}>{formatDate(req.createdAt)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <button onClick={() => onDetail(req)}
            className={cn("flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border", 
              isDark ? "bg-[var(--color-surface-container-high)] text-white border-[var(--border)] hover:bg-[var(--color-surface-container-highest)] hover:border-[var(--color-civic-emerald)]/50" 
                     : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            )}>
            <Eye className="w-4 h-4" /> Details
          </button>
          {isFulfilled || goalReached ? (
             <button disabled className="flex-[1.5] py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-gray-500/20 text-gray-500 cursor-not-allowed border border-gray-500/20">
               <Check className="w-4 h-4" /> Fulfilled
             </button>
          ) : (
            <button onClick={() => onDonate(req.id, req.title, req)}
              className={cn("flex-[1.5] py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95", 
                isDark ? "bg-[var(--color-civic-emerald-glow)] text-[var(--color-civic-emerald)] border border-[var(--color-civic-emerald)]/30 hover:bg-[var(--color-civic-emerald)] hover:text-[#0b131b]" 
                       : "bg-[var(--color-civic-emerald)] text-white border border-transparent hover:bg-[var(--color-civic-emerald-deep)]"
              )}>
              <Heart className="w-4 h-4" /> Support
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* ── Account Row (copy-to-clipboard) ──────────────────────── */
function AccountRow({ label, value, isDark }: { label: string; value?: string | null; isDark: boolean }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  const copy = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className={cn('flex items-center justify-between px-3 py-2.5 rounded-xl border',
      isDark ? 'bg-[var(--color-surface-container-highest)] border-[var(--border)]' : 'bg-gray-50 border-gray-200')}>
      <div>
        <p className={cn('text-[10px] uppercase font-bold tracking-wider', isDark ? 'text-[var(--text-muted)]' : 'text-gray-500')}>{label}</p>
        <p className={cn('text-sm font-mono font-bold', isDark ? 'text-white' : 'text-gray-900')}>{value}</p>
      </div>
      <button onClick={copy} className={cn('p-2 rounded-lg transition-colors border',
        isDark ? 'hover:bg-[var(--color-surface-container-high)] hover:text-white border-[var(--border)]' : 'hover:bg-gray-200 border-gray-300')}>
        {copied ? <Check className="w-4 h-4 text-[var(--color-civic-emerald)]" /> : <Copy className={cn('w-4 h-4', isDark ? 'text-[var(--text-muted)]' : 'text-gray-400')} />}
      </button>
    </div>
  );
}

/* ── Detail Progress Modal ────────────────────────────────── */
function DetailModal({ data, type, onClose, isDark }: { data: any; type: 'campaign' | 'request'; onClose: () => void; isDark: boolean }) {
  const { data: detailData } = useQuery({
    queryKey: ['detail', type, data?.id],
    queryFn: () => api.get(type === 'campaign' ? `/campaigns/${data.id}` : `/support-requests/${data.id}`).then(r => r.data.data),
    enabled: !!data?.id,
    staleTime: 30000,
  });
  const display = detailData || data;
  if (!display) return null;
  
  // Reuse existing logic
  const pct = display.goalAmount ? Math.min((display.raisedAmount / display.goalAmount) * 100, 100) : 0;
  const donorCount = display._count?.donations ?? display.donations?.length ?? 0;
  const daysLeft = display.deadline ? Math.max(0, Math.ceil((new Date(display.deadline).getTime() - Date.now()) / 86400000)) : null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className={cn('w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border',
          isDark ? 'bg-[var(--color-surface)] border-[var(--border)]' : 'bg-white border-gray-200')}>
          
        {/* Cover Image Hero */}
        <div className="relative h-72 overflow-hidden bg-[var(--color-surface-container)]">
          {display.imageUrl ? (
            <img src={display.imageUrl} alt={display.title} className="w-full h-full object-cover" />
          ) : (
            <div className={cn('w-full h-full flex items-center justify-center text-8xl', isDark ? 'opacity-20' : 'opacity-10')}>
              {type === 'campaign' ? '🏗️' : '🤲'}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] via-[var(--color-surface)]/40 to-transparent" />

          {/* Close button */}
          <button onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10">
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md mb-2">{display.title}</h2>
            <div className="flex flex-wrap gap-2">
              <span className={cn('text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-sm')}>
                {display.category?.replace('_', ' ')}
              </span>
              <span className={cn('text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-sm')}>
                {display.status}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Progress Overview */}
          {display.goalAmount && (
            <div className={cn('rounded-3xl p-6 border', isDark ? 'bg-[var(--color-surface-container)] border-[var(--border)]' : 'bg-gray-50 border-gray-200')}>
              <div className="flex items-center gap-2 mb-6">
                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center border',
                  isDark ? 'bg-[var(--color-civic-emerald-glow)] border-[var(--color-civic-emerald)]/30' : 'bg-green-100 border-green-200')}>
                  <Target className={cn("w-4 h-4", isDark ? "text-[var(--color-civic-emerald)]" : "text-green-600")} />
                </div>
                <h3 className={cn('text-sm font-extrabold uppercase tracking-widest', isDark ? 'text-[var(--color-civic-emerald)]' : 'text-green-700')}>
                  Campaign Overview
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className={cn('text-center p-4 rounded-2xl border', isDark ? 'bg-[var(--color-surface-container-high)] border-[var(--border)]' : 'bg-white border-gray-100')}>
                  <p className={cn('text-2xl font-black tracking-tight', isDark ? 'text-white' : 'text-gray-900')}>
                    {formatCurrency(display.raisedAmount)}
                  </p>
                  <p className={cn('text-[10px] uppercase font-bold tracking-wider mt-1', isDark ? 'text-[var(--text-muted)]' : 'text-gray-500')}>Raised</p>
                </div>
                <div className={cn('text-center p-4 rounded-2xl border', isDark ? 'bg-[var(--color-surface-container-high)] border-[var(--border)]' : 'bg-white border-gray-100')}>
                  <p className={cn('text-2xl font-black tracking-tight', isDark ? 'text-white' : 'text-gray-900')}>
                    {formatCurrency(display.goalAmount)}
                  </p>
                  <p className={cn('text-[10px] uppercase font-bold tracking-wider mt-1', isDark ? 'text-[var(--text-muted)]' : 'text-gray-500')}>Goal</p>
                </div>
                <div className={cn('text-center p-4 rounded-2xl border', isDark ? 'bg-[var(--color-surface-container-high)] border-[var(--border)]' : 'bg-white border-gray-100')}>
                  <div className="flex items-center justify-center gap-1.5">
                    <Users className={cn('w-5 h-5', isDark ? 'text-[var(--color-civic-emerald)]' : 'text-green-600')} />
                    <p className={cn('text-2xl font-black tracking-tight', isDark ? 'text-white' : 'text-gray-900')}>
                      {donorCount}
                    </p>
                  </div>
                  <p className={cn('text-[10px] uppercase font-bold tracking-wider mt-1', isDark ? 'text-[var(--text-muted)]' : 'text-gray-500')}>Donors</p>
                </div>
              </div>

              <ProgressBar raised={display.raisedAmount} goal={display.goalAmount} deadline={display.deadline} isDark={isDark} />
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className={cn('text-xs font-bold uppercase tracking-widest mb-3', isDark ? 'text-[var(--text-muted)]' : 'text-gray-500')}>
              {type === 'campaign' ? 'About this Campaign' : 'About this Request'}
            </h3>
            <p className={cn('text-[15px] leading-relaxed', isDark ? 'text-white/90' : 'text-gray-800')}>{display.description}</p>
          </div>

          <Button className="w-full" onClick={onClose}>Close Detail View</Button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Instant Donation Sidebar (replaces DonationModal) ────────── */
function InstantDonationSidebar({
  target, type, targetData, onClose, isAuthenticated, navigate, isDark,
}: {
  target: { id: string; title: string } | null;
  type: 'campaign' | 'request' | undefined;
  targetData: any;
  onClose: () => void;
  isAuthenticated: boolean;
  navigate: (p: string) => void;
  isDark: boolean;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [donateType, setDonateType] = useState<'ITEM' | 'MONEY' | ''>('');
  const [method, setMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [custom, setCustom] = useState('');
  const [anon, setAnon] = useState(false);
  const [note, setNote] = useState('');
  const [refCode, setRefCode] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemCategory, setItemCategory] = useState('OTHER');
  const [itemImgUrl, setItemImgUrl] = useState('');
  const [delivery, setDelivery] = useState('BRING_TO_OFFICE');
  const [loading, setLoading] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Reset state when target changes
  useEffect(() => {
    setStep(1); setDonateType(''); setMethod(''); setAmount(''); setCustom(''); setProofUrl(''); setItemImgUrl('');
  }, [target?.id]);

  if (!target) {
    return (
      <div className={cn("rounded-3xl border p-8 flex flex-col items-center justify-center text-center min-h-[500px]", 
        isDark ? "bg-[var(--color-surface-container)] border-[var(--border)]" : "bg-white border-gray-200"
      )}>
        <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mb-4 border-4 border-dashed",
          isDark ? "bg-[var(--color-surface-container-high)] border-[var(--border)] text-[var(--color-surface-container-highest)]" : "bg-gray-50 border-gray-200 text-gray-200"
        )}>
          <Shield className="w-8 h-8" />
        </div>
        <h3 className={cn("text-xl font-bold mb-2", isDark ? "text-white" : "text-gray-900")}>Instant Municipal Transfer</h3>
        <p className={cn("text-sm", isDark ? "text-[var(--text-muted)]" : "text-gray-500")}>
          Select a campaign or direct support request from the list to initiate a secure, verified donation.
        </p>
      </div>
    );
  }

  const AMOUNTS = [50, 100, 200, 500, 1000, 2000];
  const finalAmount = parseFloat(amount || custom) || 0;
  
  const inputClass = cn(
    "w-full px-4 py-3.5 border rounded-xl text-sm transition-colors",
    isDark 
      ? "bg-[var(--color-surface-container-high)] border-[var(--border)] text-white placeholder-[var(--text-muted)] focus:border-[var(--color-civic-emerald)] focus:ring-1 focus:ring-[var(--color-civic-emerald)]/30"
      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[var(--color-civic-emerald)] focus:ring-1 focus:ring-[var(--color-civic-emerald)]/30 focus:bg-white"
  );
  const labelClass = cn("block text-xs font-bold uppercase tracking-wider mb-2", isDark ? "text-[var(--text-muted)]" : "text-gray-600");

  const PAYMENT_METHODS = [
    { id: 'TELEBIRR', icon: Smartphone, label: 'TeleBirr', desc: 'Transfer to TeleBirr account', account: targetData?.telebirrAccount },
    { id: 'CBE', icon: Building2, label: 'CBE', desc: 'Commercial Bank of Ethiopia', account: targetData?.cbeAccount },
    { id: 'BOA', icon: Building2, label: 'BOA', desc: 'Bank of Abyssinia', account: targetData?.boaAccount },
    { id: 'AWASH', icon: Building2, label: 'Awash Bank', desc: 'Awash International Bank', account: targetData?.awashAccount },
    { id: 'OTHER_BANK', icon: Building2, label: targetData?.otherBankName || 'Other Bank', desc: 'Any other bank transfer', account: targetData?.otherBankAccount },
  ].filter(m => m.account);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      if (!guestName.trim()) { toast.error('Please provide your name'); return; }
      if (!guestPhone.trim()) { toast.error('Please provide your phone number'); return; }
    }
    if (donateType === 'MONEY') {
      if (finalAmount < 1) { toast.error('Enter a valid amount (min 1 ETB)'); return; }
      if (!refCode.trim()) { toast.error('Please enter the transaction reference code'); return; }
      if (!proofUrl.trim()) { toast.error('Please upload a payment proof screenshot'); return; }
    }
    if (donateType === 'ITEM') {
      if (!itemDesc.trim()) { toast.error('Please describe the items you are donating'); return; }
      if (!itemImgUrl.trim()) { toast.error('Please upload a photo of the items'); return; }
    }

    setLoading(true);
    try {
      const payload: any = {
        donationType: donateType === 'ITEM' ? itemCategory : 'MONEY',
        description: note || itemDesc,
        isAnonymous: anon,
        paymentMethod: donateType === 'ITEM' ? 'ITEM' : method,
        referenceCode: refCode || null,
        paymentProofUrl: proofUrl || null,
        itemDescription: itemDesc || null,
        itemImageUrl: itemImgUrl || null,
        deliveryMethod: donateType === 'ITEM' ? delivery : null,
      };
      if (!isAuthenticated) {
        payload.guestName = guestName;
        payload.guestEmail = guestEmail;
        payload.guestPhone = guestPhone;
      }
      if (donateType === 'MONEY') payload.amount = finalAmount;
      if (type === 'campaign') payload.campaignId = target!.id;
      else payload.supportRequestId = target!.id;

      await api.post('/donations', payload);
      setStep(donateType === 'MONEY' ? 4 : 3);
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Submission failed'); }
    finally { setLoading(false); }
  };

  const moneyDone = step === 4;
  const itemDone = step === 3 && donateType === 'ITEM';
  const isDone = moneyDone || itemDone;

  return (
    <div className={cn("rounded-3xl border overflow-hidden flex flex-col transition-all duration-500 sticky top-28", 
      isDark ? "bg-[var(--color-surface-container)] border-[var(--border)] shadow-2xl shadow-black/50" : "bg-white border-gray-200 shadow-xl"
    )}>
      {/* Header */}
      <div className={cn("p-6 border-b flex justify-between items-start", isDark ? "border-[var(--border)] bg-[var(--color-surface-container-low)]" : "border-gray-100 bg-gray-50")}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Shield className={cn("w-4 h-4", isDark ? "text-[var(--color-amber-cta)]" : "text-amber-500")} />
            <span className={cn("text-[10px] font-extrabold uppercase tracking-widest", isDark ? "text-[var(--color-amber-cta)]" : "text-amber-600")}>Instant Transfer</span>
          </div>
          <h3 className={cn("text-lg font-bold leading-tight line-clamp-2", isDark ? "text-white" : "text-gray-900")}>{target.title}</h3>
        </div>
        <button onClick={onClose} className={cn("p-2 rounded-full transition-colors", isDark ? "hover:bg-[var(--color-surface-container-high)] text-[var(--text-muted)]" : "hover:bg-gray-200 text-gray-500")}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 max-h-[70vh] overflow-y-auto">
        {/* STEP 1: Choose Type */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h4 className={labelClass}>Select Contribution Type</h4>
            <div className="space-y-3">
              <button onClick={() => { setDonateType('MONEY'); setStep(2); }}
                className={cn('w-full flex items-center gap-4 p-5 rounded-2xl border transition-all text-left group',
                  isDark ? 'border-[var(--border)] hover:border-[var(--color-civic-emerald)] hover:bg-[var(--color-surface-container-high)]' 
                         : 'border-gray-200 hover:border-[var(--color-civic-emerald)] hover:bg-green-50')}>
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors',
                  isDark ? 'bg-[var(--color-surface-container)] border-[var(--border)] group-hover:border-[var(--color-civic-emerald)]/50 text-[var(--color-civic-emerald)]' 
                         : 'bg-white border-gray-200 text-green-600')}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className={cn('text-sm font-bold', isDark ? 'text-white' : 'text-gray-900')}>Financial Contribution</p>
                  <p className={cn('text-xs mt-0.5', isDark ? 'text-[var(--text-muted)]' : 'text-gray-500')}>Send birr directly to beneficiary</p>
                </div>
                <ChevronRight className={cn("w-4 h-4", isDark ? "text-[var(--text-muted)] group-hover:text-[var(--color-civic-emerald)]" : "text-gray-400 group-hover:text-green-500")} />
              </button>

              <button onClick={() => { setDonateType('ITEM'); setMethod('ITEM'); setStep(2); }}
                className={cn('w-full flex items-center gap-4 p-5 rounded-2xl border transition-all text-left group',
                  isDark ? 'border-[var(--border)] hover:border-[var(--color-amber-cta)] hover:bg-[var(--color-surface-container-high)]' 
                         : 'border-gray-200 hover:border-amber-400 hover:bg-amber-50')}>
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors',
                  isDark ? 'bg-[var(--color-surface-container)] border-[var(--border)] group-hover:border-[var(--color-amber-cta)]/50 text-[var(--color-amber-cta)]' 
                         : 'bg-white border-gray-200 text-amber-600')}>
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className={cn('text-sm font-bold', isDark ? 'text-white' : 'text-gray-900')}>Material Donation</p>
                  <p className={cn('text-xs mt-0.5', isDark ? 'text-[var(--text-muted)]' : 'text-gray-500')}>Donate food, clothes, or goods</p>
                </div>
                <ChevronRight className={cn("w-4 h-4", isDark ? "text-[var(--text-muted)] group-hover:text-[var(--color-amber-cta)]" : "text-gray-400 group-hover:text-amber-500")} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Money -> Method */}
        {step === 2 && donateType === 'MONEY' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <button onClick={() => setStep(1)} className={cn("text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors", isDark ? "text-[var(--text-muted)] hover:text-white" : "text-gray-500 hover:text-gray-900")}>
              ← Back
            </button>
            
            <div>
              <h4 className={labelClass}>Select Payment Provider</h4>
              {PAYMENT_METHODS.length === 0 ? (
                <div className={cn('text-center py-8 rounded-2xl border', isDark ? 'bg-[var(--color-surface-container-high)] border-[var(--border)]' : 'bg-gray-50 border-gray-200')}>
                  <p className={cn('text-sm font-medium', isDark ? 'text-[var(--text-muted)]' : 'text-gray-500')}>No payment accounts available</p>
                </div>
              ) : (
                <div className="space-y-3 mt-3">
                  {PAYMENT_METHODS.map((m) => (
                    <button key={m.id} onClick={() => { setMethod(m.id); setStep(3); }}
                      className={cn('w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left group',
                        isDark ? 'border-[var(--border)] hover:border-[var(--color-civic-emerald)] hover:bg-[var(--color-surface-container-high)]' 
                               : 'border-gray-200 hover:border-green-400 hover:bg-green-50')}>
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border',
                        isDark ? 'bg-[var(--color-surface-container)] border-[var(--border)] text-[var(--color-civic-emerald)]' : 'bg-white border-gray-200 text-green-600')}>
                        <m.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className={cn('text-sm font-bold', isDark ? 'text-white' : 'text-gray-900')}>{m.label}</p>
                      </div>
                      <div className={cn('text-xs font-mono font-bold', isDark ? 'text-[var(--color-civic-emerald)]' : 'text-green-600')}>
                        {m.account?.length > 8 ? m.account.slice(0, 8) + '...' : m.account}
                      </div>
                      <ChevronRight className={cn("w-4 h-4 transition-colors", isDark ? "text-[var(--text-muted)] group-hover:text-[var(--color-civic-emerald)]" : "text-gray-400 group-hover:text-green-500")} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 3: Money -> Form */}
        {step === 3 && donateType === 'MONEY' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <button onClick={() => setStep(2)} className={cn("text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors", isDark ? "text-[var(--text-muted)] hover:text-white" : "text-gray-500 hover:text-gray-900")}>
              ← Back
            </button>

            <div className={cn('p-4 rounded-2xl border space-y-3',
              isDark ? 'bg-[var(--color-surface-container-low)] border-[var(--border)]' : 'bg-gray-50 border-gray-200')}>
              <p className={cn('text-[10px] font-extrabold uppercase tracking-widest', isDark ? 'text-[var(--color-amber-cta)]' : 'text-amber-600')}>
                Transfer Details
              </p>
              {method === 'TELEBIRR' && <AccountRow label="TeleBirr" value={targetData.telebirrAccount} isDark={isDark} />}
              {method === 'CBE' && <AccountRow label="CBE Account" value={targetData.cbeAccount} isDark={isDark} />}
              {method === 'BOA' && <AccountRow label="BOA Account" value={targetData.boaAccount} isDark={isDark} />}
              {method === 'AWASH' && <AccountRow label="Awash Account" value={targetData.awashAccount} isDark={isDark} />}
              {method === 'OTHER_BANK' && (
                <>
                  {targetData.otherBankName && <AccountRow label="Bank Name" value={targetData.otherBankName} isDark={isDark} />}
                  <AccountRow label="Account Number" value={targetData.otherBankAccount} isDark={isDark} />
                </>
              )}
            </div>

            <div>
              <label className={labelClass}>Amount (ETB) <span className="text-[var(--color-amber-cta)]">*</span></label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {AMOUNTS.map(a => (
                  <button key={a} onClick={() => { setAmount(String(a)); setCustom(''); }}
                    className={cn('py-2.5 rounded-xl border text-sm font-bold transition-all',
                      amount === String(a) 
                        ? (isDark ? 'border-[var(--color-civic-emerald)] bg-[var(--color-civic-emerald-glow)] text-[var(--color-civic-emerald)]' : 'border-green-600 bg-green-50 text-green-700') 
                        : (isDark ? 'border-[var(--border)] bg-[var(--color-surface-container-high)] text-white hover:border-[var(--color-civic-emerald)]/50' : 'border-gray-200 bg-white text-gray-700 hover:border-green-300'))}>
                    {formatCurrency(a)}
                  </button>
                ))}
              </div>
              <input type="number" placeholder="Custom amount..." value={custom}
                onChange={e => { setCustom(e.target.value); setAmount(''); }}
                className={inputClass} min="1" />
            </div>

            <div>
              <label className={labelClass}>Transaction Reference <span className="text-[var(--color-amber-cta)]">*</span></label>
              <input className={inputClass} placeholder="e.g. FT2345678"
                value={refCode} onChange={e => setRefCode(e.target.value)} />
            </div>

            <div>
               <label className={labelClass}>Payment Proof <span className="text-[var(--color-amber-cta)]">*</span></label>
               <ImageUpload label="" value={proofUrl} onChange={setProofUrl} hint="Upload screenshot of receipt" />
            </div>

            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
              placeholder="Leave a message... (optional)"
              className={cn(inputClass, 'resize-none')} />

            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setAnon(!anon)}
                className={cn('w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors',
                  anon ? (isDark ? 'bg-[var(--color-civic-emerald)] border-[var(--color-civic-emerald)]' : 'bg-green-600 border-green-600') 
                       : (isDark ? 'border-[var(--border)] bg-[var(--color-surface-container-high)]' : 'border-gray-300 bg-white'))}>
                {anon && <Check className={cn("w-3.5 h-3.5", isDark ? "text-[#0b131b]" : "text-white")} />}
              </div>
              <span className={cn('text-sm font-semibold', isDark ? 'text-[var(--text-muted)]' : 'text-gray-700')}>Donate anonymously</span>
            </label>

            {!isAuthenticated && (
              <div className={cn('p-5 rounded-2xl border space-y-4', isDark ? 'bg-[var(--color-surface-container-low)] border-[var(--border)]' : 'bg-gray-50 border-gray-200')}>
                <h4 className={labelClass}>Guest Information</h4>
                <input className={inputClass} placeholder="Full Name *" value={guestName} onChange={e => setGuestName(e.target.value)} />
                <input className={inputClass} placeholder="Email (optional)" type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} />
                <input className={inputClass} placeholder="Phone Number *" type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} />
              </div>
            )}

            <button disabled={loading} onClick={handleSubmit}
              className={cn("w-full py-4 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95", 
                isDark ? "bg-[var(--color-civic-emerald-glow)] text-[var(--color-civic-emerald)] border border-[var(--color-civic-emerald)]/30 hover:bg-[var(--color-civic-emerald)] hover:text-[#0b131b]" 
                       : "bg-[var(--color-civic-emerald)] text-white border border-transparent hover:bg-[var(--color-civic-emerald-deep)]"
              )}>
              {loading ? 'Processing...' : `Confirm ${finalAmount > 0 ? formatCurrency(finalAmount) : 'Donation'}`}
            </button>
          </motion.div>
        )}

        {/* STEP 2: Item -> Form */}
        {step === 2 && donateType === 'ITEM' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <button onClick={() => setStep(1)} className={cn("text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors", isDark ? "text-[var(--text-muted)] hover:text-white" : "text-gray-500 hover:text-gray-900")}>
              ← Back
            </button>

            {targetData?.requesterPhone && (
              <div className={cn('p-4 rounded-2xl border space-y-2',
                isDark ? 'bg-blue-900/10 border-blue-500/30' : 'bg-blue-50 border-blue-200')}>
                <p className={cn('text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-2', isDark ? 'text-blue-400' : 'text-blue-700')}>
                  📞 Contact Information
                </p>
                <div className={cn('text-sm', isDark ? 'text-blue-200' : 'text-blue-900')}>
                  <span className="font-semibold">Requester's Phone:</span>{' '}
                  <a href={`tel:${targetData.requesterPhone}`} className="font-bold hover:underline">{targetData.requesterPhone}</a>
                </div>
              </div>
            )}

            <div>
              <label className={labelClass}>Category <span className="text-[var(--color-amber-cta)]">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { v: 'FOOD', l: '🍚 Food' }, { v: 'CLOTHES', l: '👕 Clothes' },
                  { v: 'MEDICINE', l: '💊 Medicine' }, { v: 'OTHER', l: '📦 Other' },
                ].map(c => (
                  <button key={c.v} onClick={() => setItemCategory(c.v)}
                    className={cn('p-3 rounded-xl text-xs font-bold text-center transition-all border',
                      itemCategory === c.v
                        ? (isDark ? 'border-[var(--color-amber-cta)] bg-[var(--color-amber-cta)]/20 text-[var(--color-amber-cta)]' : 'border-amber-500 bg-amber-50 text-amber-700')
                        : (isDark ? 'border-[var(--border)] bg-[var(--color-surface-container-high)] text-white hover:border-[var(--color-amber-cta)]/50' : 'border-gray-200 bg-white text-gray-700 hover:border-amber-300'))}>
                    {c.l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Description <span className="text-[var(--color-amber-cta)]">*</span></label>
              <textarea rows={3} placeholder="Describe the items..."
                className={cn(inputClass, 'resize-none')}
                value={itemDesc} onChange={e => setItemDesc(e.target.value)} />
            </div>

            <div>
              <label className={labelClass}>Photo <span className="text-[var(--color-amber-cta)]">*</span></label>
              <ImageUpload label="" value={itemImgUrl} onChange={setItemImgUrl} hint="Upload a photo of the items" />
            </div>

            <div>
              <label className={labelClass}>Delivery Method <span className="text-[var(--color-amber-cta)]">*</span></label>
              <div className="space-y-2">
                {[
                  { v: 'BRING_TO_OFFICE', l: 'I will bring to WeDonate office' },
                  { v: 'DELIVER_TO_ADDRESS', l: 'I will deliver to beneficiary address' },
                  { v: 'COORDINATE', l: 'Please coordinate with me' },
                ].map(d => (
                  <label key={d.v} className={cn("flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                    delivery === d.v 
                      ? (isDark ? "border-[var(--color-amber-cta)] bg-[var(--color-surface-container-high)]" : "border-amber-400 bg-amber-50")
                      : (isDark ? "border-[var(--border)] bg-transparent" : "border-gray-200 bg-white")
                  )}>
                    <div className={cn('w-4 h-4 rounded-full border-2 flex items-center justify-center',
                      delivery === d.v ? (isDark ? 'border-[var(--color-amber-cta)]' : 'border-amber-500') : (isDark ? 'border-[var(--border)]' : 'border-gray-300'))}>
                      {delivery === d.v && <div className={cn("w-2 h-2 rounded-full", isDark ? "bg-[var(--color-amber-cta)]" : "bg-amber-500")} />}
                    </div>
                    <span className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-gray-700')}>{d.l}</span>
                  </label>
                ))}
              </div>
            </div>

            {!isAuthenticated && (
              <div className={cn('p-5 rounded-2xl border space-y-4', isDark ? 'bg-[var(--color-surface-container-low)] border-[var(--border)]' : 'bg-gray-50 border-gray-200')}>
                <h4 className={labelClass}>Guest Information</h4>
                <input className={inputClass} placeholder="Full Name *" value={guestName} onChange={e => setGuestName(e.target.value)} />
                <input className={inputClass} placeholder="Email (optional)" type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} />
                <input className={inputClass} placeholder="Phone Number *" type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} />
              </div>
            )}

            <button disabled={loading} onClick={handleSubmit}
              className={cn("w-full py-4 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95", 
                isDark ? "bg-[var(--color-amber-cta)]/20 text-[var(--color-amber-cta)] border border-[var(--color-amber-cta)]/30 hover:bg-[var(--color-amber-cta)] hover:text-[#0b131b]" 
                       : "bg-amber-500 text-white border border-transparent hover:bg-amber-600"
              )}>
              {loading ? 'Processing...' : 'Submit Item Donation'}
            </button>
          </motion.div>
        )}

        {/* STEP SUCCESS */}
        {isDone && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
            <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6", 
              isDark ? "bg-[var(--color-civic-emerald-glow)] text-[var(--color-civic-emerald)]" : "bg-green-100 text-green-600"
            )}>
              <Check className="w-10 h-10" />
            </div>
            <h3 className={cn('text-2xl font-black mb-3', isDark ? 'text-white' : 'text-gray-900')}>
              {donateType === 'ITEM' ? 'Thank You!' : 'Donation Received!'}
            </h3>
            <p className={cn('text-sm mb-8 leading-relaxed', isDark ? 'text-[var(--text-muted)]' : 'text-gray-500')}>
              {donateType === 'ITEM'
                ? 'The beneficiary and administration have been notified about your material donation. We will follow up shortly.'
                : 'Your financial contribution is being processed. The administration will verify your receipt and update the progress bar.'}
            </p>
            <button onClick={onClose}
              className={cn("w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all border", 
                isDark ? "bg-[var(--color-surface-container-high)] text-white border-[var(--border)] hover:bg-[var(--color-surface-container-highest)]" 
                       : "bg-gray-100 text-gray-900 border-gray-200 hover:bg-gray-200"
              )}>
              Done
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function DonatePage() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [tab, setTab] = useState<DonateTab>('campaigns');
  const [campCat, setCampCat] = useState('');
  const [reqCat, setReqCat] = useState('');
  const [search, setSearch] = useState('');
  const [donateTarget, setDonateTarget] = useState<{ id: string; title: string; type: 'campaign' | 'request'; data: any } | null>(null);
  const [detailTarget, setDetailTarget] = useState<{ data: any; type: 'campaign' | 'request' } | null>(null);

  const urlTab = searchParams.get('tab');
  const activeTab = (urlTab === 'requests' || urlTab === 'campaigns') ? urlTab : tab;

  const { data: campaigns, isLoading: loadingCamps } = useQuery({
    queryKey: ['campaigns', campCat],
    queryFn: () => api.get('/campaigns', { params: { category: campCat || undefined } }).then(r => r.data.data),
  });

  const { data: requests, isLoading: loadingReqs } = useQuery({
    queryKey: ['approved-requests', reqCat],
    queryFn: () => api.get('/support-requests', { params: { category: reqCat || undefined } }).then(r => r.data.data),
  });

  const filteredCamps = (campaigns || []).filter((c: any) =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
  );
  const filteredReqs = (requests || []).filter((r: any) =>
    !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase())
  );

  const TABS = [
    { id: 'campaigns', label: 'Civic Campaigns', count: campaigns?.length },
    { id: 'requests', label: 'Direct Support', count: requests?.length },
  ];

  return (
    <div className={cn('min-h-screen font-sans flex flex-col transition-colors duration-300', isDark ? 'bg-[var(--color-surface)]' : 'bg-[#fcfdfd]')}>
      
      {/* ── HERO SECTION ── */}
      <div className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden border-b border-[var(--border)] bg-[var(--color-surface-container-lowest)]">
        {/* Ambient Cityscape Background */}
        <div className="absolute inset-0 z-0">
          <img src="/Adama_city2.webp" alt="Adama City" className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-105" />
          <div className={cn("absolute inset-0 bg-gradient-to-b", 
            isDark ? "from-[var(--color-surface)]/80 via-[var(--color-surface)]/95 to-[var(--color-surface)]" 
                   : "from-[#fcfdfd]/80 via-[#fcfdfd]/95 to-[#fcfdfd]"
          )} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--color-civic-emerald)]/15 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-container-highest)] border border-[var(--color-civic-emerald)]/30 flex items-center justify-center p-3 shadow-2xl mb-6 backdrop-blur-md">
            <Heart className="w-full h-full text-[var(--color-civic-emerald)] fill-[var(--color-civic-emerald)]/20" />
          </div>
          <h1 className={cn("text-4xl lg:text-5xl font-extrabold tracking-tight mb-4", isDark ? "text-white" : "text-gray-900")}>
            Support Adama City
          </h1>
          <p className={cn("text-lg max-w-2xl", isDark ? "text-[var(--text-muted)]" : "text-gray-600")}>
            Discover verified municipal campaigns and individual support requests. 100% of your contribution reaches those in need.
          </p>
        </div>
      </div>

      {/* ── CONTENT GRID ── */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-16 flex-1 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT COLUMN: Feed & Filters */}
        <div className="w-full lg:w-[60%] xl:w-[65%] flex flex-col gap-6">
          
          {/* Filter Toolbar Bento */}
          <div className={cn("rounded-3xl border p-4 md:p-6 flex flex-col gap-4", 
            isDark ? "bg-[var(--color-surface-container)] border-[var(--border)]" : "bg-white border-gray-200 shadow-sm"
          )}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Tabs */}
              <div className={cn('flex p-1 rounded-xl', isDark ? 'bg-[var(--color-surface-container-high)] border border-[var(--border)]' : 'bg-gray-100 border border-gray-200')}>
                {TABS.map(t => (
                  <button key={t.id} onClick={() => { setTab(t.id as DonateTab); setDonateTarget(null); }}
                    className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all',
                      (tab === t.id)
                        ? (isDark ? 'bg-[var(--color-surface-container-lowest)] text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm')
                        : (isDark ? 'text-[var(--text-muted)] hover:text-white' : 'text-gray-500 hover:text-gray-900'))}>
                    {t.label}
                    {t.count != null && (
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full',
                        tab === t.id ? (isDark ? 'bg-[var(--color-surface-container-high)] text-[var(--color-civic-emerald)]' : 'bg-gray-100 text-green-600') : (isDark ? 'bg-[var(--color-surface-container)] text-[var(--text-muted)]' : 'bg-gray-200 text-gray-500'))}>
                        {t.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4', isDark ? 'text-[var(--text-muted)]' : 'text-gray-400')} />
                <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                  className={cn('w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 transition-colors',
                    isDark ? 'bg-[var(--color-surface-container-lowest)] border-[var(--border)] text-white placeholder-[var(--text-muted)] focus:border-[var(--color-civic-emerald)] focus:ring-[var(--color-civic-emerald)]/50' 
                           : 'bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500')} />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {(tab === 'campaigns' ? CAMPAIGN_CATEGORIES : REQUEST_CATEGORIES).map(c => {
                const active = tab === 'campaigns' ? campCat === c.value : reqCat === c.value;
                return (
                  <button key={c.value} 
                    onClick={() => tab === 'campaigns' ? setCampCat(c.value) : setReqCat(c.value)}
                    className={cn('shrink-0 px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide uppercase transition-all border',
                      active
                        ? (isDark ? 'bg-[var(--color-civic-emerald)] text-[#0b131b] border-[var(--color-civic-emerald)] shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-green-700 text-white border-green-700 shadow-md')
                        : (isDark ? 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--color-civic-emerald)]/50 hover:text-white bg-[var(--color-surface-container-high)]' : 'border-gray-200 text-gray-600 hover:border-green-400 bg-white'))}>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feed Content */}
          <AnimatePresence mode="wait">
            {(tab === 'campaigns') && (
              <motion.div key="campaigns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {loadingCamps ? (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={cn('h-96 rounded-3xl animate-pulse', isDark ? 'bg-[var(--color-surface-container)]' : 'bg-gray-200')} />
                    ))}
                  </div>
                ) : filteredCamps.length === 0 ? (
                  <div className={cn("text-center py-20 rounded-3xl border", isDark ? "border-[var(--border)] bg-[var(--color-surface-container)]" : "border-gray-200 bg-white")}>
                    <Target className={cn('w-12 h-12 mx-auto mb-3', isDark ? 'text-[var(--text-muted)]' : 'text-gray-300')} />
                    <p className={cn('font-bold', isDark ? 'text-white' : 'text-gray-900')}>No campaigns found</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {filteredCamps.map((camp: any) => (
                      <CampaignCard key={camp.id} camp={camp} isDark={isDark}
                        onDonate={(id, title, data) => setDonateTarget({ id, title, type: 'campaign', data })}
                        onDetail={(data) => setDetailTarget({ data, type: 'campaign' })} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {(tab === 'requests') && (
              <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {loadingReqs ? (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={cn('h-96 rounded-3xl animate-pulse', isDark ? 'bg-[var(--color-surface-container)]' : 'bg-gray-200')} />
                    ))}
                  </div>
                ) : filteredReqs.length === 0 ? (
                  <div className={cn("text-center py-20 rounded-3xl border", isDark ? "border-[var(--border)] bg-[var(--color-surface-container)]" : "border-gray-200 bg-white")}>
                    <Heart className={cn('w-12 h-12 mx-auto mb-3', isDark ? 'text-[var(--text-muted)]' : 'text-gray-300')} />
                    <p className={cn('font-bold', isDark ? 'text-white' : 'text-gray-900')}>No support requests found</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {filteredReqs.map((req: any) => (
                      <RequestCard key={req.id} req={req} isDark={isDark}
                        onDonate={(id, title, data) => setDonateTarget({ id, title, type: 'request', data })}
                        onDetail={(data) => setDetailTarget({ data, type: 'request' })} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* RIGHT COLUMN: Sticky Instant Donation Sidebar */}
        <div className="w-full lg:w-[40%] xl:w-[35%]">
          <InstantDonationSidebar 
            target={donateTarget}
            type={donateTarget?.type}
            targetData={donateTarget?.data}
            onClose={() => setDonateTarget(null)}
            isAuthenticated={isAuthenticated}
            navigate={navigate}
            isDark={isDark}
          />
        </div>

      </div>

      {detailTarget && (
        <DetailModal
          data={detailTarget.data}
          type={detailTarget.type}
          onClose={() => setDetailTarget(null)}
          isDark={isDark}
        />
      )}
    </div>
  );
}
