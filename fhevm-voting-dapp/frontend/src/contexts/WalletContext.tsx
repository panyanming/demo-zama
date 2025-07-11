import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { WalletState, UseWalletReturn, AppError } from '../types';
import { APP_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config';

interface WalletContextType extends UseWalletReturn {}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    balance: null,
  });

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnection();
    setupEventListeners();
  }, []);

  // Update balance when address or chainId changes
  useEffect(() => {
    if (wallet.address && provider) {
      updateBalance();
    }
  }, [wallet.address, wallet.chainId, provider]);

  const checkConnection = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          const balance = await provider.getBalance(accounts[0].address);
          
          setProvider(provider);
          setWallet({
            isConnected: true,
            address: accounts[0].address,
            chainId: Number(network.chainId),
            balance: ethers.formatEther(balance),
          });
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const setupEventListeners = () => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      setWallet(prev => ({
        ...prev,
        address: accounts[0],
      }));
    }
  };

  const handleChainChanged = (chainId: string) => {
    const newChainId = parseInt(chainId, 16);
    setWallet(prev => ({
      ...prev,
      chainId: newChainId,
    }));
    
    // Check if the new network is supported
    if (newChainId !== APP_CONFIG.network.chainId) {
      toast.warning(`Please switch to ${APP_CONFIG.network.name}`);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const connect = async (): Promise<void> => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      await provider.send('eth_requestAccounts', []);
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(address);

      setProvider(provider);
      setWallet({
        isConnected: true,
        address,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
      });

      // Check if connected to correct network
      if (Number(network.chainId) !== APP_CONFIG.network.chainId) {
        toast.warning(`Please switch to ${APP_CONFIG.network.name}`);
        await switchNetwork(APP_CONFIG.network.chainId);
      } else {
        toast.success(SUCCESS_MESSAGES.WALLET_CONNECTED);
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      
      if (error.code === 4001) {
        toast.error('Connection rejected by user');
      } else if (error.code === -32002) {
        toast.error('Connection request already pending');
      } else {
        toast.error(error.message || ERROR_MESSAGES.NETWORK_ERROR);
      }
      
      throw error;
    }
  };

  const disconnect = (): void => {
    setWallet({
      isConnected: false,
      address: null,
      chainId: null,
      balance: null,
    });
    setProvider(null);
    toast.info('Wallet disconnected');
  };

  const switchNetwork = async (chainId: number): Promise<void> => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      const chainIdHex = `0x${chainId.toString(16)}`;
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          const networkConfig = APP_CONFIG.network;
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainIdHex,
                chainName: networkConfig.name,
                rpcUrls: [networkConfig.rpcUrl],
                blockExplorerUrls: networkConfig.blockExplorer ? [networkConfig.blockExplorer] : [],
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    } catch (error: any) {
      console.error('Error switching network:', error);
      toast.error(error.message || 'Failed to switch network');
      throw error;
    }
  };

  const updateBalance = async (): Promise<void> => {
    try {
      if (provider && wallet.address) {
        const balance = await provider.getBalance(wallet.address);
        setWallet(prev => ({
          ...prev,
          balance: ethers.formatEther(balance),
        }));
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const value: WalletContextType = {
    wallet,
    connect,
    disconnect,
    switchNetwork,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Utility hook to get ethers provider
export const useEthersProvider = () => {
  const { wallet } = useWallet();
  
  const getProvider = () => {
    if (typeof window.ethereum !== 'undefined' && wallet.isConnected) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    return null;
  };

  const getSigner = async () => {
    const provider = getProvider();
    if (provider) {
      return await provider.getSigner();
    }
    return null;
  };

  return { getProvider, getSigner };
};
