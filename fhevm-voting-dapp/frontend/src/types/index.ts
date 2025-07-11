// Type definitions for the FHEVM Voting DApp

export interface VotingInfo {
  title: string;
  description: string;
  options: string[];
  startTime: number;
  endTime: number;
  state: VotingState;
  totalVoters: number;
  resultsRequested: boolean;
}

export enum VotingState {
  NotStarted = 0,
  Active = 1,
  Ended = 2,
  ResultsRevealed = 3
}

export interface VotingContract {
  contractAddress: string;
  creator: string;
  title: string;
  createdAt: number;
  isActive: boolean;
}

export interface VotingResults {
  options: string[];
  votes: number[];
  totalVotes: number;
  isDecrypted: boolean;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
}

export interface FHEVMInstance {
  encrypt32: (value: number) => Promise<{
    handles: Uint8Array[];
    inputProof: Uint8Array;
  }>;
  createInstance: (params: {
    chainId: number;
    publicKey: string;
  }) => Promise<FHEVMInstance>;
}

export interface CreateVotingForm {
  title: string;
  description: string;
  options: string[];
  startTime: Date;
  endTime: Date;
}

export interface VotingCardProps {
  voting: VotingContract;
  onVotingClick: (address: string) => void;
}

export interface VotingDetailsProps {
  contractAddress: string;
  onBack: () => void;
}

export interface ConnectWalletProps {
  onConnect: () => void;
  isConnecting: boolean;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export interface ToastType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer?: string;
  faucet?: string;
}

export interface ContractAddresses {
  votingFactory: string;
  sampleVoting?: string;
}

export interface AppConfig {
  network: NetworkConfig;
  contracts: ContractAddresses;
}

// Contract ABI types
export interface ContractMethod {
  name: string;
  type: string;
  inputs: ContractInput[];
  outputs?: ContractOutput[];
  stateMutability: string;
}

export interface ContractInput {
  name: string;
  type: string;
  indexed?: boolean;
}

export interface ContractOutput {
  name: string;
  type: string;
}

export interface ContractEvent {
  name: string;
  type: string;
  inputs: ContractInput[];
  anonymous?: boolean;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export interface TransactionError extends AppError {
  transactionHash?: string;
  gasUsed?: string;
}

export interface WalletError extends AppError {
  walletType?: string;
}

// Utility types
export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: AppError | null;
};

export type VotingFilter = 'all' | 'active' | 'ended' | 'my-votings';

export interface PaginationParams {
  offset: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Hook return types
export interface UseWalletReturn {
  wallet: WalletState;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}

export interface UseContractReturn<T> {
  contract: T | null;
  loading: boolean;
  error: AppError | null;
}

export interface UseFHEVMReturn {
  instance: FHEVMInstance | null;
  loading: boolean;
  error: AppError | null;
  encrypt: (value: number) => Promise<{
    handles: Uint8Array[];
    inputProof: Uint8Array;
  }>;
}

// Constants
export const VOTING_STATES = {
  [VotingState.NotStarted]: 'Not Started',
  [VotingState.Active]: 'Active',
  [VotingState.Ended]: 'Ended',
  [VotingState.ResultsRevealed]: 'Results Revealed'
} as const;

export const NETWORK_NAMES = {
  8009: 'Zama Devnet',
  31337: 'Hardhat Local',
  1337: 'Ganache Local'
} as const;
