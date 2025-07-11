const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Demo script to showcase FHEVM Voting DApp functionality
 * This script demonstrates the complete voting workflow
 */
async function main() {
  console.log("🎭 Starting FHEVM Voting DApp Demo...\n");

  // Get signers
  const [deployer, voter1, voter2, voter3, voter4] = await ethers.getSigners();
  
  console.log("👥 Demo Participants:");
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Voter 1:  ${voter1.address}`);
  console.log(`   Voter 2:  ${voter2.address}`);
  console.log(`   Voter 3:  ${voter3.address}`);
  console.log(`   Voter 4:  ${voter4.address}\n`);

  // Step 1: Deploy VotingFactory
  console.log("📦 Step 1: Deploying VotingFactory...");
  const VotingFactory = await ethers.getContractFactory("VotingFactory");
  const votingFactory = await VotingFactory.deploy();
  await votingFactory.waitForDeployment();
  
  const factoryAddress = await votingFactory.getAddress();
  console.log(`   ✅ VotingFactory deployed at: ${factoryAddress}\n`);

  // Step 2: Create a voting
  console.log("🗳️  Step 2: Creating a privacy voting...");
  const currentTime = await time.latest();
  const startTime = currentTime + 60; // Start in 1 minute
  const endTime = currentTime + 3600; // End in 1 hour

  const votingTitle = "FHEVM Demo: Choose Your Favorite Privacy Feature";
  const votingDescription = "Vote for your favorite FHEVM privacy feature in this demo";
  const votingOptions = [
    "Homomorphic Encryption",
    "Zero-Knowledge Proofs", 
    "Secure Multi-Party Computation",
    "Confidential Smart Contracts"
  ];

  const createTx = await votingFactory.createVoting(
    votingTitle,
    votingDescription,
    votingOptions,
    startTime,
    endTime
  );
  
  const receipt = await createTx.wait();
  const event = receipt.logs.find(log => 
    log.fragment && log.fragment.name === 'VotingContractCreated'
  );
  const votingAddress = event.args.contractAddress;
  
  console.log(`   ✅ Voting created at: ${votingAddress}`);
  console.log(`   📝 Title: ${votingTitle}`);
  console.log(`   📋 Options: ${votingOptions.join(', ')}`);
  console.log(`   ⏰ Duration: ${new Date(startTime * 1000).toLocaleString()} - ${new Date(endTime * 1000).toLocaleString()}\n`);

  // Get voting contract instance
  const PrivateVoting = await ethers.getContractFactory("PrivateVoting");
  const privateVoting = PrivateVoting.attach(votingAddress);

  // Step 3: Authorize voters
  console.log("👤 Step 3: Authorizing voters...");
  const voters = [voter1.address, voter2.address, voter3.address, voter4.address];
  await privateVoting.authorizeVoters(voters);
  
  console.log("   ✅ Authorized voters:");
  for (let i = 0; i < voters.length; i++) {
    const isAuthorized = await privateVoting.authorizedVoters(voters[i]);
    console.log(`      Voter ${i + 1}: ${voters[i]} - ${isAuthorized ? '✅ Authorized' : '❌ Not Authorized'}`);
  }
  console.log();

  // Step 4: Start voting
  console.log("🚀 Step 4: Starting the voting...");
  await time.increaseTo(startTime);
  await privateVoting.startVoting();
  
  const votingInfo = await privateVoting.getVotingInfo();
  console.log(`   ✅ Voting started! State: ${getStateName(votingInfo.state)}`);
  console.log(`   🔍 Is voting active: ${await privateVoting.isVotingActive()}\n`);

  // Step 5: Simulate voting (Note: In real FHEVM, votes would be encrypted)
  console.log("🗳️  Step 5: Simulating private voting...");
  console.log("   ⚠️  Note: In this demo, we simulate the voting process.");
  console.log("   🔐 In real FHEVM deployment, votes would be fully encrypted.\n");

  // Simulate vote casting by tracking intended votes
  const simulatedVotes = [
    { voter: "Voter 1", choice: 0, option: votingOptions[0] },
    { voter: "Voter 2", choice: 1, option: votingOptions[1] },
    { voter: "Voter 3", choice: 0, option: votingOptions[0] },
    { voter: "Voter 4", choice: 2, option: votingOptions[2] }
  ];

  console.log("   📊 Simulated voting results:");
  simulatedVotes.forEach((vote, index) => {
    console.log(`      ${vote.voter}: Selected "${vote.option}" (encrypted)`);
  });
  console.log();

  // In a real FHEVM environment, you would:
  // 1. Encrypt each vote using FHEVM
  // 2. Submit encrypted votes to the contract
  // 3. Contract would perform homomorphic addition on encrypted votes
  
  console.log("   🔐 Real FHEVM Voting Process:");
  console.log("      1. Each vote choice is encrypted using TFHE");
  console.log("      2. Encrypted votes are submitted to smart contract");
  console.log("      3. Contract performs homomorphic addition on ciphertexts");
  console.log("      4. Vote tallies remain encrypted until decryption");
  console.log("      5. No individual votes are ever revealed\n");

  // Step 6: Check voting status
  console.log("📈 Step 6: Checking voting status...");
  const updatedInfo = await privateVoting.getVotingInfo();
  console.log(`   📊 Total voters: ${updatedInfo.totalVoters}`);
  console.log(`   🏛️  Voting state: ${getStateName(updatedInfo.state)}`);
  console.log(`   ⏰ Time remaining: ${endTime - await time.latest()} seconds\n`);

  // Step 7: End voting and request results
  console.log("🏁 Step 7: Ending voting and requesting results...");
  await time.increaseTo(endTime + 1);
  
  // Check if voting automatically ended
  const finalState = await privateVoting.getCurrentState();
  console.log(`   ⏰ Voting time expired. Current state: ${getStateName(finalState)}`);
  
  // Request results decryption
  await privateVoting.requestResults();
  const finalInfo = await privateVoting.getVotingInfo();
  console.log(`   🔓 Results decryption requested: ${finalInfo.resultsRequested}`);
  console.log(`   📊 Final state: ${getStateName(finalInfo.state)}\n`);

  // Step 8: Display demo summary
  console.log("📋 Step 8: Demo Summary");
  console.log("=" * 50);
  console.log("🎯 What was demonstrated:");
  console.log("   ✅ Deployed FHEVM-compatible voting contracts");
  console.log("   ✅ Created privacy-preserving voting system");
  console.log("   ✅ Managed voter authorization");
  console.log("   ✅ Controlled voting lifecycle");
  console.log("   ✅ Simulated encrypted vote processing");
  console.log("   ✅ Demonstrated result decryption workflow\n");

  console.log("🔐 Privacy Features:");
  console.log("   • Vote choices encrypted with TFHE");
  console.log("   • Homomorphic computation on encrypted data");
  console.log("   • Zero-knowledge of individual votes");
  console.log("   • Verifiable but private results");
  console.log("   • No trusted third party required\n");

  console.log("🌐 Production Deployment:");
  console.log("   • Deploy to Zama Devnet for full FHEVM features");
  console.log("   • Use fhevmjs for client-side encryption");
  console.log("   • Integrate with React frontend");
  console.log("   • Enable real encrypted voting\n");

  console.log("📚 Next Steps:");
  console.log("   1. Deploy to Zama Devnet: npx hardhat run scripts/deploy.js --network zama");
  console.log("   2. Start frontend: cd frontend && npm start");
  console.log("   3. Test with MetaMask on Zama network");
  console.log("   4. Experience true privacy voting!\n");

  console.log("🎉 Demo completed successfully!");
  console.log("🔗 Learn more: https://docs.zama.ai/fhevm");
}

function getStateName(state) {
  const states = {
    0: "NotStarted",
    1: "Active", 
    2: "Ended",
    3: "ResultsRevealed"
  };
  return states[state] || "Unknown";
}

// Handle errors gracefully
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Demo failed:", error);
    process.exit(1);
  });
