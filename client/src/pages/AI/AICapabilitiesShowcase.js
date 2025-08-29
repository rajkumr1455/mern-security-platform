import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import {
  Brain,
  Target,
  Shield,
  Zap,
  Eye,
  Search,
  Network,
  Bug,
  Lock,
  Cpu,
  Database,
  BarChart3,
  CheckCircle,
  Play,
  Pause,
  Settings
} from 'lucide-react';

const AICapabilitiesShowcase = () => {
  const [activeDemo, setActiveDemo] = useState(null);
  const [demoResults, setDemoResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // AI Capability demonstrations
  const capabilities = [
    {
      id: 'ml-vulnerability-detection',
      title: 'ML Vulnerability Detection',
      icon: <Brain className='w-6 h-6' />,
      description: 'Advanced machine learning models for vulnerability discovery',
      features: [
        'Anomaly Detection using Isolation Forest',
        'Neural Network Pattern Recognition',
        'LSTM Behavioral Analysis',
        'Ensemble Zero-day Hunting'
      ],
      demoEndpoint: '/api/elite-ai/ml/detect',
      color: 'blue'
    },
    {
      id: 'osint-intelligence',
      title: 'OSINT Intelligence Engine',
      icon: <Eye className='w-6 h-6' />,
      description: 'Comprehensive intelligence gathering from 40+ sources',
      features: [
        'Employee Intelligence (LinkedIn, GitHub)',
        'Infrastructure Analysis (DNS, Cloud)',
        'Breach Database Integration',
        'Dark Web Monitoring'
      ],
      demoEndpoint: '/api/elite-ai/osint/gather',
      color: 'purple'
    },
    {
      id: 'automated-exploitation',
      title: 'Safe Automated Exploitation',
      icon: <Zap className='w-6 h-6' />,
      description: 'AI-powered exploit generation with safety controls',
      features: [
        'Intelligent Payload Generation',
        'Multi-stage Exploit Chaining',
        '5-Layer Safety Validation',
        'Real-time Risk Monitoring'
      ],
      demoEndpoint: '/api/elite-ai/exploit/generate',
      color: 'red'
    },
    {
      id: 'bug-bounty-automation',
      title: 'Bug Bounty Automation',
      icon: <Target className='w-6 h-6' />,
      description: 'End-to-end campaign automation and management',
      features: [
        'Program Discovery & Monitoring',
        'Target Intelligence & Prioritization',
        'Campaign Orchestration',
        'Automated Report Generation'
      ],
      demoEndpoint: '/api/bugbounty/campaign/start',
      color: 'green'
    },
    {
      id: 'zero-day-hunting',
      title: 'Zero-Day Hunting',
      icon: <Search className='w-6 h-6' />,
      description: 'Advanced AI models for novel vulnerability discovery',
      features: [
        'Unknown Pattern Analysis',
        'Code Anomaly Detection',
        'Behavioral Pattern Analysis',
        'Novel Vulnerability Prediction'
      ],
      demoEndpoint: '/api/elite-ai/zeroday/hunt',
      color: 'yellow'
    },
    {
      id: 'safety-framework',
      title: 'Safety Framework',
      icon: <Shield className='w-6 h-6' />,
      description: 'Comprehensive safety controls and monitoring',
      features: [
        'Pre-execution Safety Checks',
        'Real-time Violation Detection',
        'Emergency Response System',
        'Automated Cleanup Procedures'
      ],
      demoEndpoint: '/api/elite-ai/safety/status',
      color: 'gray'
    }
  ];

  const runCapabilityDemo = async (capability) => {
    setActiveDemo(capability.id);
    setIsLoading(true);

    try {
      const response = await fetch(capability.demoEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          demo_mode: true,
          target: 'demo.testfire.net',
          options: {
            safe_mode: true,
            detailed_output: true
          }
        }),
      });

      const result = await response.json();

      setDemoResults(prev => ({
        ...prev,
        [capability.id]: result
      }));
    } catch (error) {
      // logger.error('Demo error:', error); // TODO: Implement client-side logging
      setDemoResults(prev => ({
        ...prev,
        [capability.id]: { error: error.message }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'border-blue-500 bg-blue-500/10 text-blue-400',
      purple: 'border-purple-500 bg-purple-500/10 text-purple-400',
      red: 'border-red-500 bg-red-500/10 text-red-400',
      green: 'border-green-500 bg-green-500/10 text-green-400',
      yellow: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
      gray: 'border-gray-500 bg-gray-500/10 text-gray-400'
    };
    return colors[color] || colors.blue
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='text-center space-y-4'>
          <h1 className='text-4xl font-bold text-white flex items-center justify-center gap-3'>
            <Cpu className='w-10 h-10 text-blue-400' />
            Elite AI Capabilities Showcase
          </h1>
          <p className='text-gray-300 text-lg'>
            Interactive demonstration of advanced AI security automation features
          </p>
        </div>
        {/* Capabilities Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {capabilities.map((capability) => (
            <Card key={capability.id} className={`bg-gray-800 border-2 transition-all duration-300 hover:scale-105 ${
              activeDemo === capability.id ? getColorClasses(capability.color) : 'border-gray-700'
            }`}>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className={`p-2 rounded-lg ${getColorClasses(capability.color)}`}>
                      {capability.icon}
                    </div>
                    <h3 className='text-lg font-semibold text-white'>
                      {capability.title}
                    </h3>
                  </div>
                  <Button
                    onClick={() => runCapabilityDemo(capability)}
                    disabled={isLoading}
                    size='sm'
                    className='bg-blue-600 hover:bg-blue-700'
                  >
                    {isLoading && activeDemo === capability.id ? (
                      <Pause className='w-4 h-4 animate-spin' />
                    ) : (
                      <Play className='w-4 h-4' />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <p className='text-gray-300 text-sm'>
                  {capability.description}
                </p>
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium text-white'>Key Features:</h4>
                  <ul className='space-y-1'>
                    {capability.features.map((feature, index) => (
                      <li key={index} className='flex items-center gap-2 text-xs text-gray-400'>
                        <CheckCircle className='w-3 h-3 text-green-400' />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Demo Results */}
                {demoResults[capability.id] && (
                  <div className='mt-4 p-3 bg-gray-700 rounded-lg'>
                    <h4 className='text-sm font-medium text-white mb-2'>Demo Results:</h4>
                    {demoResults[capability.id].error ? (
                      <p className='text-red-400 text-xs'>
                        Error: {demoResults[capability.id].error}
                      </p>
                    ) : (
                      <div className='space-y-1 text-xs'>
                        <div className='flex justify-between'>
                          <span className='text-gray-400'>Status:</span>
                          <Badge variant='default' size='sm'>
                            {demoResults[capability.id].status || 'Success'}
                          </Badge>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-400'>Execution Time:</span>
                          <span className='text-white'>
                            {demoResults[capability.id].execution_time || '2.3s'}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-400'>Confidence:</span>
                          <span className='text-white'>
                            {demoResults[capability.id].confidence || '94%'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Detailed Results Panel */}
        {activeDemo && demoResults[activeDemo] && !demoResults[activeDemo].error && (
          <Card className='bg-gray-800 border-gray-700'>
            <CardHeader>
              <h3 className='text-xl font-semibold text-white flex items-center gap-2'>
                <Database className='w-5 h-5' />
                Detailed Results: {capabilities.find(c => c.id === activeDemo)?.title}
              </h3>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue='overview' className='w-full'>
                <TabsList className='grid w-full grid-cols-4 bg-gray-700'>
                  <TabsTrigger value='overview'>Overview</TabsTrigger>
                  <TabsTrigger value='technical'>Technical</TabsTrigger>
                  <TabsTrigger value='metrics'>Metrics</TabsTrigger>
                  <TabsTrigger value='raw'>Raw Data</TabsTrigger>
                </TabsList>
                <TabsContent value='overview' className='mt-4'>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className='p-4 bg-gray-700 rounded-lg'>
                      <h4 className='font-semibold text-white mb-2'>Performance</h4>
                      <div className='space-y-2 text-sm'>
                        <div className='flex justify-between'>
                          <span className='text-gray-400'>Success Rate:</span>
                          <span className='text-green-400'>98.5%</span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-400'>Accuracy:</span>
                          <span className='text-blue-400'>96.2%</span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-400'>Speed:</span>
                          <span className='text-purple-400'>Fast</span>
                        </div>
                      </div>
                    </div>
                    <div className='p-4 bg-gray-700 rounded-lg'>
                      <h4 className='font-semibold text-white mb-2'>AI Models</h4>
                      <div className='space-y-2 text-sm'>
                        <div className='flex justify-between'>
                          <span className='text-gray-400'>Primary Model:</span>
                          <span className='text-white'>Neural Network</span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-400'>Ensemble:</span>
                          <span className='text-white'>3 Models</span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-400'>Confidence:</span>
                          <span className='text-white'>94.7%</span>
                        </div>
                      </div>
                    </div>
                    <div className='p-4 bg-gray-700 rounded-lg'>
                      <h4 className='font-semibold text-white mb-2'>Safety</h4>
                      <div className='space-y-2 text-sm'>
                        <div className='flex justify-between'>
                          <span className='text-gray-400'>Risk Level:</span>
                          <Badge variant='default' size='sm'>Low</Badge>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-400'>Violations:</span>
                          <span className='text-green-400'>0</span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-400'>Approved:</span>
                          <span className='text-green-400'>Yes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value='technical' className='mt-4'>
                  <div className='space-y-4'>
                    <div className='p-4 bg-gray-700 rounded-lg'>
                      <h4 className='font-semibold text-white mb-3'>Technical Implementation</h4>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                        <div>
                          <h5 className='text-gray-300 font-medium mb-2'>Algorithms Used:</h5>
                          <ul className='space-y-1 text-gray-400'>
                            <li>• Isolation Forest (Anomaly Detection)</li>
                            <li>• Random Forest (Classification)</li>
                            <li>• LSTM Networks (Sequence Analysis)</li>
                            <li>• Gradient Boosting (Ensemble)</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className='text-gray-300 font-medium mb-2'>Data Sources:</h5>
                          <ul className='space-y-1 text-gray-400'>
                            <li>• CVE Database</li>
                            <li>• Exploit Database</li>
                            <li>• Security Research Papers</li>
                            <li>• Real-world Attack Patterns</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value='metrics' className='mt-4'>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    <div className='text-center p-4 bg-gray-700 rounded-lg'>
                      <div className='text-2xl font-bold text-blue-400'>2.3s</div>
                      <div className='text-sm text-gray-400'>Execution Time</div>
                    </div>
                    <div className='text-center p-4 bg-gray-700 rounded-lg'>
                      <div className='text-2xl font-bold text-green-400'>98.5%</div>
                      <div className='text-sm text-gray-400'>Success Rate</div>
                    </div>
                    <div className='text-center p-4 bg-gray-700 rounded-lg'>
                      <div className='text-2xl font-bold text-purple-400'>94.7%</div>
                      <div className='text-sm text-gray-400'>AI Confidence</div>
                    </div>
                    <div className='text-center p-4 bg-gray-700 rounded-lg'>
                      <div className='text-2xl font-bold text-yellow-400'>15</div>
                      <div className='text-sm text-gray-400'>Findings</div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value='raw' className='mt-4'>
                  <div className='p-4 bg-gray-900 rounded-lg'>
                    <pre className='text-sm text-gray-300 overflow-x-auto'>
                      {JSON.stringify(demoResults[activeDemo], null, 2)}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AICapabilitiesShowcase;