# MERN Stack Security Assessment Checklist

## Frontend (React.js) Security

### Authentication & Authorization
- [ ] JWT token storage (localStorage vs httpOnly cookies)
- [ ] Token expiration handling
- [ ] Refresh token implementation
- [ ] Role-based access control (RBAC)
- [ ] Protected routes implementation

### Input Validation & XSS Prevention
- [ ] Input sanitization on all user inputs
- [ ] Output encoding for dynamic content
- [ ] CSP (Content Security Policy) implementation
- [ ] dangerouslySetInnerHTML usage audit
- [ ] Third-party library XSS vulnerabilities

### Client-Side Security
- [ ] Sensitive data exposure in client-side code
- [ ] API endpoints hardcoded in frontend
- [ ] Source map exposure in production
- [ ] Console.log statements with sensitive data
- [ ] Local storage security

## Backend (Node.js/Express) Security

### Authentication & Session Management
- [ ] Password hashing (bcrypt implementation)
- [ ] JWT secret key strength and rotation
- [ ] Session management security
- [ ] Multi-factor authentication (MFA)
- [ ] Account lockout mechanisms

### Input Validation & Injection Prevention
- [ ] Request validation middleware
- [ ] NoSQL injection prevention (MongoDB)
- [ ] Command injection prevention
- [ ] Path traversal protection
- [ ] File upload security

### API Security
- [ ] Rate limiting implementation
- [ ] CORS configuration
- [ ] API versioning security
- [ ] Request size limits
- [ ] HTTP security headers

### Error Handling & Logging
- [ ] Error message sanitization
- [ ] Stack trace exposure prevention
- [ ] Comprehensive logging implementation
- [ ] Log injection prevention
- [ ] Sensitive data in logs

## Database (MongoDB) Security

### Access Control
- [ ] Database authentication enabled
- [ ] Role-based access control
- [ ] Network access restrictions
- [ ] Connection string security
- [ ] Database user privileges

### Data Protection
- [ ] Encryption at rest
- [ ] Encryption in transit
- [ ] Sensitive data field encryption
- [ ] Backup security
- [ ] Data retention policies

### Query Security
- [ ] NoSQL injection prevention
- [ ] Query optimization for DoS prevention
- [ ] Index security
- [ ] Aggregation pipeline security
- [ ] GridFS security (if used)

## Infrastructure & Deployment Security

### Server Configuration
- [ ] HTTPS implementation (TLS 1.2+)
- [ ] Security headers configuration
- [ ] Server information disclosure
- [ ] Directory listing disabled
- [ ] Default credentials changed

### Environment Security
- [ ] Environment variables protection
- [ ] Secrets management
- [ ] Configuration file security
- [ ] Dependency vulnerability scanning
- [ ] Container security (if using Docker)

### Monitoring & Incident Response
- [ ] Security monitoring implementation
- [ ] Intrusion detection
- [ ] Incident response plan
- [ ] Security alerting
- [ ] Audit trail implementation

## Specific MERN Vulnerabilities to Test

### 1. Authentication Bypass
```bash
# Test JWT manipulation
jwt-cli decode <token>
# Test weak secrets
hashcat -m 16500 jwt.txt wordlist.txt
```

### 2. NoSQL Injection
```javascript
// Test payloads
{"$ne": null}
{"$regex": ".*"}
{"$where": "this.username == this.password"}
```

### 3. API Abuse
```bash
# Parameter pollution
curl -X POST -d "user=admin&user=guest" /api/login
# HTTP method override
curl -X POST -H "X-HTTP-Method-Override: DELETE" /api/users/1
```

### 4. File Upload Vulnerabilities
```bash
# Test file type bypass
file.php.jpg
file.php%00.jpg
file.php;.jpg
```

### 5. CORS Misconfigurations
```javascript
// Test CORS bypass
Origin: https://evil.com
Origin: null
Origin: https://trusted-domain.evil.com
```

## Automated Testing Commands

### Quick Security Scan
```bash
# Run the elite assessment script
./scripts/elite-blackbox-assessment.sh target.com

# Nuclei vulnerability scan
nuclei -u https://target.com -t vulnerabilities/

# Directory fuzzing
ffuf -w wordlist.txt -u https://target.com/FUZZ
```

### API Testing
```bash
# Parameter discovery
arjun -u https://target.com/api/endpoint

# API fuzzing
ffuf -w api-wordlist.txt -u https://target.com/api/FUZZ
```

### JavaScript Analysis
```bash
# Extract endpoints from JS
jsluice urls < wayback_urls.txt

# Find secrets in JS
jsluice secrets < js_files.txt
```

## Manual Testing Checklist

### Authentication Testing
- [ ] Brute force protection
- [ ] Password policy enforcement
- [ ] Account enumeration
- [ ] Session fixation
- [ ] Concurrent session handling

### Authorization Testing
- [ ] Horizontal privilege escalation
- [ ] Vertical privilege escalation
- [ ] Direct object references (IDOR)
- [ ] Missing function level access control
- [ ] Business logic flaws

### Input Validation Testing
- [ ] SQL/NoSQL injection
- [ ] Cross-site scripting (XSS)
- [ ] Command injection
- [ ] LDAP injection
- [ ] XML external entity (XXE)

### Session Management Testing
- [ ] Session token analysis
- [ ] Session fixation
- [ ] Session timeout
- [ ] Logout functionality
- [ ] Concurrent sessions

## Reporting Template

### Vulnerability Report Structure
1. **Executive Summary**
2. **Vulnerability Details**
   - Description
   - Impact
   - Affected Components
   - Proof of Concept
3. **Remediation Steps**
4. **References**

### Risk Rating Matrix
- **Critical**: RCE, Authentication Bypass
- **High**: Privilege Escalation, Data Exposure
- **Medium**: XSS, Information Disclosure
- **Low**: Security Misconfigurations
- **Info**: Best Practice Recommendations

## Tools Integration

### Automated Pipeline
```bash
#!/bin/bash
# Automated MERN security assessment
target=$1

# Reconnaissance
subfinder -d $target | httpx -silent | nuclei -t exposures/

# API discovery
waybackurls $target | grep -E "api|endpoint" | sort -u

# Vulnerability scanning
nuclei -u https://$target -t vulnerabilities/

# Generate report
echo "Assessment complete for $target"
```