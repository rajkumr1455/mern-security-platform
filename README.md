# 🚀 Security Platform - MERN Stack

A modern, full-stack security platform built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring beautiful UI design and comprehensive Web2 security scanning capabilities.

## 📁 Project Structure

```
MERN-Stack/
├── client/                          # React Frontend
│   ├── public/                      # Static assets
│   ├── src/                         # React source code
│   │   ├── components/              # Reusable components
│   │   │   ├── Auth/               # Authentication components
│   │   │   ├── Enhanced/           # Enhanced UI components
│   │   │   ├── Layout/             # Layout components
│   │   │   └── Professional/       # Professional UI components
│   │   ├── contexts/               # React contexts
│   │   ├── pages/                  # Page components
│   │   │   ├── Auth/              # Authentication pages
│   │   │   ├── Dashboard/         # Dashboard pages
│   │   │   ├── Scans/             # Scanning pages (including Web2)
│   │   │   ├── Reconnaissance/    # Recon pages
│   │   │   ├── Reports/           # Report pages
│   │   │   ├── Settings/          # Settings pages
│   │   │   ├── Targets/           # Target management
│   │   │   ├── Tools/             # Security tools
│   │   │   ├── Web3/              # Web3 analysis
│   │   │   └── Workflows/         # Workflow management
│   │   ├── services/              # API services
│   │   └── styles/                # CSS styles
│   │       ├── enhanced-theme.css
│   │       ├── modern-light-theme.css
│   │       └── professional-ui.css
│   ├── package.json               # Client dependencies
│   └── package-lock.json
│
├── server/                         # Node.js Backend
│   ├── middleware/                 # Express middleware
│   │   ├── auth.js                # Authentication middleware
│   │   └── errorHandler.js        # Error handling
│   ├── models/                     # MongoDB models
│   │   ├── Scan.js                # Scan model
│   │   ├── Target.js              # Target model
│   │   ├── User.js                # User model
│   │   └── Workflow.js            # Workflow model
│   ├── routes/                     # API routes
│   │   ├── auth.js                # Authentication routes
│   │   ├── recon.js               # Reconnaissance routes
│   │   ├── reports.js             # Report routes
│   │   ├── scans.js               # Scanning routes (Web2 included)
│   │   ├── targets.js             # Target routes
│   │   ├── web3.js                # Web3 routes
│   │   └── workflows.js           # Workflow routes
│   ├── services/                   # Business logic services
│   │   ├── ReconService.js        # Reconnaissance service
│   │   ├── ScanOrchestrator.js    # Scan orchestration
│   │   ├── Web2ScanService.js     # Web2 scanning service
│   │   ├── Web3AnalysisService.js # Web3 analysis service
│   │   └── WebSocketManager.js    # WebSocket management
│   ├── utils/                      # Utility functions
│   │   └── logger.js              # Logging utility
│   ├── index.js                   # Server entry point
│   ├── package.json               # Server dependencies
│   └── package-lock.json
│
├── docker-compose.mern.yml         # Docker composition for MERN
├── package.json                    # Root package.json for scripts
├── package-lock.json              # Root lock file
├── README.md                       # This file
├── WEB2_FUNCTIONALITY_GUIDE.md     # Web2 features guide
└── BEAUTIFUL_UI_UPGRADE_SUMMARY.md # UI design documentation
```

## 🎨 Features

### ✨ **Beautiful Modern UI**
- **Glass-morphism Design**: Translucent cards with backdrop blur
- **Gradient Backgrounds**: Multi-layer animated gradients
- **Floating Animations**: Geometric shapes with smooth movements
- **Perfect Contrast**: Professional sidebar with dynamic content area
- **Rainbow Borders**: Colorful gradient accents
- **Responsive Design**: Mobile-first approach

### 🛡️ **Web2 Security Scanning**
- **Vulnerability Scanner**: SQL injection, XSS, CSRF, LFI, RCE, SSRF
- **API Security Testing**: Authentication bypass, rate limiting, CORS
- **Web Application Fuzzing**: Parameter discovery, directory traversal
- **Exploitation Framework**: Safe payload testing, privilege escalation
- **Real-time Progress**: Live scan monitoring with progress bars
- **Auto-refresh**: Automatic scan status updates

