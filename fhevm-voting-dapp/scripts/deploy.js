const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting FHEVM Voting DApp deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.01")) {
    console.warn("⚠️  Warning: Low balance. Make sure you have enough funds for deployment.");
  }

  try {
    // Deploy VotingFactory contract
    console.log("\n📦 Deploying VotingFactory contract...");
    const VotingFactory = await ethers.getContractFactory("VotingFactory");
    const votingFactory = await VotingFactory.deploy();
    await votingFactory.waitForDeployment();
    
    const factoryAddress = await votingFactory.getAddress();
    console.log("✅ VotingFactory deployed to:", factoryAddress);

    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    const totalVotings = await votingFactory.getTotalVotingsCount();
    console.log("📊 Total votings count:", totalVotings.toString());

    // Create a sample voting for testing
    console.log("\n🗳️  Creating sample voting...");
    const currentTime = Math.floor(Date.now() / 1000);
    const startTime = currentTime + 60; // Start in 1 minute
    const endTime = currentTime + 3600; // End in 1 hour

    const sampleTitle = "Sample Privacy Vote";
    const sampleDescription = "This is a sample voting to test the FHEVM privacy features";
    const sampleOptions = ["Option A", "Option B", "Option C"];

    const createTx = await votingFactory.createVoting(
      sampleTitle,
      sampleDescription,
      sampleOptions,
      startTime,
      endTime
    );
    
    const receipt = await createTx.wait();
    console.log("📝 Sample voting creation transaction:", receipt.hash);

    // Get the created voting contract address
    const votingContracts = await votingFactory.getAllVotings();
    const sampleVotingAddress = votingContracts[0].contractAddress;
    console.log("🏛️  Sample voting contract deployed to:", sampleVotingAddress);

    // Save deployment information
    const deploymentInfo = {
      network: hre.network.name,
      chainId: (await ethers.provider.getNetwork()).chainId.toString(),
      deployer: deployer.address,
      contracts: {
        VotingFactory: {
          address: factoryAddress,
          deploymentHash: votingFactory.deploymentTransaction().hash
        },
        SampleVoting: {
          address: sampleVotingAddress,
          title: sampleTitle,
          startTime: startTime,
          endTime: endTime
        }
      },
      deployedAt: new Date().toISOString(),
      gasUsed: {
        factory: (await ethers.provider.getTransactionReceipt(
          votingFactory.deploymentTransaction().hash
        )).gasUsed.toString(),
        sampleVoting: receipt.gasUsed.toString()
      }
    };

    // Save to file
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(
      deploymentsDir,
      `${hre.network.name}-${Date.now()}.json`
    );
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info saved to:", deploymentFile);

    // Save latest deployment for frontend
    const latestFile = path.join(deploymentsDir, "latest.json");
    fs.writeFileSync(latestFile, JSON.stringify(deploymentInfo, null, 2));

    // Create environment file for frontend
    const frontendEnv = `# Auto-generated deployment configuration
REACT_APP_VOTING_FACTORY_ADDRESS=${factoryAddress}
REACT_APP_SAMPLE_VOTING_ADDRESS=${sampleVotingAddress}
REACT_APP_CHAIN_ID=${deploymentInfo.chainId}
REACT_APP_NETWORK_NAME=${hre.network.name}
REACT_APP_DEPLOYER_ADDRESS=${deployer.address}
`;

    const frontendEnvFile = path.join(__dirname, "..", "frontend", ".env.local");
    fs.writeFileSync(frontendEnvFile, frontendEnv);
    console.log("🌐 Frontend environment file created:", frontendEnvFile);

    // Display summary
    console.log("\n🎉 Deployment completed successfully!");
    console.log("=" * 50);
    console.log("📋 Deployment Summary:");
    console.log("  Network:", hre.network.name);
    console.log("  Chain ID:", deploymentInfo.chainId);
    console.log("  VotingFactory:", factoryAddress);
    console.log("  Sample Voting:", sampleVotingAddress);
    console.log("  Deployer:", deployer.address);
    console.log("  Gas Used (Factory):", deploymentInfo.gasUsed.factory);
    console.log("  Gas Used (Sample):", deploymentInfo.gasUsed.sampleVoting);
    console.log("=" * 50);

    console.log("\n📖 Next Steps:");
    console.log("1. Start the frontend: cd frontend && npm start");
    console.log("2. Connect MetaMask to the network");
    console.log("3. Add the contract addresses to your frontend");
    console.log("4. Test the voting functionality");

    if (hre.network.name === "zama") {
      console.log("\n🔗 Zama Network Links:");
      console.log("  Explorer: https://main.explorer.zama.ai/");
      console.log("  Faucet: https://faucet.zama.ai/");
      console.log("  Documentation: https://docs.zama.ai/fhevm");
    }

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Deployment script failed:", error);
    process.exit(1);
  });
