
export enum AttendanceStatus {
  PRESENT = 'Hadir',
  ABSENT = 'Alpa',
  SICK = 'Sakit',
  PERMISSION = 'Izin',
  RETURN = 'Pulang',
  LATE = 'Terlambat'
}

export interface Student {
  id: string;
  name: string;
  studentId: string; // NISN
  className: string;
  gender: 'L' | 'P';
  photo?: string; // Base64 string
  whatsapp?: string; // Nomor WhatsApp Orang Tua
}

export interface Teacher {
  id: string;
  name: string;
  teacherId: string; // NIK/NIP
  subject: string;
  gender: 'L' | 'P';
  photo?: string; // Base64 string
  homeroomClass?: string; // Wali Kelas dari kelas mana
}

export interface AttendanceRecord {
  id: string;
  studentId: string; // Bisa ID Siswa atau ID Guru
  date: string; // ISO Date (YYYY-MM-DD)
  status: AttendanceStatus;
  time?: string; // Jam Terupdate
  note?: string;
  type: 'student' | 'teacher'; // Pembeda tipe absensi
}

export interface ClassInfo {
  id: string;
  name: string;
}
