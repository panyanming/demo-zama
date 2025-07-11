# FHEVM隐私投票DApp

一个基于FHEVM（全同态加密虚拟机）的隐私保护投票系统

## 项目特性

### 核心功能
- **隐私投票**: 投票内容完全加密，无法被外部观察
- **实时统计**: 在加密数据上进行实时投票统计
- **透明验证**: 投票过程透明但内容保密
- **权限控制**: 只有授权用户可以参与投票

### 技术特点
- **全同态加密**: 使用TFHE库进行密文计算
- **EVM兼容**: 基于Solidity智能合约
- **现代前端**: React + TypeScript + Tailwind CSS
- **Web3集成**: 使用fhevmjs与区块链交互

## 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端界面      │    │   智能合约      │    │   FHEVM网络     │
│                 │    │                 │    │                 │
│ React + fhevmjs │◄──►│ Solidity + TFHE │◄──►│ Zama Network    │
│                 │    │                 │    │                 │
│ • 投票界面      │    │ • 加密投票      │    │ • 密文计算      │
│ • 结果展示      │    │ • 权限管理      │    │ • 状态存储      │
│ • 钱包连接      │    │ • 结果统计      │    │ • 共识机制      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 项目结构

```
fhevm-voting-dapp/
├── contracts/                 # 智能合约
│   ├── PrivateVoting.sol     # 主投票合约
│   ├── VotingFactory.sol     # 投票工厂合约
│   └── interfaces/           # 合约接口
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/       # React组件
│   │   ├── hooks/           # 自定义Hooks
│   │   ├── utils/           # 工具函数
│   │   └── types/           # TypeScript类型
│   ├── public/              # 静态资源
│   └── package.json         # 依赖配置
├── scripts/                 # 部署脚本
│   ├── deploy.js           # 合约部署
│   └── setup.js            # 环境设置
├── test/                   # 测试文件
│   ├── PrivateVoting.test.js
│   └── integration.test.js
├── hardhat.config.js       # Hardhat配置
└── package.json           # 项目依赖
```

## 技术栈

### 智能合约
- **Solidity**: 智能合约开发语言
- **TFHE库**: 全同态加密操作
- **Hardhat**: 开发框架
- **OpenZeppelin**: 安全合约库

### 前端
- **React 18**: 用户界面框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架
- **fhevmjs**: FHEVM JavaScript SDK
- **ethers.js**: 以太坊交互库

### 开发工具
- **Hardhat**: 智能合约开发环境
- **Remix**: 在线IDE
- **MetaMask**: 钱包连接
- **Zama Devnet**: 测试网络

## 快速开始

### 环境要求
- Node.js >= 16
- npm 或 yarn
- MetaMask钱包

### 安装依赖
```bash
# 克隆项目
git clone <repository-url>
cd fhevm-voting-dapp

# 安装合约依赖
npm install

# 安装前端依赖
cd frontend
npm install
```

### 配置环境
```bash
# 复制环境变量文件
cp .env.example .env

# 配置私钥和RPC URL
# PRIVATE_KEY=your_private_key
# ZAMA_RPC_URL=https://devnet.zama.ai
```

### 部署合约
```bash
# 编译合约
npx hardhat compile

# 部署到测试网
npx hardhat run scripts/deploy.js --network zama
```

### 启动前端
```bash
cd frontend
npm start
```

## 使用指南

### 1. 连接钱包
- 安装MetaMask并添加Zama测试网
- 获取测试代币
- 连接到DApp

### 2. 创建投票
- 输入投票标题和选项
- 设置投票时间和权限
- 部署投票合约

### 3. 参与投票
- 选择投票选项
- 数据自动加密
- 提交到区块链

### 4. 查看结果
- 实时查看加密统计
- 投票结束后解密结果
- 验证投票完整性


## 🧪 测试

```bash
# 运行单元测试
npx hardhat test

# 运行集成测试
npm run test:integration

# 前端测试
cd frontend && npm test
```
