const router = require('express').Router();
const { sendMessage, getConversation, getContacts } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send', protect, sendMessage);
router.get('/contacts', protect, getContacts);
router.get('/:contactId', protect, getConversation);

module.exports = router;
