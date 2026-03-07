
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  QrCode, Camera, CheckCircle2, AlertCircle, Scan, X, User, 
  RefreshCcw, Info, MessageCircle, Loader2, Send, LogOut, 
  LogIn, GraduationCap, Users, Sparkles, Zap
} from 'lucide-react';
import { Student, Teacher, AttendanceStatus } from '../types';
import jsQR from 'jsqr';

interface QRScannerProps {
  students: Student[];
  teachers: Teacher[];
  onMarkAttendance: (studentId: string, status: AttendanceStatus, date?: string, type?: 'student' | 'teacher') => void;
  onSendWhatsapp?: (studentId: string, status: AttendanceStatus) => Promise<void>;
  onSendTelegram?: (studentId: string, status: AttendanceStatus) => Promise<void>;
}

const QRScanner: React.FC<QRScannerProps> = ({ students, teachers, onMarkAttendance, onSendWhatsapp, onSendTelegram }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<{data: Student | Teacher, role: 'student' | 'teacher'} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualId, setManualId] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSendingWA, setIsSendingWA] = useState(false);
  const [isSendingTele, setIsSendingTele] = useState(false);
  const [scanMode, setScanMode] = useState<'masuk' | 'pulang'>('masuk');
  const [userRole, setUserRole] = useState<'student' | 'teacher'>('student');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScannedTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    setIsScanning(false);
    setIsInitializing(false);
  }, []);

  const startCamera = async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    setError(null);
    setLastScanned(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Browser Anda tidak mendukung akses kamera. Pastikan Anda menggunakan HTTPS.");
      setIsInitializing(false);
      return;
    }

    try {
      const constraints = {
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
          setIsScanning(true);
          setIsInitializing(false);
        } catch (playError) {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsScanning(true);
            setIsInitializing(false);
          };
        }
      }
    } catch (err: any) {
      setIsInitializing(false);
      setIsScanning(false);
      setError('Gagal mengakses kamera: ' + (err.message || "Izin ditolak."));
    }
  };

  const handleScanSuccess = useCallback((scannedId: string) => {
    const now = Date.now();
    // Debounce to prevent multiple rapid scans of same ID
    if (lastScanned?.data.id === scannedId && now - lastScannedTimeRef.current < 5000) {
      return;
    }

    let foundData: Student | Teacher | undefined;
    if (userRole === 'student') {
      foundData = students.find(s => s.studentId === scannedId);
    } else {
      foundData = teachers.find(t => t.teacherId === scannedId);
    }
    
    if (foundData) {
      const status = scanMode === 'masuk' ? AttendanceStatus.PRESENT : AttendanceStatus.RETURN;
      onMarkAttendance(foundData.id, status, new Date().toISOString().split('T')[0], userRole);
      setLastScanned({ data: foundData, role: userRole });
      setError(null);
      lastScannedTimeRef.current = now;
      
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
      setTimeout(() => setLastScanned(prev => prev?.data.id === foundData?.id ? null : prev), 15000);
    } else {
      setError(`ID "${scannedId}" tidak ditemukan.`);
      if ('vibrate' in navigator) navigator.vibrate(400);
      setTimeout(() => setError(null), 3000);
    }
  }, [students, teachers, userRole, scanMode, onMarkAttendance, lastScanned]);

  useEffect(() => {
    if (!isScanning) return;

    const scanFrame = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvasElement = canvasRef.current;
        if (!canvasElement) return;
        
        const canvas = canvasElement.getContext('2d', { willReadFrequently: true });
        if (!canvas) return;

        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth;
        
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
        const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          handleScanSuccess(code.data);
        }
      }
      requestRef.current = requestAnimationFrame(scanFrame);
    };

    requestRef.current = requestAnimationFrame(scanFrame);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isScanning, handleScanSuccess]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const handleManualInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      handleScanSuccess(manualId.trim());
      setManualId('');
    }
  };

  const handleNotifyWA = async () => {
    if (!lastScanned || !onSendWhatsapp || lastScanned.role !== 'student') return;
    setIsSendingWA(true);
    const status = scanMode === 'masuk' ? AttendanceStatus.PRESENT : AttendanceStatus.RETURN;
    try {
      await onSendWhatsapp(lastScanned.data.id, status);
    } finally {
      setIsSendingWA(false);
    }
  };

  const handleNotifyTele = async () => {
    if (!lastScanned || !onSendTelegram || lastScanned.role !== 'student') return;
    setIsSendingTele(true);
    const status = scanMode === 'masuk' ? AttendanceStatus.PRESENT : AttendanceStatus.RETURN;
    try {
      await onSendTelegram(lastScanned.data.id, status);
    } finally {
      setIsSendingTele(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-24 lg:pb-0">
      {/* Role & Mode Switchers */}
      <div className="flex flex-col gap-6 items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10">
            <Zap size={14} className="text-amber-400" />
            Smart Scanner v2.0
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">Presensi Kehadiran</h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-sm flex gap-1">
            <button 
              onClick={() => { setUserRole('student'); setLastScanned(null); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${userRole === 'student' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Users size={16} /> Siswa
            </button>
            <button 
              onClick={() => { setUserRole('teacher'); setLastScanned(null); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${userRole === 'teacher' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <GraduationCap size={16} /> Guru
            </button>
          </div>

          <div className="bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-sm flex gap-1">
            <button 
              onClick={() => setScanMode('masuk')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${scanMode === 'masuk' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LogIn size={16} /> Masuk
            </button>
            <button 
              onClick={() => setScanMode('pulang')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${scanMode === 'pulang' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LogOut size={16} /> Pulang
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden relative">
        <div className="aspect-square sm:aspect-video bg-slate-950 relative flex items-center justify-center overflow-hidden">
          <canvas ref={canvasRef} className="hidden" />
          <video ref={videoRef} className={`w-full h-full object-cover transition-opacity duration-1000 ${isScanning ? 'opacity-100' : 'opacity-0'}`} muted playsInline autoPlay />

          <AnimatePresence>
            {!isScanning && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center p-12 text-center bg-slate-950/40 backdrop-blur-sm"
              >
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="w-28 h-28 bg-white/10 rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/20 shadow-2xl"
                >
                  <QrCode size={48} className="text-white" />
                </motion.div>
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startCamera}
                  disabled={isInitializing}
                  className="bg-white text-slate-900 px-12 py-5 rounded-[1.5rem] font-black shadow-2xl transition-all flex items-center gap-3 mx-auto disabled:opacity-50 text-lg uppercase tracking-widest"
                >
                  {isInitializing ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
                  {isInitializing ? 'Memulai...' : 'Buka Kamera'}
                </motion.button>
                {error && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mt-8 flex items-center gap-3 text-red-400 bg-red-400/10 py-4 px-8 rounded-2xl border border-red-400/20 backdrop-blur-md"
                  >
                    <AlertCircle size={20} />
                    <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="w-64 h-64 sm:w-80 sm:h-80 relative">
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-white rounded-tl-[2rem] shadow-[0_0_30px_rgba(255,255,255,0.4)]" />
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-white rounded-tr-[2rem] shadow-[0_0_30px_rgba(255,255,255,0.4)]" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-white rounded-bl-[2rem] shadow-[0_0_30px_rgba(255,255,255,0.4)]" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-white rounded-br-[2rem] shadow-[0_0_30px_rgba(255,255,255,0.4)]" />
                <motion.div 
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="absolute left-6 right-6 h-1 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_15px_rgba(255,255,255,0.8)]" 
                />
              </div>
              <div className="absolute inset-0 border-[80px] border-slate-950/60" />
            </div>
          )}
        </div>

        <div className="p-10 bg-white">
          <AnimatePresence mode="wait">
            {lastScanned ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 flex flex-col gap-8 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                    className="text-teal-100"
                  >
                    <Sparkles size={120} />
                  </motion.div>
                </div>

                <div className="flex items-center gap-8 relative z-10">
                  <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl border-4 border-white flex items-center justify-center shrink-0 overflow-hidden">
                    {lastScanned.data.photo ? (
                      <img src={lastScanned.data.photo} className="w-full h-full object-cover" alt="Foto" />
                    ) : (
                      <div className="bg-slate-900 w-full h-full flex items-center justify-center text-white text-4xl font-black">
                        {lastScanned.data.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={16} className="text-teal-500" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-teal-600">Presensi Berhasil Dicatat</p>
                    </div>
                    <h4 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-3">{lastScanned.data.name}</h4>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                        ID: {userRole === 'student' ? (lastScanned.data as Student).studentId : (lastScanned.data as Teacher).teacherId}
                      </span>
                      <span className="px-3 py-1.5 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-100">
                        {userRole === 'student' ? (lastScanned.data as Student).className : (lastScanned.data as Teacher).subject}
                      </span>
                    </div>
                  </div>
                </div>
                
                {lastScanned.role === 'student' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                    <motion.button 
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNotifyWA}
                      disabled={isSendingWA}
                      className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white py-4.5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-teal-100 transition-all text-[11px] uppercase tracking-widest"
                    >
                      {isSendingWA ? <Loader2 size={20} className="animate-spin" /> : <MessageCircle size={20} />}
                      Kirim WhatsApp
                    </motion.button>
                    <motion.button 
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNotifyTele}
                      disabled={isSendingTele}
                      className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white py-4.5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-teal-100 transition-all text-[11px] uppercase tracking-widest"
                    >
                      {isSendingTele ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                      Kirim Telegram
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm">
                   <Info size={24} />
                 </div>
                 <p className="text-xs text-slate-500 leading-relaxed font-bold uppercase tracking-widest">
                   Arahkan kode QR ke kamera untuk mencatat absensi {scanMode} secara otomatis.
                 </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleManualInput} 
        className="bg-white p-8 rounded-[3rem] border border-slate-200/60 flex flex-col xl:flex-row items-center justify-between gap-8 shadow-sm"
      >
        <div className="flex items-center gap-5">
          <div className="bg-slate-900 p-4 rounded-2xl text-white shadow-xl">
            {userRole === 'student' ? <Users size={28} /> : <GraduationCap size={28} />}
          </div>
          <div className="text-left">
            <p className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1.5">Input Manual</p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Masukkan ID secara manual</p>
          </div>
        </div>
        <div className="flex w-full xl:w-auto gap-3">
          <input 
            type="text" 
            placeholder={`Masukkan ${userRole === 'student' ? 'NISN' : 'NIK'}...`} 
            className="flex-1 xl:w-64 px-6 py-4.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none text-sm font-black bg-slate-50/50 transition-all"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
          />
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="bg-slate-900 text-white px-10 py-4.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-900/10"
          >
            Proses
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
};

export default QRScanner;
