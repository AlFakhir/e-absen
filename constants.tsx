
import { Student, ClassInfo } from './types';

export const INITIAL_CLASSES: ClassInfo[] = [
  { id: '1', name: '7 - IBNU RUSYD' },
  { id: '2', name: '7 - IBNU SINA' },
  { id: '3', name: '8 - AL KINDI' },
  { id: '4', name: '8 - AL KHAWARIZMI' },
];

export const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'Giar', studentId: '00001', className: '7 - IBNU RUSYD', gender: 'L', whatsapp: '6281234567890' },
  { id: '2', name: 'Ahmad Rasya', studentId: '00002', className: '7 - IBNU SINA', gender: 'L', whatsapp: '6281234567891' },
  { id: '3', name: 'Ahmad Fauzi', studentId: '10003', className: '8 - AL KINDI', gender: 'L', whatsapp: '6281234567892' },
  { id: '4', name: 'Siti Aminah', studentId: '10004', className: '8 - AL KHAWARIZMI', gender: 'P', whatsapp: '6281234567893' },
];

export const STATUS_COLORS = {
  Hadir: 'bg-green-100 text-green-700 border-green-200',
  Alpa: 'bg-red-100 text-red-700 border-red-200',
  Sakit: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Izin: 'bg-blue-100 text-blue-700 border-blue-200',
  Pulang: 'bg-teal-100 text-teal-700 border-teal-200',
  Terlambat: 'bg-orange-100 text-orange-700 border-orange-200',
};
