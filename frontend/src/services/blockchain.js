import { ethers } from 'ethers';

const CONTRACT_ABI = [
  'function storeRecord(string memory patientId, bytes32 recordHash) public',
  'function getRecords(string memory patientId) public view returns (tuple(bytes32 recordHash, uint256 timestamp, address submitter)[] memory)',
  'event RecordStored(string patientId, bytes32 recordHash, uint256 timestamp)',
];

export async function connectWallet() {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  return { provider, signer, address, network };
}

export async function storeRecordOnChain(signer, contractAddress, patientId, recordHash) {
  const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
  const hashBytes = recordHash.startsWith('0x') ? recordHash : '0x' + recordHash;
  const tx = await contract.storeRecord(patientId, hashBytes);
  const receipt = await tx.wait();
  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    polygonscanUrl: `https://amoy.polygonscan.com/tx/${receipt.hash}`,
  };
}
