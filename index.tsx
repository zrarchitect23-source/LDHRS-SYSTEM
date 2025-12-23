import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { 
  Sun, 
  Battery, 
  Thermometer, 
  Wind, 
  Settings, 
  Power, 
  RotateCw, 
  AlertTriangle,
  Zap,
  Cpu,
  Droplets,
  Lock,
  Unlock,
  User,
  LogOut,
  Sparkles,
  ChevronRight,
  Monitor,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Mail,
  CloudRain,
  ShieldAlert,
  CloudLightning,
  RefreshCcw,
  MapPin,
  CloudSun,
  Gem,
  Trophy,
  Crown,
  Stars,
  Moon
} from 'lucide-react';

// --- Constants & Types ---
const GCUF_LOGO_URL = "https://upload.wikimedia.org/wikipedia/en/0/01/Government_College_University_Logo.jpg";

interface SystemState {
  voltage: number;
  current: number;
  power: number;
  efficiency: number;
  temp: number;
  battery: number;
  dust: number;
  ldr: { t: number; b: number; l: number; r: number };
  angleX: number;
  angleY: number;
  childLock: boolean;
  isShutDown: boolean;
  weatherStatus: string;
  weatherTemp: string;
  weatherCondition: string;
  forecastAlert: boolean;
}

// --- Components ---

const SparkleText = ({ children, className = "", isDayMode = false }: { children?: React.ReactNode, className?: string, isDayMode?: boolean }) => (
  <span className={`premium-sparkle-text tracking-tighter ${isDayMode ? 'sparkle-day' : 'sparkle-night'} ${className}`}>
    {children}
  </span>
);

const PremiumCard = ({ children, className = "", isDayMode = false }: { children?: React.ReactNode, className?: string, isDayMode?: boolean }) => (
  <div className={`glass-premium border shadow-2xl transition-all duration-500 hover:border-amber-500/30 group ${isDayMode ? 'bg-white/80 border-slate-200' : 'bg-slate-950/70 border-white/5'} ${className}`}>
    {children}
  </div>
);

const WeatherWidget = ({ status, temp, condition, isEmergency, isDayMode }: { status: string, temp: string, condition: string, isEmergency: boolean, isDayMode: boolean }) => (
  <PremiumCard isDayMode={isDayMode} className={`p-6 rounded-[2rem] relative overflow-hidden ${isEmergency ? (isDayMode ? 'bg-red-50/90 border-red-200' : 'bg-red-950/40 border-red-500/40') : ''}`}>
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-black text-[9px] mb-1.5 tracking-[0.3em] uppercase">
            <MapPin className="w-3 h-3" />
            Imperial Faisalabad
          </div>
          <h3 className={`text-4xl font-black tracking-tighter ${isDayMode ? 'text-slate-800' : 'text-white'}`}>
            <SparkleText isDayMode={isDayMode}>{temp || '--°C'}</SparkleText>
          </h3>
          <p className={`${isDayMode ? 'text-slate-400' : 'text-amber-200/40'} text-[9px] font-black uppercase tracking-[0.25em] mt-1`}>{condition || 'Syncing...'}</p>
        </div>
        <div className={`p-3.5 rounded-2xl ${isEmergency ? (isDayMode ? 'bg-red-100 text-red-600' : 'bg-red-500/20 text-red-400') : (isDayMode ? 'bg-amber-50 text-amber-600 shadow-sm' : 'bg-amber-500/10 text-amber-500 shadow-inner')}`}>
          {isEmergency ? <CloudLightning className="w-8 h-8 animate-pulse" /> : <CloudSun className="w-8 h-8" />}
        </div>
      </div>
      <div className={`h-px w-full mb-4 ${isDayMode ? 'bg-slate-100' : 'bg-gradient-to-r from-transparent via-white/10 to-transparent'}`}></div>
      <p className={`text-[10px] leading-relaxed italic line-clamp-2 font-medium ${isDayMode ? 'text-slate-500' : 'text-slate-400'}`}>
        {status || "Establishing link with Royal Meteorological Services..."}
      </p>
    </div>
    <div className={`absolute -bottom-8 -right-8 w-24 h-24 blur-3xl rounded-full ${isDayMode ? 'bg-amber-200/20' : 'bg-amber-500/5'}`}></div>
  </PremiumCard>
);

