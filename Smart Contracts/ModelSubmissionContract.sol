// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract ModelSubmissionContract {

    address public owner = 0x4349807050939f95Aa0C494B496F0a694D20F98E;
    
    struct Model {

        address submitter;
        string pinataHash;
        uint256 timestamp;
        uint256 submissionFee;
        bool isProcessed;

    }
    
    Model[] public models;
    
    event ModelSubmitted(address indexed submitter, string pinataHash, uint256 timestamp, uint256 submissionFee);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }
    
    function submitModel(string memory _pinataHash) external payable {

        require(msg.value > 0, "Submission fee must be greater than 0");

        models.push(Model({
            submitter: msg.sender,
            pinataHash: _pinataHash,
            timestamp: block.timestamp,
            submissionFee: msg.value,
            isProcessed: false
        }));
        
        emit ModelSubmitted(msg.sender, _pinataHash, block.timestamp, msg.value);
    }
    
    function getModelCount() external view returns (uint256) {
        return models.length;
    }
    
    function withdrawFees() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    function markModelAsProcessed(uint256 _modelIndex) external onlyOwner {
        require(_modelIndex < models.length, "Invalid model index");
        models[_modelIndex].isProcessed = true;
    }
    
}
