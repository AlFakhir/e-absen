
import React from 'react';
import { Search, UserCircle, Check, X, Thermometer, FileText } from 'lucide-react';
import { Student, AttendanceRecord, AttendanceStatus } from '../types';
import { STATUS_COLORS } from '../constants';

interface AttendanceListProps {
  students: Student[];
  records: AttendanceRecord[];
  onMarkAttendance: (studentId: string, status: AttendanceStatus) => void;
  selectedDate: string;
}

const AttendanceList: React.FC<AttendanceListProps> = ({ 
  students, 
  records, 
  onMarkAttendance,
  selectedDate
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.includes(searchTerm)
  );

  const getRecordForStudent = (studentId: string) => 
    records.find(r => r.studentId === studentId && r.date === selectedDate);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari nama siswa atau NISN..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Siswa</th>
              <th className="px-6 py-4">Status Saat Ini</th>
              <th className="px-6 py-4 text-center">Aksi Absensi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map(student => {
              const record = getRecordForStudent(student.id);
              return (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.studentId} • {student.className}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {record ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[record.status]}`}>
                        {record.status}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold border bg-slate-100 text-slate-500 border-slate-200">
                        Belum Absen
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <AttendanceButton 
                        icon={<Check className="w-4 h-4" />}
                        label="H"
                        active={record?.status === AttendanceStatus.PRESENT}
                        onClick={() => onMarkAttendance(student.id, AttendanceStatus.PRESENT)}
                        colorClass="hover:bg-green-500 hover:text-white border-green-200 text-green-600 active:bg-green-600"
                        activeColorClass="bg-green-600 text-white"
                      />
                      <AttendanceButton 
                        icon={<X className="w-4 h-4" />}
                        label="A"
                        active={record?.status === AttendanceStatus.ABSENT}
                        onClick={() => onMarkAttendance(student.id, AttendanceStatus.ABSENT)}
                        colorClass="hover:bg-red-500 hover:text-white border-red-200 text-red-600 active:bg-red-600"
                        activeColorClass="bg-red-600 text-white"
                      />
                      <AttendanceButton 
                        icon={<Thermometer className="w-4 h-4" />}
                        label="S"
                        active={record?.status === AttendanceStatus.SICK}
                        onClick={() => onMarkAttendance(student.id, AttendanceStatus.SICK)}
                        colorClass="hover:bg-yellow-500 hover:text-white border-yellow-200 text-yellow-600 active:bg-yellow-600"
                        activeColorClass="bg-yellow-600 text-white"
                      />
                      <AttendanceButton 
                        icon={<FileText className="w-4 h-4" />}
                        label="I"
                        active={record?.status === AttendanceStatus.PERMISSION}
                        onClick={() => onMarkAttendance(student.id, AttendanceStatus.PERMISSION)}
                        colorClass="hover:bg-blue-500 hover:text-white border-blue-200 text-blue-600 active:bg-blue-600"
                        activeColorClass="bg-blue-600 text-white"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AttendanceButton = ({ icon, label, active, onClick, colorClass, activeColorClass }: any) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-lg border transition-all flex flex-col items-center gap-1 min-w-[40px] ${active ? activeColorClass : colorClass}`}
    title={label}
  >
    {icon}
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

export default AttendanceList;
