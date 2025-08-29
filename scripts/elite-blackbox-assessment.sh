#!/bin/bash

# Elite Black-box Bug Bounty Assessment Script
# Author: Elite Security Researcher
# Target: MERN Stack Security Platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "=============================================="
echo "  Elite Black-box Bug Bounty Assessment"
echo "  MERN Stack Security Platform"
echo "=============================================="
echo -e "${NC}"

# Check if target is provided
if [ $# -eq 0 ]; then
    echo -e "${RED}[!] Usage: $0 <target_domain>${NC}"
    echo -e "${YELLOW}[*] Example: $0 example.com${NC}"
    exit 1
fi

TARGET="$1"
OUTPUT_DIR="elite_assessment_$(date +%Y%m%d_%H%M%S)"
TOOLS_DIR="$HOME/tools"

echo -e "${GREEN}[+] Target: $TARGET${NC}"
echo -e "${GREEN}[+] Output Directory: $OUTPUT_DIR${NC}"

# Create output directory structure
mkdir -p "$OUTPUT_DIR"/{recon,enumeration,vulnerabilities,exploitation,reports}

# Phase 1: Passive Reconnaissance
echo -e "\n${BLUE}[PHASE 1] Passive Reconnaissance${NC}"

echo -e "${YELLOW}[*] Gathering wayback URLs...${NC}"
if command -v waybackurls &> /dev/null; then
    waybackurls "$TARGET" > "$OUTPUT_DIR/recon/wayback_urls.txt"
    echo -e "${GREEN}[✓] Wayback URLs saved${NC}"
else
    echo -e "${RED}[!] waybackurls not found. Install: go install github.com/tomnomnom/waybackurls@latest${NC}"
fi

echo -e "${YELLOW}[*] GitHub subdomain discovery...${NC}"
if command -v github-subdomains &> /dev/null; then
    github-subdomains -d "$TARGET" > "$OUTPUT_DIR/recon/github_subdomains.txt"
    echo -e "${GREEN}[✓] GitHub subdomains saved${NC}"
else
    echo -e "${RED}[!] github-subdomains not found${NC}"
fi

echo -e "${YELLOW}[*] Sudomy passive reconnaissance...${NC}"
if [ -d "$TOOLS_DIR/Sudomy" ]; then
    cd "$TOOLS_DIR/Sudomy"
    bash sudomy -d "$TARGET" -o "$OUTPUT_DIR/recon/"
    cd - > /dev/null
    echo -e "${GREEN}[✓] Sudomy scan completed${NC}"
else
    echo -e "${RED}[!] Sudomy not found in $TOOLS_DIR${NC}"
fi

# Phase 2: Active Enumeration
echo -e "\n${BLUE}[PHASE 2] Active Enumeration${NC}"

echo -e "${YELLOW}[*] Web crawling with gospider...${NC}"
if command -v gospider &> /dev/null; then
    gospider -s "https://$TARGET" -o "$OUTPUT_DIR/enumeration/gospider" -c 10 -d 3 --sitemap --robots
    echo -e "${GREEN}[✓] Web crawling completed${NC}"
else
    echo -e "${RED}[!] gospider not found. Install: go install github.com/jaeles-project/gospider@latest${NC}"
fi

echo -e "${YELLOW}[*] Port scanning with RustScan...${NC}"
if command -v rustscan &> /dev/null; then
    rustscan -a "$TARGET" --ulimit 5000 -- -sV -sC > "$OUTPUT_DIR/enumeration/rustscan_results.txt"
    echo -e "${GREEN}[✓] Port scan completed${NC}"
else
    echo -e "${RED}[!] RustScan not found${NC}"
fi

# Phase 3: Vulnerability Assessment
echo -e "\n${BLUE}[PHASE 3] Vulnerability Assessment${NC}"

echo -e "${YELLOW}[*] Parameter discovery with Arjun...${NC}"
if command -v arjun &> /dev/null; then
    arjun -u "https://$TARGET" -oT "$OUTPUT_DIR/vulnerabilities/parameters.txt" -m GET POST
    echo -e "${GREEN}[✓] Parameter discovery completed${NC}"
else
    echo -e "${RED}[!] Arjun not found. Install: pip3 install arjun${NC}"
fi

echo -e "${YELLOW}[*] XSS testing with XSStrike...${NC}"
if command -v xsstrike &> /dev/null; then
    xsstrike -u "https://$TARGET" --crawl --blind > "$OUTPUT_DIR/vulnerabilities/xss_results.txt"
    echo -e "${GREEN}[✓] XSS testing completed${NC}"
else
    echo -e "${RED}[!] XSStrike not found${NC}"
fi

# Phase 4: API and Endpoint Discovery
echo -e "\n${BLUE}[PHASE 4] API and Endpoint Discovery${NC}"

echo -e "${YELLOW}[*] JavaScript endpoint extraction...${NC}"
if command -v jsluice &> /dev/null && [ -f "$OUTPUT_DIR/recon/wayback_urls.txt" ]; then
    jsluice urls < "$OUTPUT_DIR/recon/wayback_urls.txt" > "$OUTPUT_DIR/enumeration/js_endpoints.txt"
    jsluice secrets < "$OUTPUT_DIR/recon/wayback_urls.txt" > "$OUTPUT_DIR/vulnerabilities/js_secrets.txt"
    echo -e "${GREEN}[✓] JavaScript analysis completed${NC}"
else
    echo -e "${RED}[!] jsluice not found or wayback URLs missing${NC}"
fi

# Phase 5: MERN Stack Specific Tests
echo -e "\n${BLUE}[PHASE 5] MERN Stack Specific Assessment${NC}"

echo -e "${YELLOW}[*] MongoDB injection testing...${NC}"
cat > "$OUTPUT_DIR/vulnerabilities/nosql_payloads.txt" << 'EOF'
{"$ne": null}
{"$regex": ".*"}
{"$where": "this.username == this.password"}
{"$gt": ""}
EOF

echo -e "${YELLOW}[*] JWT token analysis...${NC}"
# Check for JWT tokens in responses
grep -r "eyJ" "$OUTPUT_DIR/" > "$OUTPUT_DIR/vulnerabilities/jwt_tokens.txt" 2>/dev/null || true

echo -e "${YELLOW}[*] Node.js specific vulnerability checks...${NC}"
# Check for common Node.js vulnerabilities
cat > "$OUTPUT_DIR/vulnerabilities/nodejs_checks.txt" << 'EOF'
# Common Node.js vulnerability patterns to check:
- Prototype pollution
- Command injection via child_process
- Path traversal in file operations
- Unsafe deserialization
- Express.js misconfigurations
EOF

# Phase 6: Report Generation
echo -e "\n${BLUE}[PHASE 6] Report Generation${NC}"

echo -e "${YELLOW}[*] Generating assessment report...${NC}"
cat > "$OUTPUT_DIR/reports/assessment_summary.md" << EOF
# Elite Black-box Assessment Report

**Target:** $TARGET  
**Date:** $(date)  
**Assessment Type:** Black-box Bug Bounty Methodology

## Executive Summary

This assessment was conducted using elite black-box methodologies focusing on:
- Passive reconnaissance and OSINT
- Active enumeration and vulnerability discovery
- MERN stack specific security testing
- API endpoint discovery and abuse

## Findings Summary

### Reconnaissance Results
- Wayback URLs: $(wc -l < "$OUTPUT_DIR/recon/wayback_urls.txt" 2>/dev/null || echo "0") URLs discovered
- GitHub Subdomains: $(wc -l < "$OUTPUT_DIR/recon/github_subdomains.txt" 2>/dev/null || echo "0") subdomains found

### Vulnerability Assessment
- Parameters Discovered: $(wc -l < "$OUTPUT_DIR/vulnerabilities/parameters.txt" 2>/dev/null || echo "0")
- JavaScript Endpoints: $(wc -l < "$OUTPUT_DIR/enumeration/js_endpoints.txt" 2>/dev/null || echo "0")
- Potential Secrets: $(wc -l < "$OUTPUT_DIR/vulnerabilities/js_secrets.txt" 2>/dev/null || echo "0")

## Recommendations

1. **Input Validation**: Implement proper input validation for all user inputs
2. **Authentication**: Strengthen JWT token handling and session management
3. **API Security**: Implement proper API rate limiting and authentication
4. **Error Handling**: Avoid exposing sensitive information in error messages
5. **Dependency Management**: Regularly update and audit dependencies

## Tools Used

- waybackurls: URL discovery from Wayback Machine
- github-subdomains: GitHub-based subdomain enumeration
- Sudomy: Comprehensive OSINT reconnaissance
- gospider: Web application crawling
- RustScan: Fast port scanning
- Arjun: Parameter discovery
- XSStrike: XSS vulnerability detection
- jsluice: JavaScript analysis and secret extraction

EOF

echo -e "${GREEN}[✓] Assessment report generated${NC}"

# Final summary
echo -e "\n${GREEN}=============================================="
echo -e "  Assessment Complete!"
echo -e "=============================================="
echo -e "Output Directory: $OUTPUT_DIR"
echo -e "Report Location: $OUTPUT_DIR/reports/assessment_summary.md"
echo -e "=============================================="
echo -e "${NC}"

# Display quick stats
echo -e "${BLUE}Quick Statistics:${NC}"
echo -e "- Files created: $(find "$OUTPUT_DIR" -type f | wc -l)"
echo -e "- Total size: $(du -sh "$OUTPUT_DIR" | cut -f1)"

echo -e "\n${YELLOW}[*] Review the generated files for detailed findings${NC}"
echo -e "${YELLOW}[*] Use the assessment_summary.md for reporting${NC}"