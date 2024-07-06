// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */

contract ModelCheck {

    uint256 number;

    struct Model {
        uint256 id;
        string cid;
        address owner;
        bool isActive;
    }

      struct TaskInfo {
        string proofOfTask;
        bytes data;
        address taskPerformer;
        uint16 taskDefinitionId;
    }

    mapping(uint256 => string) cidMap;
    mapping(address => uint256[]) contributorMap;
    mapping(address => mapping(uint256 => bool)) contributionApprovalMap;
    Model[] models;

    event modelUploaded(string cid, address owner);
    event dummy(uint256 random);

    function afterTaskSubmission(TaskInfo calldata _taskInfo, bool _isApproved, bytes calldata _tpSignature, uint256[2] calldata _taSignature, uint256[] calldata _operatorIds) external {}

    function beforeTaskSubmission(TaskInfo calldata _taskInfo, bool _isApproved, bytes calldata _tpSignature, uint256[2] calldata _taSignature, uint256[] calldata _operatorIds) external{
        emit dummy(5);
    }

    /**
     * @dev Store the cid mapping in variable
     * @param cid to store
     */
     
    function storeCid(string memory cid) public {
        number += 1;
        cidMap[number] = cid;
        Model memory newModel = Model(number, cid, msg.sender, true);
        models.push(newModel);

        emit modelUploaded(cid, msg.sender);
    }

    /**
     * @dev Retrieve the CID value 
     * @return value of 'cid' based on the taskID
     */
     
    function retrieveCid(uint256 taskId) public view returns (string memory){
        return cidMap[taskId];
    }

    /**
     * Function for contributors to contribute
     *
    */
    
    function contribute(uint256 taskId) public {
        //Update the contributor address with their task
        contributorMap[msg.sender].push(taskId);
    }

    function contributionValidate(uint256 taskId, address contributor, bool valid) public {
        contributionApprovalMap[contributor][taskId] = valid;
    }

    function rewardSettlement(uint256 taskId, address contributor, uint256 reward) public {
        //Do the rewards get settled here? Not sure yet.
        //Placeholder to distribute rewards upon checking.
    }
}
