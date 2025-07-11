import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { VotingCardProps, VotingInfo, VotingState } from '../types';
import { useEthersProvider } from '../contexts/WalletContext';
import { PRIVATE_VOTING_ABI, VOTING_STATES } from '../config';

const VotingCard: React.FC<VotingCardProps> = ({ voting, onVotingClick }) => {
  const [votingInfo, setVotingInfo] = useState<VotingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { getProvider } = useEthersProvider();

  useEffect(() => {
    loadVotingInfo();
  }, [voting.contractAddress]);

  const loadVotingInfo = async () => {
    try {
      const provider = getProvider();
      if (!provider) return;

      const contract = new ethers.Contract(
        voting.contractAddress,
        PRIVATE_VOTING_ABI,
        provider
      );

      const info = await contract.getVotingInfo();
      setVotingInfo({
        title: info.title,
        description: info.description,
        options: info.options,
        startTime: Number(info.startTime),
        endTime: Number(info.endTime),
        state: info.state,
        totalVoters: Number(info.totalVoters),
        resultsRequested: info.resultsRequested,
      });
    } catch (error) {
      console.error('Error loading voting info:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeStatus = () => {
    if (!votingInfo) return { status: 'Unknown', color: 'gray' };

    const now = Math.floor(Date.now() / 1000);
    const { startTime, endTime, state } = votingInfo;

    if (state === VotingState.ResultsRevealed) {
      return { status: 'Results Available', color: 'green' };
    }

    if (state === VotingState.Ended || now > endTime) {
      return { status: 'Ended', color: 'red' };
    }

    if (state === VotingState.Active && now >= startTime && now <= endTime) {
      return { status: 'Active', color: 'green' };
    }

    if (now < startTime) {
      return { status: 'Not Started', color: 'yellow' };
    }

    return { status: 'Unknown', color: 'gray' };
  };

  const getTimeRemaining = () => {
    if (!votingInfo) return null;

    const now = Math.floor(Date.now() / 1000);
    const { startTime, endTime, state } = votingInfo;

    if (state === VotingState.Ended || state === VotingState.ResultsRevealed) {
      return null;
    }

    if (now < startTime) {
      const diff = startTime - now;
      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      return `Starts in ${days}d ${hours}h`;
    }

    if (now < endTime) {
      const diff = endTime - now;
      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      
      if (days > 0) return `${days}d ${hours}h remaining`;
      if (hours > 0) return `${hours}h ${minutes}m remaining`;
      return `${minutes}m remaining`;
    }

    return 'Ended';
  };

  const timeStatus = getTimeStatus();
  const timeRemaining = getTimeRemaining();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-soft p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  if (!votingInfo) {
    return (
      <div className="bg-white rounded-lg shadow-soft p-6 border border-red-200">
        <div className="text-red-600 text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <p>Failed to load voting information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-soft hover:shadow-medium transition-shadow duration-200 border border-gray-100">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {votingInfo.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {votingInfo.description}
            </p>
          </div>
          <div className={`ml-4 px-2 py-1 rounded-full text-xs font-medium ${
            timeStatus.color === 'green' ? 'bg-green-100 text-green-800' :
            timeStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
            timeStatus.color === 'red' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {timeStatus.status}
          </div>
        </div>

        {/* Voting Options Preview */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">
            {votingInfo.options.length} options available
          </p>
          <div className="flex flex-wrap gap-1">
            {votingInfo.options.slice(0, 3).map((option, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {option.length > 15 ? `${option.slice(0, 15)}...` : option}
              </span>
            ))}
            {votingInfo.options.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                +{votingInfo.options.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-500">Total Voters</p>
            <p className="font-semibold text-gray-900">{votingInfo.totalVoters}</p>
          </div>
          <div>
            <p className="text-gray-500">Creator</p>
            <p className="font-semibold text-gray-900 font-mono text-xs">
              {voting.creator.slice(0, 6)}...{voting.creator.slice(-4)}
            </p>
          </div>
        </div>

        {/* Time Information */}
        <div className="mb-4 text-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500">Start:</span>
            <span className="text-gray-900">{formatDate(votingInfo.startTime)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500">End:</span>
            <span className="text-gray-900">{formatDate(votingInfo.endTime)}</span>
          </div>
          {timeRemaining && (
            <div className="text-center">
              <span className={`text-sm font-medium ${
                timeStatus.color === 'green' ? 'text-green-600' :
                timeStatus.color === 'yellow' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {timeRemaining}
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link
          to={`/voting/${voting.contractAddress}`}
          className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          onClick={() => onVotingClick(voting.contractAddress)}
        >
          {timeStatus.status === 'Active' ? 'Vote Now' : 'View Details'}
        </Link>

        {/* Privacy Badge */}
        <div className="mt-3 flex items-center justify-center space-x-1 text-xs text-gray-500">
          <span>🔐</span>
          <span>Privacy Protected by FHEVM</span>
        </div>
      </div>
    </div>
  );
};

export default VotingCard;
