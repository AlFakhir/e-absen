
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  GraduationCap, 
  School, 
  MapPin, 
  CheckCircle, 
  TrendingUp, 
  Info, 
  X, 
  Check, 
  Camera, 
  User, 
  PieChart, 
  Mail, 
  Globe, 
  Instagram, 
  Facebook, 
  Phone, 
  Video, 
  Clock, 
  Calendar as CalendarIcon, 
  Smartphone, 
  Music,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { Student, AttendanceRecord, Teacher, ClassInfo } from '../types';

interface DashboardProps {
  students: Student[];
  teachers: Teacher[];
  classes: ClassInfo[];
  records: AttendanceRecord[];
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
  };
  onUpdateSchoolInfo: (info: Partial<DashboardProps['schoolInfo']>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ students, teachers, classes, records, schoolInfo, onUpdateSchoolInfo }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter(r => r.date === today);
  const todayPresent = todayRecords.filter(r => r.status === 'Hadir').length;
  const todayLate = todayRecords.filter(r => r.status === 'Terlambat').length;

  const getGreeting = () => {
    const hours = currentTime.getHours();
    if (hours < 11) return 'Selamat Pagi';
    if (hours < 15) return 'Selamat Siang';
    if (hours < 19) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const formattedTime = currentTime.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  });

  const formattedDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const classStats = useMemo(() => {
    return classes.map(cls => {
      const studentsInClass = students.filter(s => s.className.trim().toLowerCase() === cls.name.trim().toLowerCase());
      const maleCount = studentsInClass.filter(s => s.gender === 'L').length;
      const femaleCount = studentsInClass.filter(s => s.gender === 'P').length;
      
      return {
        ...cls,
        total: studentsInClass.length,
        male: maleCount,
        female: femaleCount
      };
    }).sort((a, b) => b.total - a.total);
  }, [students, classes]);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12"
    >
      {/* Hero Section: Bento Grid Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Greeting & Time Card */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-12 bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col md:flex-row items-center justify-between group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 group-hover:scale-110 transition-transform duration-700">
            <Clock className="w-48 h-48 text-teal-600" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <p className="text-teal-600 font-bold text-xs uppercase tracking-widest">{getGreeting()}, Admin!</p>
            </div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums leading-none mb-4">
              {formattedTime} <span className="text-xl font-bold text-slate-400">WIB</span>
            </h2>
            <div className="flex items-center gap-3 text-slate-500 font-semibold bg-slate-50 px-4 py-2 rounded-2xl w-fit">
              <CalendarIcon size={18} className="text-teal-600" />
              <span className="text-sm">{formattedDate}</span>
            </div>
          </div>
          <div className="mt-8 md:mt-0 relative z-10 flex flex-col items-end">
            <div className="bg-teal-50 p-4 rounded-3xl border border-teal-100/50 flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-600/20">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Kehadiran Hari Ini</p>
                <p className="text-xl font-black text-slate-900">{todayPresent} / {students.length}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* School Info Card */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[350px] group"
      >
        {/* Left Side (Brand) */}
        <div className="bg-teal-800 p-10 text-white flex flex-col justify-center items-center md:w-[35%] text-center relative overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-brand-500)_0%,_transparent_70%)]" />
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogoClick}
            className="group w-36 h-36 bg-white rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl p-5 relative z-10 cursor-pointer overflow-hidden transition-all"
          >
            <img src={schoolInfo.logo} className="w-full h-full object-contain" alt="Logo" />
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
              <Camera className="w-8 h-8 text-white mb-2" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Update Logo</span>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </motion.div>

          <h1 className="text-2xl font-black leading-tight relative z-10 tracking-tight px-4">{schoolInfo.name}</h1>
          <p className="text-teal-400 text-[10px] mt-3 font-black uppercase tracking-[0.3em] relative z-10">Pusat Informasi Digital</p>
          
          <div className="mt-10 flex gap-3 relative z-10">
            {[Instagram, Facebook, Music].map((Icon, i) => (
              <motion.a 
                key={i}
                whileHover={{ y: -5 }}
                href="#" 
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/15 transition-all"
              >
                <Icon size={18} className="text-white" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Right Side (Details) */}
        <div className="flex-1 p-10 flex flex-col justify-between bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-teal-600">
                  <MapPin size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Lokasi Kampus</span>
                </div>
                <p className="text-slate-900 font-bold leading-relaxed text-sm">{schoolInfo.address}</p>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                    <Mail size={18} className="text-slate-400 group-hover:text-teal-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">{schoolInfo.email || '-'}</span>
                </div>
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                    <Globe size={18} className="text-slate-400 group-hover:text-teal-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">{schoolInfo.website || '-'}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-teal-600">
                  <User size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Kepala Sekolah</span>
                </div>
                <p className="text-slate-900 font-black text-xl tracking-tight">{schoolInfo.headmaster}</p>
                <div className="inline-flex items-center px-3 py-1 bg-teal-50 text-teal-700 text-[10px] font-bold rounded-full border border-teal-100 uppercase tracking-widest">
                  Masa Bakti 2024 - 2028
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 text-teal-600 mb-4">
                  <Smartphone size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Kontak Resmi</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                    <Phone size={18} className="text-teal-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">{schoolInfo.phone || '-'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                      <img src={`https://picsum.photos/seed/${i+10}/100/100`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 font-semibold">
                  <span className="text-slate-900 font-bold">{students.length} Siswa</span> aktif dalam sistem
                </p>
             </div>
             <div className="hidden sm:flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-200/60">
               <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">System Secure & Online</span>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Siswa" value={students.length} icon={<Users />} color="bg-teal-600" trend="+12% bulan ini" />
        <StatCard title="Total Guru" value={teachers.length} icon={<GraduationCap />} color="bg-teal-600" trend="Aktif mengajar" />
        <StatCard title="Total Kelas" value={classes.length} icon={<School />} color="bg-teal-600" trend="Kapasitas penuh" />
        <StatCard title="Hadir Hari Ini" value={todayPresent} icon={<CheckCircle />} color="bg-teal-600" trend={`${Math.round((todayPresent/students.length)*100) || 0}% Kehadiran`} />
      </div>

      {/* Class Distribution */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200/60">
              <PieChart className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Distribusi Kelas</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Gender & Kapasitas Siswa</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {classStats.map((cls) => (
            <motion.div 
              key={cls.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                <School size={80} />
              </div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center font-black border border-slate-200 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-all duration-300">
                  {cls.name.split(' ')[0]}
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 leading-none mb-1">{cls.name}</h4>
                  <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Kelas Aktif</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Siswa</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">{cls.total}</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-center">
                       <p className="text-[10px] font-black text-blue-600">{cls.male}</p>
                       <div className="w-1 h-1 rounded-full bg-blue-600 mx-auto mt-1" />
                    </div>
                    <div className="text-center">
                       <p className="text-[10px] font-black text-pink-600">{cls.female}</p>
                       <div className="w-1 h-1 rounded-full bg-pink-600 mx-auto mt-1" />
                    </div>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex border border-slate-200/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${cls.total > 0 ? (cls.male / cls.total) * 100 : 0}%` }}
                    className="bg-blue-500 h-full" 
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${cls.total > 0 ? (cls.female / cls.total) * 100 : 0}%` }}
                    className="bg-pink-500 h-full" 
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ title, value, icon, color, trend }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60 transition-all group relative overflow-hidden"
  >
    <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-current/20`}>
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</h3>
    <p className="text-4xl font-black text-slate-900 mt-2 tracking-tighter leading-none">{value}</p>
    <div className="mt-6 flex items-center gap-2">
       <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
         <TrendingUp size={12} className="text-teal-500" />
         {trend}
       </div>
    </div>
  </motion.div>
);

export default Dashboard;
