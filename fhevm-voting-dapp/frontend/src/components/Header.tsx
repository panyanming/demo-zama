import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { useFHEVM } from '../contexts/FHEVMContext';
import { APP_CONFIG } from '../config';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { wallet, connect, disconnect } = useWallet();
  const { instance: fhevmInstance } = useFHEVM();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'Create Voting', href: '/create', current: location.pathname === '/create' },
    { name: 'My Votings', href: '/my-votings', current: location.pathname === '/my-votings' },
    { name: 'About', href: '/about', current: location.pathname === '/about' },
  ];

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toFixed(4);
  };

  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="text-2xl">🗳️</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  FHEVM Voting
                </h1>
                <p className="text-xs text-gray-500">Privacy-First Democracy</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.current
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {/* Network Status */}
            {wallet.isConnected && (
              <div className="hidden sm:flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  wallet.chainId === APP_CONFIG.network.chainId 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
                }`}></div>
                <span className="text-xs text-gray-600">
                  {wallet.chainId === APP_CONFIG.network.chainId 
                    ? APP_CONFIG.network.name 
                    : 'Wrong Network'}
                </span>
              </div>
            )}

            {/* FHEVM Status */}
            {wallet.isConnected && (
              <div className="hidden sm:flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  fhevmInstance ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-xs text-gray-600">
                  {fhevmInstance ? 'Privacy Ready' : 'Privacy Loading'}
                </span>
              </div>
            )}

            {/* Wallet Info */}
            {wallet.isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatAddress(wallet.address!)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatBalance(wallet.balance!)} ETH
                  </div>
                </div>
                <button
                  onClick={disconnect}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Connect Wallet
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    item.current
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Mobile Wallet Info */}
            {wallet.isConnected && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="px-3 py-2">
                  <div className="text-sm font-medium text-gray-900">
                    {formatAddress(wallet.address!)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatBalance(wallet.balance!)} ETH
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${
                        wallet.chainId === APP_CONFIG.network.chainId 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                      }`}></div>
                      <span className="text-xs text-gray-600">
                        {wallet.chainId === APP_CONFIG.network.chainId 
                          ? APP_CONFIG.network.name 
                          : 'Wrong Network'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${
                        fhevmInstance ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className="text-xs text-gray-600">
                        {fhevmInstance ? 'Privacy Ready' : 'Privacy Loading'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
