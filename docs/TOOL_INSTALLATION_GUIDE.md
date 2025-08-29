# Elite Bug Bounty Tools Installation Guide

This guide provides installation instructions for all tools referenced in the Elite Black-box Bug Bounty Workflow.

## Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential dependencies
sudo apt install -y git curl wget python3 python3-pip golang-go nodejs npm
```

## Core Reconnaissance Tools

### 1. waybackurls
```bash
go install github.com/tomnomnom/waybackurls@latest
```

### 2. github-subdomains
```bash
go install github.com/gwen001/github-subdomains@latest
```

### 3. Sudomy
```bash
cd ~/tools
git clone --recursive https://github.com/screetsec/Sudomy.git
cd Sudomy
python3 -m pip install -r requirements.txt
```

### 4. ReconHunter
```bash
cd ~/tools
git clone https://github.com/hassan0x/ReconHunter.git
cd ReconHunter
pip3 install -r requirements.txt
```

## Web Crawling & Analysis

### 5. gospider
```bash
go install github.com/jaeles-project/gospider@latest
```

### 6. jsluice
```bash
go install github.com/BishopFox/jsluice/cmd/jsluice@latest
```

### 7. waymore
```bash
pip3 install waymore
```

## Vulnerability Assessment

### 8. XSStrike
```bash
cd ~/tools
git clone https://github.com/s0md3v/XSStrike.git
cd XSStrike
pip3 install -r requirements.txt
```

### 9. Arjun
```bash
pip3 install arjun
```

### 10. ffuf
```bash
go install github.com/ffuf/ffuf@latest
```

## Port Scanning

### 11. RustScan
```bash
wget https://github.com/RustScan/RustScan/releases/download/2.0.1/rustscan_2.0.1_amd64.deb
sudo dpkg -i rustscan_2.0.1_amd64.deb
```

### 12. Nmap (if not installed)
```bash
sudo apt install nmap
```

## Secret Detection

### 13. truffleHog
```bash
go install github.com/trufflesecurity/trufflehog/v3@latest
```

## Additional Tools

### 14. httpx
```bash
go install github.com/projectdiscovery/httpx/cmd/httpx@latest
```

### 15. nuclei
```bash
go install github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest
```

### 16. subfinder
```bash
go install github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
```

## Tool Verification

Create a verification script:

```bash
#!/bin/bash
echo "Verifying tool installations..."

tools=(
    "waybackurls"
    "github-subdomains" 
    "gospider"
    "jsluice"
    "arjun"
    "ffuf"
    "rustscan"
    "nmap"
    "trufflehog"
    "httpx"
    "nuclei"
    "subfinder"
)

for tool in "${tools[@]}"; do
    if command -v "$tool" &> /dev/null; then
        echo "✓ $tool - installed"
    else
        echo "✗ $tool - missing"
    fi
done
```

## Environment Setup

Add to your `.bashrc` or `.zshrc`:

```bash
# Bug Bounty Tools
export PATH=$PATH:~/go/bin
export TOOLS_DIR=~/tools

# Create tools directory
mkdir -p ~/tools
```

## API Keys Configuration

Some tools require API keys. Create a config file:

```bash
# ~/.config/bugbounty/config.yaml
shodan_api_key: "your_shodan_key"
github_token: "your_github_token"
virustotal_api_key: "your_vt_key"
```

## Usage Notes

- Ensure all tools are in your PATH
- Some tools may require additional configuration
- Always respect rate limits and terms of service
- Use responsibly and only on authorized targets