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
  CloudSun
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

const WeatherWidget = ({ status, temp, condition, isEmergency }: { status: string, temp: string, condition: string, isEmergency: boolean }) => (
  <div className={`p-6 rounded-3xl border transition-all duration-700 overflow-hidden relative ${isEmergency ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200 shadow-sm'}`}>
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-red-900 font-bold text-xs mb-1">
            <MapPin className="w-3 h-3" />
            FAISALABAD, PK
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{temp || '--°C'}</h3>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{condition || 'Updating...'}</p>
        </div>
        <div className={`p-3 rounded-2xl ${isEmergency ? 'bg-red-100 text-red-600' : 'bg-red-50 text-red-900'}`}>
          {isEmergency ? <CloudLightning className="w-8 h-8 animate-pulse" /> : <CloudSun className="w-8 h-8" />}
        </div>
      </div>
      <div className="h-px bg-slate-100 w-full mb-4"></div>
      <p className="text-[10px] text-slate-500 leading-relaxed italic">
        {status || "Synchronizing with Google Weather services..."}
      </p>
    </div>
    {isEmergency && (
      <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
    )}
  </div>
);

const LdrSide = ({ label, value, icon: Icon, position }: { label: string, value: number, icon: any, position: string }) => {
  const intensity = Math.min(100, (value / 1024) * 100);
  return (
    <div className={`absolute ${position} flex flex-col items-center gap-1 group`}>
      <div className="flex items-center gap-1 mb-1">
        <Icon className="w-3 h-3 text-red-900 opacity-50" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
      </div>
      <div className="relative w-20 h-20 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-red-900 group-hover:shadow-md">
        <div 
          className="absolute bottom-0 left-0 w-full bg-red-900/5 transition-all duration-1000" 
          style={{ height: `${intensity}%` }}
        ></div>
        <span className="text-xl font-black text-red-950 relative z-10 leading-none">{value}</span>
        <span className="text-[9px] text-red-900 font-bold opacity-60 relative z-10">LUX</span>
      </div>
    </div>
  );
};

const AnalogDial = ({ 
  label, 
  value, 
  onChange, 
  disabled, 
  max = 180 
}: { 
  label: string; 
  value: number; 
  onChange: (val: number) => void; 
  disabled: boolean;
  max?: number;
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

  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</span>
      <div className="relative group">
        <svg 
          ref={dialRef}
          viewBox="0 0 100 60" 
          className={`w-full max-w-[160px] cursor-pointer transition-opacity ${disabled ? 'opacity-50 grayscale' : 'opacity-100'}`}
          onMouseDown={(e) => {
            if (disabled) return;
            handleMouseMove(e);
            const move = (ev: MouseEvent) => handleMouseMove(ev as any);
            const up = () => {
              window.removeEventListener('mousemove', move);
              window.removeEventListener('mouseup', up);
            };
            window.addEventListener('mousemove', move);
            window.addEventListener('mouseup', up);
          }}
        >
          <path 
            d="M 10 50 A 40 40 0 0 1 90 50" 
            fill="none" 
            stroke="#f1f5f9" 
            strokeWidth="8" 
            strokeLinecap="round"
          />
          <path 
            d="M 10 50 A 40 40 0 0 1 90 50" 
            fill="none" 
            stroke="#7f1d1d" 
            strokeWidth="8" 
            strokeLinecap="round"
            strokeDasharray={circumference / 2}
            strokeDashoffset={(circumference / 2) - ((value / 180) * (circumference / 2))}
            className="transition-all duration-300 ease-out"
          />
          <line 
            x1="50" y1="50" 
            x2={50 + 35 * Math.cos((value - 180) * (Math.PI / 180))} 
            y2={50 + 35 * Math.sin((value - 180) * (Math.PI / 180))}
            stroke="#7f1d1d" 
            strokeWidth="2"
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
          <circle cx="50" cy="50" r="4" fill="#7f1d1d" />
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <span className="text-xl font-black text-red-900 leading-none">{value}°</span>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, unit, color }: any) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-slate-800">{value}</span>
        <span className="text-slate-400 text-xs font-medium">{unit}</span>
      </div>
    </div>
  </div>
);

