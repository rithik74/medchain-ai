const crypto = require('crypto');

exports.generateHash = function (data) {
  const jsonString = JSON.stringify(data, Object.keys(data).sort());
  return '0x' + crypto.createHash('sha256').update(jsonString).digest('hex');
};
