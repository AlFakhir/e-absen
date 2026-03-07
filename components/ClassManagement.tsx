
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, School, X, CheckCircle2, Edit3, Users, 
  ChevronRight, UserPlus, Camera, UserCheck, User, RefreshCw, Filter
} from 'lucide-react';
import { ClassInfo, Student } from '../types';

interface ClassManagementProps {
  classes: ClassInfo[];
  students: Student[];
  onAdd: (name: string) => void;
  onUpdate: (c: ClassInfo) => void;
  onDelete: (id: string) => void;
  onAddStudent: (s: Omit<Student, 'id'>) => void;
  onSync?: () => void;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ classes, students, onAdd, onUpdate, onDelete, onAddStudent, onSync }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [className, setClassName] = useState('');
  
  // States for student drill-down
  const [selectedClassDetail, setSelectedClassDetail] = useState<ClassInfo | null>(null);
  const [isAddStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [studentFormData, setStudentFormData] = useState<Omit<Student, 'id'>>({
    name: '',
    studentId: '',
    className: '',
    gender: 'L',
    photo: '',
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setClassName('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassInfo) => {
    setEditingId(cls.id);
    setClassName(cls.name);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;
    if (editingId) onUpdate({ id: editingId, name: className.trim() });
    else onAdd(className.trim());
    setModalOpen(false);
  };

  const handleOpenAddStudent = (clsName: string) => {
    setStudentFormData({
      name: '',
      studentId: '',
      className: clsName,
      gender: 'L',
      photo: '',
    });
    setAddStudentModalOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudentFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFormData.name || !studentFormData.studentId) return;
    onAddStudent(studentFormData);
    setAddStudentModalOpen(false);
  };

  // Logika sinkronisasi otomatis yang tidak peka huruf besar/kecil & spasi ganda
  const normalizeString = (str: string) => str.trim().toLowerCase().replace(/\s+/g, ' ');

  const getStudentsByClass = (clsName: string) => {
    const normalizedClsName = normalizeString(clsName);
    return students.filter(s => normalizeString(s.className) === normalizedClsName);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Manajemen Kelas</h3>
          <p className="text-slate-500 font-medium">Kelola struktur kelas dan pantau distribusi siswa secara real-time.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSync}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 px-5 py-3.5 rounded-2xl font-black shadow-sm transition-all text-[11px] uppercase tracking-widest"
          >
            <RefreshCw size={18} />
            Sinkronkan
          </motion.button>
          <motion.button 
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-7 py-3.5 rounded-2xl font-black shadow-xl shadow-slate-900/10 transition-all text-[11px] uppercase tracking-widest"
          >
            <Plus size={18} />
            Tambah Kelas
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {classes.length > 0 ? (
            classes.map((cls) => {
              const classStudents = getStudentsByClass(cls.name);
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={cls.id} 
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col group hover:border-teal-300 transition-all hover:shadow-xl hover:shadow-teal-100/20 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50/50 rounded-full -mr-16 -mt-16 group-hover:bg-teal-100/50 transition-colors" />
                  
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <School size={32} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-xl tracking-tight leading-none mb-2">{cls.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {cls.id.slice(0,5)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleOpenEdit(cls)}
                        className="p-2.5 text-slate-300 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                      >
                        <Edit3 size={18} />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDelete(cls.id)}
                        className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 mb-8 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-slate-400" />
                        <span className="text-sm font-black text-slate-700">{classStudents.length} Siswa</span>
                      </div>
                      <span className="text-[9px] font-black text-teal-600 uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-100">Aktif</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {classStudents.length > 0 ? (
                        classStudents.slice(0, 4).map(s => (
                          <span key={s.id} className="text-[9px] bg-white border border-slate-200 px-3 py-1 rounded-lg font-black text-slate-500 uppercase tracking-tighter">
                            {s.name.split(' ')[0]}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] italic text-slate-400 font-bold uppercase tracking-widest">Belum ada siswa</span>
                      )}
                      {classStudents.length > 4 && (
                        <span className="text-[9px] text-teal-500 font-black flex items-center bg-teal-50 px-2 rounded-lg">+{classStudents.length - 4}</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-3 relative z-10">
                    <motion.button 
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedClassDetail(cls)}
                      className="flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm uppercase tracking-widest"
                    >
                      Detail
                      <ChevronRight size={14} />
                    </motion.button>
                    <motion.button 
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOpenAddStudent(cls.name)}
                      className="flex items-center justify-center gap-2 py-4 bg-teal-50 text-teal-700 rounded-2xl text-[10px] font-black hover:bg-teal-600 hover:text-white transition-all shadow-sm uppercase tracking-widest"
                    >
                      <UserPlus size={14} />
                      Input
                    </motion.button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-24 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                <School size={48} className="text-slate-200" />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-2">Belum ada data kelas</h4>
              <p className="text-slate-400 font-medium max-w-sm mx-auto mb-8">Gunakan tombol sinkronkan untuk mengambil data kelas secara otomatis dari database siswa.</p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSync}
                className="bg-teal-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-100"
              >
                Sinkronkan Sekarang
              </motion.button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Class Detail Modal */}
      <AnimatePresence>
        {selectedClassDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClassDetail(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 relative z-10 flex flex-col max-h-[85vh]"
            >
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                    <Users size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Siswa Kelas {selectedClassDetail.name}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Total {getStudentsByClass(selectedClassDetail.name).length} Peserta Didik</p>
                  </div>
                </div>
                <button onClick={() => setSelectedClassDetail(null)} className="p-4 hover:bg-white rounded-2xl text-slate-400 shadow-sm transition-all border border-slate-100">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {getStudentsByClass(selectedClassDetail.name).length > 0 ? (
                    getStudentsByClass(selectedClassDetail.name).map(student => (
                      <div key={student.id} className="flex items-center gap-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg hover:border-teal-200 transition-all group">
                        <div className="w-14 h-14 rounded-xl bg-white border-2 border-white shadow-md flex items-center justify-center font-black text-slate-400 overflow-hidden group-hover:scale-110 transition-transform">
                          {student.photo ? (
                            <img src={student.photo} className="w-full h-full object-cover" alt="Student" />
                          ) : (
                            <User size={24} />
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-black text-slate-900 truncate leading-none mb-1.5">{student.name}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">NISN: {student.studentId}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${student.gender === 'L' ? 'bg-blue-400' : 'bg-pink-400'}`} />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <User size={40} className="text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-black text-sm uppercase tracking-widest">Belum ada siswa di kelas ini</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOpenAddStudent(selectedClassDetail.name)}
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-900/10 flex items-center gap-3"
                >
                  <UserPlus size={18} />
                  Tambah Siswa Baru
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Student Modal */}
      <AnimatePresence>
        {isAddStudentModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddStudentModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 relative z-10"
            >
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Input Siswa</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Kelas: {studentFormData.className}</p>
                </div>
                <button onClick={() => setAddStudentModalOpen(false)} className="p-4 hover:bg-white rounded-2xl text-slate-400 shadow-sm transition-all border border-slate-100">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleStudentSubmit} className="p-10 space-y-6">
                <div className="flex flex-col items-center mb-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-28 h-28 rounded-[2rem] border-4 border-white shadow-xl bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all overflow-hidden relative group"
                  >
                    {studentFormData.photo ? (
                      <img src={studentFormData.photo} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <Camera size={28} className="text-slate-300" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-white" />
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Siswa</label>
                  <input 
                    type="text" required placeholder="Nama lengkap..."
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none bg-slate-50/50 font-bold text-slate-900 transition-all"
                    value={studentFormData.name}
                    onChange={e => setStudentFormData({ ...studentFormData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NISN / ID</label>
                  <input 
                    type="text" required placeholder="Nomor induk..."
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none bg-slate-50/50 font-bold text-slate-900 transition-all"
                    value={studentFormData.studentId}
                    onChange={e => setStudentFormData({ ...studentFormData, studentId: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Kelamin</label>
                  <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setStudentFormData({ ...studentFormData, gender: 'L' })}
                      className={`py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${studentFormData.gender === 'L' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      Laki-laki
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudentFormData({ ...studentFormData, gender: 'P' })}
                      className={`py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${studentFormData.gender === 'P' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      Perempuan
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-slate-900 text-white font-black py-4.5 rounded-2xl shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[11px]"
                  >
                    <UserCheck size={20} />
                    Simpan Siswa
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Class Name Edit Modal */}
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
              className="bg-white rounded-[3rem] w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200 relative z-10"
            >
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{editingId ? 'Edit Kelas' : 'Tambah Kelas'}</h3>
                <button onClick={() => setModalOpen(false)} className="p-4 hover:bg-white rounded-2xl text-slate-400 shadow-sm transition-all border border-slate-100">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Kelas</label>
                  <input 
                    type="text" required autoFocus placeholder="Contoh: XII IPA 1"
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none bg-slate-50/50 font-bold text-slate-900 transition-all"
                    value={className}
                    onChange={e => setClassName(e.target.value)}
                  />
                </div>

                <div className="pt-2">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-slate-900 text-white font-black py-4.5 rounded-2xl shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[11px]"
                  >
                    <CheckCircle2 size={20} />
                    Simpan Kelas
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClassManagement;
