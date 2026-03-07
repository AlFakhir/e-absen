
import { GoogleGenAI, Type } from "@google/genai";
import { Student, AttendanceRecord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateParentMessage = async (studentName: string, className: string, status: string, date: string, currenttime: string, schoolName: string) => {
  const isReturn = status.toLowerCase() === 'pulang';
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      Buatkan pesan WhatsApp notifikasi absensi dari pihak sekolah ke orang tua siswa.
      
      Detail:
      - Nama Sekolah: ${schoolName}
      - Nama Siswa: ${studentName}
      - Kelas: ${className}
      - Status: ${status}
      - Tanggal: ${date}
      - Waktu: ${currenttime}
      
      Instruksi Khusus:
      ${isReturn 
        ? 'Ini adalah notifikasi PULANG SEKOLAH. Sampaikan bahwa siswa telah selesai mengikuti KBM. Ingatkan orang tua untuk memastikan ananda sampai di rumah dengan selamat.' 
        : 'Ini adalah notifikasi KEHADIRAN/MASUK sekolah. Sampaikan bahwa siswa telah tiba di sekolah.'
      }

      Gunakan gaya bahasa Indonesia yang formal, ramah, dan informatif. 
      Sebutkan secara spesifik bahwa siswa tersebut dari kelas ${className} tercatat [Status] pada jam [Waktu].
      Sertakan doa singkat yang relevan.
      Berikan format pesan yang siap dikirim, tanpa tanda petik di awal dan akhir.
      Berikan hanya teks pesan utamanya saja.
    `
  });

  return response.text;
};

export const getAttendanceInsights = async (students: Student[], records: AttendanceRecord[]): Promise<{ summary: string[], recommendation: string }> => {
  const studentSample = students.slice(0, 50).map(s => `${s.name} (${s.className})`).join(', ');
  const recentRecords = records.slice(-100).map(r => {
    const s = students.find(std => std.id === r.studentId);
    return `${s?.name || 'Siswa'}: ${r.status} pada ${r.date}`;
  }).join('; ');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analisis data absensi sekolah berikut (Total Siswa: ${students.length}, Total Rekaman: ${records.length}).
    Daftar Siswa (Sampel): ${studentSample}
    Rekaman Kehadiran (Terbaru): ${recentRecords}
    
    Tugas:
    1. Identifikasi 3-5 tren utama kehadiran.
    2. Berikan 1 rekomendasi strategis untuk meningkatkan disiplin siswa.
    Gunakan Bahasa Indonesia yang profesional.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Daftar 3-5 poin ringkasan tren kehadiran.',
          },
          recommendation: {
            type: Type.STRING,
            description: 'Saran strategis untuk pimpinan sekolah.',
          },
        },
        required: ["summary", "recommendation"],
      },
    },
  });

  const jsonStr = response.text?.trim() || '{"summary": [], "recommendation": ""}';
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error parsing Gemini AI response:", error);
    return {
      summary: ["Gagal menganalisis tren absensi secara otomatis saat ini."],
      recommendation: "Coba muat ulang halaman atau periksa kelengkapan data absensi Anda."
    };
  }
};
