const fs = require('fs');
const path = require('path');

class VisualizationEngine {
  constructor() {
    this.chartTypes = ['bar', 'pie', 'line', 'gauge', 'heatmap']
  }

  generateSecurityGauge(data) {
    const { score = 75, title = "Security Score" } = data;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
</head>
<body>
    <div id="gauge" style="width:600px;height:400px;"></div>
    <script>
        var data = [{
            domain: { x: [0, 1], y: [0, 1] },
            value: ${score},
            title: { text: "${title}" },
            type: "indicator",
            mode: "gauge+number+delta",
            gauge: {
                axis: { range: [null, 100] },
                bar: { color: "darkblue" },
                steps: [
                    { range: [0, 50], color: "lightgray" },
                    { range: [50, 80], color: "gray" }
                ],
                threshold: {
                    line: { color: "red", width: 4 },
                    thickness: 0.75,
                    value: 90
                }
            }
        }];
        
        var layout = { width: 600, height: 400, margin: { t: 0, b: 0 } };
        Plotly.newPlot("gauge", data, layout);
    </script>
</body>
</html>`;
  }

  generateSeverityChart(vulnerabilities) {
    const severityCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    };

    vulnerabilities.forEach(vuln => {
      if (severityCounts.hasOwnProperty(vuln.severity)) {
        severityCounts[vuln.severity]++;
      }
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Vulnerability Severity Distribution</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
</head>
<body>
    <div id="chart" style="width:800px;height:500px;"></div>
    <script>
        var data = [{
            x: ["Critical', 'High', 'Medium', 'Low', 'Info'],
            y: [${severityCounts.critical}, ${severityCounts.high}, ${severityCounts.medium}, ${severityCounts.low}, ${severityCounts.info}],
            type: 'bar',
            marker: {
                color: ['#8B0000', '#FF0000', '#FFA500', '#FFFF00', '#0000FF']
            }
        }];
        
        var layout = {
            title: 'Vulnerability Severity Distribution',
            xaxis: { title: 'Severity Level' },
            yaxis: { title: "Count" }
        };
        
        Plotly.newPlot("chart", data, layout);
    </script>
</body>
</html>`;
  }

  generateTimelineChart(scanHistory) {
    const dates = scanHistory.map(scan => scan.date);
    const counts = scanHistory.map(scan => scan.vulnerabilityCount);

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Vulnerability Timeline</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
</head>
<body>
    <div id="timeline" style="width:900px;height:500px;"></div>
    <script>
        var data = [{
            x: ${JSON.stringify(dates)},
            y: ${JSON.stringify(counts)},
            type: "scatter',
            mode: 'lines+markers',
            name: 'Vulnerabilities Found'
        }];
        
        var layout = {
            title: 'Vulnerability Discovery Timeline',
            xaxis: { title: 'Date' },
            yaxis: { title: "Vulnerabilities Found" }
        };
        
        Plotly.newPlot("timeline", data, layout);
    </script>
</body>
</html>`;
  }

  generateHeatmap(data) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Security Heatmap</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
</head>
<body>
    <div id="heatmap" style="width:800px;height:600px;"></div>
    <script>
        var data = [{
            z: ${JSON.stringify(data.values || [[1, 2, 3], [4, 5, 6], [7, 8, 9]])},
            x: ${JSON.stringify(data.xLabels || ["Low', 'Medium', 'High'])},
            y: ${JSON.stringify(data.yLabels || ['Web2', 'Web3', 'API'])},
            type: 'heatmap',
            colorscale: 'Viridis'
        }];
        
        var layout = {
            title: 'Security Risk Heatmap',
            xaxis: { title: 'Risk Level' },
            yaxis: { title: 'Category' }
        };
        
        Plotly.newPlot('heatmap', data, layout);
    </script>
</body>
</html>`;
  }

  generateVisualization(type, data) {
    switch (type) {
      case 'gauge':
        return this.generateSecurityGauge(data);
      case 'severity':
        return this.generateSeverityChart(data.vulnerabilities || []);
      case 'timeline':
        return this.generateTimelineChart(data.scanHistory || []);
      case 'heatmap':
        return this.generateHeatmap(data);
      default:
        throw new Error(`Unsupported visualization type: ${type}`);
    }
  }

  saveVisualization(html, filename) {
    const filePath = path.join(process.cwd(), "reports", filename);
    fs.writeFileSync(filePath, html);
    return filePath;
  }
}

module.exports = VisualizationEngine;