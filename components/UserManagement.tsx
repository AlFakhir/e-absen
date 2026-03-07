
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, GraduationCap, School } from 'lucide-react';
import { Student, Teacher, ClassInfo } from '../types';
import StudentManagement from './StudentManagement';
import TeacherManagement from './TeacherManagement';
import ClassManagement from './ClassManagement';

interface UserManagementProps {
  schoolInfo: any;
  students: Student[];
  onAddStudent: (s: Omit<Student, 'id'>) => void;
  onUpdateStudent: (s: Student) => void;
  onDeleteStudent: (id: string) => void;
  
  teachers: Teacher[];
  onAddTeacher: (t: Omit<Teacher, 'id'>) => void;
  onUpdateTeacher: (t: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  
  classes: ClassInfo[];
  onAddClass: (name: string) => void;
  onUpdateClass: (c: ClassInfo) => void;
  onDeleteClass: (id: string) => void;
  onSyncClasses?: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({
  schoolInfo,
  students, onAddStudent, onUpdateStudent, onDeleteStudent,
  teachers, onAddTeacher, onUpdateTeacher, onDeleteTeacher,
  classes, onAddClass, onUpdateClass, onDeleteClass,
  onSyncClasses
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'students' | 'teachers' | 'classes'>('students');

  const tabs = [
    { id: 'students', label: 'Data Siswa', icon: <Users className="w-5 h-5" />, color: 'teal' },
    { id: 'teachers', label: 'Data Guru', icon: <GraduationCap className="w-5 h-5" />, color: 'teal' },
    { id: 'classes', label: 'Data Kelas', icon: <School className="w-5 h-5" />, color: 'teal' },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Modern Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/50 rounded-3xl w-fit border border-slate-200/60">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`relative flex items-center gap-2.5 px-6 py-3 text-sm font-black transition-all rounded-2xl ${
              activeSubTab === tab.id 
                ? 'text-white' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {activeSubTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-teal-600 rounded-2xl shadow-lg shadow-teal-600/10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.icon}</span>
            <span className="relative z-10 uppercase tracking-widest text-[11px]">{tab.label}</span>
          </button>
        ))}
      </div>

      <motion.div 
        key={activeSubTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-[600px]"
      >
        {activeSubTab === 'students' && (
          <StudentManagement 
            schoolInfo={schoolInfo}
            students={students} 
            classes={classes} 
            onAdd={onAddStudent} 
            onUpdate={onUpdateStudent} 
            onDelete={onDeleteStudent} 
          />
        )}
        {activeSubTab === 'teachers' && (
          <TeacherManagement 
            schoolInfo={schoolInfo}
            teachers={teachers}
            classes={classes}
            onAdd={onAddTeacher} 
            onUpdate={onUpdateTeacher} 
            onDelete={onDeleteTeacher} 
          />
        )}
        {activeSubTab === 'classes' && (
          <ClassManagement 
            classes={classes} 
            students={students}
            onAdd={onAddClass} 
            onUpdate={onUpdateClass}
            onDelete={onDeleteClass} 
            onAddStudent={onAddStudent}
            onSync={onSyncClasses}
          />
        )}
      </motion.div>
    </div>
  );
};

export default UserManagement;
