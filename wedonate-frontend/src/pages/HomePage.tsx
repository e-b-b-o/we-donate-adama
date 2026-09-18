import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Heart, Users, TrendingUp, Shield, ArrowRight,
  Star, Quote, Wallet, Utensils, Shirt, Stethoscope, Share2,
  Send, Mail, Phone, User as UserIcon, MapPin, ShieldCheck,
  FileText, Handshake, CreditCard, LineChart
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { cn } from '../lib/utils';
import Button from '../components/ui/Button';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

export default function HomePage() {
  const { t } = useTranslation();

  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  /* ── Data ──────────────────────────────────────────────────── */
  const { data: statsData } = useQuery({
    queryKey: ['donation-stats'],
    queryFn: () => api.get('/donations/stats').then(r => r.data.data),
  });

  const { data: apiTestimonials } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => api.get('/testimonials').then(r => r.data.data),
  });

  // Fetch 3 approved requests for home page
  const { data: featuredRequests } = useQuery({
    queryKey: ['featured-requests'],
    queryFn: () => api.get('/support-requests', { params: { limit: 2 } }).then(r => r.data.data),
  });

  const contactMutation = useMutation({
    mutationFn: (data: typeof contactForm) => api.post('/messages/contact', data),
    onSuccess: () => {
      toast.success('Message sent! We will get back to you shortly.');
      setContactForm({ name: '', email: '', phone: '', subject: '', message: '' });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to send message'),
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.subject.trim() || !contactForm.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    contactMutation.mutate(contactForm);
  };

  const stats = {
    donors: statsData?.totalUsers ?? '1,200+',
    beneficiaries: statsData?.fulfilledRequests ?? '500+',
    raised: statsData?.totalAmount ? formatCurrency(statsData.totalAmount) : 'ETB 2.5M+',
    ngos: statsData?.totalDonations ?? '5,000+',
  };

  const testimonials = apiTestimonials?.length
    ? apiTestimonials.map((t: any) => ({
        name: t.name,
        role: t.role,
        text: t.text,
        avatar: t.avatar || t.name.split(' ').map((n: string) => n[0]).join(''),
      }))
    : [
        { name: 'Liya Tadesse',   role: 'Donor',       text: 'WeDonate made it incredibly easy to help families in Adama. I can see exactly where my money goes.', avatar: 'LT' },
        { name: 'Gemechu Alemu',  role: 'Beneficiary', text: 'Through this platform my family received food support during a very difficult time. We are grateful.', avatar: 'GA' },
        { name: 'Amina Ibrahim',  role: 'NGO Partner', text: 'Coordination between our NGO and city admin has never been more streamlined. Outstanding platform.',   avatar: 'AI' },
      ];

  const waysToGive = [
    { icon: Wallet,      key: 'category_money',    label: 'Financial Aid', colorClass: 'text-[var(--color-civic-emerald)] bg-[var(--color-civic-emerald)]/10 group-hover:bg-[var(--color-civic-emerald)]/20', hoverBorder: 'hover:border-[var(--color-civic-emerald)]/40' },
    { icon: Utensils,    key: 'category_food',     label: 'Food Support',  colorClass: 'text-[var(--color-amber-cta)] bg-[var(--color-amber-cta)]/10 group-hover:bg-[var(--color-amber-cta)]/20', hoverBorder: 'hover:border-[var(--color-amber-cta)]/40' },
    { icon: Shirt,       key: 'category_clothes',  label: 'Clothing',      colorClass: 'text-blue-400 bg-blue-500/10 group-hover:bg-blue-500/20', hoverBorder: 'hover:border-blue-400/40' },
    { icon: Stethoscope, key: 'category_medicine', label: 'Medical Aid',   colorClass: 'text-red-400 bg-red-500/10 group-hover:bg-red-500/20', hoverBorder: 'hover:border-red-400/40' },
    { icon: Heart,       key: 'category_other',    label: 'Other Support', colorClass: 'text-purple-400 bg-purple-500/10 group-hover:bg-purple-500/20', hoverBorder: 'hover:border-purple-400/40' },
  ];

  return (
    <div className="overflow-x-hidden bg-[var(--color-surface)] text-[var(--color-text-ivory)]">

      {/* ════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32 border-b border-[var(--border)]" id="home">
        <div className="absolute inset-0 z-0">
          <img src="/Adama-City.webp" alt="Adama City" className="w-full h-full object-cover filter brightness-[0.25]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-surface)]/80 to-[var(--color-background)]/60"></div>
          <div className="absolute inset-0 bg-[var(--color-civic-emerald)]/10 mix-blend-overlay"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Hero Narrative */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.7 }} className="lg:col-span-7 flex flex-col items-start space-y-6">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[var(--color-surface-container-high)]/90 border border-[var(--border)] shadow-inner">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-civic-emerald)] animate-pulse"></span>
                <span className="text-xs font-semibold text-[var(--color-civic-emerald)] tracking-wide">Adama City Administration</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold text-[var(--color-text-ivory)] tracking-tight leading-tight">
                Together We <br className="hidden sm:inline"/>Build <span className="text-[var(--color-amber-cta)]">Wealthy Community</span>
              </h1>
              
              <p className="text-lg text-[var(--color-text-muted)] max-w-xl leading-relaxed">
                Connecting generous donors with families in need across Adama City. Every contribution transforms lives and strengthens our community.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/donate">
                  <button className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--color-amber-cta)] hover:bg-[var(--color-amber-hover)] text-[#0b131b] text-sm font-semibold transition-all duration-150 shadow-lg active:scale-95">
                    <span>{t('hero.cta_donate')}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                <Link to="/about">
                  <button className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--color-civic-emerald)] text-[var(--color-text-ivory)] hover:text-[var(--color-civic-emerald)] bg-[var(--color-surface-container-low)]/40 backdrop-blur-sm text-sm font-semibold transition-all duration-150">
                    <span>{t('hero.cta_learn')}</span>
                  </button>
                </Link>
              </div>
            </motion.div>
            
            {/* Right Quick Metrics Bento Grid */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="lg:col-span-5">
              <div className="relative bg-[var(--color-surface-container-low)]/80 backdrop-blur-xl border border-[var(--border)] rounded-3xl p-6 lg:p-8 shadow-2xl">
                <div className="flex items-center justify-between pb-6 border-b border-[var(--border)] mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-main)]">Civic Snapshot</h2>
                    <p className="text-xs text-[var(--text-muted)]">Live municipal dashboard metrics</p>
                  </div>
                  <Shield className="w-7 h-7 text-[var(--color-civic-emerald)]" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--color-surface-container)] p-5 rounded-2xl border border-[var(--border)] flex flex-col justify-between space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[var(--text-main)]">{stats.donors}</div>
                      <div className="text-xs text-[var(--text-muted)]">Active Donors</div>
                    </div>
                  </div>
                  <div className="bg-[var(--color-surface-container)] p-5 rounded-2xl border border-[var(--border)] flex flex-col justify-between space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 text-[var(--color-civic-emerald)] flex items-center justify-center">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[var(--text-main)]">{stats.beneficiaries}</div>
                      <div className="text-xs text-[var(--text-muted)]">Families Helped</div>
                    </div>
                  </div>
                  <div className="bg-[var(--color-surface-container)] p-5 rounded-2xl border border-[var(--border)] flex flex-col justify-between space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[var(--color-amber-cta)] flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-[var(--text-main)]">{stats.raised}</div>
                      <div className="text-xs text-[var(--text-muted)]">ETB Raised</div>
                    </div>
                  </div>
                  <div className="bg-[var(--color-surface-container)] p-5 rounded-2xl border border-[var(--border)] flex flex-col justify-between space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[var(--text-main)]">{stats.ngos}</div>
                      <div className="text-xs text-[var(--text-muted)]">NGO Partners</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-24 bg-[var(--color-surface)] border-b border-[var(--border)]" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-main)]">{t('home.how_title')}</h2>
            <p className="text-[var(--text-muted)]">{t('home.how_subtitle')}</p>
          </motion.div>
          
          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="hidden lg:block absolute top-12 left-16 right-16 h-0.5 border-t-2 border-dashed border-[var(--border)] -z-0"></div>
            
            {[
              { icon: FileText,   title: t('home.step1_title'), desc: t('home.step1_desc'), color: 'text-blue-400' },
              { icon: Handshake,  title: t('home.step2_title'), desc: t('home.step2_desc'), color: 'text-[var(--color-amber-cta)]' },
              { icon: CreditCard, title: t('home.step3_title'), desc: t('home.step3_desc'), color: 'text-purple-400' },
              { icon: LineChart,  title: t('home.step4_title'), desc: t('home.step4_desc'), color: 'text-[var(--color-civic-emerald)]' },
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="relative z-10 flex flex-col items-center text-center bg-[var(--color-surface-container-low)] p-6 rounded-2xl border border-[var(--border)]">
                <div className={`relative w-16 h-16 rounded-2xl bg-[var(--color-surface-container-high)] border border-[var(--border)] flex items-center justify-center ${step.color} mb-5 shadow-lg`}>
                  <step.icon className="w-7 h-7" />
                  <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[var(--color-civic-emerald)] text-white text-xs font-bold flex items-center justify-center shadow">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-[var(--text-main)] mb-2">{step.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          WAYS TO GIVE
      ════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-24 bg-[var(--color-surface-container-lowest)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-main)]">Ways to Give</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            {waysToGive.map((cat, i) => (
              <motion.div key={cat.key} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to="/donate">
                  <div className={`group bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] p-6 rounded-2xl border border-[var(--border)] ${cat.hoverBorder} transition-all duration-200 flex flex-col items-center text-center cursor-pointer`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${cat.colorClass}`}>
                      <cat.icon className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <span className="font-semibold text-[var(--text-main)]">{cat.label}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          RECENT DONATIONS
      ════════════════════════════════════════════════ */}
      {statsData?.recentDonations?.length > 0 && (
        <section className="py-16 lg:py-20 bg-[var(--color-surface)] border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-[var(--text-main)]">{t('home.recent_donations')}</h2>
              <Link to="/donate" className="inline-flex items-center gap-1 text-[var(--color-civic-emerald)] hover:text-emerald-400 text-sm font-semibold transition-colors">
                <span>{t('home.view_all')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {statsData.recentDonations.slice(0, 3).map((d: any, i: number) => (
                <motion.div key={d.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <div className="bg-[var(--color-surface-container-low)] p-5 rounded-2xl border border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-11 h-11 rounded-full bg-[var(--color-civic-emerald)]/10 text-[var(--color-civic-emerald)] flex items-center justify-center font-bold text-sm border border-[var(--color-civic-emerald)]/30">
                        {d.isAnonymous ? '?' : `${d.donor?.firstName?.[0]}${d.donor?.lastName?.[0]}`}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--text-main)]">
                          {d.isAnonymous ? 'Anonymous' : `${d.donor?.firstName} ${d.donor?.lastName}`}
                        </h4>
                        <p className="text-xs text-[var(--text-muted)]">{formatDate(d.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full bg-[var(--color-amber-cta)]/10 text-[var(--color-amber-cta)] border border-[var(--color-amber-cta)]/20 text-xs font-semibold whitespace-nowrap">
                        {formatCurrency(d.amount || 0)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════
          FEATURED SUPPORT REQUESTS
      ════════════════════════════════════════════════ */}
      {featuredRequests && featuredRequests.length > 0 && (
        <section className="py-20 lg:py-24 bg-[var(--color-surface)] border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-main)]">People Who Need Your Help</h2>
              <p className="text-[var(--text-muted)]">These community members have verified support requests waiting</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {featuredRequests.map((req: any, i: number) => {
                const pct = req.goalAmount ? Math.min((req.raisedAmount / req.goalAmount) * 100, 100) : 0;
                return (
                  <motion.div key={req.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-[var(--color-surface-container-low)] p-6 lg:p-8 rounded-3xl border border-[var(--border)] hover:border-gray-600 transition-colors flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-[var(--text-main)] truncate pr-2">{req.title}</h3>
                        <span className="px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-1 shrink-0">
                          🚨 Urgent
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-muted)] line-clamp-2">{req.description}</p>
                      
                      {req.goalAmount && (
                        <div className="space-y-2 pt-2">
                          <div className="flex justify-between text-xs text-[var(--text-muted)]">
                            <span className="text-[var(--color-civic-emerald)] font-semibold">{formatCurrency(req.raisedAmount)} raised</span>
                            <span>{Math.round(pct)}% of {formatCurrency(req.goalAmount)}</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-[var(--color-surface-container-highest)] overflow-hidden">
                            <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} className="h-full bg-[var(--color-civic-emerald)] rounded-full"></motion.div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold">{req.user?.firstName?.[0]}</div>
                          <span className="text-sm text-[var(--text-main)]">{req.user?.firstName}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-md bg-[var(--color-surface-container-highest)] text-[var(--text-muted)] text-xs font-semibold uppercase">{req.category}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
                      <Link to={`/donate?tab=requests`} className="flex-1">
                        <button className="w-full py-3 px-4 rounded-xl bg-[var(--color-civic-emerald-deep)] hover:bg-[var(--color-civic-emerald)] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shadow">
                          <span>Support Now</span>
                          <Heart className="w-4 h-4" />
                        </button>
                      </Link>
                      <a href={`https://t.me/share/url?url=${encodeURIComponent(`https://wedonate.et/donate/request/${req.id}`)}&text=${encodeURIComponent(`Help: ${req.title}`)}`} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--color-surface-container)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                        <Share2 className="w-5 h-5" />
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            <div className="text-center mt-12">
              <Link to="/donate?tab=requests" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--border)] hover:border-[var(--color-civic-emerald)] text-[var(--color-civic-emerald)] hover:bg-[var(--color-surface-container)] font-semibold text-sm transition-colors">
                <span>View All Requests</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-24 bg-[var(--color-surface-container-lowest)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-main)]">What People Say</h2>
            <p className="text-[var(--text-muted)]">Voices from our community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="bg-[var(--color-surface-container)] p-6 lg:p-8 rounded-2xl border border-[var(--border)] flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <Quote className="text-[var(--color-civic-emerald)] w-10 h-10" />
                  <p className="text-[var(--text-main)] italic leading-relaxed">
                    "{item.text}"
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-civic-emerald)]/20 text-[var(--color-civic-emerald)] font-bold flex items-center justify-center text-sm">
                      {item.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--text-main)]">{item.name}</h4>
                      <span className="text-xs text-[var(--color-civic-emerald)]">{item.role}</span>
                    </div>
                  </div>
                  <div className="flex text-[var(--color-amber-cta)] text-sm">
                    {[...Array(5)].map((_, s) => <Star key={s} className="w-4 h-4 fill-current" />)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          CONTACT US
      ════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-24 bg-[var(--color-surface)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-main)]">Contact Us</h2>
            <p className="text-[var(--text-muted)]">Have questions or want to get involved? Send us a message.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">
            <div className="lg:col-span-5 bg-[var(--color-surface-container-low)] p-8 rounded-3xl border border-[var(--border)] space-y-8">
              <h3 className="text-xl font-bold text-[var(--text-main)]">Get in Touch</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-11 h-11 rounded-xl bg-[var(--color-civic-emerald)]/10 text-[var(--color-civic-emerald)] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-[var(--text-muted)]">Address</span>
                    <p className="text-sm font-medium text-[var(--text-main)] mt-0.5">Adama City Administration, Oromia, Ethiopia</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-[var(--text-muted)]">Email</span>
                    <p className="text-sm font-medium text-[var(--text-main)] mt-0.5">info@wedonate.et</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-[var(--text-muted)]">Phone</span>
                    <p className="text-sm font-medium text-[var(--text-main)] mt-0.5">+251 91 234 5678</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--color-surface-container)] border border-[var(--border)] text-sm text-[var(--text-muted)] leading-relaxed">
                Our team typically responds within 24–48 hours during business days.
              </div>
            </div>
            
            <div className="lg:col-span-7 bg-[var(--color-surface-container-low)] p-8 rounded-3xl border border-[var(--border)]">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--text-main)]">Name *</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-3.5 text-[var(--text-muted)] w-5 h-5" />
                      <input type="text" value={contactForm.name} onChange={e => setContactForm(p => ({...p, name: e.target.value}))} className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface-container)] rounded-xl border border-[var(--border)] focus:border-[var(--color-civic-emerald)] focus:ring-1 focus:ring-[var(--color-civic-emerald)] text-[var(--text-main)] text-sm outline-none transition-colors" placeholder="Your full name" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--text-main)]">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 text-[var(--text-muted)] w-5 h-5" />
                      <input type="email" value={contactForm.email} onChange={e => setContactForm(p => ({...p, email: e.target.value}))} className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface-container)] rounded-xl border border-[var(--border)] focus:border-[var(--color-civic-emerald)] focus:ring-1 focus:ring-[var(--color-civic-emerald)] text-[var(--text-main)] text-sm outline-none transition-colors" placeholder="you@example.com" required />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--text-main)]">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 text-[var(--text-muted)] w-5 h-5" />
                      <input type="tel" value={contactForm.phone} onChange={e => setContactForm(p => ({...p, phone: e.target.value}))} className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface-container)] rounded-xl border border-[var(--border)] focus:border-[var(--color-civic-emerald)] focus:ring-1 focus:ring-[var(--color-civic-emerald)] text-[var(--text-main)] text-sm outline-none transition-colors" placeholder="+251 91 234 5678" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--text-main)]">Subject *</label>
                    <input type="text" value={contactForm.subject} onChange={e => setContactForm(p => ({...p, subject: e.target.value}))} className="w-full px-4 py-3 bg-[var(--color-surface-container)] rounded-xl border border-[var(--border)] focus:border-[var(--color-civic-emerald)] focus:ring-1 focus:ring-[var(--color-civic-emerald)] text-[var(--text-main)] text-sm outline-none transition-colors" placeholder="How can we help?" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[var(--text-main)]">Message *</label>
                  <textarea value={contactForm.message} onChange={e => setContactForm(p => ({...p, message: e.target.value}))} className="w-full px-4 py-3 bg-[var(--color-surface-container)] rounded-xl border border-[var(--border)] focus:border-[var(--color-civic-emerald)] focus:ring-1 focus:ring-[var(--color-civic-emerald)] text-[var(--text-main)] text-sm outline-none transition-colors resize-none" placeholder="Write your message here..." required rows={4}></textarea>
                </div>
                <button type="submit" disabled={contactMutation.isPending} className="w-full py-4 rounded-xl bg-[var(--color-civic-emerald-deep)] hover:bg-[var(--color-civic-emerald)] text-white font-semibold transition-all duration-150 flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] disabled:opacity-50">
                  <Send className="w-5 h-5" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface-container-low)] border-b border-[var(--border)]">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
          <span className="text-[120px] lg:text-[220px] font-black tracking-widest text-[var(--color-civic-emerald)] select-none">ADAMA</span>
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-4xl lg:text-6xl font-bold text-[var(--text-main)] leading-tight">
            Ready to Make a <span className="text-[var(--color-amber-cta)]">Difference?</span>
          </h2>
          <p className="text-lg text-[var(--text-muted)] max-w-xl mx-auto">
            Join thousands of donors already transforming lives in Adama City.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/donate">
              <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[var(--color-amber-cta)] hover:bg-[var(--color-amber-hover)] text-[#0b131b] font-semibold transition-all duration-150 shadow-xl active:scale-95">
                <span>Donate Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/register">
              <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-[var(--border)] hover:border-[var(--color-civic-emerald)] text-[var(--text-main)] hover:text-[var(--color-civic-emerald)] bg-[var(--color-surface-container)] font-semibold transition-all duration-150 active:scale-95">
                <span>Register</span>
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
