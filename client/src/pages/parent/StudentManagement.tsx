import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../lib/api';
import {
  Plus,
  Search,
  X,
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

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    grade: '',
    school_name: '',
    pickup_address: '',
    dropoff_address: '',
    special_needs: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    fetchStudents();
  }, []);

  // Auto-open modal when navigated from Dashboard "Add Student" button
  useEffect(() => {
    const state = location.state as { openAddModal?: boolean } | null;
    if (state?.openAddModal) {
      setShowModal(true);
      setEditingStudent(null);
      setError('');
      setFormData({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        grade: '',
        school_name: '',
        pickup_address: '',
        dropoff_address: '',
        special_needs: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
      });
      // Clear the state so it doesn't re-open on refresh/back
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data.data || []);
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
        first_name: student.first_name,
        last_name: student.last_name,
        date_of_birth: student.date_of_birth?.split('T')[0] || '',
        grade: student.grade,
        school_name: student.school_name,
        pickup_address: student.pickup_address,
        dropoff_address: student.dropoff_address,
        special_needs: student.special_needs || '',
        emergency_contact_name: student.emergency_contact_name,
        emergency_contact_phone: student.emergency_contact_phone,
      });
    } else {
      setEditingStudent(null);
      setFormData({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        grade: '',
        school_name: '',
        pickup_address: '',
        dropoff_address: '',
        special_needs: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
      });
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

  const handleDelete = async (id: number) => {
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
      s.school_name.toLowerCase().includes(search.toLowerCase())
  );

  const card: React.CSSProperties = {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 44,
    padding: '0 14px',
    fontSize: 14,
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    background: '#fff',
    outline: 'none',
    color: '#1e293b',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 6,
    display: 'block',
  };

  // Demo data when no real students
  const demoStudents = [
    { id: 1, first_name: 'Sarah', last_name: 'Jenkins', grade: '6-A', school_name: 'Greenwood Academy', pickup_address: '24 Elm Street', emergency_contact_phone: '+1 555 0001', route: 'Morning Route #3', status: 'Active' },
    { id: 2, first_name: 'Chloe', last_name: 'Jenkins', grade: '4-B', school_name: 'Greenwood Academy', pickup_address: '24 Elm Street', emergency_contact_phone: '+1 555 0001', route: 'Bus Stop #5, North Ave', status: 'Active' },
    { id: 3, first_name: 'Marcus', last_name: 'Jenkins', grade: '2', school_name: 'Lincoln Elementary', pickup_address: '24 Elm Street', emergency_contact_phone: '+1 555 0001', route: 'Afternoon Shuttle', status: 'Pending' },
  ];

  const displayStudents = filteredStudents.length > 0 ? filteredStudents : (students.length === 0 ? demoStudents : []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>My Students</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
            Manage your children's enrollment, schedules, and transportation
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
            background: '#137fec', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600,
            border: 'none', cursor: 'pointer',
          }}
        >
          <Plus style={{ width: 16, height: 16 }} /> Add Student
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative' }}>
        <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#94a3b8' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students, classes..."
          style={{ ...inputStyle, paddingLeft: 42, height: 46, background: '#fff', borderRadius: 10 }}
        />
      </div>

      {/* Student Cards */}
      {displayStudents.length === 0 ? (
        <div style={{ ...card, padding: 60, textAlign: 'center' }}>
          <Users style={{ width: 48, height: 48, color: '#cbd5e1', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>No students found</h3>
          <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
            {search ? 'Try a different search term' : 'Add your first student to get started'}
          </p>
          {!search && (
            <button
              onClick={() => handleOpenModal()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                background: '#137fec', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600,
                border: 'none', cursor: 'pointer',
              }}
            >
              <Plus style={{ width: 16, height: 16 }} /> Add Student
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {displayStudents.map((student: typeof demoStudents[0] | Student) => {
            const isReal = 'date_of_birth' in student;
            const initials = student.first_name[0] + student.last_name[0];
            const colors = ['#dbeafe', '#d1fae5', '#fef3c7', '#ede9fe', '#fce7f3'];
            const textColors = ['#137fec', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
            const colorIdx = (student.id || 0) % colors.length;

            return (
              <div key={student.id} style={{ ...card, padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
                {/* Avatar */}
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', flexShrink: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18,
                  background: colors[colorIdx], color: textColors[colorIdx],
                }}>
                  {initials}
                </div>

                {/* Student Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
                      {student.first_name} {student.last_name}
                    </span>
                    <span style={{
                      fontSize: 12, fontWeight: 500, color: '#137fec', background: '#eff6ff',
                      padding: '2px 8px', borderRadius: 4,
                    }}>
                      {student.school_name} • Grade {student.grade}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Phone style={{ width: 14, height: 14 }} />
                      {student.emergency_contact_phone || '+1 555 0001'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin style={{ width: 14, height: 14 }} />
                      {'route' in student ? (student as typeof demoStudents[0]).route : student.pickup_address}
                    </span>
                  </div>
                </div>

                {/* View Profile Link */}
                <a
                  href="#"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: '#137fec', textDecoration: 'none', whiteSpace: 'nowrap' }}
                  onClick={(e) => { e.preventDefault(); handleOpenModal(isReal ? (student as Student) : undefined); }}
                >
                  View Profile <ChevronRight style={{ width: 14, height: 14 }} />
                </a>

                {/* Actions */}
                {isReal && (
                  <button
                    onClick={() => handleDelete((student as Student).id)}
                    style={{ padding: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    title="More options"
                  >
                    <MoreVertical style={{ width: 18, height: 18 }} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════ Add/Edit Modal ═══════ */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowModal(false)}
          />

          {/* Modal Card */}
          <div style={{
            position: 'relative', background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto',
          }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X style={{ width: 18, height: 18, color: '#64748b' }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px' }}>
              {error && (
                <div style={{ padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
                  {error}
                </div>
              )}

              {/* Photo Upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', background: '#f1f5f9', border: '2px dashed #cbd5e1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                }}>
                  <Camera style={{ width: 24, height: 24, color: '#94a3b8' }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>Student Photograph</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>PNG, JPG up to 5MB. Must be a clear headshot.</div>
                </div>
              </div>

              {/* Full Name */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={formData.first_name ? `${formData.first_name} ${formData.last_name}` : ''}
                  onChange={(e) => {
                    const parts = e.target.value.split(' ');
                    setFormData({ ...formData, first_name: parts[0] || '', last_name: parts.slice(1).join(' ') || '' });
                  }}
                  placeholder="Enter student's full name"
                  style={inputStyle}
                  required
                />
              </div>

              {/* School + Grade Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>School</label>
                  <select
                    value={formData.school_name}
                    onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                    style={{ ...inputStyle, appearance: 'auto' as React.CSSProperties['appearance'] }}
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
                  <label style={labelStyle}>Class / Grade</label>
                  <input
                    type="text"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="e.g. 10-B"
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              {/* Home Address */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Home Address (Drop-off)</label>
                <div style={{ position: 'relative' }}>
                  <Home style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={formData.dropoff_address}
                    onChange={(e) => setFormData({ ...formData, dropoff_address: e.target.value, pickup_address: e.target.value })}
                    placeholder="Enter residential address"
                    style={{ ...inputStyle, paddingLeft: 40 }}
                    required
                  />
                </div>
              </div>

              {/* Hidden fields for API compatibility */}
              <input type="hidden" value={formData.date_of_birth || '2015-01-01'} />

              {/* Info Box */}
              <div style={{
                display: 'flex', gap: 12, padding: 16, background: '#eff6ff', borderRadius: 10,
                marginBottom: 24, alignItems: 'flex-start',
              }}>
                <Info style={{ width: 20, height: 20, color: '#137fec', flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  Verification will be sent to the school administration once you submit this form.
                  Profile will remain 'Pending' until approved.
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    height: 44, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff',
                    fontSize: 14, fontWeight: 600, color: '#475569', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    height: 44, borderRadius: 8, border: 'none', background: '#137fec',
                    fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer',
                    opacity: submitting ? 0.6 : 1,
                  }}
                >
                  {submitting ? 'Submitting...' : editingStudent ? 'Update Student' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
