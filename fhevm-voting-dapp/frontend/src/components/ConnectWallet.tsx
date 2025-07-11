import React from 'react';
import { ConnectWalletProps } from '../types';
import LoadingSpinner from './LoadingSpinner';

const ConnectWallet: React.FC<ConnectWalletProps> = ({ onConnect, isConnecting }) => {
  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="text-6xl mb-4">🔗</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Connect your MetaMask wallet to start participating in private voting
        </p>
      </div>

      <button
        onClick={onConnect}
        disabled={isConnecting}
        className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
      >
        {isConnecting ? (
          <>
            <LoadingSpinner size="sm" color="white" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <span>Connect MetaMask</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
          </>
        )}
      </button>

      <div className="mt-6 text-sm text-gray-500">
        <p>Don't have MetaMask? <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800">Download here</a></p>
      </div>
    </div>
  );
};

export default ConnectWallet;
