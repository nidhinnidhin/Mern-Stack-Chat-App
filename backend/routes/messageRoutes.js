const express = require('express');
const {sendMessage, allMessages, sendMedia } = require('../controllers/messageControllers');
const { protect } = require('../middlewares/authMiddleware')

const router = express.Router();

router.post('/', protect, sendMessage)
router.post('/sendimage', protect, sendMedia)
router.get('/:chatId', protect, allMessages)

module.exports = router;