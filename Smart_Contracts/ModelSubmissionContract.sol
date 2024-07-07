// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract ModelSubmissionContract {
    
    uint256 id;
    address public admin = 0x4349807050939f95Aa0C494B496F0a694D20F98E;
    
    struct Model {
        uint256 id;
        address owner;
        string pinataHash;
        string updatedPinataHash;
        uint256 timestamp;
        uint256 submissionFee;
        bool isProcessed;
    }
    
    Model[] public models;

    mapping(uint256 => string) taskOwnerCidMap;
    mapping(address => mapping(uint256 => string)) taskContributorCidMap;
    
    event ModelSubmitted(address indexed submitter, string pinataHash, uint256 timestamp, uint256 submissionFee);
    event ContributorModelSubmitted(uint256 indexed taskId, string originalModelHash, string contributorModelHash);

    modifier onlyOwner() {
        require(msg.sender == admin, "Only the admin can call this function");
        _;
    }
    
    function submitModelByOwner(string memory _pinataHash) external payable {
        
        require(msg.value > 0, "Submission fee must be greater than 0");

        taskOwnerCidMap[id] = _pinataHash;

        models.push(Model({
            id: id,
            owner: msg.sender,
            pinataHash: _pinataHash,
            updatedPinataHash: "",
            timestamp: block.timestamp,
            submissionFee: msg.value,
            isProcessed: false
        }));

        id += 1;
        emit ModelSubmitted(msg.sender, _pinataHash, block.timestamp, msg.value);
    }
    
    function getModelCount() external view returns (uint256) {
        return models.length;
    }
    
    function getAllModels() external view returns (Model[] memory) {
        return models;
    }
    
    function getModelsPaginated(uint256 _start, uint256 _limit) external view returns (Model[] memory) {
        require(_start < models.length, "Start index out of bounds");
        
        uint256 end = _start + _limit;
        if (end > models.length) {
            end = models.length;
        }
        
        Model[] memory result = new Model[](end - _start);
        for (uint256 i = _start; i < end; i++) {
            result[i - _start] = models[i];
        }
        
        return result;
    }
    
    function withdrawFees() external onlyOwner {
        payable(admin).transfer(address(this).balance);
    }

    function markModelAsProcessed(uint256 _modelIndex) external {

        require(_modelIndex < models.length, "Invalid model index");
        require(msg.sender == models[_modelIndex].owner, "Only the model owner can mark it as processed");
        require(!models[_modelIndex].isProcessed, "Model is already processed");
        
        models[_modelIndex].isProcessed = true;
    }

    function submitModelByContributor(uint256 index, string memory _pinataHash) public {
        Model storage model = models[index];
        require(model.isProcessed == false, "Model is not active");
        model.updatedPinataHash = _pinataHash;
        taskContributorCidMap[msg.sender][index] = _pinataHash;

        emit ContributorModelSubmitted(model.id, model.pinataHash, _pinataHash);
    }


}