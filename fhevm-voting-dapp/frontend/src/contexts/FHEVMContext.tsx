import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { FHEVMInstance, UseFHEVMReturn, AppError } from '../types';
import { FHEVM_CONFIG } from '../config';
import { useWallet } from './WalletContext';

interface FHEVMContextType extends UseFHEVMReturn {}

const FHEVMContext = createContext<FHEVMContextType | undefined>(undefined);

interface FHEVMProviderProps {
  children: ReactNode;
}

export const FHEVMProvider: React.FC<FHEVMProviderProps> = ({ children }) => {
  const [instance, setInstance] = useState<FHEVMInstance | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AppError | null>(null);
  
  const { wallet } = useWallet();

  // Initialize FHEVM instance when wallet is connected
  useEffect(() => {
    if (wallet.isConnected && wallet.chainId === FHEVM_CONFIG.chainId) {
      initializeFHEVM();
    } else {
      setInstance(null);
      setError(null);
    }
  }, [wallet.isConnected, wallet.chainId]);

  const initializeFHEVM = async () => {
    setLoading(true);
    setError(null);

    try {
      // Import fhevmjs dynamically
      const { createInstance } = await import('fhevmjs');
      
      // Get public key from the network
      const publicKey = await getPublicKey();
      
      // Create FHEVM instance
      const fhevmInstance = await createInstance({
        chainId: FHEVM_CONFIG.chainId,
        publicKey: publicKey,
      });

      setInstance(fhevmInstance);
      console.log('FHEVM instance initialized successfully');
    } catch (err: any) {
      console.error('Error initializing FHEVM:', err);
      const appError: AppError = {
        code: 'FHEVM_INIT_ERROR',
        message: 'Failed to initialize FHEVM instance',
        details: err.message,
      };
      setError(appError);
      toast.error('Failed to initialize privacy features');
    } finally {
      setLoading(false);
    }
  };

  const getPublicKey = async (): Promise<string> => {
    try {
      const response = await fetch(FHEVM_CONFIG.publicKeyUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.publicKey || data;
    } catch (err) {
      console.error('Error fetching public key:', err);
      // Fallback: return a mock public key for development
      return "0x" + "00".repeat(32); // This should be replaced with actual public key
    }
  };

  const encrypt = async (value: number): Promise<{
    handles: Uint8Array[];
    inputProof: Uint8Array;
  }> => {
    if (!instance) {
      throw new Error('FHEVM instance not initialized');
    }

    try {
      const encrypted = await instance.encrypt32(value);
      return encrypted;
    } catch (err: any) {
      console.error('Error encrypting value:', err);
      throw new Error(`Encryption failed: ${err.message}`);
    }
  };

  const value: FHEVMContextType = {
    instance,
    loading,
    error,
    encrypt,
  };

  return (
    <FHEVMContext.Provider value={value}>
      {children}
    </FHEVMContext.Provider>
  );
};

export const useFHEVM = (): FHEVMContextType => {
  const context = useContext(FHEVMContext);
  if (context === undefined) {
    throw new Error('useFHEVM must be used within a FHEVMProvider');
  }
  return context;
};

// Utility hook for encryption operations
export const useEncryption = () => {
  const { instance, encrypt, loading, error } = useFHEVM();

  const encryptVote = async (optionIndex: number): Promise<{
    encryptedVote: string;
    inputProof: string;
  }> => {
    if (!instance) {
      throw new Error('FHEVM instance not available');
    }

    try {
      const encrypted = await encrypt(optionIndex);
      
      // Convert to hex strings for contract interaction
      const encryptedVote = '0x' + Array.from(encrypted.handles[0])
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      const inputProof = '0x' + Array.from(encrypted.inputProof)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      return { encryptedVote, inputProof };
    } catch (err: any) {
      console.error('Error encrypting vote:', err);
      throw new Error(`Vote encryption failed: ${err.message}`);
    }
  };

  const isReady = (): boolean => {
    return !!instance && !loading && !error;
  };

  return {
    encryptVote,
    isReady,
    loading,
    error,
  };
};
