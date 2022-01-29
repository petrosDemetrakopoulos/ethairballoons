// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.2;
pragma experimental ABIEncoderV2;

contract carContracts {
    bytes32 public dataId;
    uint256 public numberOfRecords = 0;
    bytes32[] public recordsList;

    event dataAdded(string dat);

    struct Car {
        string payload;
        uint256 listPointer;
    }

    mapping(bytes32 => Car) public facts;

    function isRecord(bytes32 recordAddress) public view returns (bool isRec) {
        if (recordsList.length == 0) return false;
        return (recordsList[facts[recordAddress].listPointer] == recordAddress);
    }

    function getRecordCount() public view returns (uint256 recCount) {
        return recordsList.length;
    }

    function addRecord(string memory payload, bytes32 ID)
        public
        returns (bool success)
    {
        if (isRecord(ID)) revert("record with this id already exists");
        facts[ID].payload = payload;
        recordsList.push(ID);
        facts[ID].listPointer = recordsList.length - 1;
        numberOfRecords++;
        return (true);
    }

    function getRecord(bytes32 id) public view returns (string memory payload) {
        if (!isRecord(id)) revert("record with this id does not exist");
        return (facts[id].payload);
    }

    function updateRecord(bytes32 id, string memory payload)
        public
        returns (bool success)
    {
        if (!isRecord(id)) revert("record with this id does not exist");
        facts[id].payload = payload;
        return (true);
    }

    function getAllRecords() public view returns (string[] memory payloads) {
        string[] memory payloadss = new string[](numberOfRecords);
        for (uint256 i = 0; i < numberOfRecords; i++) {
            Car storage fact = facts[recordsList[i]];
            payloadss[i] = fact.payload;
        }
        return (payloadss);
    }

    function deleteRecord(bytes32 id) public returns (bool success) {
        if (!isRecord(id)) revert("record with this id does not exist");
        uint256 rowToDelete = facts[id].listPointer;
        bytes32 keyToMove = recordsList[recordsList.length - 1];
        recordsList[rowToDelete] = keyToMove;
        facts[keyToMove].listPointer = rowToDelete;
        recordsList.pop();
        numberOfRecords--;
        return (true);
    }
}
