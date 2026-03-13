const hre = require('hardhat');

async function main() {
  console.log('🚀 Deploying MedicalRecordHash to', hre.network.name);
  const MedicalRecordHash = await hre.ethers.getContractFactory('MedicalRecordHash');
  const contract = await MedicalRecordHash.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log('✅ MedicalRecordHash deployed to:', address);
  console.log(`\nAdd to .env: CONTRACT_ADDRESS=${address}`);
  if (hre.network.name === 'amoy') console.log(`\nVerify: https://amoy.polygonscan.com/address/${address}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
