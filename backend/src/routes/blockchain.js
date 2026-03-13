const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');

router.post('/store', blockchainController.storeOnBlockchain);

module.exports = router;
