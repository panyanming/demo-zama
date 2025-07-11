// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./PrivateVoting.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VotingFactory
 * @dev Factory contract to create and manage multiple private voting contracts
 */
contract VotingFactory is Ownable, ReentrancyGuard {
    
    // Structure to store voting contract information
    struct VotingContract {
        address contractAddress;
        address creator;
        string title;
        uint256 createdAt;
        bool isActive;
    }

    // Array to store all voting contracts
    VotingContract[] public votingContracts;
    
    // Mapping from creator to their voting contracts
    mapping(address => uint256[]) public creatorToVotings;
    
    // Mapping to check if an address is a valid voting contract
    mapping(address => bool) public isValidVotingContract;

    // Events
    event VotingContractCreated(
        address indexed contractAddress,
        address indexed creator,
        string title,
        uint256 timestamp
    );
    
    event VotingContractDeactivated(
        address indexed contractAddress,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Create a new private voting contract
     * @param _title The title of the voting
     * @param _description Description of the voting
     * @param _options Array of voting options
     * @param _startTime When voting starts (timestamp)
     * @param _endTime When voting ends (timestamp)
     * @return The address of the created voting contract
     */
    function createVoting(
        string memory _title,
        string memory _description,
        string[] memory _options,
        uint256 _startTime,
        uint256 _endTime
    ) external nonReentrant returns (address) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_options.length >= 2, "At least 2 options required");
        require(_startTime < _endTime, "Invalid time range");

        // Create new voting contract
        PrivateVoting newVoting = new PrivateVoting(
            _title,
            _description,
            _options,
            _startTime,
            _endTime
        );

        address votingAddress = address(newVoting);

        // Transfer ownership to the creator
        newVoting.transferOwnership(msg.sender);

        // Store voting contract information
        VotingContract memory votingContract = VotingContract({
            contractAddress: votingAddress,
            creator: msg.sender,
            title: _title,
            createdAt: block.timestamp,
            isActive: true
        });

        votingContracts.push(votingContract);
        uint256 votingIndex = votingContracts.length - 1;
        
        creatorToVotings[msg.sender].push(votingIndex);
        isValidVotingContract[votingAddress] = true;

        emit VotingContractCreated(votingAddress, msg.sender, _title, block.timestamp);

        return votingAddress;
    }

    /**
     * @dev Deactivate a voting contract (only creator or owner)
     * @param _votingAddress The address of the voting contract to deactivate
     */
    function deactivateVoting(address _votingAddress) external {
        require(isValidVotingContract[_votingAddress], "Invalid voting contract");
        
        // Find the voting contract
        uint256 votingIndex = findVotingIndex(_votingAddress);
        require(votingIndex < votingContracts.length, "Voting not found");
        
        VotingContract storage voting = votingContracts[votingIndex];
        require(
            voting.creator == msg.sender || owner() == msg.sender,
            "Not authorized to deactivate"
        );
        require(voting.isActive, "Voting already deactivated");

        voting.isActive = false;
        emit VotingContractDeactivated(_votingAddress, block.timestamp);
    }

    /**
     * @dev Get all voting contracts
     * @return Array of all voting contracts
     */
    function getAllVotings() external view returns (VotingContract[] memory) {
        return votingContracts;
    }

    /**
     * @dev Get active voting contracts
     * @return Array of active voting contracts
     */
    function getActiveVotings() external view returns (VotingContract[] memory) {
        uint256 activeCount = 0;
        
        // Count active votings
        for (uint256 i = 0; i < votingContracts.length; i++) {
            if (votingContracts[i].isActive) {
                activeCount++;
            }
        }

        // Create array of active votings
        VotingContract[] memory activeVotings = new VotingContract[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < votingContracts.length; i++) {
            if (votingContracts[i].isActive) {
                activeVotings[currentIndex] = votingContracts[i];
                currentIndex++;
            }
        }

        return activeVotings;
    }

    /**
     * @dev Get voting contracts created by a specific address
     * @param _creator The creator's address
     * @return Array of voting contracts created by the address
     */
    function getVotingsByCreator(address _creator) external view returns (VotingContract[] memory) {
        uint256[] memory votingIndices = creatorToVotings[_creator];
        VotingContract[] memory creatorVotings = new VotingContract[](votingIndices.length);

        for (uint256 i = 0; i < votingIndices.length; i++) {
            creatorVotings[i] = votingContracts[votingIndices[i]];
        }

        return creatorVotings;
    }

    /**
     * @dev Get voting contract by address
     * @param _votingAddress The voting contract address
     * @return The voting contract information
     */
    function getVotingByAddress(address _votingAddress) external view returns (VotingContract memory) {
        require(isValidVotingContract[_votingAddress], "Invalid voting contract");
        
        uint256 votingIndex = findVotingIndex(_votingAddress);
        require(votingIndex < votingContracts.length, "Voting not found");
        
        return votingContracts[votingIndex];
    }

    /**
     * @dev Get total number of voting contracts
     * @return The total count
     */
    function getTotalVotingsCount() external view returns (uint256) {
        return votingContracts.length;
    }

    /**
     * @dev Get active voting contracts count
     * @return The active count
     */
    function getActiveVotingsCount() external view returns (uint256) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < votingContracts.length; i++) {
            if (votingContracts[i].isActive) {
                activeCount++;
            }
        }
        return activeCount;
    }

    /**
     * @dev Get voting contracts created by a creator count
     * @param _creator The creator's address
     * @return The count of votings created by the address
     */
    function getCreatorVotingsCount(address _creator) external view returns (uint256) {
        return creatorToVotings[_creator].length;
    }

    /**
     * @dev Check if a voting contract exists and is valid
     * @param _votingAddress The voting contract address
     * @return True if valid, false otherwise
     */
    function isValidVoting(address _votingAddress) external view returns (bool) {
        return isValidVotingContract[_votingAddress];
    }

    /**
     * @dev Internal function to find voting index by address
     * @param _votingAddress The voting contract address
     * @return The index in the votingContracts array
     */
    function findVotingIndex(address _votingAddress) internal view returns (uint256) {
        for (uint256 i = 0; i < votingContracts.length; i++) {
            if (votingContracts[i].contractAddress == _votingAddress) {
                return i;
            }
        }
        revert("Voting contract not found");
    }

    /**
     * @dev Get paginated voting contracts
     * @param _offset Starting index
     * @param _limit Number of contracts to return
     * @return Array of voting contracts and total count
     */
    function getPaginatedVotings(
        uint256 _offset,
        uint256 _limit
    ) external view returns (VotingContract[] memory, uint256) {
        require(_limit > 0, "Limit must be greater than 0");
        require(_offset < votingContracts.length, "Offset out of bounds");

        uint256 end = _offset + _limit;
        if (end > votingContracts.length) {
            end = votingContracts.length;
        }

        uint256 length = end - _offset;
        VotingContract[] memory paginatedVotings = new VotingContract[](length);

        for (uint256 i = 0; i < length; i++) {
            paginatedVotings[i] = votingContracts[_offset + i];
        }

        return (paginatedVotings, votingContracts.length);
    }

    /**
     * @dev Emergency function to update a voting contract's active status (only owner)
     * @param _votingAddress The voting contract address
     * @param _isActive The new active status
     */
    function emergencyUpdateVotingStatus(
        address _votingAddress,
        bool _isActive
    ) external onlyOwner {
        require(isValidVotingContract[_votingAddress], "Invalid voting contract");
        
        uint256 votingIndex = findVotingIndex(_votingAddress);
        votingContracts[votingIndex].isActive = _isActive;
        
        if (!_isActive) {
            emit VotingContractDeactivated(_votingAddress, block.timestamp);
        }
    }
}
