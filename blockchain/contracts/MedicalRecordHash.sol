// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MedicalRecordHash
 * @dev Stores SHA-256 hashes of medical records on-chain for integrity verification.
 */
contract MedicalRecordHash {
    struct Record {
        bytes32 recordHash;
        uint256 timestamp;
        address submitter;
    }

    mapping(string => Record[]) private patientRecords;
    uint256 public totalRecords;

    event RecordStored(string indexed patientId, bytes32 recordHash, uint256 timestamp, address submitter);

    function storeRecord(string memory patientId, bytes32 recordHash) public {
        require(bytes(patientId).length > 0, "Patient ID cannot be empty");
        require(recordHash != bytes32(0), "Record hash cannot be zero");

        patientRecords[patientId].push(Record({
            recordHash: recordHash,
            timestamp: block.timestamp,
            submitter: msg.sender
        }));
        totalRecords++;
        emit RecordStored(patientId, recordHash, block.timestamp, msg.sender);
    }

    function getRecords(string memory patientId) public view returns (Record[] memory) {
        return patientRecords[patientId];
    }

    function getRecordCount(string memory patientId) public view returns (uint256) {
        return patientRecords[patientId].length;
    }

    function verifyRecord(string memory patientId, bytes32 recordHash) public view returns (bool exists) {
        Record[] memory records = patientRecords[patientId];
        for (uint256 i = 0; i < records.length; i++) {
            if (records[i].recordHash == recordHash) return true;
        }
        return false;
    }
}
