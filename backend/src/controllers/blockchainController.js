const hashService = require('../services/hashService');
const blockchainService = require('../services/blockchainService');
const { RiskLog } = require('../models');

exports.storeOnBlockchain = async (req, res, next) => {
  try {
    const { patient_id, vitals_data, risk_log_id } = req.body;
    const recordHash = hashService.generateHash(vitals_data);
    const txResult = await blockchainService.storeHash(patient_id, recordHash);

    if (risk_log_id) {
      await RiskLog.update({ record_hash: recordHash, tx_hash: txResult.transactionHash }, { where: { id: risk_log_id } });
    }

    res.json({
      success: true,
      data: {
        record_hash: recordHash,
        transaction_hash: txResult.transactionHash,
        block_number: txResult.blockNumber,
        polygonscan_url: `https://amoy.polygonscan.com/tx/${txResult.transactionHash}`,
      },
    });
  } catch (error) { next(error); }
};
