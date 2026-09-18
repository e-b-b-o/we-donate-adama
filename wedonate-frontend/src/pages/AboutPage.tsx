import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Shield, Eye, Target, Users, Heart, ArrowRight, X, ZoomIn, ChevronLeft, ChevronRight, CheckCircle, Package, ArrowUpRight, Scale, BookOpen, Activity, Play } from 'lucide-react';
import { cn } from '../lib/utils';
import Button from '../components/ui/Button';
import api from '../lib/api';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

/* ── Lightbox ── */
function Lightbox({ photos, index, onClose, onPrev, onNext }: {
  photos: any[]; index: number; onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  const photo = photos[index];
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
          className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
          <img src={photo.imageUrl} alt={photo.title}
            className="w-full max-h-[75vh] object-contain rounded-2xl" />
          <div className="mt-4 text-center">
            <p className="text-white font-bold text-lg">{photo.title}</p>
            {photo.description && <p className="text-white/70 text-sm mt-1">{photo.description}</p>}
          </div>
          <button onClick={onClose}
            className="absolute -top-4 -right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          {index > 0 && (
            <button onClick={onPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {index < photos.length - 1 && (
            <button onClick={onNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          <p className="text-white/50 text-xs text-center mt-3">{index + 1} / {photos.length}</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function AboutPage() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  /* Fetch gallery from backend; fallback to local images */
  const { data: galleryData } = useQuery({
    queryKey: ['gallery'],
    queryFn: () => api.get('/gallery').then(r => r.data.data),
  });

  const defaultPhotos = [
    { imageUrl: '/Adama-City.webp',   title: 'Adama City Skyline',       description: 'The vibrant heart of Oromia, Ethiopia', category: 'Civic Center' },
    { imageUrl: '/Adama_city2.webp',  title: 'City Streets',             description: 'Daily life and community in Adama', category: 'Urban Corridor' },
    { imageUrl: '/Adama_city3.webp',  title: 'Adama at Dusk',            description: 'The city comes alive in the evening', category: 'Infrastructure' },
    { imageUrl: '/Adama_City1.jfif', title: 'Central Adama',            description: 'A city of opportunity and growth', category: 'Civic Pride' },
    { imageUrl: '/Adama_city.jfif',  title: 'Community Gathering',      description: 'Together we build wealthy community', category: 'Historical Landmark' },
    { imageUrl: '/adama_logo.webp',   title: 'Adama City Administration', description: 'Official seal of Adama City', category: 'Administration' },
  ];

  const photos = (galleryData && galleryData.length > 0) ? galleryData : defaultPhotos;

  const values = [
    { icon: Shield, title: 'Transparency', desc: 'Every donation is tracked end-to-end. Donors see exactly where their money goes.', footer: 'Audited Transactions', color: 'text-[var(--color-civic-emerald)]', bg: 'bg-[var(--color-civic-emerald)]/10 border-[var(--color-civic-emerald)]/20', hover: 'hover:border-[var(--color-civic-emerald)]/50', hoverBg: 'group-hover:bg-[var(--color-civic-emerald)]' },
    { icon: Eye,    title: 'Accountability', desc: 'Multi-level admin oversight from Kebele to City level ensures responsible distribution.', footer: 'Kebele Leadership', color: 'text-[var(--color-amber-cta)]', bg: 'bg-[var(--color-amber-cta)]/10 border-[var(--color-amber-cta)]/20', hover: 'hover:border-[var(--color-amber-cta)]/50', hoverBg: 'group-hover:bg-[var(--color-amber-cta)]' },
    { icon: Target, title: 'Impact',     desc: 'We measure real outcomes — families fed, medical bills paid, lives improved.', footer: 'Real-Time Reports', color: 'text-tertiary', bg: 'bg-green-300/10 border-green-300/20', hover: 'hover:border-green-300/50', hoverBg: 'group-hover:bg-green-400' },
    { icon: Users,  title: 'Community',  desc: 'Built by and for the people of Adama. We celebrate every generous act.', footer: 'Local Solidarity', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20', hover: 'hover:border-blue-400/50', hoverBg: 'group-hover:bg-blue-500' },
  ];

  return (
    <div className="bg-[var(--color-surface)] text-[var(--text-main)] min-h-screen flex flex-col selection:bg-[var(--color-civic-emerald)]/20 selection:text-[var(--color-civic-emerald)]">

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden border-b border-[var(--border)]">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-civic-emerald)]/10 via-[var(--color-surface)] to-[var(--color-surface)]"></div>
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[var(--color-civic-emerald)]/20 blur-[140px] rounded-full"></div>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[var(--color-civic-emerald)]/10 border border-[var(--color-civic-emerald)]/30 backdrop-blur-sm mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--color-amber-cta)] animate-pulse"></span>
            <CheckCircle className="text-[var(--color-civic-emerald)] w-4 h-4" />
            <span className="text-xs font-semibold text-[var(--color-civic-emerald)] uppercase tracking-wider">Adama City Administration</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[var(--text-main)] mb-6">
            About <span className="text-[var(--color-amber-cta)] underline decoration-[var(--color-amber-cta)]/40 decoration-wavy decoration-2">WeDonate</span>
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-3xl mx-auto leading-relaxed">
            Adama City Administration's official digital platform connecting generous donors with families and individuals in need across Adama, Oromia, Ethiopia.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[var(--text-muted)] text-sm font-semibold">
            <div className="flex items-center gap-2">
              <Scale className="text-[var(--color-civic-emerald)] w-5 h-5" />
              <span>Civic Oversight</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] opacity-50"></div>
            <div className="flex items-center gap-2">
              <Package className="text-[var(--color-civic-emerald)] w-5 h-5" />
              <span>100% Verified Needs</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] opacity-50"></div>
            <div className="flex items-center gap-2">
              <Heart className="text-[var(--color-amber-cta)] w-5 h-5" />
              <span>Kebele Certified</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-[var(--color-civic-emerald)] text-xs font-bold uppercase tracking-widest">
              <span className="w-6 h-px bg-[var(--color-civic-emerald)]"></span>
              Institutional Purpose
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--text-main)]">
              Our Mission
            </h2>
            <div className="space-y-4 text-[var(--text-muted)] text-lg leading-relaxed">
              <p>
                To eliminate the inefficiencies of manual charity management by creating a transparent, digital bridge between donors and those in need in Adama City — ensuring every birr reaches those who truly need it.
              </p>
              <p>
                We work directly with Kebele and City-level administrators to verify requests, manage distributions, and report outcomes with full accountability.
              </p>
            </div>
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link to="/register">
                <button className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[var(--color-civic-emerald-deep)] hover:bg-[var(--color-civic-emerald)] text-white font-semibold transition-all duration-200 shadow-md active:scale-95">
                  <span>Join the Movement</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-surface-container)] border border-[var(--border)]">
                <BookOpen className="text-[var(--color-amber-cta)] w-5 h-5" />
                <span className="text-sm font-semibold text-[var(--text-main)]">Official Charter 2025/26</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="relative group rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--color-surface-container-low)] shadow-2xl">
              <div className="aspect-[16/11] w-full relative overflow-hidden">
                <img src="/Adama_city2.webp" alt="Adama City" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-container-lowest)] via-[var(--color-surface-container-lowest)]/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-[var(--color-surface-container-high)]/85 backdrop-blur-md border border-[var(--border)] shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[var(--text-main)]">Adama City</h3>
                      <p className="text-sm text-[var(--color-amber-cta)] flex items-center gap-1.5 mt-0.5">
                        Oromia, Ethiopia
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[var(--color-civic-emerald)]/10 border border-[var(--color-civic-emerald)]/30 flex items-center justify-center text-[var(--color-civic-emerald)]">
                      <Shield className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-16 md:py-24 bg-[var(--color-surface-container-low)] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-[var(--color-amber-cta)] text-xs font-bold uppercase tracking-widest mb-3">
              <span className="w-4 h-px bg-[var(--color-amber-cta)]"></span>
              Guiding Principles
              <span className="w-4 h-px bg-[var(--color-amber-cta)]"></span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--text-main)]">Our Values</h2>
            <p className="text-[var(--text-muted)] text-lg mt-3">
              Designed for municipal integrity, communal empathy, and verified direct assistance.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className={`group p-8 rounded-2xl bg-[var(--color-surface-container)] border border-[var(--border)] ${v.hover} transition-all duration-300 hover:-translate-y-1 shadow-sm flex flex-col justify-between h-full`}>
                  <div>
                    <div className={`w-14 h-14 rounded-xl ${v.bg} border flex items-center justify-center mb-6 ${v.color} group-hover:scale-110 ${v.hoverBg} group-hover:text-white transition-all duration-300`}>
                      <v.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-main)] mb-2.5">{v.title}</h3>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">{v.desc}</p>
                  </div>
                  <div className={`pt-6 mt-6 border-t border-[var(--border)] flex items-center gap-2 text-xs font-bold ${v.color}`}>
                    <Activity className="w-4 h-4" />
                    <span>{v.footer}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--text-main)]">Our City, Our Community</h2>
          <p className="text-[var(--text-muted)] text-lg mt-3">A glimpse of life in Adama — curated by our city administrators</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="relative group rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--color-surface-container)] aspect-[4/3] cursor-pointer" onClick={() => setLightboxIdx(i)}>
              <img src={photo.imageUrl} alt={photo.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-5">
                <div>
                  <span className="text-xs font-bold text-[var(--color-amber-cta)] uppercase tracking-wider">{photo.category || 'City View'}</span>
                  <p className="text-lg font-bold text-white mt-1">{photo.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox photos={photos} index={lightboxIdx} onClose={() => setLightboxIdx(null)} onPrev={() => setLightboxIdx(i => Math.max(0, (i ?? 0) - 1))} onNext={() => setLightboxIdx(i => Math.min(photos.length - 1, (i ?? 0) + 1))} />
      )}

      {/* ── CTA ── */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/Adama_city3.webp" alt="" loading="lazy" className="w-full h-full object-cover filter brightness-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-surface)]/90 to-[var(--color-background)]/80"></div>
          <div className="absolute inset-0 bg-[var(--color-civic-emerald)]/10 mix-blend-overlay"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-amber-cta)]/15 border border-[var(--color-amber-cta)]/30 text-[var(--color-amber-cta)] text-xs font-bold mb-6">
            <Play className="w-4 h-4" />
            <span>Community Call to Action</span>
          </div>
          <h2 className="text-4xl md:text-6xl text-white mb-6 font-extrabold tracking-tight">Be Part of the Change</h2>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Post a request, donate to someone in need, or join a community campaign.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[var(--color-amber-cta)] text-[#0b131b] font-bold transition-all duration-200 shadow-xl active:scale-95">
                <span>Get Started Today</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/about">
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[var(--color-surface-container)]/80 backdrop-blur-md border border-[var(--border)] text-[var(--text-main)] hover:border-[var(--color-civic-emerald)] transition-all">
                <Shield className="w-5 h-5" />
                <span>How Verification Works</span>
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
