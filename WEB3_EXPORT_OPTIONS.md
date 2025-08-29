# 📊 Web3 Analysis Export Options

## 🎯 **Current Web3 Analysis Export Methods**

To export **current/fresh** Web3 results (not previous ones), you have several options:

## 🔄 **Method 1: Generate Fresh Analysis with Export**

### **API Call for New Analysis**
```bash
curl -X POST http://localhost:5000/api/web3/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "contractAddress": "0x355bd33f0033066bb3de396a6d069be57353ad95",
    "network": "ethereum",
    "generateReport": true,
    "exportFormats": ["html", "json", "pdf"]
  }'
```

### **Response includes Report ID**
```json
{
  "success": true,
  "data": {
    "id": "web3_1756041979043_51ceea64",
    "reportId": "web3_report_1756041979043",
    "status": "completed",
    "exportOptions": {
      "html": "/api/web3/report/download/web3_report_1756041979043/html",
      "json": "/api/web3/report/download/web3_report_1756041979043/json",
      "pdf": "/api/web3/report/download/web3_report_1756041979043/pdf"
    }
  }
}
```

## 📥 **Method 2: Download Latest Report**

### **Get Latest Report ID**
```bash
curl http://localhost:5000/api/web3/reports/latest
```

### **Download Specific Formats**
```bash
# Download HTML Report
curl -O http://localhost:5000/api/web3/report/download/{REPORT_ID}/security_report.html

# Download JSON Data
curl -O http://localhost:5000/api/web3/report/download/{REPORT_ID}/analysis_data.json

# Download Executive Summary
curl -O http://localhost:5000/api/web3/report/download/{REPORT_ID}/executive_summary.txt

# Download Complete Report Package
curl -O http://localhost:5000/api/web3/report/download/{REPORT_ID}/complete.zip
```

## 📋 **Method 3: View Current Report Content**

### **Get Report Metadata**
```bash
curl http://localhost:5000/api/web3/report/info/{REPORT_ID}
```

### **View Specific Files**
```bash
# View HTML Report
curl http://localhost:5000/api/web3/report/view/{REPORT_ID}/security_report.html

# View Executive Summary
curl http://localhost:5000/api/web3/report/view/{REPORT_ID}/executive_summary.txt

# View Analysis Data
curl http://localhost:5000/api/web3/report/view/{REPORT_ID}/analysis_data.json
```

## 🎯 **Method 4: Export via UI**

### **Web Interface Export**
1. Navigate to: `http://localhost:3000/web3`
2. Enter contract: `0x355bd33f0033066bb3de396a6d069be57353ad95`
3. Click "Analyze Contract"
4. Use export buttons in results:
   - 📄 "Export HTML"
   - 📊 "Export JSON"
   - 📋 "Export Summary"
   - 📦 "Download All"

## 📊 **Available Export Formats**

### **HTML Report** 📄
- Professional formatted report
- Includes charts and visualizations
- Ready for presentation
- Contains vulnerability details

### **JSON Data** 📊
- Raw analysis data
- Machine-readable format
- API integration friendly
- Complete vulnerability information

### **Executive Summary** 📋
- High-level overview
- Business-focused content
- Risk assessment summary
- Recommendations

### **Complete Package** 📦
- All files in ZIP format
- Screenshots included
- Visual charts
- Complete documentation

## 🚀 **Quick Export Commands**

### **For Current Analysis**
```bash
# Get latest report ID
LATEST_ID=$(curl -s http://localhost:5000/api/web3/reports/latest | jq -r '.reportId')

# Export HTML
curl -O "http://localhost:5000/api/web3/report/download/$LATEST_ID/security_report.html"

# Export JSON
curl -O "http://localhost:5000/api/web3/report/download/$LATEST_ID/analysis_data.json"

# Export Summary
curl -O "http://localhost:5000/api/web3/report/download/$LATEST_ID/executive_summary.txt"
```

### **Generate Fresh Analysis & Export**
```bash
# Start new analysis
ANALYSIS_ID=$(curl -s -X POST http://localhost:5000/api/web3/analyze \
  -H "Content-Type: application/json" \
  -d '{"contractAddress":"0x355bd33f0033066bb3de396a6d069be57353ad95","network":"ethereum","generateReport":true}' \
  | jq -r '.data.reportId')

# Wait for completion (15-30 seconds)
sleep 30

# Export the fresh report
curl -O "http://localhost:5000/api/web3/report/download/$ANALYSIS_ID/security_report.html"
```

## 📈 **Export Features**

### **Real-time Export** ✅
- Export immediately after analysis
- No waiting for batch processing
- Fresh data guaranteed

### **Multiple Formats** ✅
- HTML for presentation
- JSON for integration
- TXT for quick review
- ZIP for complete package

### **Professional Quality** ✅
- Updated "Bug Bounty Automation Platform" branding
- Professional formatting
- Comprehensive vulnerability details
- Visual evidence included

### **API Integration** ✅
- RESTful endpoints
- Programmatic access
- Automation friendly
- Webhook support available

## 🎯 **Recommended Workflow**

1. **Generate Fresh Analysis**
   ```bash
   curl -X POST http://localhost:5000/api/web3/analyze \
     -d '{"contractAddress":"0x355bd33f0033066bb3de396a6d069be57353ad95","generateReport":true}'
   ```

2. **Get Report ID from Response**
   ```json
   {"data": {"reportId": "web3_report_TIMESTAMP"}}
   ```

3. **Export Desired Format**
   ```bash
   curl -O "http://localhost:5000/api/web3/report/download/{REPORT_ID}/security_report.html"
   ```

This ensures you get the **current, fresh analysis results** with updated branding and latest vulnerability data!