const LdrSide = ({ label, value, icon: Icon, position, isDayMode }: { label: string, value: number, icon: any, position: string, isDayMode: boolean }) => {
  const intensity = Math.min(100, (value / 1024) * 100);
  return (
    <div className={`absolute ${position} flex flex-col items-center gap-1.5 group z-20`}>
      <div className="flex items-center gap-1.5">
        <Icon className={`w-3 h-3 transition-opacity ${isDayMode ? 'text-amber-600 opacity-60' : 'text-amber-500 opacity-40'} group-hover:opacity-100`} />
        <span className={`text-[8px] font-black uppercase tracking-widest ${isDayMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
      </div>
      <div className={`relative w-20 h-20 backdrop-blur-2xl rounded-2xl border flex flex-col items-center justify-center overflow-hidden transition-all group-hover:scale-105 ${isDayMode ? 'bg-white border-slate-100 shadow-xl' : 'bg-slate-950/60 border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.5)]'} group-hover:border-amber-500/40`}>
        <div 
          className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ${isDayMode ? 'bg-amber-100' : 'bg-gradient-to-t from-amber-500/20 to-transparent'}`} 
          style={{ height: `${intensity}%` }}
        ></div>
        <span className={`text-2xl font-black relative z-10 leading-none tracking-tighter ${isDayMode ? 'text-slate-800' : 'text-white'}`}>
          {value}
        </span>
        <span className={`text-[7px] font-black tracking-[0.2em] opacity-60 relative z-10 uppercase mt-1 ${isDayMode ? 'text-amber-700' : 'text-amber-500'}`}>Luminance</span>
      </div>
    </div>
  );
};

