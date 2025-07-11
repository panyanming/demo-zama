import React from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../config';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🗳️</span>
              <span className="text-xl font-bold">FHEVM Voting</span>
            </div>
            <p className="text-gray-400 text-sm">
              Privacy-preserving voting powered by Fully Homomorphic Encryption
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-gray-400 hover:text-white transition-colors">
                  Create Voting
                </Link>
              </li>
              <li>
                <Link to="/my-votings" className="text-gray-400 hover:text-white transition-colors">
                  My Votings
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  About FHEVM
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://docs.zama.ai/fhevm" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  FHEVM Documentation
                </a>
              </li>
              <li>
                <a 
                  href="https://zama.ai/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Zama Network
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/zama-ai/fhevm" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a 
                  href={APP_CONFIG.network.faucet} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Test Faucet
                </a>
              </li>
            </ul>
          </div>

          {/* Network Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Network</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Network:</span>
                <span className="ml-2 text-white">{APP_CONFIG.network.name}</span>
              </div>
              <div>
                <span className="text-gray-400">Chain ID:</span>
                <span className="ml-2 text-white">{APP_CONFIG.network.chainId}</span>
              </div>
              {APP_CONFIG.network.blockExplorer && (
                <div>
                  <a 
                    href={APP_CONFIG.network.blockExplorer} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Block Explorer ↗
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400">
              © 2024 FHEVM Voting DApp. Built with privacy in mind.
            </div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>🔐</span>
                <span>Powered by FHEVM</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>⚡</span>
                <span>Built on {APP_CONFIG.network.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
