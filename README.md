# 🛡️ Elite Cybersecurity Platform - MERN Stack

<div align="center">

![Security Platform](https://img.shields.io/badge/Security-Platform-red?style=for-the-badge&logo=shield&logoColor=white)
![MERN Stack](https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge&logo=mongodb&logoColor=white)
![Web3](https://img.shields.io/badge/Web3-Security-purple?style=for-the-badge&logo=ethereum&logoColor=white)
![AI Powered](https://img.shields.io/badge/AI-Powered-green?style=for-the-badge&logo=openai&logoColor=white)

**A comprehensive, enterprise-grade cybersecurity automation platform with Web3 smart contract analysis, AI-powered vulnerability detection, and professional bug bounty automation.**

[🚀 Live Demo](#) • [📖 Documentation](#installation) • [🐛 Report Bug](https://github.com/rajkumr1455/mern-security-platform/issues) • [✨ Request Feature](https://github.com/rajkumr1455/mern-security-platform/issues)

</div>

---

## 🌟 Key Features

### 🔍 **Advanced Reconnaissance & OSINT**
- **Sudomy Integration**: Comprehensive subdomain enumeration and reconnaissance
- **DNS Analysis**: Advanced DNS record analysis and zone transfer detection
- **Port Scanning**: Intelligent port scanning with service detection
- **HTTP Analysis**: Web application fingerprinting and technology detection
- **OSINT Intelligence**: Automated open-source intelligence gathering

### 🌐 **Web3 Smart Contract Security**
- **Multi-Tool Analysis**: Integration with Slither, Mythril, Securify, and Manticore
- **Automated Vulnerability Detection**: AI-powered smart contract vulnerability scanning
- **ImmuneFi Integration**: Professional PoC generation for bug bounty submissions
- **Real-time Blockchain Monitoring**: Live contract interaction analysis
- **Comprehensive Reporting**: Detailed security reports with visual analytics

### 🤖 **AI-Powered Security Engine**
- **Elite AI Analysis**: Advanced machine learning vulnerability detection
- **Automated Exploitation**: Intelligent exploit generation and validation
- **Threat Intelligence**: Real-time threat data correlation and analysis
- **Pattern Recognition**: ML-based attack pattern identification
- **Risk Assessment**: Automated security risk scoring and prioritization

### 🎯 **Bug Bounty Automation**
- **Platform Integration**: Automated submissions to major bug bounty platforms
- **Evidence Collection**: Comprehensive proof-of-concept generation
- **Report Generation**: Professional vulnerability reports with visual evidence
- **Workflow Automation**: End-to-end bug bounty workflow management
- **Performance Tracking**: Analytics and success rate monitoring

### 🔧 **Professional Security Tools**
- **Vulnerability Scanning**: Multi-layered security assessment tools
- **Network Analysis**: Advanced network topology and security analysis
- **Web Application Testing**: Comprehensive web app security testing
- **API Security**: REST/GraphQL API vulnerability assessment
- **Configuration Analysis**: Security configuration auditing

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React.js      │    │    Node.js      │    │   MongoDB       │
│   Frontend      │◄──►│    Backend      │◄──►│   Database      │
│                 │    │                 │    │                 │
│ • Professional  │    │ • RESTful APIs  │    │ • Scan Results  │
│   Dashboard     │    │ • WebSocket     │    │ • User Data     │
│ • Real-time UI  │    │ • AI Engine     │    │ • Reports       │
│ • Reporting     │    │ • Automation    │    │ • Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌───────────────────────▼───────────────────────┐
         │            Security Tools Integration          │
         │                                               │
         │  Nmap • Sqlmap • Nikto • Sudomy • Slither    │
         │  Mythril • Securify • Manticore • Custom AI  │
         └───────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16.0.0 or higher)
- **MongoDB** (v4.4 or higher)
- **Git**
- **Security Tools**: Nmap, Sqlmap, Nikto (optional but recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rajkumr1455/mern-security-platform.git
   cd mern-security-platform
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install && cd ..
   
   # Install server dependencies
   cd server && npm install && cd ..
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment templates
   cp server/.env.example server/.env
   cp client/.env.local.example client/.env.local
   
   # Edit configuration files with your settings
   nano server/.env
   nano client/.env.local
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if not running)
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Launch the Platform**
   ```bash
   # Development mode (runs both client and server)
   npm run dev
   
   # Or run separately
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

6. **Access the Platform**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000
   - **API Documentation**: http://localhost:5000/api-docs

---

## 🔧 Configuration

### Security Tools Setup

```bash
# Install required security tools (Ubuntu/Debian)
sudo apt update
sudo apt install nmap sqlmap nikto

# Install Web3 security tools
pip3 install slither-analyzer mythril
npm install -g @securify/securify
```

### Environment Variables

#### Server Configuration (`server/.env`)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/security-platform

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Security
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_ROUNDS=12

# External Tools
NMAP_PATH=/usr/bin/nmap
SQLMAP_PATH=/usr/bin/sqlmap
NIKTO_PATH=/usr/bin/nikto
```

#### Client Configuration (`client/.env.local`)
```env
REACT_APP_API_URL=http://localhost:5000
GENERATE_SOURCEMAP=false
ESLINT_NO_DEV_ERRORS=true
```

---

## 📊 Features Overview

### 🎯 **Reconnaissance Module**
- **Subdomain Discovery**: Advanced enumeration using multiple techniques
- **Port Scanning**: Intelligent scanning with service fingerprinting
- **Technology Detection**: Web application stack identification
- **Vulnerability Assessment**: Automated security flaw detection

### 🌐 **Web3 Security Suite**
- **Smart Contract Analysis**: Multi-tool vulnerability detection
- **Blockchain Monitoring**: Real-time transaction analysis
- **DeFi Security**: Specialized DeFi protocol security testing
- **NFT Analysis**: NFT contract security assessment

### 🤖 **AI Security Engine**
- **Machine Learning Models**: Custom-trained vulnerability detection
- **Pattern Analysis**: Advanced attack pattern recognition
- **Automated Exploitation**: AI-driven exploit generation
- **Risk Scoring**: Intelligent vulnerability prioritization

### 📈 **Professional Reporting**
- **Executive Summaries**: High-level security overviews
- **Technical Reports**: Detailed vulnerability documentation
- **Visual Analytics**: Interactive charts and graphs
- **Export Options**: PDF, HTML, JSON, CSV formats

---

## 🛠️ API Documentation

### Authentication
```javascript
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
```

### Reconnaissance
```javascript
POST /api/recon/subdomain-scan
POST /api/recon/port-scan
GET  /api/recon/results/:scanId
```

### Web3 Analysis
```javascript
POST /api/web3/contract-analysis
POST /api/web3/blockchain-scan
GET  /api/web3/reports/:reportId
```

### AI Security
```javascript
POST /api/ai/vulnerability-analysis
POST /api/ai/threat-intelligence
GET  /api/ai/risk-assessment/:targetId
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:client    # Frontend tests
npm run test:server    # Backend tests
npm run test:e2e       # End-to-end tests

# Generate coverage report
npm run test:coverage
```

---

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t security-platform .
docker run -p 3000:3000 -p 5000:5000 security-platform
```

### Production Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Security Community**: For continuous inspiration and knowledge sharing
- **Open Source Tools**: Nmap, Sqlmap, Nikto, Slither, Mythril, and others
- **Web3 Security**: ImmuneFi and the bug bounty community
- **AI/ML Libraries**: TensorFlow, PyTorch, and scikit-learn communities

---

## 📞 Support

- **Documentation**: [Wiki](https://github.com/rajkumr1455/mern-security-platform/wiki)
- **Issues**: [GitHub Issues](https://github.com/rajkumr1455/mern-security-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rajkumr1455/mern-security-platform/discussions)

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [rajkumr1455](https://github.com/rajkumr1455)

</div>