const router = require('express').Router();
const { chat, getHistory } = require('../controllers/chatbotController');

router.post('/message', chat);
router.get('/history/:patientId', getHistory);

module.exports = router;
