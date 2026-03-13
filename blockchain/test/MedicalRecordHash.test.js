const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('MedicalRecordHash', function () {
  let contract, owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('MedicalRecordHash');
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  it('should store a record and emit event', async function () {
    const hash = ethers.keccak256(ethers.toUtf8Bytes('test-record'));
    await expect(contract.storeRecord('P-1001', hash))
      .to.emit(contract, 'RecordStored');
    const records = await contract.getRecords('P-1001');
    expect(records.length).to.equal(1);
    expect(records[0].recordHash).to.equal(hash);
  });

  it('should store multiple records per patient', async function () {
    const h1 = ethers.keccak256(ethers.toUtf8Bytes('r1'));
    const h2 = ethers.keccak256(ethers.toUtf8Bytes('r2'));
    await contract.storeRecord('P-1001', h1);
    await contract.storeRecord('P-1001', h2);
    expect(await contract.getRecordCount('P-1001')).to.equal(2);
  });

  it('should reject empty patient ID', async function () {
    const hash = ethers.keccak256(ethers.toUtf8Bytes('test'));
    await expect(contract.storeRecord('', hash)).to.be.revertedWith('Patient ID cannot be empty');
  });

  it('should reject zero hash', async function () {
    await expect(contract.storeRecord('P-1001', ethers.ZeroHash)).to.be.revertedWith('Record hash cannot be zero');
  });

  it('should verify existing records', async function () {
    const hash = ethers.keccak256(ethers.toUtf8Bytes('test'));
    await contract.storeRecord('P-1001', hash);
    expect(await contract.verifyRecord('P-1001', hash)).to.be.true;
    expect(await contract.verifyRecord('P-1001', ethers.keccak256(ethers.toUtf8Bytes('other')))).to.be.false;
  });

  it('should increment totalRecords', async function () {
    const hash = ethers.keccak256(ethers.toUtf8Bytes('test'));
    await contract.storeRecord('P-1001', hash);
    expect(await contract.totalRecords()).to.equal(1);
  });
});
