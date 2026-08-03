const router = require('express').Router();
const { getAllUsers, getUsersByRole, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/role/:role', protect, authorize('admin'), getUsersByRole);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
