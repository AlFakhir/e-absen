
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User, ArrowRight, Loader2, Eye, EyeOff, Camera, ShieldCheck, Sparkles } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  schoolInfo: {
    name: string;
    logo: string;
  };
  onUpdateSchoolInfo: (info: Partial<LoginProps['schoolInfo']>) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, schoolInfo, onUpdateSchoolInfo }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      if (username === 'admin' && password === 'admin') {
        onLogin();
      } else {
        setError('Username atau password salah (Gunakan admin/admin)');
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleLogoClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file terlalu besar. Maksimal 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => onUpdateSchoolInfo({ logo: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left Side: Visuals (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_var(--color-brand-600)_0%,_transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,_var(--color-brand-800)_0%,_transparent_50%)]" />
        </div>
        
        {/* Floating Elements */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-32 h-32 bg-teal-500/10 rounded-3xl border border-white/10 backdrop-blur-3xl flex items-center justify-center"
        >
          <ShieldCheck size={48} className="text-teal-400" />
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-20 w-40 h-40 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur-3xl flex items-center justify-center"
        >
          <Sparkles size={64} className="text-teal-500/50" />
        </motion.div>

        <div className="relative z-10 max-w-lg text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-12 inline-block p-6 bg-white rounded-[40px] shadow-2xl shadow-teal-500/20"
          >
            <img src={schoolInfo.logo} className="w-32 h-32 object-contain" alt="Logo" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-black text-white tracking-tighter mb-6 leading-tight"
          >
            Sistem Absensi <br />
            <span className="text-teal-400">Generasi Baru</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400 text-lg font-medium leading-relaxed"
          >
            Kelola kehadiran siswa dengan cerdas, cepat, dan aman menggunakan teknologi QR Code terintegrasi.
          </motion.p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-12 bg-slate-50 relative overflow-hidden">
        {/* Mobile Decorative Background */}
        <div className="lg:hidden absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-600/5 rounded-full blur-3xl" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-8 lg:hidden flex flex-col items-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-20 h-20 bg-white rounded-3xl shadow-xl p-4 mb-4 border border-slate-100 flex items-center justify-center"
            >
              <img src={schoolInfo.logo} className="w-full h-full object-contain" alt="Logo" />
            </motion.div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">E-Absensi Pintar</h2>
            <div className="h-1 w-12 bg-teal-500 rounded-full mt-2" />
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-white/60">
            <div className="mb-10 text-center lg:text-left">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Selamat Datang</h3>
              <p className="text-slate-500 font-semibold text-sm md:text-base">Silakan masuk ke akun administrator Anda</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 border border-red-100 text-red-600 px-5 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="admin"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all bg-slate-50/50 font-bold text-slate-900 placeholder:text-slate-300"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all bg-slate-50/50 font-bold text-slate-900 placeholder:text-slate-300"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" className="peer w-5 h-5 rounded-lg border-slate-200 text-teal-600 focus:ring-teal-500/20 transition-all cursor-pointer appearance-none border-2 checked:bg-teal-600 checked:border-teal-600" />
                    <ShieldCheck className="absolute w-3 h-3 text-white left-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Ingat saya</span>
                </label>
                <button type="button" className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors">Lupa password?</button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4.5 rounded-2xl shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-3 group disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span className="uppercase tracking-widest text-[11px]">Masuk ke Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>
          </div>

          <div className="mt-10 text-center">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
              © 2026 E-Absensi Pintar • Al Fakhir Modern
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
