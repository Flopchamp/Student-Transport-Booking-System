const { Router } = require('express');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createStudentValidator,
  updateStudentValidator,
  studentIdValidator,
  listStudentsValidator,
} = require('../validators/studentValidator');
const {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  activateStudent,
} = require('../controllers/studentController');

const router = Router();

// All student routes require authentication
router.use(protect);

// ─── Parent + Admin ─────────────────────────────────
router.post('/', createStudentValidator, validate, createStudent);
router.get('/', listStudentsValidator, validate, getStudents);
router.get('/:id', studentIdValidator, validate, getStudent);
router.put('/:id', updateStudentValidator, validate, updateStudent);
router.delete('/:id', studentIdValidator, validate, deleteStudent);

// ─── Admin Only ─────────────────────────────────────
router.patch('/:id/activate', authorize('admin'), studentIdValidator, validate, activateStudent);

module.exports = router;
