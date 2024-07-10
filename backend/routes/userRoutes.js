const express = require('express');
const {registerUser, authUser, allUsers} = require('../controllers/userControllers')
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware')

router.post('/', registerUser);
router.post('/login', authUser);
router.get('/searchusers', protect, allUsers);


module.exports = router;