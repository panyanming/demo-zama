# 🚀 FHEVM Voting DApp Deployment Guide

This guide will walk you through deploying and testing the FHEVM Privacy Voting DApp.

## 📋 Prerequisites

### Required Software
- **Node.js** >= 16.0.0
- **npm** or **yarn**
- **Git**
- **MetaMask** browser extension

### Required Accounts
- **Zama Devnet** wallet with test tokens
- **GitHub** account (for cloning)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd fhevm-voting-dapp
```

### 2. Install Dependencies
```bash
# Install contract dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit the .env file with your configuration
nano .env
```

Required environment variables:
```env
# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Zama Devnet RPC URL
ZAMA_RPC_URL=https://devnet.zama.ai/

# Optional: Gas reporting
REPORT_GAS=false
```

## 🌐 Network Configuration

### Add Zama Devnet to MetaMask

1. Open MetaMask
2. Click on network dropdown
3. Select "Add Network"
4. Enter the following details:

```
Network Name: Zama Devnet
RPC URL: https://devnet.zama.ai/
Chain ID: 8009
Currency Symbol: ETH
Block Explorer: https://main.explorer.zama.ai/
```

### Get Test Tokens

1. Visit the [Zama Faucet](https://faucet.zama.ai/)
2. Connect your MetaMask wallet
3. Request test tokens
4. Wait for confirmation

## 📦 Smart Contract Deployment

### 1. Compile Contracts
```bash
npx hardhat compile
```

### 2. Run Tests (Optional)
```bash
npx hardhat test
```

### 3. Deploy to Zama Devnet
```bash
npx hardhat run scripts/deploy.js --network zama
```

Expected output:
```
🚀 Starting FHEVM Voting DApp deployment...
📝 Deploying contracts with account: 0x...
💰 Account balance: 1.0 ETH
📦 Deploying VotingFactory contract...
✅ VotingFactory deployed to: 0x...
🗳️ Creating sample voting...
🏛️ Sample voting contract deployed to: 0x...
💾 Deployment info saved to: deployments/zama-1234567890.json
🌐 Frontend environment file created: frontend/.env.local
🎉 Deployment completed successfully!
```

### 4. Verify Deployment
The deployment script will automatically:
- Save deployment information to `deployments/` folder
- Create frontend environment file
- Display contract addresses and gas usage

## 🖥️ Frontend Deployment

### 1. Start Development Server
```bash
cd frontend
npm start
```

The application will open at `http://localhost:3000`

### 2. Production Build
```bash
cd frontend
npm run build
```

### 3. Deploy to Hosting Service

#### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

#### Netlify Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod --dir=build
```

## 🧪 Testing the DApp

### 1. Connect Wallet
1. Open the DApp in your browser
2. Click "Connect Wallet"
3. Approve MetaMask connection
4. Ensure you're on Zama Devnet

### 2. Create a Voting
1. Click "Create New Voting"
2. Fill in voting details:
   - Title: "Test Privacy Vote"
   - Description: "Testing FHEVM privacy features"
   - Options: ["Option A", "Option B", "Option C"]
   - Start/End times
3. Click "Create Voting"
4. Confirm transaction in MetaMask

### 3. Authorize Voters
1. Go to your created voting
2. Click "Manage Voters"
3. Add voter addresses
4. Confirm authorization transactions

### 4. Cast Private Votes
1. Switch to authorized voter account
2. Navigate to the voting
3. Select your choice
4. Click "Cast Vote"
5. Confirm the encrypted transaction

### 5. View Results
1. Wait for voting to end
2. As voting creator, click "Request Results"
3. Wait for decryption process
4. View final results

## 🔧 Troubleshooting

### Common Issues

#### 1. "FHEVM instance not initialized"
**Solution**: Ensure you're connected to Zama Devnet and have sufficient balance.

#### 2. "Transaction failed"
**Possible causes**:
- Insufficient gas
- Wrong network
- Contract not deployed
- Invalid encrypted input

**Solutions**:
- Check gas settings
- Verify network connection
- Confirm contract addresses
- Retry with fresh encryption

#### 3. "Privacy features not loading"
**Solution**: 
- Refresh the page
- Clear browser cache
- Check network connectivity
- Verify FHEVM public key endpoint

#### 4. "Voting not found"
**Solution**:
- Verify contract address
- Check if voting was created successfully
- Ensure you're on the correct network

### Debug Mode

Enable debug logging:
```bash
# In frontend/.env.local
REACT_APP_DEBUG=true
```

Check browser console for detailed error messages.

## 📊 Performance Optimization

### Gas Optimization
- Use batch operations for multiple voters
- Optimize voting option count
- Consider voting duration

### Frontend Optimization
- Enable React production build
- Use CDN for static assets
- Implement lazy loading

### FHEVM Optimization
- Cache FHEVM instance
- Batch encryption operations
- Optimize proof generation

## 🔒 Security Considerations

### Smart Contract Security
- Contracts are audited for common vulnerabilities
- Use OpenZeppelin security patterns
- Implement proper access controls

### Frontend Security
- Validate all user inputs
- Sanitize data before encryption
- Use secure communication channels

### Privacy Protection
- Votes are encrypted end-to-end
- No plaintext vote data stored
- Decryption only after voting ends

## 📈 Monitoring and Analytics

### Contract Events
Monitor these events for system health:
- `VotingContractCreated`
- `VoteCast`
- `VotingEnded`
- `ResultsRevealed`

### Frontend Analytics
Track user interactions:
- Wallet connections
- Voting participation
- Error rates
- Performance metrics

## 🆘 Support

### Documentation
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama Network](https://zama.ai/)
- [Hardhat Documentation](https://hardhat.org/docs)

### Community
- [Zama Discord](https://discord.gg/zama)
- [GitHub Issues](https://github.com/zama-ai/fhevm/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/fhevm)

### Emergency Contacts
For critical issues:
- Create GitHub issue with "urgent" label
- Contact Zama team on Discord
- Check status page for network issues

---

## 🎉 Congratulations!

You have successfully deployed and tested the FHEVM Privacy Voting DApp! 

Your deployment includes:
- ✅ Privacy-preserving voting contracts
- ✅ Modern React frontend
- ✅ Complete FHEVM integration
- ✅ Production-ready configuration

Next steps:
1. Customize the UI for your use case
2. Add additional voting features
3. Implement governance mechanisms
4. Scale to production usage

Happy voting! 🗳️🔐
