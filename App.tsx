
import { 
  LayoutDashboard, 
  Database, 
  QrCode, 
  FileSpreadsheet, 
  Menu, 
  X,
  Settings,
  LogOut,
  Bell,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_STUDENTS, INITIAL_CLASSES } from './constants';
import { AttendanceRecord, Student, AttendanceStatus, ClassInfo, Teacher } from './types';
import Dashboard from './components/Dashboard';
import MasterData from './components/UserManagement';
import QRScanner from './components/QRScanner';
import Reports from './components/Reports';
import Login from './components/Login';
import Admin from './components/Admin';
import { generateParentMessage } from './services/geminiService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'master' | 'scan' | 'reports' | 'admin'>('dashboard');
  
  const [schoolInfo, setSchoolInfo] = useState(() => {
    const saved = localStorage.getItem('absensi_school_info');
    return saved ? JSON.parse(saved) : {
      name: "SMP ISLAM MODERN AL FAKHIR",
      address: "Jl. Kemang RT. 03 RW. 06 Pasir Putih - Sawangan, Depok",
      headmaster: "Ust. Muhammad Al-Fakhir, M.Pd",
      logo: "https://storage.googleapis.com/static-content-ais/ais-dev-wpounotmuphbvhywkgyzb3/logo_1741312674.png",
      email: "info@alfakhir.sch.id",
      phone: "021-77889900",
      website: "www.alfakhir.sch.id",
      instagram: "@alfakhir_modern",
      facebook: "SMP Islam Modern Al Fakhir",
      tiktok: "@alfakhir_official",
      telegramBotToken: "",
      telegramChatId: "",
      whatsappApiToken: "",
      studentCheckInTime: "07:30",
      studentCheckOutTime: "14:30",
      teacherCheckInTime: "07:00",
      teacherCheckOutTime: "15:00"
    };
  });

  const [classes, setClasses] = useState<ClassInfo[]>(() => {
    const saved = localStorage.getItem('absensi_classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('absensi_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('absensi_teachers');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Drs. Supriatna', teacherId: '19700101', subject: 'Matematika', gender: 'L' },
      { id: '2', name: 'Ibu Ratna Sari', teacherId: '19820512', subject: 'Bahasa Indonesia', gender: 'P' }
    ];
  });
  
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Security Measures: Prevent Inspect Element
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) ||
        (e.metaKey && e.altKey && (e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J')) 
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('absensi_school_info', JSON.stringify(schoolInfo));
  }, [schoolInfo]);

  useEffect(() => {
    localStorage.setItem('absensi_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('absensi_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('absensi_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    const saved = localStorage.getItem('absensi_records');
    if (saved) setRecords(JSON.parse(saved));
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('is_authenticated', 'true');
  };

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
      setIsAuthenticated(false);
      localStorage.removeItem('is_authenticated');
    }
  };

  const handleUpdateSchoolInfo = (newInfo: Partial<typeof schoolInfo>) => {
    setSchoolInfo(prev => ({ ...prev, ...newInfo }));
  };

  const handleMarkAttendance = (studentId: string, status: AttendanceStatus, date = new Date().toISOString().split('T')[0], type: 'student' | 'teacher' = 'student') => {
    const now = new Date();
    const currentTimeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    
    let finalStatus = status;

    // Logic for LATE status check based on type
    const limitTime = type === 'student' ? schoolInfo.studentCheckInTime : schoolInfo.teacherCheckInTime;

    if (status === AttendanceStatus.PRESENT && limitTime) {
      const [limitH, limitM] = limitTime.split(':').map(Number);
      const currentH = now.getHours();
      const currentM = now.getMinutes();

      if (currentH > limitH || (currentH === limitH && currentM > limitM)) {
        finalStatus = AttendanceStatus.LATE;
      }
    }
    
    const newRecords = [...records];
    const existingIndex = newRecords.findIndex(r => r.studentId === studentId && r.date === date && r.type === type && r.status === status);
    
    if (existingIndex > -1) {
      // Update existing record if same status (e.g. updating time)
      newRecords[existingIndex].time = currentTimeStr;
    } else {
      // Check if we should allow multiple records for same person on same day
      // Usually one for Masuk, one for Pulang
      newRecords.push({
        id: Math.random().toString(36).substr(2, 9),
        studentId,
        date,
        status: finalStatus,
        time: currentTimeStr,
        type 
      });
    }
    
    setRecords(newRecords);
    localStorage.setItem('absensi_records', JSON.stringify(newRecords));
  };

  const handleSendWhatsapp = async (studentId: string, status: AttendanceStatus) => {
    const student = students.find(s => s.id === studentId);
    if (!student || !student.whatsapp) {
      alert("Nomor WhatsApp orang tua belum diinput.");
      return;
    }

    try {
      const now = new Date();
      const date = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const currentTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      
      const message = await generateParentMessage(student.name, student.className, status, date, currentTime, schoolInfo.name);
      const cleanPhone = student.whatsapp.replace(/[^0-9]/g, '');

      if (schoolInfo.whatsappApiToken) {
        const response = await fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: {
            'Authorization': schoolInfo.whatsappApiToken
          },
          body: new URLSearchParams({
            'target': cleanPhone,
            'message': message || `Ananda ${student.name} (Kelas ${student.className}) tercatat ${status} pada ${date} jam ${currentTime} di ${schoolInfo.name}.`
          })
        });

        const result = await response.json();
        if (result.status) {
          alert("Notifikasi WhatsApp berhasil dikirim!");
        } else {
          window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message || '')}`, '_blank');
        }
      } else {
        const encodedMessage = encodeURIComponent(message || `Ananda ${student.name} (Kelas ${student.className}) tercatat ${status} pada ${date} jam ${currentTime} di ${schoolInfo.name}.`);
        window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
      }
    } catch (error) {
      console.error("Gagal kirim WA:", error);
      alert("Terjadi kesalahan sistem.");
    }
  };

  const handleSendTelegram = async (studentId: string, status: AttendanceStatus) => {
    if (!schoolInfo.telegramBotToken || !schoolInfo.telegramChatId) {
      alert("Pengaturan Telegram belum dikonfigurasi.");
      return;
    }

    const student = students.find(s => s.id === studentId);
    if (!student) return;

    try {
      const now = new Date();
      const date = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const currentTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const message = await generateParentMessage(student.name, student.className, status, date, currentTime, schoolInfo.name);
      
      const url = `https://api.telegram.org/bot${schoolInfo.telegramBotToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: schoolInfo.telegramChatId,
          text: message || `Notifikasi: ${student.name} (${student.className}) - ${status} pada ${currentTime}`,
          parse_mode: 'Markdown'
        })
      });

      if (response.ok) alert("Notifikasi Telegram terkirim!");
    } catch (error) {
      alert("Gagal mengirim notifikasi Telegram.");
    }
  };

  const handleAddStudent = (newStudent: Omit<Student, 'id'>) => {
    setStudents(prev => [...prev, { ...newStudent, id: Math.random().toString(36).substr(2, 9) }]);
  };
  const handleUpdateStudent = (updated: Student) => {
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
  };
  const handleDeleteStudent = (id: string) => {
    if (confirm('Hapus siswa ini?')) {
      setStudents(prev => prev.filter(s => s.id !== id));
      setRecords(prev => prev.filter(r => r.studentId !== id));
    }
  };

  const handleAddTeacher = (newTeacher: Omit<Teacher, 'id'>) => {
    setTeachers(prev => [...prev, { ...newTeacher, id: Math.random().toString(36).substr(2, 9) }]);
  };
  const handleUpdateTeacher = (updated: Teacher) => {
    setTeachers(prev => prev.map(t => t.id === updated.id ? updated : t));
  };
  const handleDeleteTeacher = (id: string) => {
    if (confirm('Hapus guru ini?')) setTeachers(prev => prev.filter(t => t.id !== id));
  };

  const handleAddClass = (name: string) => {
    setClasses(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), name }]);
  };
  const handleUpdateClass = (updated: ClassInfo) => {
    setClasses(prev => prev.map(c => c.id === updated.id ? updated : c));
  };
  const handleDeleteClass = (id: string) => {
    if (confirm('Hapus kelas ini?')) setClasses(prev => prev.filter(c => c.id !== id));
  };

  const handleSyncClassesFromStudents = () => {
    const studentClasses = students.map(s => s.className.trim()).filter(Boolean);
    const uniqueClasses = Array.from(new Set(studentClasses)) as string[];
    let addedCount = 0;
    const currentClassNames = classes.map(c => c.name.toLowerCase().trim());
    const newClasses = [...classes];
    uniqueClasses.forEach(name => {
      if (!currentClassNames.includes(name.toLowerCase())) {
        newClasses.push({ id: Math.random().toString(36).substr(2, 9), name });
        addedCount++;
      }
    });
    if (addedCount > 0) {
      setClasses(newClasses);
      alert(`Berhasil menyinkronkan data. ${addedCount} kelas baru ditambahkan.`);
    } else {
      alert("Semua data kelas sudah sinkron.");
    }
  };

  if (!isAuthenticated) {
    return (
      <Login 
        onLogin={handleLogin} 
        schoolInfo={schoolInfo} 
        onUpdateSchoolInfo={handleUpdateSchoolInfo} 
      />
    );
  }

  const tabTitles = {
    dashboard: 'Dashboard Utama',
    master: 'Master Data Sekolah',
    scan: 'Scan QR Absensi',
    reports: 'Laporan Kehadiran',
    admin: 'Pengaturan'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden select-none">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 88 }}
        className="fixed inset-y-0 left-0 bg-white border-r border-slate-200/60 z-50 hidden lg:flex flex-col shadow-[20px_0_40px_rgba(0,0,0,0.02)]"
      >
        <div className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shrink-0 overflow-hidden shadow-lg shadow-teal-600/20">
             <img src={schoolInfo.logo} className="w-full h-full object-cover" alt="Logo" />
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col overflow-hidden"
              >
                <span className="font-black text-lg text-slate-900 truncate tracking-tight">E-Absensi</span>
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Al Fakhir</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-6">
          <NavItem icon={<LayoutDashboard size={22} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} collapsed={!isSidebarOpen} />
          <NavItem icon={<Database size={22} />} label="Master Data" active={activeTab === 'master'} onClick={() => setActiveTab('master')} collapsed={!isSidebarOpen} />
          <NavItem icon={<QrCode size={22} />} label="Scan QR Absen" active={activeTab === 'scan'} onClick={() => setActiveTab('scan')} collapsed={!isSidebarOpen} />
          <NavItem icon={<FileSpreadsheet size={22} />} label="Laporan" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} collapsed={!isSidebarOpen} />
        </nav>

        <div className="p-4 mt-auto border-t border-slate-100 space-y-1">
          <NavItem 
            icon={<Settings size={22} />} 
            label="Pengaturan" 
            active={activeTab === 'admin'} 
            onClick={() => setActiveTab('admin')} 
            collapsed={!isSidebarOpen} 
          />
          <NavItem 
            icon={<LogOut size={22} className="text-red-500" />} 
            label="Keluar" 
            active={false} 
            onClick={handleLogout} 
            collapsed={!isSidebarOpen}
            danger
          />
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-[88px]'} w-full flex flex-col h-screen overflow-hidden`}>
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-8 shrink-0 z-40 sticky top-0">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)} 
              className="p-2.5 hover:bg-slate-100 rounded-2xl text-slate-600 hidden lg:block transition-all active:scale-90"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{tabTitles[activeTab]}</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{schoolInfo.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-slate-900">Admin Al Fakhir</span>
              <span className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">Super Admin</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold overflow-hidden">
              <img src="https://picsum.photos/seed/admin/100/100" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 pb-32 lg:pb-12 bg-slate-50/50 scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  students={students} 
                  records={records} 
                  schoolInfo={schoolInfo} 
                  classes={classes} 
                  teachers={teachers}
                  onUpdateSchoolInfo={handleUpdateSchoolInfo}
                />
              )}

              {activeTab === 'master' && (
                <MasterData 
                  schoolInfo={schoolInfo}
                  students={students} onAddStudent={handleAddStudent} onUpdateStudent={handleUpdateStudent} onDeleteStudent={handleDeleteStudent}
                  teachers={teachers} onAddTeacher={handleAddTeacher} onUpdateTeacher={handleUpdateTeacher} onDeleteTeacher={handleDeleteTeacher}
                  classes={classes} onAddClass={handleAddClass} onUpdateClass={handleUpdateClass} onDeleteClass={handleDeleteClass}
                  onSyncClasses={handleSyncClassesFromStudents}
                />
              )}

              {activeTab === 'scan' && (
                <QRScanner students={students} teachers={teachers} onMarkAttendance={handleMarkAttendance} onSendWhatsapp={handleSendWhatsapp} onSendTelegram={handleSendTelegram} />
              )}

              {activeTab === 'reports' && (
                <Reports students={students} teachers={teachers} records={records} classes={classes} onSendWhatsapp={handleSendWhatsapp} onSendTelegram={handleSendTelegram} />
              )}

              {activeTab === 'admin' && (
                <Admin 
                  schoolInfo={schoolInfo} 
                  onUpdateSchoolInfo={handleUpdateSchoolInfo} 
                  onLogout={handleLogout} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-2xl border border-white/10 px-6 py-4 flex justify-around z-50 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <MobileNavItem icon={<LayoutDashboard />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <MobileNavItem icon={<Database />} active={activeTab === 'master'} onClick={() => setActiveTab('master')} />
        <MobileNavItem icon={<QrCode />} active={activeTab === 'scan'} onClick={() => setActiveTab('scan')} />
        <MobileNavItem icon={<FileSpreadsheet />} active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
        <MobileNavItem icon={<Settings />} active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} />
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, collapsed, danger }: any) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group ${
      active 
        ? 'bg-teal-600 text-white font-bold shadow-lg shadow-teal-600/20' 
        : 'text-slate-500 font-semibold hover:bg-slate-100 hover:text-slate-900'
    } ${danger ? 'hover:bg-red-50 hover:text-red-600' : ''}`}
  >
    <span className={`shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </span>
    {!collapsed && (
      <motion.span 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-sm tracking-tight"
      >
        {label}
      </motion.span>
    )}
    {active && !collapsed && (
      <motion.div 
        layoutId="active-pill"
        className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white"
      />
    )}
  </button>
);

const MobileNavItem = ({ icon, active, onClick }: any) => (
  <button 
    onClick={onClick} 
    className={`p-3.5 rounded-2xl transition-all active:scale-75 relative ${
      active ? 'text-teal-400' : 'text-slate-400'
    }`}
  >
    {React.cloneElement(icon, { size: 24 })}
    {active && (
      <motion.div 
        layoutId="mobile-active"
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-400"
      />
    )}
  </button>
);

export default App;
