import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';

// Components
import VotingCard from '../components/VotingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ConnectWallet from '../components/ConnectWallet';

// Hooks and Context
import { useWallet, useEthersProvider } from '../contexts/WalletContext';
import { useFHEVM } from '../contexts/FHEVMContext';

// Types and Config
import { VotingContract, VotingFilter } from '../types';
import { CONTRACT_ADDRESSES, VOTING_FACTORY_ABI, APP_CONFIG } from '../config';

const HomePage: React.FC = () => {
  const [votings, setVotings] = useState<VotingContract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<VotingFilter>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { wallet } = useWallet();
  const { getProvider } = useEthersProvider();
  const { instance: fhevmInstance, loading: fhevmLoading } = useFHEVM();

  useEffect(() => {
    loadVotings();
  }, [wallet.isConnected, filter]);

  const loadVotings = async () => {
    if (!wallet.isConnected) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const provider = getProvider();
      if (!provider || !CONTRACT_ADDRESSES.votingFactory) {
        throw new Error('Provider or contract address not available');
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.votingFactory,
        VOTING_FACTORY_ABI,
        provider
      );

      let votingData: VotingContract[];
      
      switch (filter) {
        case 'active':
          votingData = await contract.getActiveVotings();
          break;
        case 'my-votings':
          votingData = await contract.getVotingsByCreator(wallet.address);
          break;
        default:
          votingData = await contract.getAllVotings();
      }

      setVotings(votingData);
    } catch (error: any) {
      console.error('Error loading votings:', error);
      toast.error('Failed to load votings');
    } finally {
      setLoading(false);
    }
  };

  const filteredVotings = votings.filter(voting => {
    const matchesSearch = voting.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (filter) {
      case 'ended':
        // This would require checking individual voting contracts for their state
        return matchesSearch;
      default:
        return matchesSearch;
    }
  });

  const handleVotingClick = (address: string) => {
    // Navigation will be handled by the VotingCard component
  };

  if (!wallet.isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center py-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🗳️ FHEVM Privacy Voting
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience the future of voting with complete privacy. Cast your vote using 
            homomorphic encryption - your choice remains secret while still being verifiable.
          </p>
          <div className="space-y-4">
            <ConnectWallet onConnect={() => {}} isConnecting={false} />
            <p className="text-sm text-gray-500">
              Connect your wallet to start voting privately
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 py-16">
          <div className="text-center p-6 bg-white rounded-lg shadow-soft">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold mb-2">Complete Privacy</h3>
            <p className="text-gray-600">
              Your vote is encrypted using homomorphic encryption. No one can see how you voted.
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-soft">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Transparent Results</h3>
            <p className="text-gray-600">
              Vote counting happens on-chain with verifiable results while maintaining privacy.
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-soft">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Instant Verification</h3>
            <p className="text-gray-600">
              Votes are processed immediately with cryptographic proof of validity.
            </p>
          </div>
        </div>

        {/* About FHEVM */}
        <div className="bg-primary-50 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">
            Powered by FHEVM Technology
          </h2>
          <p className="text-primary-700 mb-4">
            This application uses Fully Homomorphic Encryption Virtual Machine (FHEVM) 
            technology to enable computations on encrypted data without ever decrypting it.
          </p>
          <Link 
            to="/about" 
            className="text-primary-600 hover:text-primary-800 font-medium"
          >
            Learn more about FHEVM →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Privacy Voting Dashboard
          </h1>
          <p className="text-gray-600">
            Participate in private voting or create your own
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to="/create"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Create New Voting
          </Link>
        </div>
      </div>

      {/* FHEVM Status */}
      {fhevmLoading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <LoadingSpinner size="sm" />
            <span className="ml-2 text-yellow-800">
              Initializing privacy features...
            </span>
          </div>
        </div>
      )}

      {!fhevmInstance && !fhevmLoading && wallet.chainId !== APP_CONFIG.network.chainId && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">
            Please switch to {APP_CONFIG.network.name} to use privacy features.
          </p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex space-x-2">
          {(['all', 'active', 'ended', 'my-votings'] as VotingFilter[]).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === filterOption
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search votings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Voting List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredVotings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🗳️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No votings found
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'my-votings' 
              ? "You haven't created any votings yet."
              : "No votings match your current filter."}
          </p>
          {filter === 'my-votings' && (
            <Link
              to="/create"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your First Voting
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVotings.map((voting) => (
            <VotingCard
              key={voting.contractAddress}
              voting={voting}
              onVotingClick={handleVotingClick}
            />
          ))}
        </div>
      )}

      {/* Network Info */}
      <div className="mt-12 p-4 bg-gray-100 rounded-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Connected to: {APP_CONFIG.network.name}</span>
          <span>Total Votings: {votings.length}</span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
