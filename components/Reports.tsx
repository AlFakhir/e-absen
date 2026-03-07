
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSpreadsheet, Search, Filter, Calendar, 
  GraduationCap, Users, CalendarDays, BarChart3,
  ArrowRight, Download, Share2, MoreVertical
} from 'lucide-react';
import { Student, Teacher, AttendanceRecord, ClassInfo, AttendanceStatus } from '../types';

interface ReportsProps {
  students: Student[];
  teachers: Teacher[];
  records: AttendanceRecord[];
  classes: ClassInfo[];
  onSendWhatsapp?: (studentId: string, status: AttendanceStatus) => Promise<void>;
  onSendTelegram?: (studentId: string, status: AttendanceStatus) => Promise<void>;
}

const Reports: React.FC<ReportsProps> = ({ students, teachers, records, classes }) => {
  const [activeReportTab, setActiveReportTab] = useState<'students' | 'teachers'>('students');
  const [reportMode, setReportMode] = useState<'daily' | 'monthly'>('daily');
  const [filterClass, setFilterClass] = useState<string>('Semua');
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  // Monthly states
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const months = [
    { value: '01', name: 'Januari' },
    { value: '02', name: 'Februari' },
    { value: '03', name: 'Maret' },
    { value: '04', name: 'April' },
    { value: '05', name: 'Mei' },
    { value: '06', name: 'Juni' },
    { value: '07', name: 'Juli' },
    { value: '08', name: 'Agustus' },
    { value: '09', name: 'September' },
    { value: '10', name: 'Oktober' },
    { value: '11', name: 'November' },
    { value: '12', name: 'Desember' },
  ];

  const reportData = useMemo(() => {
    const isStudent = activeReportTab === 'students';
    const baseList = isStudent ? students : teachers;
    
    const filteredBase = baseList.filter(item => {
      const matchesClass = !isStudent || filterClass === 'Semua' || (item as Student).className === filterClass;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (isStudent ? (item as Student).studentId : (item as Teacher).teacherId).includes(searchTerm);
      return matchesClass && matchesSearch;
    });

    if (reportMode === 'daily') {
      return filteredBase.map(item => {
        const inRecord = records.find(r => r.studentId === item.id && r.date === filterDate && (r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE));
        const outRecord = records.find(r => r.studentId === item.id && r.date === filterDate && r.status === AttendanceStatus.RETURN);
        const otherRecord = records.find(r => r.studentId === item.id && r.date === filterDate && [AttendanceStatus.SICK, AttendanceStatus.PERMISSION, AttendanceStatus.ABSENT].includes(r.status));
        
        let mainStatus: string = 'Belum Absen';
        if (otherRecord) mainStatus = otherRecord.status;
        else if (inRecord) mainStatus = inRecord.status;

        return {
          ...item,
          status: mainStatus,
          timeIn: inRecord?.time || '--:--',
          timeOut: outRecord?.time || '--:--',
          date: filterDate
        };
      });
    } else {
      // Aggregation for Monthly mode
      return filteredBase.map(item => {
        const monthRecords = records.filter(r => {
          const [y, m] = r.date.split('-');
          return r.studentId === item.id && y === selectedYear.toString() && m === selectedMonth;
        });

        const counts = {
          hadir: monthRecords.filter(r => r.status === AttendanceStatus.PRESENT).length,
          telat: monthRecords.filter(r => r.status === AttendanceStatus.LATE).length,
          pulang: monthRecords.filter(r => r.status === AttendanceStatus.RETURN).length,
          sakit: monthRecords.filter(r => r.status === AttendanceStatus.SICK).length,
          izin: monthRecords.filter(r => r.status === AttendanceStatus.PERMISSION).length,
          alpa: monthRecords.filter(r => r.status === AttendanceStatus.ABSENT).length,
        };

        // Effectiveness is presence (hadir + telat) vs total entries recorded including absences
        const totalPresent = counts.hadir + counts.telat;
        const totalEntries = totalPresent + counts.sakit + counts.izin + counts.alpa;
        const attendanceRate = totalEntries > 0 ? Math.round((totalPresent / totalEntries) * 100) : 0;

        return {
          ...item,
          ...counts,
          attendanceRate,
          monthName: months.find(m => m.value === selectedMonth)?.name,
          year: selectedYear
        };
      });
    }
  }, [students, teachers, records, filterClass, filterDate, searchTerm, activeReportTab, reportMode, selectedMonth, selectedYear]);

  const exportToXLS = () => {
    let headers: string[] = [];
    let rows: any[] = [];
    const isStudent = activeReportTab === 'students';

    if (reportMode === 'daily') {
      headers = isStudent 
        ? ['Nama', 'NISN', 'Kelas', 'Status', 'Jam Masuk', 'Jam Pulang', 'Tanggal']
        : ['Nama', 'NIK', 'Mapel', 'Status', 'Jam Masuk', 'Jam Pulang', 'Tanggal'];
      rows = reportData.map((r: any) => [
        r.name, 
        isStudent ? r.studentId : r.teacherId, 
        isStudent ? r.className : r.subject, 
        r.status, r.timeIn, r.timeOut, r.date
      ]);
    } else {
      // Simplified headers for Monthly Student: Hadir, Telat, Pulang, Efektifitas
      headers = isStudent
        ? ['Nama', 'NISN', 'Kelas', 'Hadir', 'Terlambat', 'Pulang', 'Efektifitas (%)']
        : ['Nama', 'NIK', 'Mapel', 'Hadir', 'Terlambat', 'Pulang', 'Efektifitas (%)'];
      rows = reportData.map((r: any) => [
        r.name, 
        isStudent ? r.studentId : r.teacherId, 
        isStudent ? r.className : r.subject, 
        r.hadir, r.telat, r.pulang, `${r.attendanceRate}%`
      ]);
    }

    const xlsContent = [
      headers.join(','),
      ...rows.map(row => row.map((cell: any) => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([xlsContent], { type: 'text/xls;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const filename = reportMode === 'daily' 
      ? `Rekap_Harian_${activeReportTab}_${filterDate}.xls`
      : `Rekap_Bulanan_${activeReportTab}_${selectedMonth}_${selectedYear}.xls`;
    link.setAttribute('download', filename);
    link.click();
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Laporan Absensi</h3>
          <p className="text-slate-500 font-medium">Pantau dan analisis data kehadiran harian serta akumulasi bulanan.</p>
        </div>
        <motion.button 
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={exportToXLS}
          className="flex items-center justify-center gap-3 bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-teal-100 transition-all text-[11px] uppercase tracking-widest"
        >
          <FileSpreadsheet size={20} />
          Export Data XLS
        </motion.button>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div className="flex p-1.5 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
          <button 
            onClick={() => setActiveReportTab('students')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all uppercase ${activeReportTab === 'students' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Users size={16} /> Siswa
          </button>
          <button 
            onClick={() => setActiveReportTab('teachers')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all uppercase ${activeReportTab === 'teachers' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <GraduationCap size={16} /> Guru & Staff
          </button>
        </div>

        <div className="flex p-1.5 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
          <button 
            onClick={() => setReportMode('daily')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all uppercase ${reportMode === 'daily' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <CalendarDays size={16} /> Harian
          </button>
          <button 
            onClick={() => setReportMode('monthly')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all uppercase ${reportMode === 'monthly' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <BarChart3 size={16} /> Bulanan
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          
          {reportMode === 'daily' ? (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Calendar size={14} /> Tanggal
              </label>
              <input 
                type="date" 
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none bg-white font-bold text-slate-900 text-sm transition-all"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                  <Calendar size={14} /> Bulan
                </label>
                <select 
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none bg-white font-bold text-slate-900 text-sm transition-all"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                   Tahun
                </label>
                <input 
                  type="number" 
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none bg-white font-bold text-slate-900 text-sm transition-all"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                />
              </div>
            </>
          )}

          {activeReportTab === 'students' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Filter size={14} /> Kelas
              </label>
              <select 
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none bg-white font-bold text-slate-900 text-sm transition-all"
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
              >
                <option value="Semua">Semua Kelas</option>
                {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <Search size={14} /> Cari
            </label>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Nama atau ID..."
                className="w-full pl-12 pr-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none bg-white font-bold text-slate-900 text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-10 py-6">Identitas</th>
                <th className="px-6 py-6">{activeReportTab === 'students' ? 'NISN' : 'NIK'}</th>
                {reportMode === 'daily' ? (
                  <>
                    <th className="px-6 py-6">Status</th>
                    <th className="px-6 py-6">Masuk</th>
                    <th className="px-6 py-6">Pulang</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-6 text-center">Hadir</th>
                    <th className="px-4 py-6 text-center">Telat</th>
                    <th className="px-4 py-6 text-center">Pulang</th>
                    <th className="px-10 py-6 text-right">Efektifitas</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {reportData.length > 0 ? (
                  reportData.map((row: any, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={idx} 
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-sm">
                            {row.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm tracking-tight leading-none mb-1.5">{row.name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeReportTab === 'students' ? row.className : row.subject}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-xs font-mono font-black text-slate-500 tracking-wider">
                          {activeReportTab === 'students' ? row.studentId : row.teacherId}
                        </span>
                      </td>
                      
                      {reportMode === 'daily' ? (
                        <>
                          <td className="px-6 py-6">
                            <StatusBadge status={row.status} />
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-2 h-2 rounded-full ${row.timeIn !== '--:--' ? (row.status === AttendanceStatus.LATE ? 'bg-orange-500' : 'bg-teal-500') : 'bg-slate-200'}`} />
                              <span className="text-xs text-slate-900 font-black tracking-widest">{row.timeIn}</span>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-2 h-2 rounded-full ${row.timeOut !== '--:--' ? 'bg-teal-500' : 'bg-slate-200'}`} />
                              <span className="text-xs text-slate-900 font-black tracking-widest">{row.timeOut}</span>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-6 text-center">
                            <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100 uppercase">{row.hadir}</span>
                          </td>
                          <td className="px-4 py-6 text-center">
                            <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 uppercase">{row.telat}</span>
                          </td>
                          <td className="px-4 py-6 text-center">
                            <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100 uppercase">{row.pulang}</span>
                          </td>
                          <td className="px-10 py-6 text-right">
                             <div className="flex flex-col items-end">
                                <span className={`text-xs font-black mb-2 ${row.attendanceRate > 80 ? 'text-teal-600' : (row.attendanceRate > 50 ? 'text-orange-500' : 'text-red-500')}`}>
                                   {row.attendanceRate}%
                                </span>
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${row.attendanceRate}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full ${row.attendanceRate > 80 ? 'bg-teal-500' : (row.attendanceRate > 50 ? 'bg-orange-500' : 'bg-red-500')}`} 
                                  />
                                </div>
                             </div>
                          </td>
                        </>
                      )}
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                          <Search size={40} className="text-slate-200" />
                        </div>
                        <h4 className="text-lg font-black text-slate-900 mb-1">Data tidak ditemukan</h4>
                        <p className="text-slate-400 font-medium">Coba gunakan filter atau kata kunci pencarian lain.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'Hadir': 'bg-teal-50 text-teal-600 border-teal-100',
    'Alpa': 'bg-red-50 text-red-600 border-red-100',
    'Sakit': 'bg-orange-50 text-orange-600 border-orange-100',
    'Izin': 'bg-blue-50 text-blue-600 border-blue-100',
    'Pulang': 'bg-teal-50 text-teal-600 border-teal-100',
    'Terlambat': 'bg-amber-50 text-amber-600 border-amber-100',
    'Belum Absen': 'bg-slate-50 text-slate-400 border-slate-100'
  };

  return (
    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm inline-block ${styles[status] || styles['Belum Absen']}`}>
      {status}
    </span>
  );
};

export default Reports;
