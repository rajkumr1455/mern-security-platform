import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import {
  Terminal,
  Play,
  Square,
  Download,
  Upload,
  Settings,
  Brain,
  Target,
  Shield,
  Zap,
  Eye,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

const InteractiveAITesting = () => {
  const [selectedTest, setSelectedTest] = useState('vulnerability-detection');
  const [testConfig, setTestConfig] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [testHistory, setTestHistory] = useState([]);

  const testTypes = [
    {
      id: 'vulnerability-detection',
      name: 'Vulnerability Detection',
      icon: <Brain className='w-5 h-5' />,
      description: 'Test AI-powered vulnerability discovery capabilities',
      endpoint: '/api/elite-ai/ml/detect',
      parameters: [
        { name: 'target', type: 'text', required: true, placeholder: 'https://example.com' },
        { name: 'scan_depth', type: 'select', options: ['shallow', 'medium', 'deep'], default: 'medium' },
        { name: 'ai_models', type: 'multiselect', options: ['anomaly', 'pattern', 'behavioral', 'ensemble'] },
        { name: 'confidence_threshold', type: 'number', min: 0, max: 100, default: 80 }
      ]
    },
    {
      id: 'osint-gathering',
      name: 'OSINT Intelligence',
      icon: <Eye className='w-5 h-5' />,
      description: 'Test comprehensive intelligence gathering capabilities',
      endpoint: '/api/elite-ai/osint/gather',
      parameters: [
        { name: 'target', type: 'text', required: true, placeholder: 'example.com' },
        { name: 'sources', type: 'multiselect', options: ['linkedin', 'github', 'social', 'dns', 'whois'] },
        { name: 'depth_level', type: 'select', options: ['basic', 'standard', 'comprehensive'], default: 'standard' },
        { name: 'include_employees', type: 'boolean', default: true }
      ]
    },
    {
      id: 'exploit-generation',
      name: 'Exploit Generation',
      icon: <Zap className='w-5 h-5' />,
      description: 'Test AI-powered exploit generation with safety controls',
      endpoint: '/api/elite-ai/exploit/generate',
      parameters: [
        { name: 'vulnerability_type', type: 'select', options: ['xss', 'sqli', 'rce', 'lfi', 'xxe'] },
        { name: 'target_context', type: 'textarea', placeholder: 'Describe the target application context...' },
        { name: 'safety_level', type: 'select', options: ['maximum', 'high', 'medium'], default: 'maximum' },
        { name: 'generate_poc', type: 'boolean', default: true }
      ]
    },
    {
      id: 'zero-day-hunting',
      name: 'Zero-Day Hunting',
      icon: <Search className='w-5 h-5' />,
      description: 'Test advanced zero-day vulnerability discovery',
      endpoint: '/api/elite-ai/zeroday/hunt',
      parameters: [
        { name: 'target', type: 'text', required: true, placeholder: 'https://example.com' },
        { name: 'analysis_type', type: 'select', options: ['behavioral', 'pattern', 'anomaly', 'comprehensive'] },
        { name: 'novelty_threshold', type: 'number', min: 0, max: 100, default: 90 },
        { name: 'deep_analysis', type: 'boolean', default: false }
      ]
    }
  ];

  const runTest = async () => {
    const currentTest = testTypes.find(t => t.id === selectedTest);
    setIsRunning(true);
    setTestResults(null);

    try {
      const response = await fetch(currentTest.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...testConfig,
          test_mode: true,
          detailed_output: true
        }),
      });

      const result = await response.json();
      setTestResults(result);

      // Add to history
      const historyEntry = {
        id: Date.now(),
        test: currentTest.name,
        timestamp: new Date().toISOString(),
        config: { ...testConfig },
        result: result,
        success: result.success
      };
      setTestHistory(prev => [historyEntry, ...prev.slice(0, 9)]);

    } catch (error) {
      setTestResults({
        success: false,
        error: error.message
      });
    } finally {
      setIsRunning(false);
    }
  };

  const updateConfig = (paramName, value) => {
    setTestConfig(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const renderParameterInput = (param) => {
    switch (param.type) {
      case 'text':
        return (
          <Input
            type='text'
            placeholder={param.placeholder}
            value={testConfig[param.name] || ''}
            onChange={(e) => updateConfig(param.name, e.target.value)}
            className='bg-gray-700 border-gray-600 text-white'
          />
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={param.placeholder}
            value={testConfig[param.name] || ''}
            onChange={(e) => updateConfig(param.name, e.target.value)}
            className='bg-gray-700 border-gray-600 text-white'
            rows={3}
          />
        );

      case 'select':
        return (
          <select
            value={testConfig[param.name] || param.default || ''}
            onChange={(e) => updateConfig(param.name, e.target.value)}
            className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white'
          >
            {param.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className='space-y-2'>
            {param.options.map(option => (
              <label key={option} className='flex items-center gap-2 text-sm text-gray-300'>
                <input
                  type='checkbox'
                  checked={(testConfig[param.name] || []).includes(option)}
                  onChange={(e) => {
                    const current = testConfig[param.name] || [];
                    const updated = e.target.checked
                      ? [...current, option]
                      : current.filter(item => item !== option);
                    updateConfig(param.name, updated);
                  }}
                  className='rounded'
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'number':
        return (
          <Input
            type='number'
            min={param.min}
            max={param.max}
            value={testConfig[param.name] || param.default || ''}
            onChange={(e) => updateConfig(param.name, parseInt(e.target.value))}
            className='bg-gray-700 border-gray-600 text-white'
          />
        );

      case 'boolean':
        return (
          <label className='flex items-center gap-2 text-gray-300'>
            <input
              type='checkbox'
              checked={testConfig[param.name] ?? param.default}
              onChange={(e) => updateConfig(param.name, e.target.checked)}
              className='rounded'
            />
            Enable
          </label>
        );

      default:;
        return null
    }
  };

  const currentTest = testTypes.find(t => t.id === selectedTest);

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='text-center space-y-4'>
          <h1 className='text-4xl font-bold text-white flex items-center justify-center gap-3'>
            <Terminal className='w-10 h-10 text-green-400' />
            Interactive AI Testing Console
          </h1>
          <p className='text-gray-300 text-lg'>
            Test and validate AI security capabilities with real-time feedback
          </p>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Test Selection */}
          <Card className='bg-gray-800 border-gray-700'>
            <CardHeader>
              <h3 className='text-lg font-semibold text-white'>Select Test Type</h3>
            </CardHeader>
            <CardContent className='space-y-3'>
              {testTypes.map(test => (
                <div
                  key={test.id}
                  onClick={() => setSelectedTest(test.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedTest === test.id
                      ? 'bg-blue-600 border-blue-500'
                      : 'bg-gray-700 hover:bg-gray-600'
                  } border`}
                >
                  <div className='flex items-center gap-3'>
                    {test.icon}
                    <div>
                      <h4 className='font-medium text-white'>{test.name}</h4>
                      <p className='text-xs text-gray-400'>{test.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          {/* Test Configuration */}
          <Card className='bg-gray-800 border-gray-700'>
            <CardHeader>
              <h3 className='text-lg font-semibold text-white flex items-center gap-2'>
                <Settings className='w-5 h-5' />
                Test Configuration
              </h3>
            </CardHeader>
            <CardContent className='space-y-4'>
              {currentTest?.parameters.map(param => (
                <div key={param.name} className='space-y-2'>
                  <label className='block text-sm font-medium text-gray-300'>
                    {param.name.replace('_', ' ').toUpperCase()}
                    {param.required && <span className='text-red-400 ml-1'>*</span>}
                  </label>
                  {renderParameterInput(param)}
                </div>
              ))}

              <div className='pt-4 space-y-2'>
                <Button
                  onClick={runTest}
                  disabled={isRunning}
                  className='w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2'
                >
                  {isRunning ? (
                    <>
                      <Square className='w-4 h-4 animate-pulse' />
                      Running Test...
                    </>
                  ) : (
                    <>
                      <Play className='w-4 h-4' />
                      Run Test
                    </>
                  )}
                </Button>
                {testResults && (
                  <Button
                    onClick={() => {
                      const dataStr = JSON.stringify(testResults, null, 2);
                      const dataBlob = new Blob([dataStr], {type: 'application/json'});
                      const url = URL.createObjectURL(dataBlob);
                      const link = document.createElement('a');
                      link.href = url
                      link.download = `ai-test-results-${Date.now()}.json`;
                      link.click();
                    }}
                    className='w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2'
                  >
                    <Download className='w-4 h-4' />
                    Download Results
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Test Results */}
          <Card className='bg-gray-800 border-gray-700'>
            <CardHeader>
              <h3 className='text-lg font-semibold text-white'>Test Results</h3>
            </CardHeader>
            <CardContent>
              {!testResults ? (
                <div className='text-center py-8 text-gray-500'>
                  Configure and run a test to see results here
                </div>
              ) : (
                <div className='space-y-4'>
                  {/* Status */}
                  <Alert className={`${
                    testResults.success
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-red-500 bg-red-500/10'
                  }`}>
                    {testResults.success ? (
                      <CheckCircle className='h-4 w-4 text-green-400' />
                    ) : (
                      <XCircle className='h-4 w-4 text-red-400' />
                    )}
                    <AlertDescription className={testResults.success ? 'text-green-400' : 'text-red-400'}>
                      {testResults.success ? 'Test completed successfully' : `Test failed: ${testResults.error}`}
                    </AlertDescription>
                  </Alert>
                  {/* Metrics */}
                  {testResults.success && (
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='text-center p-3 bg-gray-700 rounded-lg'>
                        <div className='text-lg font-bold text-blue-400'>
                          {testResults.execution_time || '2.3s'}
                        </div>
                        <div className='text-xs text-gray-400'>Execution Time</div>
                      </div>
                      <div className='text-center p-3 bg-gray-700 rounded-lg'>
                        <div className='text-lg font-bold text-green-400'>
                          {testResults.confidence || '94%'}
                        </div>
                        <div className='text-xs text-gray-400'>Confidence</div>
                      </div>
                    </div>
                  )}

                  {/* Results Summary */}
                  {testResults.success && testResults.summary && (
                    <div className='p-3 bg-gray-700 rounded-lg'>
                      <h4 className='font-medium text-white mb-2'>Summary</h4>
                      <p className='text-sm text-gray-300'>{testResults.summary}</p>
                    </div>
                  )}

                  {/* Raw Results */}
                  <div className='p-3 bg-gray-900 rounded-lg'>
                    <h4 className='font-medium text-white mb-2'>Raw Output</h4>
                    <pre className='text-xs text-gray-300 overflow-x-auto max-h-40'>
                      {JSON.stringify(testResults, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Test History */}
        {testHistory.length > 0 && (
          <Card className='bg-gray-800 border-gray-700'>
            <CardHeader>
              <h3 className='text-lg font-semibold text-white flex items-center gap-2'>
                <Clock className='w-5 h-5' />
                Test History
              </h3>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {testHistory.map(entry => (
                  <div key={entry.id} className='flex items-center justify-between p-3 bg-gray-700 rounded-lg'>
                    <div className='flex items-center gap-3'>
                      {entry.success ? (
                        <CheckCircle className='w-4 h-4 text-green-400' />
                      ) : (
                        <XCircle className='w-4 h-4 text-red-400' />
                      )}
                      <div>
                        <h4 className='font-medium text-white'>{entry.test}</h4>
                        <p className='text-xs text-gray-400'>
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={entry.success ? 'default' : 'destructive'}>
                      {entry.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InteractiveAITesting;