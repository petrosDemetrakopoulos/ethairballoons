pragma solidity ^0.6.1;
pragma experimental ABIEncoderV2;
contract carsContract {
	bytes32 public dataId;
	uint public numberOfRecords = 0;
	bytes32[] public recordsList;

	event dataAdded(string dat);

	struct Car {
		string payload;
		uint listPointer;
	}


	mapping(bytes32 => Car) public facts;

	function isRecord(bytes32 recordAddress) public view returns (bool isRec) {
		if(recordsList.length == 0) return false;
		return (recordsList[facts[recordAddress].listPointer] == recordAddress);
	}

	function getRecordCount() public view returns (uint recCount){
		return recordsList.length;
	}

	function addRecord(string memory payload, bytes32 ID) public returns (bool success) {
	if(isRecord(ID)) revert('record exists');
		facts[ID].payload = payload;
		recordsList.push(ID);
		facts[ID].listPointer = recordsList.length - 1;
		numberOfRecords++;
		return (true);
	}

	function getRecord(bytes32 id) public view returns (string memory payload){
		return (facts[id].payload);
	}

	function updateRecord(bytes32 id, string memory payload) public returns (bool success){
		if(!isRecord(id)) revert('it is not record');
		facts[id].payload = payload;
		return (true);
	}

	function getAllRecords() public view returns (string[] memory payloads) {
		string[] memory payloadss = new string[](numberOfRecords);
		for (uint i = 0; i < numberOfRecords; i++) {
			Car storage fact = facts[recordsList[i]];
			payloadss[i] = fact.payload;
		}
		return (payloadss);
	}

function deleteRecord(bytes32 id) public returns (bool success) {
    if(!isRecord(id)) revert('it is not record');
    uint rowToDelete = facts[id].listPointer;
    bytes32 keyToMove = recordsList[recordsList.length-1];
    recordsList[rowToDelete] = keyToMove;
    facts[keyToMove].listPointer = rowToDelete;
    recordsList.pop();
    numberOfRecords--;
    return (true);
  }

}