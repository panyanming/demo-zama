const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PrivateVoting", function () {
  let PrivateVoting;
  let privateVoting;
  let VotingFactory;
  let votingFactory;
  let owner;
  let voter1;
  let voter2;
  let voter3;
  let addrs;

  const votingTitle = "Test Privacy Voting";
  const votingDescription = "A test voting to verify FHEVM functionality";
  const votingOptions = ["Option A", "Option B", "Option C"];
  
  beforeEach(async function () {
    // Get signers
    [owner, voter1, voter2, voter3, ...addrs] = await ethers.getSigners();

    // Deploy VotingFactory
    VotingFactory = await ethers.getContractFactory("VotingFactory");
    votingFactory = await VotingFactory.deploy();
    await votingFactory.waitForDeployment();

    // Set voting times
    const currentTime = await time.latest();
    const startTime = currentTime + 60; // Start in 1 minute
    const endTime = currentTime + 3600; // End in 1 hour

    // Create a voting through factory
    const createTx = await votingFactory.createVoting(
      votingTitle,
      votingDescription,
      votingOptions,
      startTime,
      endTime
    );
    
    const receipt = await createTx.wait();
    
    // Get the created voting contract address from events
    const event = receipt.logs.find(log => 
      log.fragment && log.fragment.name === 'VotingContractCreated'
    );
    const votingAddress = event.args.contractAddress;

    // Get the PrivateVoting contract instance
    PrivateVoting = await ethers.getContractFactory("PrivateVoting");
    privateVoting = PrivateVoting.attach(votingAddress);
  });

  describe("Deployment", function () {
    it("Should set the correct voting information", async function () {
      const votingInfo = await privateVoting.getVotingInfo();
      
      expect(votingInfo.title).to.equal(votingTitle);
      expect(votingInfo.description).to.equal(votingDescription);
      expect(votingInfo.options).to.deep.equal(votingOptions);
      expect(votingInfo.totalVoters).to.equal(0);
      expect(votingInfo.resultsRequested).to.equal(false);
    });

    it("Should authorize the owner as a voter", async function () {
      expect(await privateVoting.authorizedVoters(owner.address)).to.equal(true);
    });

    it("Should have correct initial state", async function () {
      const votingInfo = await privateVoting.getVotingInfo();
      expect(votingInfo.state).to.equal(0); // NotStarted
    });
  });

  describe("Voter Authorization", function () {
    it("Should allow owner to authorize voters", async function () {
      await privateVoting.authorizeVoter(voter1.address);
      expect(await privateVoting.authorizedVoters(voter1.address)).to.equal(true);
    });

    it("Should allow owner to authorize multiple voters", async function () {
      const voters = [voter1.address, voter2.address, voter3.address];
      await privateVoting.authorizeVoters(voters);
      
      for (const voter of voters) {
        expect(await privateVoting.authorizedVoters(voter)).to.equal(true);
      }
    });

    it("Should allow owner to revoke voter authorization", async function () {
      await privateVoting.authorizeVoter(voter1.address);
      expect(await privateVoting.authorizedVoters(voter1.address)).to.equal(true);
      
      await privateVoting.revokeVoter(voter1.address);
      expect(await privateVoting.authorizedVoters(voter1.address)).to.equal(false);
    });

    it("Should not allow non-owner to authorize voters", async function () {
      await expect(
        privateVoting.connect(voter1).authorizeVoter(voter2.address)
      ).to.be.revertedWithCustomError(privateVoting, "OwnableUnauthorizedAccount");
    });

    it("Should not allow authorizing zero address", async function () {
      await expect(
        privateVoting.authorizeVoter(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("Voting State Management", function () {
    it("Should start voting when time arrives", async function () {
      const votingInfo = await privateVoting.getVotingInfo();
      
      // Fast forward to start time
      await time.increaseTo(votingInfo.startTime);
      
      // Call startVoting
      await privateVoting.startVoting();
      
      const updatedInfo = await privateVoting.getVotingInfo();
      expect(updatedInfo.state).to.equal(1); // Active
    });

    it("Should not allow starting voting before start time", async function () {
      await expect(
        privateVoting.startVoting()
      ).to.be.revertedWith("Start time not reached");
    });

    it("Should allow owner to end voting manually", async function () {
      const votingInfo = await privateVoting.getVotingInfo();
      
      // Start voting first
      await time.increaseTo(votingInfo.startTime);
      await privateVoting.startVoting();
      
      // End voting
      await privateVoting.endVoting();
      
      const updatedInfo = await privateVoting.getVotingInfo();
      expect(updatedInfo.state).to.equal(2); // Ended
    });

    it("Should check if voting is active correctly", async function () {
      const votingInfo = await privateVoting.getVotingInfo();
      
      // Before start time
      expect(await privateVoting.isVotingActive()).to.equal(false);
      
      // After start time
      await time.increaseTo(votingInfo.startTime);
      await privateVoting.startVoting();
      expect(await privateVoting.isVotingActive()).to.equal(true);
      
      // After end time
      await time.increaseTo(votingInfo.endTime + 1);
      expect(await privateVoting.isVotingActive()).to.equal(false);
    });
  });

  describe("Voting Process", function () {
    beforeEach(async function () {
      // Authorize voters and start voting
      await privateVoting.authorizeVoters([voter1.address, voter2.address, voter3.address]);
      
      const votingInfo = await privateVoting.getVotingInfo();
      await time.increaseTo(votingInfo.startTime);
      await privateVoting.startVoting();
    });

    it("Should not allow voting with mock encrypted data (placeholder test)", async function () {
      // Note: This is a placeholder test since we can't easily test FHEVM encryption in unit tests
      // In a real test environment with FHEVM, you would use actual encrypted inputs
      
      const mockEncryptedVote = ethers.randomBytes(32);
      const mockInputProof = ethers.randomBytes(64);
      
      // This test verifies the contract structure, not the actual encryption
      // Real FHEVM testing would require the FHEVM test environment
      await expect(
        privateVoting.connect(voter1).vote(mockEncryptedVote, mockInputProof)
      ).to.be.reverted; // Will revert due to invalid TFHE operations in test environment
    });

    it("Should track voting status correctly", async function () {
      expect(await privateVoting.hasVoted(voter1.address)).to.equal(false);
      expect(await privateVoting.authorizedVoters(voter1.address)).to.equal(true);
    });

    it("Should not allow unauthorized voters to vote", async function () {
      const unauthorizedVoter = addrs[0];
      const mockEncryptedVote = ethers.randomBytes(32);
      const mockInputProof = ethers.randomBytes(64);
      
      await expect(
        privateVoting.connect(unauthorizedVoter).vote(mockEncryptedVote, mockInputProof)
      ).to.be.revertedWith("Not authorized to vote");
    });

    it("Should not allow voting when voting is not active", async function () {
      // End voting
      await privateVoting.endVoting();
      
      const mockEncryptedVote = ethers.randomBytes(32);
      const mockInputProof = ethers.randomBytes(64);
      
      await expect(
        privateVoting.connect(voter1).vote(mockEncryptedVote, mockInputProof)
      ).to.be.revertedWith("Voting is not active");
    });
  });

  describe("Results Management", function () {
    beforeEach(async function () {
      const votingInfo = await privateVoting.getVotingInfo();
      await time.increaseTo(votingInfo.endTime + 1);
    });

    it("Should allow requesting results after voting ends", async function () {
      await expect(
        privateVoting.requestResults()
      ).to.not.be.reverted;
      
      const votingInfo = await privateVoting.getVotingInfo();
      expect(votingInfo.resultsRequested).to.equal(true);
    });

    it("Should not allow requesting results before voting ends", async function () {
      const votingInfo = await privateVoting.getVotingInfo();
      await time.increaseTo(votingInfo.startTime);
      await privateVoting.startVoting();
      
      await expect(
        privateVoting.requestResults()
      ).to.be.revertedWith("Voting is still active");
    });

    it("Should not allow non-owner to request results", async function () {
      await expect(
        privateVoting.connect(voter1).requestResults()
      ).to.be.revertedWithCustomError(privateVoting, "OwnableUnauthorizedAccount");
    });

    it("Should not allow requesting results twice", async function () {
      await privateVoting.requestResults();
      
      await expect(
        privateVoting.requestResults()
      ).to.be.revertedWith("Results already requested");
    });
  });

  describe("View Functions", function () {
    it("Should return correct voting options", async function () {
      const options = await privateVoting.getOptions();
      expect(options).to.deep.equal(votingOptions);
    });

    it("Should return current state correctly", async function () {
      const currentState = await privateVoting.getCurrentState();
      expect(currentState).to.equal(0); // NotStarted initially
    });

    it("Should return voting info correctly", async function () {
      const votingInfo = await privateVoting.getVotingInfo();
      expect(votingInfo.title).to.equal(votingTitle);
      expect(votingInfo.description).to.equal(votingDescription);
      expect(votingInfo.options).to.deep.equal(votingOptions);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle voting creation with minimum options", async function () {
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 3600;
      
      await expect(
        votingFactory.createVoting(
          "Minimum Options Test",
          "Test with minimum options",
          ["Yes", "No"],
          startTime,
          endTime
        )
      ).to.not.be.reverted;
    });

    it("Should reject voting creation with insufficient options", async function () {
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 3600;
      
      await expect(
        votingFactory.createVoting(
          "Invalid Test",
          "Test with one option",
          ["Only Option"],
          startTime,
          endTime
        )
      ).to.be.revertedWith("At least 2 options required");
    });

    it("Should reject voting creation with too many options", async function () {
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 3600;
      
      const tooManyOptions = Array.from({ length: 11 }, (_, i) => `Option ${i + 1}`);
      
      await expect(
        votingFactory.createVoting(
          "Too Many Options Test",
          "Test with too many options",
          tooManyOptions,
          startTime,
          endTime
        )
      ).to.be.revertedWith("Maximum 10 options allowed");
    });

    it("Should reject voting creation with invalid time range", async function () {
      const currentTime = await time.latest();
      const startTime = currentTime + 3600;
      const endTime = currentTime + 60; // End before start
      
      await expect(
        votingFactory.createVoting(
          "Invalid Time Test",
          "Test with invalid time range",
          ["Option A", "Option B"],
          startTime,
          endTime
        )
      ).to.be.revertedWith("Invalid time range");
    });
  });
});