const Login = ({ onLogin }: { onLogin: (email: string) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email address format');
      return;
    }
    onLogin(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
        <div className="p-8 text-center bg-red-900 text-white">
          <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full p-1 overflow-hidden flex items-center justify-center shadow-lg">
            <img src={GCUF_LOGO_URL} alt="GCUF Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight uppercase leading-none">LDHRS System</h1>
          <p className="text-red-100 text-[10px] mt-2 opacity-80 uppercase tracking-[0.2em] font-bold">Smart Solar Intelligence</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-900 text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none text-slate-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none text-slate-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full py-4 bg-red-900 hover:bg-red-800 text-white font-bold rounded-xl shadow-lg shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Access System <ChevronRight className="w-5 h-5" />
          </button>
        </form>
        <div className="p-4 bg-slate-50 text-center">
          <p className="text-xs text-slate-400 font-medium">© 2024 GCUF Engineering Department</p>
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
          contents: "Provide the live weather forecast for Faisalabad, Punjab, Pakistan. Format: 'Current temperature is X°C. Condition is Y. Summary: Z'. If extreme weather like storms, heavy rain, or high winds are detected, clearly state 'STORM_WARNING_SHUTDOWN'.",
          config: { tools: [{ googleSearch: {} }] }
        });

        const text = response.text || "";
        const isEmergency = text.includes("STORM_WARNING_SHUTDOWN") || text.toLowerCase().includes("storm") || text.toLowerCase().includes("heavy rain");
        
        // Extract basic data for display
        const tempMatch = text.match(/(\d+°C)/);
        const condMatch = text.match(/Condition is ([^.]+)/);

        setState(prev => ({
          ...prev,
          weatherStatus: text.replace("STORM_WARNING_SHUTDOWN", "EXTREME WEATHER ALERT!"),
          weatherTemp: tempMatch ? tempMatch[1] : prev.weatherTemp,
          weatherCondition: condMatch ? condMatch[1] : prev.weatherCondition,
          forecastAlert: isEmergency,
          isShutDown: isEmergency ? true : prev.isShutDown
        }));
      } catch (e) {
        console.error("Weather check failed", e);
      }
    };
    checkWeather();
    const weatherInterval = setInterval(checkWeather, 300000); 
    return () => clearInterval(weatherInterval);
  }, []);

  const runAiAnalysis = async () => {
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `AI Solar Audit for user ${userEmail}:
        Voltage: ${state.voltage}V, Current: ${state.current}A, Temperature: ${state.temp}C, Dust: ${state.dust}%. 
        Current Weather in Faisalabad: ${state.weatherStatus}.
        Provide technical insight on cleaning needs and weather resilience.`
      });
      setAiInsight(response.text);
    } catch (err) {
      setAiInsight("Unable to connect to AI core.");
    } finally {
      setAiLoading(false);
    }
  };

  const toggleEmergencyShutdown = () => {
    setState(prev => ({ ...prev, isShutDown: !prev.isShutDown }));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <img src={GCUF_LOGO_URL} alt="GCUF Logo" className="h-10 object-contain" />
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <h1 className="text-lg font-bold text-red-900 leading-none">LDHRS SYSTEM</h1>
            <p className="text-[10px] text-red-700 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${state.isShutDown ? 'bg-slate-400' : 'bg-red-600'}`}></span>
              {state.isShutDown ? 'SYSTEM STOWED' : 'Live Faisalabad Monitoring'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsAuto(!isAuto)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
              isAuto ? 'bg-red-50 text-red-900 border border-red-100' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isAuto ? <RotateCw className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            {isAuto ? 'Auto Track' : 'Manual'}
          </button>
          <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-900 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {state.isShutDown && (
          <div className="mb-8 p-6 bg-red-900 text-white rounded-3xl flex items-center justify-between shadow-xl animate-pulse ring-4 ring-red-100">
            <div className="flex items-center gap-4">
              <ShieldAlert className="w-8 h-8 text-white" />
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight">System Protective Shutdown</h2>
                <p className="text-xs opacity-90 font-medium">LDHRS array stowed for safety. Reason: {state.forecastAlert ? 'Faisalabad Weather Alert' : 'Manual Override'}.</p>
              </div>
            </div>
            <button 
              onClick={toggleEmergencyShutdown}
              className="bg-white text-red-900 px-6 py-2 rounded-xl font-black text-xs hover:shadow-lg transition-all"
            >
              RESUME OPERATION
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-3 space-y-4">
            <WeatherWidget 
              status={state.weatherStatus} 
              temp={state.weatherTemp} 
              condition={state.weatherCondition} 
              isEmergency={state.forecastAlert} 
            />
            <MetricCard icon={Zap} label="Voltage" value={state.isShutDown ? 0 : state.voltage} unit="V" color="bg-red-50 text-red-900" />
            <MetricCard icon={Power} label="Current" value={state.isShutDown ? 0 : state.current} unit="A" color="bg-red-50 text-red-900" />
            <MetricCard icon={Battery} label="Storage" value={state.battery} unit="%" color="bg-emerald-50 text-emerald-600" />
            <MetricCard icon={Wind} label="Dust Accumulation" value={state.dust} unit="%" color="bg-orange-50 text-orange-600" />
            <MetricCard icon={Thermometer} label="Core Temp" value={state.temp} unit="°C" color="bg-rose-50 text-rose-600" />
          </div>

          <div className="lg:col-span-6 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-center mb-12">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">LDR Directional Mapping</h3>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 rounded-full border border-red-100">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${state.isShutDown ? 'bg-slate-300' : 'bg-red-600'}`}></span>
                  <span className="text-[10px] font-bold text-red-900">4-SIDE MATRIX</span>
                </div>
              </div>

              <div className="relative w-full aspect-square max-w-[340px] mx-auto flex items-center justify-center">
                <div className="w-1/3 h-1/3 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center relative shadow-inner">
                  <div className={`absolute inset-0 rounded-3xl animate-pulse ${state.isShutDown ? 'bg-slate-200' : 'bg-red-900/5'}`}></div>
                  <Sun className={`w-8 h-8 ${state.isShutDown ? 'text-slate-300' : 'text-red-900 opacity-20'}`} />
                  {!state.isShutDown && (
                    <div 
                      className="absolute w-6 h-6 bg-red-600 rounded-full blur-sm animate-pulse pointer-events-none transition-all duration-700 ease-out z-20"
                      style={{ transform: `translate(${(state.ldr.r - state.ldr.l) / 6}px, ${(state.ldr.b - state.ldr.t) / 6}px)` }}
                    ></div>
                  )}
                </div>

                <LdrSide label="Top" value={state.ldr.t} icon={ArrowUp} position="top-0 left-1/2 -translate-x-1/2" />
                <LdrSide label="Bottom" value={state.ldr.b} icon={ArrowDown} position="bottom-0 left-1/2 -translate-x-1/2" />
                <LdrSide label="Left" value={state.ldr.l} icon={ArrowLeft} position="left-0 top-1/2 -translate-y-1/2" />
                <LdrSide label="Right" value={state.ldr.r} icon={ArrowRight} position="right-0 top-1/2 -translate-y-1/2" />
                
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
                  <div className="w-[80%] h-px bg-slate-100 absolute"></div>
                  <div className="h-[80%] w-px bg-slate-100 absolute"></div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-900 to-red-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-red-200" />
                    <h3 className="font-bold">AI Solar Guardian Hub</h3>
                  </div>
                  <button 
                    onClick={runAiAnalysis}
                    disabled={aiLoading}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold transition-all border border-white/20"
                  >
                    {aiLoading ? 'Connecting...' : 'Fetch AI Audit'}
                  </button>
                </div>
                <div className="min-h-[100px] flex flex-col justify-center">
                  {aiInsight ? (
                    <p className="text-red-50 text-sm leading-relaxed whitespace-pre-line italic">"{aiInsight}"</p>
                  ) : (
                    <div className="text-center opacity-60">
                      <Monitor className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-xs uppercase font-bold tracking-widest">Awaiting System Audit...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
                <h3 className="text-xs font-black text-red-900 uppercase tracking-widest">Axis Control</h3>
                <button 
                  onClick={() => setState(s => ({...s, childLock: !s.childLock}))}
                  className={`p-2 rounded-lg transition-colors ${state.childLock ? 'bg-red-900 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
                >
                  {state.childLock ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-6 space-y-12">
                <AnalogDial 
                  label="X-Axis (H) 180°" 
                  value={state.angleX} 
                  max={180}
                  disabled={isAuto || state.childLock || state.isShutDown}
                  onChange={(val) => setState(s => ({...s, angleX: val}))}
                />
                <AnalogDial 
                  label="Y-Axis (V) 180°" 
                  value={state.angleY} 
                  max={180}
                  disabled={isAuto || state.childLock || state.isShutDown}
                  onChange={(val) => setState(s => ({...s, angleY: val}))}
                />
                {(isAuto || state.childLock || state.isShutDown) && (
                  <div className="text-center">
                    <p className="text-[10px] text-red-800 font-bold uppercase">
                      {state.isShutDown ? "PROTECTIVE SHUTDOWN" : state.childLock ? "LOCKED" : "AUTO TRACKING"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className={`p-6 rounded-3xl border transition-all duration-500 flex gap-4 ${state.dust > 15 ? 'bg-orange-50 border-orange-200 animate-pulse' : 'bg-slate-50 border-slate-100'}`}>
              <div className={`p-3 rounded-2xl ${state.dust > 15 ? 'bg-orange-100' : 'bg-white'}`}>
                {state.dust > 15 ? <RefreshCcw className="w-6 h-6 text-orange-600 animate-spin-slow" /> : <Droplets className="w-6 h-6 text-slate-400" />}
              </div>
              <div>
                <h4 className={`font-black text-sm uppercase ${state.dust > 15 ? 'text-orange-900' : 'text-slate-700'}`}>Self-Cleaning</h4>
                <p className={`text-[10px] mt-1 ${state.dust > 15 ? 'text-orange-700' : 'text-slate-500'}`}>
                  {state.dust > 15 ? 'High Dust: Cleaning Cycle Start' : 'Efficiency optimal. No wash needed.'}
                </p>
              </div>
            </div>

            <div className={`p-6 rounded-3xl border transition-all duration-500 flex gap-4 ${state.forecastAlert ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-100'}`}>
              <div className={`p-3 rounded-2xl ${state.forecastAlert ? 'bg-red-100' : 'bg-emerald-100'}`}>
                {state.forecastAlert ? <CloudRain className="w-6 h-6 text-red-600" /> : <Sun className="w-6 h-6 text-emerald-600" />}
              </div>
              <div>
                <h4 className={`font-black text-sm uppercase ${state.forecastAlert ? 'text-red-900' : 'text-emerald-900'}`}>Faisalabad Hub</h4>
                <p className={`text-[10px] mt-1 ${state.forecastAlert ? 'text-red-700' : 'text-emerald-700'}`}>
                  {state.forecastAlert ? 'Critical weather alert in effect.' : 'Local weather safe for operation.'}
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
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
    <div className="min-h-screen bg-slate-50">
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