### 🔍 **Reconnaissance Tools**
- **Subdomain Enumeration**: Multiple discovery techniques
- **Port Scanning**: Comprehensive network analysis
- **API Discovery**: Endpoint and schema detection
- **OSINT Gathering**: Open source intelligence collection

### 📊 **Dashboard & Analytics**
- **Real-time Metrics**: Live statistics and monitoring
- **Activity Feed**: Recent scan activities and findings
- **Threat Intelligence**: Current threat levels and security scores
- **Quick Actions**: One-click access to main features

## 🚀 **Quick Start**

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone and navigate to MERN Stack folder**
   ```bash
   cd MERN-Stack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

This will start:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8082

### Alternative: Individual Setup

**Backend Setup:**
```bash
cd server
npm install
npm run dev
```

**Frontend Setup:**
```bash
cd client
npm install
npm start
```

## 🔧 **Configuration**

### Environment Variables
Create `.env` files in the server directory:

```env
# Server Configuration
PORT=8082
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/security-platform

# JWT
JWT_SECRET=your-secret-key

# API Keys (optional)
SHODAN_API_KEY=your-shodan-key
VIRUSTOTAL_API_KEY=your-virustotal-key
```

## 📱 **Usage**

### **Web2 Security Scanning**
1. Navigate to **Web2 Security** in the sidebar
2. Click **"Start New Scan"**
3. Select target and scanning modules
4. Configure scan options
5. Monitor real-time progress
6. Review vulnerability findings

### **Dashboard Overview**
- View security statistics and metrics
- Monitor active scans and recent activities
- Access quick actions for common tasks
- Check threat intelligence and system health

### **Target Management**
- Add and manage scan targets
- Organize targets by type (Web, API, Web3)
- Track scan history and findings

## 🎨 **UI Themes**

### **Modern Light Theme** (Default)
- Beautiful gradient backgrounds
- Glass-morphism cards
- Floating geometric animations
- Professional sidebar contrast

### **Professional Theme**
- Clean, business-focused design
- Consistent color scheme
- Enhanced typography
- Responsive layout

## 🛠️ **Development**

### **Available Scripts**

**Root Level:**
- `npm run dev` - Start both frontend and backend
- `npm run client` - Start only frontend
- `npm run server` - Start only backend

**Frontend (client/):**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

**Backend (server/):**
- `npm run dev` - Start with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

### **API Endpoints**

**Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

**Web2 Scanning:**
- `GET /api/scans/web2/modules` - Get available modules
- `POST /api/scans/web2` - Start new scan
- `GET /api/scans` - Get all scans
- `GET /api/scans/:id` - Get specific scan

**Dashboard:**
- `GET /api/dashboard/stats` - Get dashboard statistics

**Targets:**
- `GET /api/targets` - Get all targets
- `POST /api/targets` - Create new target

## 🔒 **Security Features**

- **Authentication**: JWT-based user authentication
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting protection
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers middleware

## 📈 **Performance**

- **Optimized React Build**: Production-ready frontend
- **Efficient API Design**: RESTful endpoints with pagination
- **Real-time Updates**: WebSocket integration for live data
- **Caching**: Strategic caching for improved performance
- **Compression**: Gzip compression for faster loading

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

## 🆘 **Support**

For support and questions:
- Check the documentation files in this directory
- Review the API endpoints and examples
- Examine the component structure in the client folder

## 🎯 **Roadmap**

- [ ] Advanced Web3 security features
- [ ] Machine learning-based vulnerability detection
- [ ] Integration with external security tools
- [ ] Advanced reporting and analytics
- [ ] Mobile application
- [ ] Cloud deployment templates

---

**Built with ❤️ using the MERN Stack**

**Frontend**: React + Material-UI + Modern CSS
**Backend**: Node.js + Express + MongoDB
**Features**: Web2 Security Scanning + Beautiful UI + Real-time Updates