const AnalogDial = ({ 
  label, 
  value, 
  onChange, 
  disabled, 
  max = 180,
  isDayMode
}: { 
  label: string; 
  value: number; 
  onChange: (val: number) => void; 
  disabled: boolean;
  max?: number;
  isDayMode: boolean;
}) => {
  const dialRef = useRef<SVGSVGElement>(null);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || !dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
    let normalized = angle + 180;
    if (normalized < 0) normalized += 360;
    if (normalized > 180) normalized = normalized > 270 ? 0 : 180;
    onChange(Math.round(normalized));
  };

  const circumference = 2 * Math.PI * 40;

  return (
    <div className="flex flex-col items-center">
      <span className={`text-[8px] font-black uppercase tracking-[0.3em] mb-4 ${isDayMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
      <div className="relative group">
        <svg 
          ref={dialRef}
          viewBox="0 0 100 60" 
          className={`w-full max-w-[180px] cursor-pointer transition-all duration-500 ${disabled ? 'opacity-20 grayscale' : 'opacity-100'}`}
          onMouseDown={(e) => {
            if (disabled) return;
            handleMouseMove(e);
            const move = (ev: MouseEvent) => handleMouseMove(ev as any);
            const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
            window.addEventListener('mousemove', move);
            window.addEventListener('mouseup', up);
          }}
        >
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={isDayMode ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)"} strokeWidth="10" strokeLinecap="round" />
          <path 
            d="M 10 50 A 40 40 0 0 1 90 50" 
            fill="none" stroke="url(#premiumGold)" 
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference / 2}
            strokeDashoffset={(circumference / 2) - ((value / 180) * (circumference / 2))}
            className="transition-all duration-700 ease-out"
          />
          <defs>
            <linearGradient id="premiumGold" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="30%" stopColor="#fbbf24" />
              <stop offset="70%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
          </defs>
          <line 
            x1="50" y1="50" 
            x2={50 + 35 * Math.cos((value - 180) * (Math.PI / 180))} 
            y2={50 + 35 * Math.sin((value - 180) * (Math.PI / 180))}
            stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
          <circle cx="50" cy="50" r="5" fill="#fbbf24" className="shadow-lg" />
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <span className="text-2xl font-black text-amber-500 leading-none tracking-tighter italic">{value}°</span>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, unit, color, isDayMode }: any) => (
  <PremiumCard isDayMode={isDayMode} className="p-5 rounded-3xl flex items-center gap-5">
    <div className={`p-3.5 rounded-2xl ${color} shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">{label}</p>
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span className={`text-2xl font-black tracking-tighter ${isDayMode ? 'text-slate-800' : 'text-white'}`}>{value}</span>
        <span className="text-amber-500/40 text-[9px] font-black uppercase tracking-widest">{unit}</span>
      </div>
    </div>
  </PremiumCard>
);

const Login = ({ onLogin }: { onLogin: (email: string) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Credentials Mandatory');
      return;
    }
    onLogin(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#010409] p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-red-950/10 blur-[180px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-amber-500/5 blur-[180px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="w-full max-w-md glass-premium rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10 transition-transform duration-700 hover:scale-[1.01]">
        <div className="p-12 text-center bg-gradient-to-b from-red-950/40 to-transparent border-b border-white/5 relative">
          <div className="w-32 h-32 mx-auto mb-8 bg-white rounded-full p-2 overflow-hidden flex items-center justify-center shadow-2xl shadow-red-900/60 ring-4 ring-amber-500/20 group cursor-pointer">
            <img src={GCUF_LOGO_URL} alt="GCUF Logo" className="w-full h-full object-contain transition-transform group-hover:scale-110" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            <SparkleText>LDHRS <span className="not-italic opacity-80">SYSTEM</span></SparkleText>
          </h1>
          <div className="flex items-center justify-center gap-2 mt-4 opacity-60">
            <Crown className="w-3 h-3 text-amber-500" />
            <p className="text-amber-500 text-[9px] uppercase tracking-[0.5em] font-black">Imperial Dashboard</p>
            <Crown className="w-3 h-3 text-amber-500" />
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-12 space-y-8">
          <div className="space-y-5">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-[10px] font-black uppercase tracking-widest animate-shake">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-amber-500 transition-colors" />
              <input 
                type="email" 
                placeholder="REGISTRY EMAIL" 
                className="w-full pl-12 pr-5 py-5 bg-black/40 border border-white/5 rounded-2xl focus:ring-1 focus:ring-amber-500/40 focus:border-amber-500/20 outline-none text-white transition-all placeholder:text-slate-700 text-xs font-bold tracking-widest"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-amber-500 transition-colors" />
              <input 
                type="password" 
                placeholder="ACCESS KEY" 
                className="w-full pl-12 pr-5 py-5 bg-black/40 border border-white/5 rounded-2xl focus:ring-1 focus:ring-amber-500/40 focus:border-amber-500/20 outline-none text-white transition-all placeholder:text-slate-700 text-xs font-bold tracking-widest"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full py-6 bg-gradient-to-br from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white font-black rounded-2xl shadow-[0_15px_30px_rgba(127,29,29,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3 border border-white/10 uppercase tracking-[0.2em] text-xs"
          >
            Authenticate <ChevronRight className="w-5 h-5" />
          </button>
        </form>
        <div className="p-6 bg-black/60 text-center border-t border-white/5">
          <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.4em]">GCUF Royal Engineering Hub</p>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ onLogout, userEmail }: { onLogout: () => void, userEmail: string }) => {
  const [state, setState] = useState<SystemState>({
    voltage: 18.4,
    current: 4.2,
    power: 77.28,
    efficiency: 92,
    temp: 34,
    battery: 88,
    dust: 12,
    ldr: { t: 850, b: 840, l: 820, r: 830 },
    angleX: 90,
    angleY: 45,
    childLock: false,
    isShutDown: false,
    weatherStatus: "",
    weatherTemp: "",
    weatherCondition: "",
    forecastAlert: false,
  });
  const [isAuto, setIsAuto] = useState(true);
  const [isDayMode, setIsDayMode] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (state.isShutDown) return;
      setState(prev => ({
        ...prev,
        voltage: +(prev.voltage + (Math.random() - 0.5) * 0.1).toFixed(2),
        current: +(prev.current + (Math.random() - 0.5) * 0.05).toFixed(2),
        temp: +(prev.temp + (Math.random() - 0.5) * 0.2).toFixed(1),
        ldr: {
          t: Math.max(0, Math.min(1024, Math.floor(prev.ldr.t + (Math.random() - 0.5) * 20))),
          b: Math.max(0, Math.min(1024, Math.floor(prev.ldr.b + (Math.random() - 0.5) * 20))),
          l: Math.max(0, Math.min(1024, Math.floor(prev.ldr.l + (Math.random() - 0.5) * 20))),
          r: Math.max(0, Math.min(1024, Math.floor(prev.ldr.r + (Math.random() - 0.5) * 20))),
        },
        angleX: isAuto ? Math.max(0, Math.min(180, prev.angleX + (Math.random() - 0.5) * 2)) : prev.angleX,
        angleY: isAuto ? Math.max(0, Math.min(180, prev.angleY + (Math.random() - 0.5) * 2)) : prev.angleY,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [isAuto, state.isShutDown]);

  useEffect(() => {
    const checkWeather = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: "Provide the royal weather report for Faisalabad, Pakistan. If a threat to solar infrastructure exists, mark CRITICAL_THREAT.",
          config: { tools: [{ googleSearch: {} }] }
        });
        const text = response.text || "";
        const isEmergency = text.includes("CRITICAL_THREAT") || text.toLowerCase().includes("storm");
        setState(prev => ({
          ...prev,
          weatherStatus: text.split(".")[0] + ".",
          weatherTemp: text.match(/(\d+°C)/)?.[1] || "34°C",
          weatherCondition: text.toLowerCase().includes("cloud") ? "Partly Cloudy" : "Peak Irradiance",
          forecastAlert: isEmergency,
          isShutDown: isEmergency ? true : prev.isShutDown
        }));
      } catch (e) { console.error(e); }
    };
    checkWeather();
    const weatherInterval = setInterval(checkWeather, 900000); 
    return () => clearInterval(weatherInterval);
  }, []);

  const toggleEmergencyShutdown = () => {
    setState(prev => ({ ...prev, isShutDown: !prev.isShutDown }));
  };

  const runAiAnalysis = async () => {
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a high-level executive summary for Solar Hub LDHRS-SYSTEM-FSD. Current Voltage: ${state.voltage}V. Dust: ${state.dust}%. Ambient: ${state.weatherStatus}. Be technical and imperial.`
      });
      setAiInsight(response.text);
    } catch (err) { setAiInsight("Telemetry link failed."); } finally { setAiLoading(false); }
  };

  return (
    <div className={`min-h-screen pb-20 selection:bg-amber-500/40 transition-colors duration-1000 ${isDayMode ? 'bg-slate-50 text-slate-800' : 'bg-[#010409] text-slate-100'}`}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {isDayMode ? (
          <>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-50/20 via-white to-slate-100/40"></div>
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-amber-200/20 blur-[150px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-100/20 blur-[150px] rounded-full"></div>
          </>
        ) : (
          <>
            <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-red-950/10 blur-[200px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-amber-500/5 blur-[200px] rounded-full"></div>
          </>
        )}
      </div>

      <nav className={`px-10 py-6 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-700 ${isDayMode ? 'bg-white/70 border-slate-200 shadow-sm' : 'bg-[#0a0f1d]/70 border-white/5 shadow-2xl'}`}>
        <div className="flex items-center gap-6">
          <div className={`p-1.5 rounded-xl transition-all duration-700 ${isDayMode ? 'bg-white shadow-xl ring-2 ring-amber-100' : 'bg-white shadow-[0_0_30px_rgba(255,255,255,0.1)] ring-2 ring-amber-500/20'}`}>
            <img src={GCUF_LOGO_URL} alt="GCUF Logo" className="h-12 w-12 object-contain" />
          </div>
          <div className={`h-10 w-px ${isDayMode ? 'bg-slate-200' : 'bg-white/10'}`}></div>
          <div>
            <h1 className={`text-2xl font-black tracking-tighter uppercase italic`}>
              <SparkleText isDayMode={isDayMode}>LDHRS <span className="not-italic opacity-60">SYSTEM</span></SparkleText>
            </h1>
            <p className={`text-[9px] font-black uppercase tracking-[0.4em] mt-1.5 flex items-center gap-2 ${isDayMode ? 'text-amber-600' : 'text-amber-500/60'}`}>
              <span className={`w-2 h-2 rounded-full ${state.isShutDown ? 'bg-red-500 shadow-[0_0_10px_red]' : (isDayMode ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse')}`}></span>
              {state.isShutDown ? 'System Stowed' : 'Grand Faisalabad Command'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsDayMode(!isDayMode)}
            className={`p-3 rounded-2xl transition-all duration-500 border flex items-center justify-center ${
              isDayMode 
                ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm hover:shadow-md' 
                : 'bg-white/5 text-amber-500 border-white/10 shadow-xl hover:bg-white/10'
            }`}
          >
            {isDayMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <div className="hidden lg:flex flex-col items-end">
            <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${isDayMode ? 'text-slate-400' : 'text-slate-500'}`}>Commanding Officer</span>
            <span className={`text-xs font-black tracking-wider ${isDayMode ? 'text-slate-800' : 'text-amber-500'}`}>LORD {userEmail.split('@')[0].toUpperCase()}</span>
          </div>
          <button 
            onClick={() => setIsAuto(!isAuto)}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 flex items-center gap-3 border ${
              isAuto 
                ? (isDayMode ? 'bg-amber-600 text-white border-amber-500 shadow-lg' : 'bg-amber-500/10 text-amber-500 border-amber-500/40 shadow-inner') 
                : (isDayMode ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-slate-900 text-slate-500 border-white/5')
            }`}
          >
            {isAuto ? <Stars className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            {isAuto ? 'Master Auto' : 'Direct Link'}
          </button>
          <button onClick={onLogout} className={`p-3 rounded-2xl transition-all border ${isDayMode ? 'bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 border-slate-200 shadow-sm' : 'glass-premium text-slate-500 hover:text-red-500 hover:bg-red-500/5 border-white/5 shadow-xl'}`}>
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-10 py-12 relative">
        {state.isShutDown && (
          <div className={`mb-12 p-10 rounded-[3rem] border backdrop-blur-3xl flex items-center justify-between shadow-2xl animate-pulse ring-1 transition-all duration-700 ${isDayMode ? 'bg-red-50 border-red-200 ring-red-100' : 'bg-gradient-to-br from-red-950/60 via-red-900/40 to-black border-red-500/40 ring-red-500/20'}`}>
            <div className="flex items-center gap-8">
              <div className={`p-5 rounded-[1.5rem] shadow-inner ${isDayMode ? 'bg-red-100' : 'bg-red-500/20'}`}>
                <ShieldAlert className={`w-10 h-10 ${isDayMode ? 'text-red-600' : 'text-red-400'}`} />
              </div>
              <div>
                <h2 className={`text-2xl font-black uppercase tracking-tighter ${isDayMode ? 'text-red-900' : 'text-white'}`}>Grid Protection Mode</h2>
                <p className={`text-[11px] font-black uppercase tracking-widest mt-2 ${isDayMode ? 'text-red-700/60' : 'text-red-200/50'}`}>Array stowed. Source: {state.forecastAlert ? 'Severe Faisalabad Storm' : 'Manual Command'}.</p>
              </div>
            </div>
            <button 
              onClick={toggleEmergencyShutdown}
              className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl ${isDayMode ? 'bg-red-900 text-white' : 'bg-white text-red-950'}`}
            >
              Resume Grid
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-3 space-y-6">
            <WeatherWidget 
              status={state.weatherStatus} 
              temp={state.weatherTemp} 
              condition={state.weatherCondition} 
              isEmergency={state.forecastAlert} 
              isDayMode={isDayMode}
            />
            <MetricCard isDayMode={isDayMode} icon={Zap} label="Potential Diff" value={state.isShutDown ? 0 : state.voltage} unit="V" color={isDayMode ? "text-amber-600 bg-amber-50" : "text-amber-500 bg-amber-500/10"} />
            <MetricCard isDayMode={isDayMode} icon={Power} label="Flux Current" value={state.isShutDown ? 0 : state.current} unit="A" color={isDayMode ? "text-amber-600 bg-amber-50" : "text-amber-500 bg-amber-500/10"} />
            <MetricCard isDayMode={isDayMode} icon={Trophy} label="Array Rating" value={state.efficiency} unit="%" color={isDayMode ? "text-emerald-600 bg-emerald-50" : "text-emerald-400 bg-emerald-400/10"} />
            <MetricCard isDayMode={isDayMode} icon={Battery} label="Reserves" value={state.battery} unit="%" color={isDayMode ? "text-blue-600 bg-blue-50" : "text-sky-400 bg-sky-400/10"} />
            <MetricCard isDayMode={isDayMode} icon={Wind} label="Surface Dust" value={state.dust} unit="%" color={isDayMode ? "text-orange-600 bg-orange-50" : "text-orange-400 bg-orange-400/10"} />
            <MetricCard isDayMode={isDayMode} icon={Thermometer} label="Ambient Temp" value={state.temp} unit="°C" color={isDayMode ? "text-rose-600 bg-rose-50" : "text-rose-400 bg-rose-400/10"} />
          </div>

          <div className="lg:col-span-6 space-y-12">
            <PremiumCard isDayMode={isDayMode} className="p-12 rounded-[3.5rem] relative overflow-hidden group">
              <div className={`absolute -top-32 -right-32 w-80 h-80 blur-[120px] rounded-full ${isDayMode ? 'bg-amber-100/40' : 'bg-amber-500/5'}`}></div>
              
              <div className="flex justify-between items-center mb-16 relative z-10">
                <div>
                  <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDayMode ? 'text-slate-400' : 'text-slate-500'}`}>Vector Irradiance Matrix</h3>
                  <p className={`text-[8px] font-black mt-2 uppercase tracking-widest ${isDayMode ? 'text-amber-700/50' : 'text-amber-500/50'}`}>Global Positioning Faisalabad Hub</p>
                </div>
                <div className={`px-5 py-2 rounded-full border flex items-center gap-2.5 ${isDayMode ? 'bg-white border-slate-100' : 'glass-premium border-white/10'}`}>
                  <div className={`w-2 h-2 rounded-full ${isDayMode ? 'bg-amber-500 animate-pulse' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-pulse'}`}></div>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isDayMode ? 'text-amber-600' : 'text-amber-500'}`}>SYSTEM Sync</span>
                </div>
              </div>

              <div className="relative w-full aspect-square max-w-[380px] mx-auto flex items-center justify-center">
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className={`w-full h-px absolute ${isDayMode ? 'bg-gradient-to-r from-transparent via-slate-200 to-transparent' : 'bg-gradient-to-r from-transparent via-white/5 to-transparent'}`}></div>
                  <div className={`h-full w-px absolute ${isDayMode ? 'bg-gradient-to-b from-transparent via-slate-200 to-transparent' : 'bg-gradient-to-b from-transparent via-white/5 to-transparent'}`}></div>
                  <div className={`w-[90%] h-[90%] rounded-full border absolute shadow-inner ${isDayMode ? 'border-slate-100' : 'border-white/5'}`}></div>
                  <div className={`w-[65%] h-[65%] rounded-full border absolute ${isDayMode ? 'border-slate-100' : 'border-white/5'}`}></div>
                  <div className={`w-[40%] h-[40%] rounded-full border absolute animate-ping-slow ${isDayMode ? 'border-amber-500/10' : 'border-amber-500/5'}`}></div>
                </div>

                <div className={`w-1/3 h-1/3 backdrop-blur-3xl rounded-[3rem] border flex items-center justify-center relative shadow-2xl transition-all duration-700 z-10 ${isDayMode ? 'bg-white border-slate-200 group-hover:border-amber-300' : 'bg-black/60 border-white/10 group-hover:border-amber-500/30 shadow-[0_0_60px_rgba(0,0,0,0.8)]'}`}>
                  <div className={`absolute inset-0 rounded-[3rem] ${state.isShutDown ? (isDayMode ? 'bg-slate-50' : 'bg-slate-900/30') : (isDayMode ? 'bg-amber-50/50' : 'bg-amber-500/5')}`}></div>
                  <Sun className={`w-12 h-12 transition-all duration-700 ${state.isShutDown ? 'text-slate-300' : (isDayMode ? 'text-amber-500/60 group-hover:scale-110' : 'text-amber-500/30 group-hover:scale-110')}`} />
                  {!state.isShutDown && (
                    <div 
                      className={`absolute w-10 h-10 rounded-full blur-[14px] animate-pulse pointer-events-none transition-all duration-1000 ease-out z-20 ${isDayMode ? 'bg-amber-400/60' : 'bg-amber-500/80'}`}
                      style={{ transform: `translate(${(state.ldr.r - state.ldr.l) / 5}px, ${(state.ldr.b - state.ldr.t) / 5}px)` }}
                    ></div>
                  )}
                </div>

                <LdrSide isDayMode={isDayMode} label="North Polar" value={state.ldr.t} icon={ArrowUp} position="top-0 left-1/2 -translate-x-1/2" />
                <LdrSide isDayMode={isDayMode} label="South Polar" value={state.ldr.b} icon={ArrowDown} position="bottom-0 left-1/2 -translate-x-1/2" />
                <LdrSide isDayMode={isDayMode} label="West Vector" value={state.ldr.l} icon={ArrowLeft} position="left-0 top-1/2 -translate-y-1/2" />
                <LdrSide isDayMode={isDayMode} label="East Vector" value={state.ldr.r} icon={ArrowRight} position="right-0 top-1/2 -translate-y-1/2" />
              </div>
            </PremiumCard>

            <div className={`rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden border transition-all duration-1000 group ${isDayMode ? 'bg-white border-slate-200' : 'bg-gradient-to-br from-[#0a0f1d] to-[#010409] border-white/10'}`}>
               <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] -mr-40 -mt-40 ${isDayMode ? 'bg-blue-50' : 'bg-red-900/5'}`}></div>
               <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl shadow-inner border transition-all ${isDayMode ? 'bg-amber-50 border-amber-100' : 'bg-amber-500/10 border-amber-500/10'}`}>
                      <Sparkles className={`w-7 h-7 ${isDayMode ? 'text-amber-600' : 'text-amber-500'}`} />
                    </div>
                    <div>
                      <h3 className={`font-black text-2xl tracking-tighter uppercase italic ${isDayMode ? 'text-slate-800' : 'text-white'}`}><SparkleText isDayMode={isDayMode}>Imperial Intel</SparkleText></h3>
                      <p className={`text-[9px] uppercase font-black tracking-[0.4em] mt-1 ${isDayMode ? 'text-amber-700/40' : 'text-amber-500/40'}`}>Neural Core Faisalabad</p>
                    </div>
                  </div>
                  <button 
                    onClick={runAiAnalysis}
                    disabled={aiLoading}
                    className={`px-8 py-3.5 backdrop-blur-xl rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${isDayMode ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-white/5 border-white/10 hover:border-amber-500/30'}`}
                  >
                    {aiLoading ? 'Accessing Neural Link...' : 'Fetch Royal Audit'}
                  </button>
                </div>
                <div className={`min-h-[140px] flex flex-col justify-center p-8 rounded-3xl border shadow-inner transition-colors ${isDayMode ? 'bg-slate-50/50 border-slate-100' : 'bg-black/50 border-white/5'} group-hover:border-amber-500/10`}>
                  {aiInsight ? (
                    <p className={`text-sm leading-relaxed italic font-semibold whitespace-pre-line ${isDayMode ? 'text-slate-600' : 'text-slate-300'}`}>
                      <span className={`font-black not-italic mr-3 tracking-widest text-[10px] ${isDayMode ? 'text-amber-600' : 'text-amber-500'}`}>VERDICT:</span>
                      "{aiInsight}"
                    </p>
                  ) : (
                    <div className="text-center opacity-40">
                      <Monitor className="w-12 h-12 mx-auto mb-5 text-slate-500" />
                      <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDayMode ? 'text-slate-400' : 'text-slate-500'}`}>Awaiting Imperial Telemetry...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-10">
            <PremiumCard isDayMode={isDayMode} className="rounded-[3.5rem] overflow-hidden relative group">
              <div className={`px-10 py-8 border-b flex items-center justify-between ${isDayMode ? 'bg-slate-50/50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                <h3 className={`text-[11px] font-black uppercase tracking-[0.3em] ${isDayMode ? 'text-slate-400' : 'text-slate-500'}`}>Axis Command</h3>
                <button 
                  onClick={() => setState(s => ({...s, childLock: !s.childLock}))}
                  className={`p-3.5 rounded-2xl transition-all border shadow-lg ${state.childLock ? 'bg-amber-500 text-black border-amber-600' : (isDayMode ? 'bg-white text-slate-400 border-slate-200' : 'bg-white/5 text-slate-500 border-white/10')}`}
                >
                  {state.childLock ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-10 space-y-20">
                <AnalogDial 
                  isDayMode={isDayMode}
                  label="Azimuth Orientation" 
                  value={state.angleX} 
                  max={180}
                  disabled={isAuto || state.childLock || state.isShutDown}
                  onChange={(val) => setState(s => ({...s, angleX: val}))}
                />
                <AnalogDial 
                  isDayMode={isDayMode}
                  label="Altitude Projection" 
                  value={state.angleY} 
                  max={180}
                  disabled={isAuto || state.childLock || state.isShutDown}
                  onChange={(val) => setState(s => ({...s, angleY: val}))}
                />
                {(isAuto || state.childLock || state.isShutDown) && (
                  <div className="text-center pt-6">
                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] animate-pulse ${isDayMode ? 'text-amber-700/60' : 'text-amber-500/60'}`}>
                      {state.isShutDown ? "Security Lock" : state.childLock ? "Access Denied" : "Autonomous Intel"}
                    </p>
                  </div>
                )}
              </div>
            </PremiumCard>

            <div className={`p-10 rounded-[2.5rem] border transition-all duration-700 flex gap-6 ${state.dust > 15 ? (isDayMode ? 'bg-orange-50 border-orange-200' : 'bg-orange-500/10 border-orange-500/40') : (isDayMode ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5')}`}>
              <div className={`p-5 rounded-3xl transition-colors duration-700 ${state.dust > 15 ? 'bg-orange-100 text-orange-600' : (isDayMode ? 'bg-white text-slate-300' : 'bg-white/5 text-slate-600')}`}>
                {state.dust > 15 ? <RefreshCcw className="w-7 h-7 animate-spin-slow" /> : <Droplets className="w-7 h-7" />}
              </div>
              <div>
                <h4 className={`font-black text-[11px] uppercase tracking-[0.2em] ${state.dust > 15 ? 'text-orange-600' : 'text-slate-400'}`}>Purification</h4>
                <p className={`text-[10px] mt-2.5 leading-relaxed font-semibold ${state.dust > 15 ? 'text-orange-900/50' : (isDayMode ? 'text-slate-400' : 'text-slate-600')}`}>
                  {state.dust > 15 ? 'Critical Impurity Detected: Wash cycle start.' : 'Array integrity optimal. Peak solar intake.'}
                </p>
              </div>
            </div>

            <div className={`p-10 rounded-[2.5rem] border transition-all duration-700 flex gap-6 ${state.forecastAlert ? (isDayMode ? 'bg-red-50 border-red-200' : 'bg-red-500/10 border-red-500/40') : (isDayMode ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/40')}`}>
              <div className={`p-5 rounded-3xl transition-colors duration-700 ${state.forecastAlert ? 'bg-red-100 text-red-600' : (isDayMode ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-500/20 text-emerald-500')}`}>
                {state.forecastAlert ? <ShieldAlert className="w-7 h-7" /> : <Gem className="w-7 h-7" />}
              </div>
              <div>
                <h4 className={`font-black text-[11px] uppercase tracking-[0.2em] ${state.forecastAlert ? 'text-red-600' : 'text-emerald-600'}`}>Link Guard</h4>
                <p className={`text-[10px] mt-2.5 leading-relaxed font-semibold ${state.forecastAlert ? 'text-red-700/50' : 'text-emerald-700/50'}`}>
                  {state.forecastAlert ? 'Severe atmospheric risk. Protective mode.' : 'Quantum encrypted link stable. Secure.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@900&display=swap');

        body {
          transition: background-color 1s ease;
        }

        .glass-premium {
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        .premium-sparkle-text {
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shine-premium 5s linear infinite;
        }

        .sparkle-night {
          background-image: linear-gradient(
            to right, 
            #ffffff 0%, 
            #fbbf24 25%, 
            #ffffff 50%, 
            #fbbf24 75%, 
            #ffffff 100%
          );
          text-shadow: 0 0 10px rgba(251, 191, 36, 0.2);
        }

        .sparkle-day {
          background-image: linear-gradient(
            to right, 
            #1e293b 0%, 
            #b45309 25%, 
            #1e293b 50%, 
            #b45309 75%, 
            #1e293b 100%
          );
          text-shadow: 0 0 5px rgba(180, 83, 9, 0.1);
        }

        @keyframes shine-premium {
          to { background-position: 200% center; }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.1); opacity: 0.2; }
          100% { transform: scale(1.2); opacity: 0.1; }
        }

        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 4s ease-in-out infinite;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
  };

  return (
    <div className="min-h-screen">
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard onLogout={handleLogout} userEmail={userEmail} />
      )}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
