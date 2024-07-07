pragma solidity ^0.8.0;

contract VaultSmartContract {

    address public owner;
    uint256 public currentModelScore;
    mapping(address => bool) public attestors;
    mapping(address => uint256) public stakes;

    event ModelUpdated(address newModel, uint256 newScore);
    event RewardsDistributed(uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function stake() public payable {
        stakes[msg.sender] += msg.value;
    }

    function registerAttestor(address attestor) public onlyOwner {
        attestors[attestor] = true;
    }

    function submitAttestation(uint256 newScore) public {
        require(attestors[msg.sender], "Only registered attestors can submit");
        if (newScore > currentModelScore) {
            currentModelScore = newScore;
            emit ModelUpdated(msg.sender, newScore);
        }
    }

    function compareAndUpdateModel(address newModel, uint256 newScore) public onlyOwner {

        if (newScore > currentModelScore) {
            currentModelScore = newScore;
            emit ModelUpdated(newModel, newScore);
        }

    }

    function distributeRewards(address[] memory recipients, uint256[] memory amounts) public onlyOwner {

        require(recipients.length == amounts.length, "Arrays must have same length");

        uint256 totalAmount = 0;

        for (uint i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(address(this).balance >= totalAmount, "Insufficient balance");

        for (uint i = 0; i < recipients.length; i++) {
            payable(recipients[i]).transfer(amounts[i]);
        }
        emit RewardsDistributed(totalAmount);
    }
}