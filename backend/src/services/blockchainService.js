const { ethers } = require('ethers');
const env = require('../config/env');

const CONTRACT_ABI = [
  'function storeRecord(string memory patientId, bytes32 recordHash) public',
  'function getRecords(string memory patientId) public view returns (tuple(bytes32 recordHash, uint256 timestamp, address submitter)[] memory)',
  'event RecordStored(string patientId, bytes32 recordHash, uint256 timestamp)',
];

let provider, wallet, contract;
let initialized = false;

function initBlockchain() {
  if (!env.POLYGON_AMOY_RPC_URL || !env.PRIVATE_KEY || !env.CONTRACT_ADDRESS) {
    console.warn('⚠️  Blockchain not configured — missing env vars');
    return false;
  }
  try {
    provider = new ethers.JsonRpcProvider(env.POLYGON_AMOY_RPC_URL);
    wallet = new ethers.Wallet(env.PRIVATE_KEY, provider);
    contract = new ethers.Contract(env.CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    console.log('✅ Blockchain service initialized');
    return true;
  } catch (err) {
    console.error('❌ Blockchain init failed:', err.message);
    return false;
  }
}

initialized = initBlockchain();

exports.storeHash = async function (patientId, recordHash) {
  if (!initialized || !contract) throw new Error('Blockchain service not initialized. Check environment variables.');
  const hashBytes = recordHash.startsWith('0x') ? recordHash : '0x' + recordHash;
  const tx = await contract.storeRecord(patientId, hashBytes);
  const receipt = await tx.wait();
  return { transactionHash: receipt.hash, blockNumber: receipt.blockNumber };
};

exports.getRecords = async function (patientId) {
  if (!initialized || !contract) throw new Error('Blockchain service not initialized.');
  const records = await contract.getRecords(patientId);
  return records.map((r) => ({ recordHash: r.recordHash, timestamp: Number(r.timestamp), submitter: r.submitter }));
};
