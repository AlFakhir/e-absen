
import React, { useState } from 'react';
import { Sparkles, Loader2, BrainCircuit, RefreshCw } from 'lucide-react';
import { getAttendanceInsights } from '../services/geminiService';
import { Student, AttendanceRecord } from '../types';

interface AIInsightsProps {
  students: Student[];
  records: AttendanceRecord[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ students, records }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<{ summary: string[], recommendation: string } | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const data = await getAttendanceInsights(students, records);
      setInsights(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl shadow-lg p-6 text-white mb-8 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <BrainCircuit className="w-32 h-32" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-300 fill-yellow-300" />
            <h2 className="text-xl font-bold">Wawasan Cerdas (AI)</h2>
          </div>
          <button 
            onClick={fetchInsights}
            disabled={loading}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 px-4 py-2 rounded-xl transition-colors text-sm font-medium backdrop-blur-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {insights ? 'Perbarui Analisis' : 'Mulai Analisis'}
          </button>
        </div>

        {loading && !insights && (
          <div className="py-12 flex flex-col items-center justify-center text-teal-100">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="animate-pulse">Sedang memproses data absensi siswa...</p>
          </div>
        )}

        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-200 mb-3">Analisis Kehadiran</h3>
              <ul className="space-y-3">
                {insights.summary.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white/10 p-3 rounded-lg text-sm border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/10 p-5 rounded-xl border border-white/20 backdrop-blur-sm self-start">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-200 mb-2">Saran Strategis</h3>
              <p className="text-sm leading-relaxed text-teal-50">
                {insights.recommendation}
              </p>
            </div>
          </div>
        )}

        {!insights && !loading && (
          <div className="text-center py-8">
            <p className="text-teal-100 mb-2">Klik tombol untuk mendapatkan analisis otomatis mengenai tren kehadiran kelas Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
