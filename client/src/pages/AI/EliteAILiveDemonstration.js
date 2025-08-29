import React, { useState, useEffect, useRef } from 'react';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Progress } from '../../components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import {
  Brain,
  Target,
  Shield,
  Zap,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Square,
  BarChart3,
  Activity,
  Cpu,
  Database,
  Network,
  Lock,
  Unlock,
  Bug,
  Search,
  Crosshair
} from 'lucide-react';

const EliteAILiveDemonstration = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('idle');
  const [liveResults, setLiveResults] = useState({});
  const [metrics, setMetrics] = useState({});
  const [logs, setLogs] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState('');
  const [demoMode, setDemoMode] = useState('vulnerability-discovery');
  const wsRef = useRef(null);

  // Demo targets for testing
  const demoTargets = [
    { id: 'testphp.vulnweb.com', name: 'TestPHP (Vulnerable Web App)', type: 'Web Application' },
    { id: 'demo.testfire.net', name: 'Altoro Mutual (Banking Demo)', type: 'Financial Application' },
    { id: 'zero.webappsecurity.com', name: 'Zero Bank (Security Testing)', type: 'Banking Application' },
    { id: 'dvwa.local', name: 'DVWA (Local Testing)', type: 'Vulnerable Application' },
    { id: 'custom', name: 'Custom Target', type: 'User Defined' }
  ];

  // Demo modes
  const demoModes = [
    {
      id: 'vulnerability-discovery',
      name: 'AI Vulnerability Discovery',
      icon: <Brain className='w-5 h-5' />,
      description: 'Demonstrate ML-powered vulnerability detection'
    },
    {
      id: 'osint-intelligence',
      name: 'OSINT Intelligence Gathering',
      icon: <Eye className='w-5 h-5' />,
      description: 'Show comprehensive intelligence collection'
    },
    {
      id: 'automated-exploitation',
      name: 'Safe Automated Exploitation',
      icon: <Zap className='w-5 h-5' />,
      description: 'Demonstrate controlled exploit execution'
    },
    {
      id: 'bug-bounty-automation',
      name: 'Bug Bounty Campaign',
      icon: <Target className='w-5 h-5' />,
      description: 'Show end-to-end campaign automation'
    },
    {
      id: 'zero-day-hunting',
      name: 'Zero-Day Hunting',
      icon: <Search className='w-5 h-5' />,
      description: 'Advanced AI-powered novel vulnerability discovery'
    }
  ];

  useEffect(() => {
    // Initialize WebSocket connection for live updates
    initializeWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const initializeWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/elite-ai-demo`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleLiveUpdate(data);
    };

    wsRef.current.onerror = (error) => {
      // logger.error('WebSocket error:', error); // TODO: Implement client-side logging
      addLog('error', 'WebSocket connection failed');
    };
  };

  const handleLiveUpdate = (data) => {
    switch (data.type) {
      case 'phase_update':
        setCurrentPhase(data.phase);
        addLog('info', `Phase: ${data.phase}`);
        break
      case 'result_update':
        setLiveResults(prev => ({ ...prev, ...data.results }));
        break
      case 'metrics_update':
        setMetrics(prev => ({ ...prev, ...data.metrics }));
        break
      case 'log':
        addLog(data.level, data.message);
        break
      default:;
        break
    }
  };

  const addLog = (level, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-99), { timestamp, level, message }]);
  };

  const startDemonstration = async () => {
    if (!selectedTarget) {
      addLog('error', 'Please select a target for demonstration');
      return
    }

    setIsRunning(true);
    setCurrentPhase('initializing');
    setLiveResults({});
    setMetrics({});
    setLogs([]);

    addLog('info', `Starting ${demoMode} demonstration on ${selectedTarget}`);

    try {
      const response = await fetch('/api/elite-ai/demo/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: selectedTarget,
          mode: demoMode,
          options: {
            live_demo: true,
            safety_mode: true,
            detailed_logging: true
          }
        }),
      });

      const result = await response.json();

      if (result.success) {
        addLog('success', 'Demonstration started successfully');
      } else {
        addLog('error', `Failed to start demonstration: ${result.error}`);
        setIsRunning(false);
      }
    } catch (error) {
      addLog('error', `Error starting demonstration: ${error.message}`);
      setIsRunning(false);
    }
  };

  const stopDemonstration = async () => {
    try {
      await fetch('/api/elite-ai/demo/stop', {
        method: 'POST',
      });

      setIsRunning(false);
      setCurrentPhase('stopped');
      addLog('info', 'Demonstration stopped');
    } catch (error) {
      addLog('error', `Error stopping demonstration: ${error.message}`);
    }
  };

  const pauseDemonstration = async () => {
    try {
      await fetch('/api/elite-ai/demo/pause', {
        method: 'POST',
      });

      setCurrentPhase('paused');
      addLog('info', 'Demonstration paused');
    } catch (error) {
      addLog('error', `Error pausing demonstration: ${error.message}`);
    }
  };

  const getPhaseIcon = (phase) => {
    const icons = {
      'idle': <Square className='w-4 h-4' />,
      'initializing': <Activity className='w-4 h-4 animate-spin' />,
      'reconnaissance': <Search className='w-4 h-4' />,
      'vulnerability-scanning': <Bug className='w-4 h-4' />,
      'ai-analysis': <Brain className='w-4 h-4' />,
      'exploitation': <Zap className='w-4 h-4' />,
      'reporting': <BarChart3 className='w-4 h-4' />,
      'completed': <CheckCircle className='w-4 h-4' />,
      'error': <XCircle className='w-4 h-4' />,
      'paused': <Pause className='w-4 h-4' />,
      'stopped': <Square className='w-4 h-4' />
    };
    return icons[phase] || <Activity className='w-4 h-4' />
  };

  const getPhaseColor = (phase) => {
    const colors = {
      'idle': 'gray',
      'initializing': 'blue',
      'reconnaissance': 'yellow',
      'vulnerability-scanning': 'orange',
      'ai-analysis': 'purple',
      'exploitation': 'red',
      'reporting': 'green',
      'completed': 'green',
      'error': 'red',
      'paused': 'yellow',
      'stopped': 'gray'
    };
    return colors[phase] || 'blue';
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='text-center space-y-4'>
          <h1 className='text-4xl font-bold text-white flex items-center justify-center gap-3'>
            <Brain className='w-10 h-10 text-blue-400' />
            Elite AI Security Engine
            <span className='text-2xl text-blue-400'>Live Demonstration</span>
          </h1>
          <p className='text-gray-300 text-lg'>
            Real-time demonstration of advanced AI-powered security automation capabilities
          </p>
        </div>
        {/* Control Panel */}
        <Card className='bg-gray-800 border-gray-700'>
          <CardHeader>
            <h2 className='text-xl font-semibold text-white flex items-center gap-2'>
              <Cpu className='w-5 h-5' />
              Demonstration Control Panel
            </h2>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Demo Mode Selection */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Demonstration Mode
                </label>
                <select
                  value={demoMode}
                  onChange={(e) => setDemoMode(e.target.value)}
                  className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white'
                  disabled={isRunning}
                >
                  {demoModes.map(mode => (
                    <option key={mode.id} value={mode.id}>
                      {mode.name}
                    </option>
                  ))}
                </select>
                <p className='text-xs text-gray-400 mt-1'>
                  {demoModes.find(m => m.id === demoMode)?.description}
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Target Selection
                </label>
                <select
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white'
                  disabled={isRunning}
                >
                  <option value=''>Select a target...</option>
                  {demoTargets.map(target => (
                    <option key={target.id} value={target.id}>
                      {target.name} ({target.type})
                    </option>
                  ))}
                </select>
              </div>
              <div className='flex items-end gap-2'>
                <Button
                  onClick={startDemonstration}
                  disabled={isRunning || !selectedTarget}
                  className='bg-green-600 hover:bg-green-700 text-white flex items-center gap-2'
                >
                  <Play className='w-4 h-4' />
                  Start Demo
                </Button>
                <Button
                  onClick={pauseDemonstration}
                  disabled={!isRunning}
                  className='bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2'
                >
                  <Pause className='w-4 h-4' />
                  Pause
                </Button>
                <Button
                  onClick={stopDemonstration}
                  disabled={!isRunning}
                  className='bg-red-600 hover:bg-red-700 text-white flex items-center gap-2'
                >
                  <Square className='w-4 h-4' />
                  Stop
                </Button>
              </div>
            </div>
            {/* Current Status */}
            <div className='flex items-center justify-between p-4 bg-gray-700 rounded-lg'>
              <div className='flex items-center gap-3'>
                <Badge variant={getPhaseColor(currentPhase)} className='flex items-center gap-1'>
                  {getPhaseIcon(currentPhase)}
                  {currentPhase.replace('-', ' ').toUpperCase()}
                </Badge>
                <span className='text-gray-300'>
                  {isRunning ? 'Demonstration Active' : 'Ready for Demonstration'}
                </span>
              </div>
              <div className='flex items-center gap-4 text-sm text-gray-400'>
                <span>Target: {selectedTarget || 'None'}</span>
                <span>Mode: {demoModes.find(m => m.id === demoMode)?.name}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Live Results Dashboard */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Real-time Metrics */}
          <Card className='bg-gray-800 border-gray-700'>
            <CardHeader>
              <h3 className='text-lg font-semibold text-white flex items-center gap-2'>
                <BarChart3 className='w-5 h-5' />
                Live Metrics
              </h3>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='text-center p-3 bg-gray-700 rounded-lg'>
                  <div className='text-2xl font-bold text-blue-400'>
                    {metrics.vulnerabilities_found || 0}
                  </div>
                  <div className='text-xs text-gray-400'>Vulnerabilities</div>
                </div>
                <div className='text-center p-3 bg-gray-700 rounded-lg'>
                  <div className='text-2xl font-bold text-green-400'>
                    {metrics.exploits_generated || 0}
                  </div>
                  <div className='text-xs text-gray-400'>Exploits</div>
                </div>
                <div className='text-center p-3 bg-gray-700 rounded-lg'>
                  <div className='text-2xl font-bold text-purple-400'>
                    {metrics.ai_confidence || 0}%
                  </div>
                  <div className='text-xs text-gray-400'>AI Confidence</div>
                </div>
                <div className='text-center p-3 bg-gray-700 rounded-lg'>
                  <div className='text-2xl font-bold text-yellow-400'>
                    {metrics.success_rate || 0}%
                  </div>
                  <div className='text-xs text-gray-400'>Success Rate</div>
                </div>
              </div>
              {/* Progress Indicators */}
              <div className='space-y-3'>
                <div>
                  <div className='flex justify-between text-sm text-gray-400 mb-1'>
                    <span>Reconnaissance</span>
                    <span>{metrics.recon_progress || 0}%</span>
                  </div>
                  <Progress value={metrics.recon_progress || 0} className='h-2' />
                </div>
                <div>
                  <div className='flex justify-between text-sm text-gray-400 mb-1'>
                    <span>AI Analysis</span>
                    <span>{metrics.ai_progress || 0}%</span>
                  </div>
                  <Progress value={metrics.ai_progress || 0} className='h-2' />
                </div>
                <div>
                  <div className='flex justify-between text-sm text-gray-400 mb-1'>
                    <span>Exploitation</span>
                    <span>{metrics.exploit_progress || 0}%</span>
                  </div>
                  <Progress value={metrics.exploit_progress || 0} className='h-2' />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Live Activity Log */}
          <Card className='bg-gray-800 border-gray-700 lg:col-span-2'>
            <CardHeader>
              <h3 className='text-lg font-semibold text-white flex items-center gap-2'>
                <Activity className='w-5 h-5' />
                Live Activity Log
              </h3>
            </CardHeader>
            <CardContent>
              <div className='h-64 overflow-y-auto bg-gray-900 rounded-lg p-3 font-mono text-sm'>
                {logs.length === 0 ? (
                  <div className='text-gray-500 text-center py-8'>
                    No activity yet. Start a demonstration to see live logs.
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className={`mb-1 ${
                      log.level === 'error' ? 'text-red-400' :
                      log.level === 'success' ? 'text-green-400' :
                      log.level === 'warning' ? 'text-yellow-400' :
                      'text-gray-300'
                    }`}>
                      <span className='text-gray-500'>[{log.timestamp}]</span> {log.message}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Detailed Results Tabs */}
        <Card className='bg-gray-800 border-gray-700'>
          <CardHeader>
            <h3 className='text-lg font-semibold text-white flex items-center gap-2'>
              <Database className='w-5 h-5' />
              Live Demonstration Results
            </h3>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue='vulnerabilities' className='w-full'>
              <TabsList className='grid w-full grid-cols-5 bg-gray-700'>
                <TabsTrigger value='vulnerabilities' className='text-white'>
                  Vulnerabilities
                </TabsTrigger>
                <TabsTrigger value='exploits' className='text-white'>
                  Exploits
                </TabsTrigger>
                <TabsTrigger value='intelligence' className='text-white'>
                  Intelligence
                </TabsTrigger>
                <TabsTrigger value='ai-analysis' className='text-white'>
                  AI Analysis
                </TabsTrigger>
                <TabsTrigger value='safety' className='text-white'>
                  Safety Controls
                </TabsTrigger>
              </TabsList>
              <TabsContent value='vulnerabilities' className='mt-4'>
                <div className='space-y-3'>
                  {liveResults.vulnerabilities?.length > 0 ? (
                    liveResults.vulnerabilities.map((vuln, index) => (
                      <div key={index} className='p-4 bg-gray-700 rounded-lg'>
                        <div className='flex items-center justify-between mb-2'>
                          <h4 className='font-semibold text-white'>{vuln.title}</h4>
                          <Badge variant={vuln.severity === 'critical' ? 'destructive' :
                                        vuln.severity === 'high' ? 'destructive' :
                                        vuln.severity === 'medium' ? 'warning' : 'secondary'}>
                            {vuln.severity}
                          </Badge>
                        </div>
                        <p className='text-gray-300 text-sm mb-2'>{vuln.description}</p>
                        <div className='flex items-center gap-4 text-xs text-gray-400'>
                          <span>Type: {vuln.type}</span>
                          <span>Confidence: {vuln.confidence}%</span>
                          <span>AI Generated: {vuln.ai_generated ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='text-center py-8 text-gray-500'>
                      No vulnerabilities discovered yet. Start a demonstration to see results.
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value='exploits' className='mt-4'>
                <div className='space-y-3'>
                  {liveResults.exploits?.length > 0 ? (
                    liveResults.exploits.map((exploit, index) => (
                      <div key={index} className='p-4 bg-gray-700 rounded-lg'>
                        <div className='flex items-center justify-between mb-2'>
                          <h4 className='font-semibold text-white'>{exploit.name}</h4>
                          <div className='flex items-center gap-2'>
                            <Badge variant={exploit.approved ? 'default' : 'warning'}>
                              {exploit.approved ? 'Approved' : 'Pending'}
                            </Badge>
                            <Badge variant='outline'>
                              {exploit.success_probability}% Success
                            </Badge>
                          </div>
                        </div>
                        <p className='text-gray-300 text-sm mb-2'>{exploit.description}</p>
                        <div className='flex items-center gap-4 text-xs text-gray-400'>
                          <span>Target: {exploit.target}</span>
                          <span>Type: {exploit.type}</span>
                          <span>Safety Level: {exploit.safety_level}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='text-center py-8 text-gray-500'>
                      No exploits generated yet. Start a demonstration to see results.
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value='intelligence' className='mt-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='p-4 bg-gray-700 rounded-lg'>
                    <h4 className='font-semibold text-white mb-3 flex items-center gap-2'>
                      <Network className='w-4 h-4' />
                      Infrastructure Intelligence
                    </h4>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-gray-400'>Subdomains:</span>
                        <span className='text-white'>{liveResults.intelligence?.subdomains || 0}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-400'>Technologies:</span>
                        <span className='text-white'>{liveResults.intelligence?.technologies || 0}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-400'>Services:</span>
                        <span className='text-white'>{liveResults.intelligence?.services || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className='p-4 bg-gray-700 rounded-lg'>
                    <h4 className='font-semibold text-white mb-3 flex items-center gap-2'>
                      <Eye className='w-4 h-4' />
                      OSINT Intelligence
                    </h4>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-gray-400'>Employees:</span>
                        <span className='text-white'>{liveResults.intelligence?.employees || 0}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-400'>Breaches:</span>
                        <span className='text-white'>{liveResults.intelligence?.breaches || 0}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-400'>Social Media:</span>
                        <span className='text-white'>{liveResults.intelligence?.social_media || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value='ai-analysis' className='mt-4'>
                <div className='space-y-4'>
                  <div className='p-4 bg-gray-700 rounded-lg'>
                    <h4 className='font-semibold text-white mb-3 flex items-center gap-2'>
                      <Brain className='w-4 h-4' />
                      AI Model Performance
                    </h4>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                      <div className='text-center'>
                        <div className='text-lg font-bold text-blue-400'>
                          {liveResults.ai_analysis?.anomaly_detection || 0}%
                        </div>
                        <div className='text-gray-400'>Anomaly Detection</div>
                      </div>
                      <div className='text-center'>
                        <div className='text-lg font-bold text-purple-400'>
                          {liveResults.ai_analysis?.pattern_recognition || 0}%
                        </div>
                        <div className='text-gray-400'>Pattern Recognition</div>
                      </div>
                      <div className='text-center'>
                        <div className='text-lg font-bold text-green-400'>
                          {liveResults.ai_analysis?.behavioral_analysis || 0}%
                        </div>
                        <div className='text-gray-400'>Behavioral Analysis</div>
                      </div>
                      <div className='text-center'>
                        <div className='text-lg font-bold text-yellow-400'>
                          {liveResults.ai_analysis?.zero_day_potential || 0}%
                        </div>
                        <div className='text-gray-400'>Zero-day Potential</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value='safety' className='mt-4'>
                <div className='space-y-4'>
                  <Alert className='border-green-500 bg-green-500/10'>
                    <Shield className='h-4 w-4' />
                    <AlertDescription className='text-green-400'>
                      All safety controls are active and monitoring operations in real-time.
                    </AlertDescription>
                  </Alert>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='p-4 bg-gray-700 rounded-lg'>
                      <h4 className='font-semibold text-white mb-3 flex items-center gap-2'>
                        <Lock className='w-4 h-4' />
                        Safety Checks
                      </h4>
                      <div className='space-y-2 text-sm'>
                        <div className='flex items-center justify-between'>
                          <span className='text-gray-400'>Scope Validation</span>
                          <CheckCircle className='w-4 h-4 text-green-400' />
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-gray-400'>Legal Compliance</span>
                          <CheckCircle className='w-4 h-4 text-green-400' />
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-gray-400'>Impact Assessment</span>
                          <CheckCircle className='w-4 h-4 text-green-400' />
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-gray-400'>Reversibility Check</span>
                          <CheckCircle className='w-4 h-4 text-green-400' />
                        </div>
                      </div>
                    </div>
                    <div className='p-4 bg-gray-700 rounded-lg'>
                      <h4 className='font-semibold text-white mb-3 flex items-center gap-2'>
                        <AlertTriangle className='w-4 h-4' />
                        Risk Monitoring
                      </h4>
                      <div className='space-y-2 text-sm'>
                        <div className='flex justify-between'>
                          <span className='text-gray-400'>Risk Level:</span>
                          <Badge variant='default'>Low</Badge>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-400'>Safety Violations:</span>
                          <span className='text-green-400'>0</span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-400'>Emergency Stops:</span>
                          <span className='text-green-400'>0</span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-400'>Cleanup Actions:</span>
                          <span className='text-green-400'>0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EliteAILiveDemonstration;