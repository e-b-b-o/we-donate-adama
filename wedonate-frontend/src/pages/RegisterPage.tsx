import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { 
  ArrowLeft, Mail, Phone, Lock, Eye, EyeOff, ChevronRight, 
  Building2, MapPin, FileText, CheckCircle, Shield, Globe, Users, Target
} from 'lucide-react';
import ImageUpload from '../components/ui/ImageUpload';

type OrgType = 'NGO' | 'GOVERNMENTAL' | 'RELIGIOUS' | 'PRIVATE_CHARITY';

const ORG_TYPES: { value: OrgType; label: string }[] = [
  { value: 'NGO', label: 'NGO' },
  { value: 'GOVERNMENTAL', label: 'Governmental' },
  { value: 'RELIGIOUS', label: 'Religious' },
  { value: 'PRIVATE_CHARITY', label: 'Private Charity' },
];

export default function RegisterPage() {
  const { isDark } = useTheme();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectTo = params.get('from') || '/dashboard';

  const [isOrg, setIsOrg] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<OrgType>('NGO');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [registrationDocUrl, setRegistrationDocUrl] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [kebeles, setKebeles] = useState<any[]>([]);
  const [kebeleId, setKebeleId] = useState('');

  useEffect(() => {
    api.get('/kebeles/active').then(res => setKebeles(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOrg && (!firstName || !lastName || !email || !password)) return toast.error('Fill all fields');
    if (isOrg && (!orgName || !licenseNumber || !officeAddress || !email || !password)) return toast.error('Fill all required fields');
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    if (isOrg && !agreed) return toast.error('You must certify the organization info');
    if (isOrg && !registrationDocUrl) return toast.error('Please upload registration certificate');
    if (!agreed) return toast.error('You must agree to the Terms of Service');

    setLoading(true);
    try {
      const payload: any = { firstName, lastName, email, phone, password, kebeleId: kebeleId || null };
      if (isOrg) {
        payload.accountType = 'organization';
        payload.orgName = orgName;
        payload.orgType = orgType;
        payload.licenseNumber = licenseNumber;
        payload.registrationDocUrl = registrationDocUrl;
        payload.officeAddress = officeAddress;
        delete payload.kebeleId;
      }
      await register(payload);
      toast.success(isOrg ? 'Registration submitted! Pending admin verification.' : 'Account created!');
      navigate(isOrg ? '/login' : redirectTo);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Using Stitch styles for the input elements
  const inputClass = cn(
    "w-full px-4 py-3 border rounded-xl text-sm transition-colors",
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
            Join WeDonate
          </h1>
          <p className={cn("mt-2 text-lg leading-relaxed", isDark ? "text-[var(--text-muted)]" : "text-gray-600")}>
            One account. Endless ways to help.
          </p>

          {/* 3 Value Proposition Civic Cards */}
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
                <h3 className={cn("font-bold text-base", isDark ? "text-white" : "text-gray-900")}>Direct Impact</h3>
                <p className={cn("text-sm mt-0.5", isDark ? "text-[var(--text-muted)]" : "text-gray-500")}>Help real people in Adama</p>
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
                <h3 className={cn("font-bold text-base", isDark ? "text-white" : "text-gray-900")}>Full Transparency</h3>
                <p className={cn("text-sm mt-0.5", isDark ? "text-[var(--text-muted)]" : "text-gray-500")}>Track every birr donated</p>
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
                <h3 className={cn("font-bold text-base", isDark ? "text-white" : "text-gray-900")}>Trusted Platform</h3>
                <p className={cn("text-sm mt-0.5", isDark ? "text-[var(--text-muted)]" : "text-gray-500")}>Verified organizations only</p>
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

      {/* ── RIGHT COLUMN: Registration Form Panel ── */}
      <div className={cn("w-full lg:w-[52%] xl:w-[55%] flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-y-auto", 
        isDark ? "bg-[var(--color-surface)]" : "bg-white"
      )}>
        <div className="max-w-xl w-full mx-auto">
          {/* Top Back Navigation Action */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className={cn("inline-flex items-center gap-2 text-sm font-bold transition-colors duration-200 group", 
              isDark ? "text-[var(--text-muted)] hover:text-[var(--color-civic-emerald)]" : "text-gray-500 hover:text-[var(--color-civic-emerald)]"
            )}>
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Form Title & Subtitle */}
          <div className="mb-7">
            <h2 className={cn("text-3xl lg:text-4xl font-extrabold tracking-tight", isDark ? "text-white" : "text-gray-900")}>
              Create Your Account
            </h2>
            <p className={cn("mt-2 text-base", isDark ? "text-[var(--text-muted)]" : "text-gray-600")}>
              Join WeDonate and start making a difference
            </p>
          </div>

          {/* Role Selection Segmented Toggle */}
          <div className={cn("p-1 rounded-xl border grid grid-cols-2 gap-1 mb-8", 
            isDark ? "bg-[var(--color-surface-container-low)] border-[var(--border)]" : "bg-gray-100 border-gray-200"
          )}>
            <button 
              type="button" 
              onClick={() => setIsOrg(false)}
              className={cn("flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm transition-all duration-200 focus:outline-none",
                !isOrg 
                  ? "bg-[var(--color-civic-emerald-glow)] text-[var(--color-civic-emerald)] font-bold shadow-sm" 
                  : (isDark ? "text-[var(--text-muted)] hover:text-white font-semibold" : "text-gray-500 hover:text-gray-900 font-semibold")
              )}
            >
              <Users className="w-5 h-5" />
              <span>Individual</span>
            </button>
            <button 
              type="button" 
              onClick={() => setIsOrg(true)}
              className={cn("flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm transition-all duration-200 focus:outline-none",
                isOrg 
                  ? "bg-[var(--color-civic-emerald-glow)] text-[var(--color-civic-emerald)] font-bold shadow-sm" 
                  : (isDark ? "text-[var(--text-muted)] hover:text-white font-semibold" : "text-gray-500 hover:text-gray-900 font-semibold")
              )}
            >
              <Building2 className="w-5 h-5" />
              <span>Organization</span>
            </button>
          </div>

          {/* Registration Form Elements */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Row: First Name & Last Name (Side by Side) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name <span className="text-[var(--color-amber-cta)] font-bold">*</span></label>
                <input 
                  className={inputClass} 
                  placeholder="Abebe" 
                  required
                  value={firstName} onChange={e => setFirstName(e.target.value)} 
                />
              </div>
              <div>
                <label className={labelClass}>Last Name <span className="text-[var(--color-amber-cta)] font-bold">*</span></label>
                <input 
                  className={inputClass} 
                  placeholder="Kebede" 
                  required
                  value={lastName} onChange={e => setLastName(e.target.value)} 
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className={labelClass}>Email <span className="text-[var(--color-amber-cta)] font-bold">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  className={cn(inputClass, "pl-11")} 
                  placeholder={isOrg ? "org@example.com" : "you@example.com"} 
                  required
                  value={email} onChange={e => setEmail(e.target.value)} 
                />
              </div>
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className={labelClass}>Phone <span className={cn("text-xs font-normal", isDark ? "text-[var(--text-muted)]" : "text-gray-400")}>(optional)</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Phone className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  className={cn(inputClass, "pl-11")} 
                  placeholder="+251 911 234 567" 
                  value={phone} onChange={e => setPhone(e.target.value)} 
                />
              </div>
              <p className={cn("mt-1 text-xs font-semibold", isDark ? "text-[var(--text-muted)]/70" : "text-gray-500")}>For SMS updates and urgent municipal donor alerts</p>
            </div>

            {/* Kebele (Optional) Dropdown */}
            {!isOrg && (
              <div>
                <label className={labelClass}>Kebele <span className={cn("text-xs font-normal", isDark ? "text-[var(--text-muted)]" : "text-gray-400")}>(optional)</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <select 
                    className={cn(inputClass, "pl-11 appearance-none cursor-pointer")} 
                    value={kebeleId} onChange={e => setKebeleId(e.target.value)}
                  >
                    <option value="">-- Select your Kebele --</option>
                    {kebeles.map(k => (
                      <option key={k.id} value={k.id}>{k.name}</option>
                    ))}
                    <option value="other">Outside Adama / Diaspora Supporter</option>
                  </select>
                </div>
              </div>
            )}

            {/* Organization Specific Fields */}
            <AnimatePresence>
              {isOrg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className={cn('rounded-2xl border p-5 space-y-4 mt-2 mb-4',
                    isDark ? 'border-[var(--border)] bg-[var(--color-surface-container-low)]' 
                           : 'border-[var(--color-civic-emerald)]/20 bg-[var(--color-civic-emerald-glow)]/10'
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-5 h-5 text-[var(--color-civic-emerald)]" />
                      <h3 className="text-sm font-extrabold text-[var(--color-civic-emerald)]">
                        Organization Details
                      </h3>
                    </div>

                    <div>
                      <label className={labelClass}>Organization Name <span className="text-[var(--color-amber-cta)] font-bold">*</span></label>
                      <input className={inputClass} placeholder="e.g. Adama Charity Foundation"
                        value={orgName} onChange={e => setOrgName(e.target.value)} />
                    </div>

                    <div>
                      <label className={labelClass}>Organization Type <span className="text-[var(--color-amber-cta)] font-bold">*</span></label>
                      <div className="grid grid-cols-2 gap-2">
                        {ORG_TYPES.map(ot => (
                          <button key={ot.value} type="button" onClick={() => setOrgType(ot.value)}
                            className={cn('p-2.5 rounded-xl text-xs font-semibold text-left transition-all border',
                              orgType === ot.value
                                ? 'bg-[var(--color-civic-emerald)] text-[var(--color-surface-container-lowest)] border-[var(--color-civic-emerald)] shadow-md'
                                : (isDark ? 'bg-[var(--color-surface-container)] border-[var(--border)] text-white hover:border-[var(--color-civic-emerald)]/50' 
                                          : 'bg-white border-gray-200 text-gray-700 hover:border-[var(--color-civic-emerald)]/50'))}>
                            {ot.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>License / Registration Number <span className="text-[var(--color-amber-cta)] font-bold">*</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                          <FileText className="w-5 h-5" />
                        </div>
                        <input className={cn(inputClass, 'pl-11')} placeholder="e.g. 1234/2024"
                          value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Registration Certificate <span className="text-[var(--color-amber-cta)] font-bold">*</span></label>
                      <ImageUpload
                        label=""
                        value={registrationDocUrl}
                        onChange={setRegistrationDocUrl}
                        hint="Upload PDF or image of your registration certificate"
                        accept=".pdf,image/*"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Office Address <span className="text-[var(--color-amber-cta)] font-bold">*</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <input className={cn(inputClass, 'pl-11')} placeholder="Sub-city, Kebele"
                          value={officeAddress} onChange={e => setOfficeAddress(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password * */}
            <div>
              <label className={labelClass}>Password <span className="text-[var(--color-amber-cta)] font-bold">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showPw ? 'text' : 'password'} 
                  className={cn(inputClass, "pl-11 pr-12", !showPw && "tracking-widest")} 
                  placeholder="••••••••••" 
                  required
                  value={password} onChange={e => setPassword(e.target.value)} 
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
              {password && password.length < 8 && (
                <p className="text-xs text-[var(--color-amber-cta)] font-semibold mt-1.5">Must be at least 8 characters</p>
              )}
            </div>

            {/* Confirm Password * */}
            <div>
              <label className={labelClass}>Confirm Password <span className="text-[var(--color-amber-cta)] font-bold">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showPw ? 'text' : 'password'} 
                  className={cn(inputClass, "pl-11", !showPw && "tracking-widest")} 
                  placeholder="Repeat password" 
                  required
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} 
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400 font-semibold mt-1.5">Passwords do not match</p>
              )}
            </div>

            {/* Terms & Agreement Check */}
            <div className="pt-2 flex items-start gap-2.5">
              <input 
                id="civic-terms" 
                name="civic-terms" 
                type="checkbox" 
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
                className={cn("mt-1 w-4 h-4 rounded cursor-pointer transition-colors focus:ring-0 focus:ring-offset-0", 
                  isDark ? "bg-[var(--color-surface-container)] border-[var(--border)] text-[var(--color-civic-emerald)] focus:ring-[var(--color-civic-emerald)]"
                         : "bg-gray-50 border-gray-300 text-[var(--color-civic-emerald)]"
                )} 
              />
              <label htmlFor="civic-terms" className={cn("text-sm leading-snug font-medium", isDark ? "text-[var(--text-muted)]" : "text-gray-600")}>
                I agree to the <a href="#" className="text-[var(--color-civic-emerald)] hover:underline font-bold">Terms of Service</a>, <a href="#" className="text-[var(--color-civic-emerald)] hover:underline font-bold">Privacy Policy</a>, and Adama Municipal Charity Code of Conduct.
              </label>
            </div>

            {isOrg && (
              <div className={cn('p-3.5 rounded-xl text-xs leading-relaxed font-semibold border',
                isDark ? 'bg-amber-900/10 text-[var(--color-amber-cta)] border-[var(--color-amber-cta)]/20' 
                       : 'bg-amber-50 text-amber-700 border-amber-200'
              )}>
                After registration, your account will be <strong className="font-extrabold underline">Pending</strong>. The Adama City Admin will verify your documents within <strong>24–48 hours</strong> before you can start fundraising.
              </div>
            )}

            {/* Submit Action Button: Create Free Account */}
            <div className="pt-2">
              <button 
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full py-3.5 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors duration-200",
                  "bg-[var(--color-civic-emerald)] text-white hover:bg-[var(--color-civic-emerald-deep)]",
                  loading && "opacity-80 cursor-wait"
                )}
              >
                <span>{loading ? 'Processing...' : (isOrg ? 'Register Organization' : 'Create Free Account')}</span>
                {!loading && <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          </form>

          {/* Bottom Auth Switcher */}
          <div className={cn("mt-8 text-center pt-6 border-t", isDark ? "border-[var(--border)]" : "border-gray-200")}>
            <p className={cn("text-base", isDark ? "text-[var(--text-muted)]" : "text-gray-600")}>
              Already have an account? 
              <Link to={`/login?from=${encodeURIComponent(redirectTo)}`} className="text-[var(--color-civic-emerald)] hover:text-[var(--color-amber-cta)] font-extrabold transition-colors ml-1.5 inline-flex items-center gap-1 group">
                <span>Log In</span>
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
