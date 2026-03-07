
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  School, MapPin, User, LogOut, Camera, Save, Info, ShieldCheck, 
  Check, Mail, Globe, Instagram, Facebook, Phone, MessageSquare, 
  Smartphone, Video, Clock, Users, GraduationCap, Sparkles, ShieldAlert,
  CheckCircle, ArrowUpRight
} from 'lucide-react';

interface AdminProps {
  schoolInfo: {
    name: string;
    address: string;
    headmaster: string;
    logo: string;
    email: string;
    phone: string;
    website: string;
    instagram: string;
    facebook: string;
    tiktok: string;
    telegramBotToken: string;
    telegramChatId: string;
    whatsappApiToken: string;
    studentCheckInTime: string;
    studentCheckOutTime: string;
    teacherCheckInTime: string;
    teacherCheckOutTime: string;
  };
  onUpdateSchoolInfo: (info: Partial<AdminProps['schoolInfo']>) => void;
  onLogout: () => void;
}

const Admin: React.FC<AdminProps> = ({ schoolInfo, onUpdateSchoolInfo, onLogout }) => {
  const [formData, setFormData] = useState(schoolInfo);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file maksimal 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchoolInfo(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-200"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          >
            <ShieldCheck className="w-64 h-64" />
          </motion.div>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 bg-white/10 rounded-[2.5rem] flex items-center justify-center border border-white/20 backdrop-blur-md">
            <ShieldCheck size={40} className="text-amber-400" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-black tracking-tight mb-2">Pusat Administrasi</h2>
            <p className="text-slate-400 font-medium max-w-lg">Konfigurasi identitas sekolah, jam operasional, dan integrasi notifikasi dalam satu panel kendali.</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-8 space-y-8">
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit} 
            className="bg-white rounded-[3rem] border border-slate-200/60 shadow-sm overflow-hidden"
          >
            <div className="p-10 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <School className="text-teal-600" size={24} /> Identitas Lembaga
              </h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Sparkles size={12} /> Konfigurasi Utama
              </div>
            </div>
            
            <div className="p-10 space-y-10">
              {/* Logo Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-8 pb-10 border-b border-slate-100">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-40 h-40 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-all overflow-hidden relative group shadow-inner"
                >
                  <img src={formData.logo} className="w-full h-full object-contain p-4" alt="Preview Logo" />
                  <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <Camera size={32} className="text-white mb-2" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Ganti Logo</span>
                  </div>
                </motion.div>
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <p className="text-lg font-black text-slate-900">Logo Instansi</p>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">Logo ini akan muncul di dashboard, laporan, dan kartu identitas. Pastikan gambar memiliki resolusi yang baik.</p>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lembaga / Sekolah</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none bg-slate-50/50 font-black text-slate-900 transition-all"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kepala Sekolah / Pimpinan</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none bg-slate-50/50 font-black text-slate-900 transition-all"
                    value={formData.headmaster}
                    onChange={e => setFormData({ ...formData, headmaster: e.target.value })}
                  />
                </div>

                {/* Jam Operasional */}
                <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 space-y-6">
                    <h4 className="text-[11px] font-black text-teal-600 flex items-center gap-2 uppercase tracking-widest">
                      <Users size={16} /> Jam Operasional Siswa
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Batas Masuk</label>
                        <input 
                          type="time" 
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none bg-white font-black text-slate-900 text-sm"
                          value={formData.studentCheckInTime}
                          onChange={e => setFormData({ ...formData, studentCheckInTime: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Jam Pulang</label>
                        <input 
                          type="time" 
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none bg-white font-black text-slate-900 text-sm"
                          value={formData.studentCheckOutTime}
                          onChange={e => setFormData({ ...formData, studentCheckOutTime: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 space-y-6">
                    <h4 className="text-[11px] font-black text-teal-600 flex items-center gap-2 uppercase tracking-widest">
                      <GraduationCap size={16} /> Jam Operasional Guru
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Batas Masuk</label>
                        <input 
                          type="time" 
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none bg-white font-black text-slate-900 text-sm"
                          value={formData.teacherCheckInTime}
                          onChange={e => setFormData({ ...formData, teacherCheckInTime: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Jam Pulang</label>
                        <input 
                          type="time" 
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none bg-white font-black text-slate-900 text-sm"
                          value={formData.teacherCheckOutTime}
                          onChange={e => setFormData({ ...formData, teacherCheckOutTime: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="col-span-full space-y-6 pt-4">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Media Sosial & Website</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text" 
                        placeholder="Website Sekolah"
                        className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 outline-none bg-slate-50/50 font-black text-slate-900 text-sm"
                        value={formData.website}
                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                      />
                    </div>
                    <div className="relative">
                      <Instagram className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text" 
                        placeholder="Instagram"
                        className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 outline-none bg-slate-50/50 font-black text-slate-900 text-sm"
                        value={formData.instagram}
                        onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Integrasi */}
                <div className="col-span-full space-y-6 pt-4">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp & Telegram Gateway</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-teal-600 uppercase tracking-widest ml-1">Fonnte API Token</label>
                      <input 
                        type="password" 
                        placeholder="Fonnte Token"
                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none bg-slate-50/50 font-black text-slate-900 text-sm"
                        value={formData.whatsappApiToken}
                        onChange={e => setFormData({ ...formData, whatsappApiToken: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-teal-600 uppercase tracking-widest ml-1">Telegram Bot Token</label>
                      <input 
                        type="password" 
                        placeholder="Bot Token"
                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none bg-slate-50/50 font-black text-slate-900 text-sm"
                        value={formData.telegramBotToken}
                        onChange={e => setFormData({ ...formData, telegramBotToken: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-full space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Lengkap</label>
                  <textarea 
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none bg-slate-50/50 font-black text-slate-900 min-h-[120px] transition-all"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              <motion.button 
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className={`w-full py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl ${isSaved ? 'bg-teal-500 text-white shadow-teal-100' : 'bg-slate-900 text-white shadow-slate-200'}`}
              >
                {isSaved ? <Check size={24} /> : <Save size={24} />}
                {isSaved ? 'PENGATURAN TERSIMPAN' : 'SIMPAN SEMUA PERUBAHAN'}
              </motion.button>
            </div>
          </motion.form>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm space-y-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shadow-sm">
                <Info size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 tracking-tight leading-none mb-1">Status Sesi</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Terautentikasi</p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-widest">Terakhir Login</span>
                <span className="font-black text-slate-900">Hari ini, 08:45</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-widest">IP Address</span>
                <span className="font-black text-slate-900">192.168.1.102</span>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-3 bg-red-50 hover:bg-red-100 text-red-600 py-5 rounded-2xl font-black transition-all border border-red-100 shadow-sm shadow-red-50 uppercase tracking-widest text-[11px]"
            >
              <LogOut size={20} />
              Keluar Aplikasi
            </motion.button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-slate-900 p-8 rounded-[3rem] text-white relative overflow-hidden group shadow-xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-teal-500/30 transition-all duration-500" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight mb-1">Status Sistem</h3>
                <p className="text-xs text-slate-400 font-medium">Semua modul berjalan normal</p>
              </div>
              <div className="space-y-4 mt-8">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle size={16} className="text-teal-400" />
                    </div>
                    <span className="text-sm font-bold">Database Online</span>
                  </div>
                  <ArrowUpRight size={16} className="text-slate-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Globe size={16} className="text-blue-400" />
                    </div>
                    <span className="text-sm font-bold">WhatsApp API</span>
                  </div>
                  <ArrowUpRight size={16} className="text-slate-500" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-amber-50 p-10 rounded-[3rem] border border-amber-100 space-y-6"
          >
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm">
              <ShieldAlert size={24} />
            </div>
            <div className="space-y-2">
              <h4 className="font-black text-amber-900 tracking-tight leading-none">Keamanan Data</h4>
              <p className="text-xs text-amber-700/70 font-medium leading-relaxed">Pastikan API Token WhatsApp dan Telegram Anda tetap rahasia. Jangan bagikan token ini kepada siapapun untuk menjaga keamanan data sekolah.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
