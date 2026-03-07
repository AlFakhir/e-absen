
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, Trash2, Search, X, UserCheck, Edit3, Printer, 
  School, Camera, User, Eye, MessageCircle, Save, 
  FileUp, Download, AlertCircle, CheckCircle2, Loader2, Filter
} from 'lucide-react';
import { Student, ClassInfo } from '../types';
import { domToPng } from 'modern-screenshot';

interface StudentManagementProps {
  schoolInfo: any;
  students: Student[];
  classes: ClassInfo[];
  onAdd: (student: Omit<Student, 'id'>) => void;
  onUpdate: (student: Student) => void;
  onDelete: (id: string) => void;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ schoolInfo, students, classes, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [isPrintModalOpen, setPrintModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xlsImportRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    name: '',
    studentId: '',
    className: classes[0]?.name || '',
    gender: 'L',
    photo: '',
    whatsapp: '',
  });

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.studentId.includes(searchTerm)
  );

  const handleOpenAdd = () => {
    setEditingStudentId(null);
    setFormData({ 
      name: '', 
      studentId: '', 
      className: classes[0]?.name || '', 
      gender: 'L',
      photo: '',
      whatsapp: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudentId(student.id);
    setFormData({
      name: student.name,
      studentId: student.studentId,
      className: student.className,
      gender: student.gender,
      photo: student.photo || '',
      whatsapp: student.whatsapp || ''
    });
    setModalOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImportXLS = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      let importCount = 0;
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        let columns = line.split('\t').map(c => c.trim().replace(/^"|"$/g, ''));
        if (columns.length < 5) {
          columns = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        }
        
        if (columns.length >= 5) {
          const [name, studentId, whatsapp, genderStr, className] = columns;
          
          if (!name || !studentId) continue;

          const gender: 'L' | 'P' = 
            genderStr.toUpperCase() === 'L' || 
            genderStr.toUpperCase() === 'LAKI-LAKI' || 
            genderStr.toUpperCase() === 'LAKI LAKI' ? 'L' : 'P';

          onAdd({
            name,
            studentId,
            whatsapp,
            gender,
            className,
            photo: ''
          });
          importCount++;
        }
      }
      alert(`Berhasil mengimport ${importCount} data siswa.`);
      if (xlsImportRef.current) xlsImportRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const header = "NAMA SISWA\tNISN\tNO WA\tJENIS KELAMIN\tKELAS\n";
    const exampleRow = "Contoh Nama\t123456\t628120000000\tLAKI-LAKI\t7 - IBNU RUSYD\n";
    const content = header + exampleRow;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'Template_Import_Siswa.xls');
    link.click();
  };

  const handleOpenPreview = (student: Student) => {
    setSelectedStudent(student);
    setPrintModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.studentId || !formData.className) return;

    if (editingStudentId) {
      onUpdate({ ...formData, id: editingStudentId });
    } else {
      onAdd(formData);
    }
    
    setModalOpen(false);
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current || !selectedStudent) return;
    
    setIsDownloading(true);
    try {
      const dataUrl = await domToPng(cardRef.current, { scale: 2 });
      const link = document.createElement('a');
      link.download = `Kartu_Siswa_${selectedStudent.name.replace(/\s+/g, '_')}_${selectedStudent.studentId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download card:', err);
      alert('Gagal mendownload kartu. Silakan coba lagi.');
    } finally {
      setIsDownloading(false);
    }
  };

  const openWhatsApp = (number: string) => {
    const cleanNumber = number.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Manajemen Siswa</h3>
          <p className="text-slate-500 font-medium">Kelola database siswa, cetak kartu pelajar, dan integrasi WhatsApp.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 px-5 py-3.5 rounded-2xl font-black shadow-sm transition-all text-[11px] uppercase tracking-widest"
          >
            <Download size={18} />
            Template
          </motion.button>
          <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => xlsImportRef.current?.click()}
            className="flex items-center gap-2 bg-teal-50 border border-teal-100 hover:bg-teal-100 text-teal-700 px-5 py-3.5 rounded-2xl font-black shadow-sm transition-all text-[11px] uppercase tracking-widest"
          >
            <FileUp size={18} />
            Import
          </motion.button>
          <input 
            type="file" 
            ref={xlsImportRef} 
            className="hidden" 
            accept=".xls, .xlsx, .txt, .csv" 
            onChange={handleImportXLS} 
          />
          <motion.button 
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenAdd}
            disabled={classes.length === 0}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-7 py-3.5 rounded-2xl font-black shadow-xl shadow-teal-600/10 transition-all text-[11px] uppercase tracking-widest"
          >
            <UserPlus size={18} />
            Tambah Siswa
          </motion.button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari siswa berdasarkan nama atau NISN..."
              className="w-full pl-14 pr-6 py-4 rounded-[1.5rem] border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none bg-white transition-all font-bold text-slate-900 placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
            <Filter size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
                <th className="px-8 py-6">Profil Siswa</th>
                <th className="px-6 py-6">NISN</th>
                <th className="px-6 py-6">WhatsApp</th>
                <th className="px-6 py-6">Gender</th>
                <th className="px-6 py-6">Kelas</th>
                <th className="px-8 py-6 text-right">Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredStudents.map((student, idx) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={student.id} 
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-slate-100 flex items-center justify-center font-black text-slate-400 relative group-hover:scale-105 transition-transform">
                          {student.photo ? (
                            <img src={student.photo} className="w-full h-full object-cover" alt={student.name} />
                          ) : (
                            <User size={20} />
                          )}
                        </div>
                        <div>
                          <span className="font-black text-slate-900 block leading-none mb-1.5">{student.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Aktif</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-slate-900 font-mono text-sm font-black bg-slate-100 px-3 py-1 rounded-lg">{student.studentId}</span>
                    </td>
                    <td className="px-6 py-5">
                      {student.whatsapp ? (
                        <button 
                          onClick={() => openWhatsApp(student.whatsapp!)}
                          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-black text-xs bg-teal-50 px-3 py-1.5 rounded-xl transition-all"
                        >
                          <MessageCircle size={14} />
                          {student.whatsapp}
                        </button>
                      ) : (
                        <span className="text-slate-300 italic text-[10px] font-bold uppercase">Kosong</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        student.gender === 'L' 
                          ? 'bg-blue-50 text-blue-600 border-blue-100' 
                          : 'bg-pink-50 text-pink-600 border-pink-100'
                      }`}>
                        {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-900 font-black rounded-xl text-[10px] uppercase tracking-widest border border-slate-200">
                        {student.className}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-1">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleOpenPreview(student)}
                          className="p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                        >
                          <Download size={18} />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleOpenEdit(student)}
                          className="p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                        >
                          <Edit3 size={18} />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onDelete(student.id)}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center max-w-xs mx-auto">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                        <Search className="w-10 h-10 text-slate-200" />
                      </div>
                      <h4 className="text-lg font-black text-slate-900 mb-2">Data tidak ditemukan</h4>
                      <p className="text-slate-400 font-medium text-sm">Coba gunakan kata kunci lain atau tambahkan siswa baru.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Student */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200 relative z-10"
            >
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingStudentId ? 'Edit Siswa' : 'Tambah Siswa'}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Lengkapi informasi profil siswa</p>
                </div>
                <button onClick={() => setModalOpen(false)} className="p-4 hover:bg-white rounded-2xl text-slate-400 shadow-sm transition-all active:scale-90 border border-slate-100">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="flex flex-col items-center mb-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 rounded-[2.5rem] border-4 border-white shadow-2xl bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all overflow-hidden relative group"
                  >
                    {formData.photo ? (
                      <img src={formData.photo} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="flex flex-col items-center text-slate-300">
                        <Camera size={32} className="mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Upload</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={32} className="text-white" />
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                    <input 
                      type="text" required placeholder="Nama lengkap siswa"
                      className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none bg-slate-50/50 font-bold text-slate-900 transition-all"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NISN / ID</label>
                    <input 
                      type="text" required placeholder="Nomor induk siswa"
                      className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none bg-slate-50/50 font-bold text-slate-900 transition-all"
                      value={formData.studentId}
                      onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Kelas</label>
                    <select 
                      className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none bg-slate-50/50 font-bold text-slate-900 transition-all appearance-none"
                      value={formData.className}
                      onChange={e => setFormData({ ...formData, className: e.target.value })}
                    >
                      {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Kelamin</label>
                    <select 
                      className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none bg-slate-50/50 font-bold text-slate-900 transition-all appearance-none"
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp Orang Tua</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-teal-300 group-focus-within:text-teal-600 transition-colors">
                      <MessageCircle size={20} />
                    </div>
                    <input 
                      type="text" placeholder="62812xxxxxx"
                      className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none bg-slate-50/50 font-bold text-slate-900 transition-all"
                      value={formData.whatsapp}
                      onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl font-black text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all uppercase tracking-widest text-[11px]"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest text-[11px]"
                  >
                    <Save size={20} />
                    Simpan Data
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print Modal / Preview Kartu */}
      <AnimatePresence>
        {isPrintModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 no-print">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPrintModalOpen(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden relative z-10 border border-slate-200"
            >
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                    <Printer size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Cetak Kartu</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Tinjau desain kartu pelajar</p>
                  </div>
                </div>
                <button onClick={() => setPrintModalOpen(false)} className="p-4 hover:bg-white rounded-2xl text-slate-400 shadow-sm transition-all border border-slate-100">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-10 flex flex-col items-center gap-10 bg-slate-50/30">
                {/* Desain Kartu */}
                <div ref={cardRef} className="w-[340px] h-[600px] bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col">
                  {/* Decorative Background Elements */}
                  <div className="absolute top-0 left-0 w-full h-48 bg-slate-900 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/5 rounded-full -ml-24 -mb-24 blur-2xl" />
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                  </div>

                  <div className="h-36 p-8 flex items-center gap-5 text-white relative z-10 shrink-0">
                    <div className="w-16 h-16 bg-white rounded-[1.25rem] flex items-center justify-center p-2.5 shadow-2xl border border-white/20">
                      <img src={schoolInfo.logo} className="w-full h-full object-contain" alt="Logo" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-[9px] font-black leading-none uppercase tracking-[0.3em] text-teal-400 mb-2">KARTU PELAJAR</h4>
                      <p className="text-[11px] font-black uppercase tracking-tight leading-tight line-clamp-2 text-white/90">{schoolInfo.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center pt-6 px-8 text-center bg-white relative z-10">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 border-[6px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden mb-5 relative shrink-0">
                      {selectedStudent.photo ? (
                        <img src={selectedStudent.photo} className="w-full h-full object-cover" alt="Student" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                          <User size={56} />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1 mb-5">
                      <h2 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight line-clamp-1">{selectedStudent.name}</h2>
                      <div className="inline-flex items-center px-4 py-1 bg-teal-50 text-teal-600 rounded-full border border-teal-100/50">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">{selectedStudent.className}</span>
                      </div>
                    </div>
                    
                    <div className="w-full py-4 px-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 mb-6">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">NOMOR INDUK SISWA NASIONAL</p>
                      <p className="text-xl font-black text-slate-900 tracking-[0.2em] font-mono">{selectedStudent.studentId}</p>
                    </div>

                    <div className="mt-auto pb-10 flex flex-col items-center w-full">
                      <div className="flex items-center justify-between w-full gap-6 px-2">
                        <div className="p-4 bg-white rounded-[2rem] border border-slate-100 shadow-xl relative group">
                          <div className="absolute inset-0 bg-teal-500/5 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedStudent.studentId}`} 
                            className="w-20 h-20 relative z-10"
                            alt="QR Code"
                          />
                        </div>
                        <div className="flex-1 text-left">
                           <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">VERIFIED IDENTITY</p>
                          </div>
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.1em] leading-tight mb-1">E-ABSENSI PINTAR</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.1em]">Digital School System v3.0</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Bottom Accent */}
                  <div className="h-2 bg-slate-900 w-full shrink-0" />
                </div>

                <div className="flex gap-4 w-full">
                  <button onClick={() => setPrintModalOpen(false)} className="flex-1 px-8 py-5 bg-white border border-slate-200 rounded-2xl font-black text-slate-500 hover:bg-slate-50 uppercase tracking-widest text-[11px]">Batal</button>
                  <button 
                    onClick={handleDownloadCard} 
                    disabled={isDownloading}
                    className="flex-[1.5] px-8 py-5 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all disabled:opacity-70 uppercase tracking-widest text-[11px]"
                  >
                    {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download size={20} />}
                    Download Kartu
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentManagement;
