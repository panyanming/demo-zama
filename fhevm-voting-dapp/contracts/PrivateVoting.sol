// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PrivateVoting
 * @dev A privacy-preserving voting contract using FHEVM
 * @notice This contract allows users to vote privately using homomorphic encryption
 */
contract PrivateVoting is Ownable, ReentrancyGuard, GatewayCaller {
    using TFHE for euint32;
    using TFHE for ebool;

    // Voting states
    enum VotingState {
        NotStarted,
        Active,
        Ended,
        ResultsRevealed
    }

    // Voting information structure
    struct VotingInfo {
        string title;
        string description;
        string[] options;
        uint256 startTime;
        uint256 endTime;
        VotingState state;
        uint256 totalVoters;
        bool resultsRequested;
    }

    // Encrypted vote counts for each option
    mapping(uint256 => euint32) private encryptedVoteCounts;
    
    // Track if an address has voted
    mapping(address => bool) public hasVoted;
    
    // Authorized voters
    mapping(address => bool) public authorizedVoters;
    
    // Voting information
    VotingInfo public votingInfo;
    
    // Decrypted results (only available after voting ends)
    mapping(uint256 => uint32) public decryptedResults;
    bool public resultsDecrypted = false;

    // Events
    event VotingCreated(string title, uint256 startTime, uint256 endTime);
    event VoteCast(address indexed voter, uint256 timestamp);
    event VotingEnded(uint256 timestamp);
    event VoterAuthorized(address indexed voter);
    event VoterRevoked(address indexed voter);
    event ResultsRequested(uint256 timestamp);
    event ResultsRevealed(uint256[] results);

    // Modifiers
    modifier onlyDuringVoting() {
        require(
            block.timestamp >= votingInfo.startTime && 
            block.timestamp <= votingInfo.endTime,
            "Voting is not active"
        );
        require(votingInfo.state == VotingState.Active, "Voting is not active");
        _;
    }

    modifier onlyAuthorizedVoter() {
        require(authorizedVoters[msg.sender], "Not authorized to vote");
        _;
    }

    modifier hasNotVoted() {
        require(!hasVoted[msg.sender], "Already voted");
        _;
    }

    modifier onlyAfterVoting() {
        require(
            block.timestamp > votingInfo.endTime || 
            votingInfo.state == VotingState.Ended,
            "Voting is still active"
        );
        _;
    }

    /**
     * @dev Constructor to initialize the voting contract
     * @param _title The title of the voting
     * @param _description Description of the voting
     * @param _options Array of voting options
     * @param _startTime When voting starts (timestamp)
     * @param _endTime When voting ends (timestamp)
     */
    constructor(
        string memory _title,
        string memory _description,
        string[] memory _options,
        uint256 _startTime,
        uint256 _endTime
    ) Ownable(msg.sender) {
        require(_options.length >= 2, "At least 2 options required");
        require(_options.length <= 10, "Maximum 10 options allowed");
        require(_startTime < _endTime, "Invalid time range");
        require(_endTime > block.timestamp, "End time must be in future");

        votingInfo = VotingInfo({
            title: _title,
            description: _description,
            options: _options,
            startTime: _startTime,
            endTime: _endTime,
            state: _startTime <= block.timestamp ? VotingState.Active : VotingState.NotStarted,
            totalVoters: 0,
            resultsRequested: false
        });

        // Initialize encrypted vote counts to 0
        for (uint256 i = 0; i < _options.length; i++) {
            encryptedVoteCounts[i] = TFHE.asEuint32(0);
        }

        // Authorize the contract owner to vote
        authorizedVoters[msg.sender] = true;

        emit VotingCreated(_title, _startTime, _endTime);
    }

    /**
     * @dev Cast a private vote
     * @param encryptedVote Encrypted vote option (0-based index)
     * @param inputProof Proof for the encrypted input
     */
    function vote(
        einput encryptedVote,
        bytes calldata inputProof
    ) external onlyDuringVoting onlyAuthorizedVoter hasNotVoted nonReentrant {
        // Convert encrypted input to euint32
        euint32 vote = TFHE.asEuint32(encryptedVote, inputProof);
        
        // Verify vote is within valid range (0 to options.length - 1)
        euint32 maxOption = TFHE.asEuint32(uint32(votingInfo.options.length - 1));
        ebool isValidVote = TFHE.le(vote, maxOption);
        require(TFHE.decrypt(isValidVote), "Invalid vote option");

        // Update vote counts for each option
        for (uint256 i = 0; i < votingInfo.options.length; i++) {
            euint32 optionIndex = TFHE.asEuint32(uint32(i));
            ebool isThisOption = TFHE.eq(vote, optionIndex);
            euint32 voteIncrement = TFHE.select(isThisOption, TFHE.asEuint32(1), TFHE.asEuint32(0));
            encryptedVoteCounts[i] = TFHE.add(encryptedVoteCounts[i], voteIncrement);
        }

        // Mark voter as having voted
        hasVoted[msg.sender] = true;
        votingInfo.totalVoters++;

        emit VoteCast(msg.sender, block.timestamp);
    }

    /**
     * @dev Authorize a voter
     * @param voter Address to authorize
     */
    function authorizeVoter(address voter) external onlyOwner {
        require(voter != address(0), "Invalid address");
        authorizedVoters[voter] = true;
        emit VoterAuthorized(voter);
    }

    /**
     * @dev Authorize multiple voters
     * @param voters Array of addresses to authorize
     */
    function authorizeVoters(address[] calldata voters) external onlyOwner {
        for (uint256 i = 0; i < voters.length; i++) {
            require(voters[i] != address(0), "Invalid address");
            authorizedVoters[voters[i]] = true;
            emit VoterAuthorized(voters[i]);
        }
    }

    /**
     * @dev Revoke voter authorization
     * @param voter Address to revoke
     */
    function revokeVoter(address voter) external onlyOwner {
        authorizedVoters[voter] = false;
        emit VoterRevoked(voter);
    }

    /**
     * @dev End voting manually (only owner)
     */
    function endVoting() external onlyOwner {
        require(votingInfo.state == VotingState.Active, "Voting not active");
        votingInfo.state = VotingState.Ended;
        emit VotingEnded(block.timestamp);
    }

    /**
     * @dev Start voting if not started yet
     */
    function startVoting() external onlyOwner {
        require(votingInfo.state == VotingState.NotStarted, "Voting already started");
        require(block.timestamp >= votingInfo.startTime, "Start time not reached");
        votingInfo.state = VotingState.Active;
    }

    /**
     * @dev Request decryption of results (only after voting ends)
     */
    function requestResults() external onlyOwner onlyAfterVoting {
        require(!votingInfo.resultsRequested, "Results already requested");
        
        votingInfo.resultsRequested = true;
        votingInfo.state = VotingState.Ended;
        
        // Request decryption for all vote counts
        for (uint256 i = 0; i < votingInfo.options.length; i++) {
            TFHE.allowThis(encryptedVoteCounts[i]);
            uint256[] memory cts = new uint256[](1);
            cts[0] = Gateway.toUint256(encryptedVoteCounts[i]);
            Gateway.requestDecryption(cts, this.callbackResults.selector, 0, block.timestamp + 100, false);
        }
        
        emit ResultsRequested(block.timestamp);
    }

    /**
     * @dev Callback function for decrypted results
     * @param requestId The request ID
     * @param decryptedInput The decrypted values
     */
    function callbackResults(uint256 requestId, uint256[] memory decryptedInput) external onlyGateway {
        // Store decrypted results
        for (uint256 i = 0; i < decryptedInput.length && i < votingInfo.options.length; i++) {
            decryptedResults[i] = uint32(decryptedInput[i]);
        }
        
        resultsDecrypted = true;
        votingInfo.state = VotingState.ResultsRevealed;
        
        emit ResultsRevealed(decryptedInput);
    }

    /**
     * @dev Get encrypted vote count for an option (for authorized parties)
     * @param optionIndex The option index
     * @return The encrypted vote count
     */
    function getEncryptedVoteCount(uint256 optionIndex) external view returns (euint32) {
        require(optionIndex < votingInfo.options.length, "Invalid option index");
        return encryptedVoteCounts[optionIndex];
    }

    /**
     * @dev Get decrypted results (only available after decryption)
     * @return Array of vote counts for each option
     */
    function getResults() external view returns (uint32[] memory) {
        require(resultsDecrypted, "Results not yet decrypted");
        
        uint32[] memory results = new uint32[](votingInfo.options.length);
        for (uint256 i = 0; i < votingInfo.options.length; i++) {
            results[i] = decryptedResults[i];
        }
        return results;
    }

    /**
     * @dev Get voting information
     * @return The voting info struct
     */
    function getVotingInfo() external view returns (VotingInfo memory) {
        return votingInfo;
    }

    /**
     * @dev Get all voting options
     * @return Array of option strings
     */
    function getOptions() external view returns (string[] memory) {
        return votingInfo.options;
    }

    /**
     * @dev Check if voting is currently active
     * @return True if voting is active
     */
    function isVotingActive() external view returns (bool) {
        return votingInfo.state == VotingState.Active && 
               block.timestamp >= votingInfo.startTime && 
               block.timestamp <= votingInfo.endTime;
    }

    /**
     * @dev Get current voting state
     * @return The current voting state
     */
    function getCurrentState() external view returns (VotingState) {
        if (votingInfo.state == VotingState.NotStarted && block.timestamp >= votingInfo.startTime) {
            return VotingState.Active;
        }
        if (votingInfo.state == VotingState.Active && block.timestamp > votingInfo.endTime) {
            return VotingState.Ended;
        }
        return votingInfo.state;
    }
}
