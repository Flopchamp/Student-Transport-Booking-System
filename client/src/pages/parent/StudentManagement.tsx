import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../lib/api';
import {
  Plus,
  Search,
  MapPin,
  Phone,
  Camera,
  Home,
  Info,
  ChevronRight,
  MoreVertical,
  Users,
} from 'lucide-react';
import type { Student } from '../../types';
import Modal from '../../components/ui/Modal';

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', date_of_birth: '', grade: '', school_name: '',
    pickup_address: '', dropoff_address: '', special_needs: '',
    emergency_contact_name: '', emergency_contact_phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => { fetchStudents(); }, []);

  useEffect(() => {
    const state = location.state as { openAddModal?: boolean } | null;
    if (state?.openAddModal) {
      setShowModal(true);
      setEditingStudent(null);
      setError('');
      setFormData({ first_name: '', last_name: '', date_of_birth: '', grade: '', school_name: '', pickup_address: '', dropoff_address: '', special_needs: '', emergency_contact_name: '', emergency_contact_phone: '' });
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      const data = res.data.data;
      setStudents(Array.isArray(data) ? data : (data?.students || []));
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        first_name: student.first_name, last_name: student.last_name,
        date_of_birth: student.date_of_birth?.split('T')[0] || '', grade: student.grade,
        school_name: student.school_name, pickup_address: student.pickup_address,
        dropoff_address: student.dropoff_address, special_needs: student.special_needs || '',
        emergency_contact_name: student.emergency_contact_name, emergency_contact_phone: student.emergency_contact_phone,
      });
    } else {
      setEditingStudent(null);
      setFormData({ first_name: '', last_name: '', date_of_birth: '', grade: '', school_name: '', pickup_address: '', dropoff_address: '', special_needs: '', emergency_contact_name: '', emergency_contact_phone: '' });
    }
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent.id}`, formData);
      } else {
        await api.post('/students', formData);
      }
      setShowModal(false);
      fetchStudents();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      fetchStudents();
    } catch (err) {
      console.error('Failed to delete student:', err);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.first_name.toLowerCase().includes(search.toLowerCase()) ||
      s.last_name.toLowerCase().includes(search.toLowerCase()) ||
      s.school_name.toLowerCase().includes(search.toLowerCase()),
  );

  /* Demo data when no real students */
  const demoStudents = [
    { id: 1, first_name: 'Sarah', last_name: 'Jenkins', grade: '6-A', school_name: 'Greenwood Academy', pickup_address: '24 Elm Street', emergency_contact_phone: '+1 555 0001', route: 'Morning Route #3', status: 'Active' },
    { id: 2, first_name: 'Chloe', last_name: 'Jenkins', grade: '4-B', school_name: 'Greenwood Academy', pickup_address: '24 Elm Street', emergency_contact_phone: '+1 555 0001', route: 'Bus Stop #5, North Ave', status: 'Active' },
    { id: 3, first_name: 'Marcus', last_name: 'Jenkins', grade: '2', school_name: 'Lincoln Elementary', pickup_address: '24 Elm Street', emergency_contact_phone: '+1 555 0001', route: 'Afternoon Shuttle', status: 'Pending' },
  ];

  const displayStudents = filteredStudents.length > 0 ? filteredStudents : (students.length === 0 ? demoStudents : []);

  const avatarBgs = ['bg-blue-100', 'bg-green-100', 'bg-amber-100', 'bg-violet-100', 'bg-pink-100'];
  const avatarTexts = ['text-primary', 'text-emerald-500', 'text-amber-500', 'text-violet-500', 'text-pink-500'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Students</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your children's enrollment, schedules, and transportation</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold border-none cursor-pointer hover:bg-blue-600 transition"
        >
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students, classes..."
          className="w-full h-[46px] pl-10 pr-3.5 text-sm border border-slate-200 rounded-[10px] bg-white outline-none text-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Student Cards */}
      {displayStudents.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-[60px] text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 mb-1">No students found</h3>
          <p className="text-sm text-slate-400 mb-4">
            {search ? 'Try a different search term' : 'Add your first student to get started'}
          </p>
          {!search && (
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold border-none cursor-pointer hover:bg-blue-600 transition"
            >
              <Plus className="w-4 h-4" /> Add Student
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {displayStudents.map((student: (typeof demoStudents)[0] | Student) => {
            const isReal = 'date_of_birth' in student;
            const initials = student.first_name[0] + student.last_name[0];
            const colorIdx = Math.abs(String(student.id || '').split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0)) % avatarBgs.length;

            return (
              <div key={student.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center gap-5">
                {/* Avatar */}
                <div className={`w-14 h-14 rounded-full shrink-0 flex items-center justify-center font-bold text-lg ${avatarBgs[colorIdx]} ${avatarTexts[colorIdx]}`}>
                  {initials}
                </div>

                {/* Student Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-semibold text-slate-800">
                      {student.first_name} {student.last_name}
                    </span>
                    <span className="text-xs font-medium text-primary bg-blue-50 px-2 py-0.5 rounded">
                      {student.school_name} · Grade {student.grade}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[13px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {student.emergency_contact_phone || '+1 555 0001'}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {'route' in student ? (student as (typeof demoStudents)[0]).route : student.pickup_address}
                    </span>
                  </div>
                </div>

                {/* View Profile */}
                <a
                  href="#"
                  className="flex items-center gap-1 text-[13px] font-semibold text-primary whitespace-nowrap hover:underline"
                  onClick={(e) => { e.preventDefault(); handleOpenModal(isReal ? (student as Student) : undefined); }}
                >
                  View Profile <ChevronRight className="w-3.5 h-3.5" />
                </a>

                {/* Actions */}
                {isReal && (
                  <button
                    onClick={() => handleDelete((student as Student).id)}
                    className="p-1.5 bg-transparent border-none cursor-pointer text-slate-400 hover:text-slate-600"
                    title="More options"
                  >
                    <MoreVertical className="w-[18px] h-[18px]" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Add/Edit Modal ─── */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
        maxWidth="max-w-[520px]"
      >
            <form onSubmit={handleSubmit} className="px-6 pb-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[13px] mb-4">
                  {error}
                </div>
              )}

              {/* Photo Upload */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer shrink-0">
                  <Camera className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">Student Photograph</div>
                  <div className="text-xs text-slate-400">PNG, JPG up to 5MB. Must be a clear headshot.</div>
                </div>
              </div>

              {/* Full Name */}
              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={formData.first_name ? `${formData.first_name} ${formData.last_name}` : ''}
                  onChange={(e) => {
                    const parts = e.target.value.split(' ');
                    setFormData({ ...formData, first_name: parts[0] || '', last_name: parts.slice(1).join(' ') || '' });
                  }}
                  placeholder="Enter student's full name"
                  className="w-full h-11 px-3.5 text-sm border border-slate-200 rounded-lg bg-white outline-none text-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              {/* School + Grade */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">School</label>
                  <select
                    value={formData.school_name}
                    onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                    className="w-full h-11 px-3.5 text-sm border border-slate-200 rounded-lg bg-white outline-none text-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Select school</option>
                    <option value="Greenwood High">Greenwood High</option>
                    <option value="Greenwood Academy">Greenwood Academy</option>
                    <option value="Lincoln Elementary">Lincoln Elementary</option>
                    <option value="Springfield Middle">Springfield Middle</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Class / Grade</label>
                  <input
                    type="text"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="e.g. 10-B"
                    className="w-full h-11 px-3.5 text-sm border border-slate-200 rounded-lg bg-white outline-none text-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Home Address */}
              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Home Address (Drop-off)</label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                  <input
                    type="text"
                    value={formData.dropoff_address}
                    onChange={(e) => setFormData({ ...formData, dropoff_address: e.target.value, pickup_address: e.target.value })}
                    placeholder="Enter residential address"
                    className="w-full h-11 pl-10 pr-3.5 text-sm border border-slate-200 rounded-lg bg-white outline-none text-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <input type="hidden" value={formData.date_of_birth || '2015-01-01'} />

              {/* Info Box */}
              <div className="flex gap-3 p-4 bg-blue-50 rounded-[10px] mb-6 items-start">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  Verification will be sent to the school administration once you submit this form.
                  Profile will remain 'Pending' until approved.
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-11 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-11 rounded-lg border-none bg-primary text-sm font-semibold text-white cursor-pointer hover:bg-blue-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : editingStudent ? 'Update Student' : 'Submit Application'}
                </button>
              </div>
            </form>
      </Modal>
    </div>
  );
}
