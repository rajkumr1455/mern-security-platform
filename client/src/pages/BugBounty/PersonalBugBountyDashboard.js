import React, { useState, useEffect } from 'react';
import {  Card, Button, Badge, Progress, Tabs, Alert  } from '../../components/ui';
import { Target,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Eye,
  Send,
  RefreshCw,
  Calendar,
  BarChart3
 } from 'lucide-react';

const PersonalBugBountyDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [targetInput, setTargetInput] = useState('');

  useEffect(() => {
    loadDashboardData();
    loadSubmissions();
    loadEarnings();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/bugbounty/dashboard');
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      // logger.error('Failed to load dashboard:', error); // TODO: Implement client-side logging
    }
  };

  const loadSubmissions = async () => {
    try {
      const response = await fetch('/api/bugbounty/submissions');
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.data.submissions);
      }
    } catch (error) {
      // logger.error('Failed to load submissions:', error); // TODO: Implement client-side logging
    }
  };

  const loadEarnings = async () => {
    try {
      const response = await fetch('/api/bugbounty/earnings');
      const data = await response.json();
      if (data.success) {
        setEarnings(data.data);
      }
      setLoading(false);
    } catch (error) {
      // logger.error('Failed to load earnings:', error); // TODO: Implement client-side logging
      setLoading(false);
    }
  };

  const startPersonalWorkflow = async () => {
    if (!targetInput.trim()) return

    try {
      const response = await fetch('/api/bugbounty/workflow/personal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: targetInput.trim() })
      });

      const data = await response.json();
      if (data.success) {
        alert(`🚀 Workflow started for ${targetInput}! Check back in a few minutes for results.`);
        setTargetInput('');
        loadDashboardData();
      }
    } catch (error) {
      // logger.error('Failed to start workflow:', error); // TODO: Implement client-side logging
      alert('Failed to start workflow. Please try again.');
    }
  };

  const submitReport = async (platform, reportData) => {
    try {
      const response = await fetch('/api/bugbounty/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, reportData })
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Report submitted to ${platform}!`);
        loadSubmissions();
      }
    } catch (error) {
      // logger.error('Failed to submit report:', error); // TODO: Implement client-side logging
      alert('Failed to submit report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <RefreshCw className='w-8 h-8 animate-spin mx-auto mb-4' />
          <p>Loading your bug bounty dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-white mb-2'>
            🎯 Personal Bug Bounty Dashboard
          </h1>
          <p className='text-blue-200'>
            Your automated bug hunting command center
          </p>
        </div>
        {/* Quick Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card className='bg-gradient-to-r from-green-500 to-green-600 text-white'>
            <div className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-green-100'>Total Earnings</p>
                  <p className='text-3xl font-bold'>
                    ${earnings?.totalEarnings || 0}
                  </p>
                </div>
                <DollarSign className='w-12 h-12 text-green-200' />
              </div>
            </div>
          </Card>
          <Card className='bg-gradient-to-r from-blue-500 to-blue-600 text-white'>
            <div className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-blue-100'>Success Rate</p>
                  <p className='text-3xl font-bold'>
                    {earnings?.successRate || 0}%
                  </p>
                </div>
                <TrendingUp className='w-12 h-12 text-blue-200' />
              </div>
            </div>
          </Card>
          <Card className='bg-gradient-to-r from-purple-500 to-purple-600 text-white'>
            <div className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-purple-100'>Total Submissions</p>
                  <p className='text-3xl font-bold'>
                    {earnings?.totalSubmissions || 0}
                  </p>
                </div>
                <Send className='w-12 h-12 text-purple-200' />
              </div>
            </div>
          </Card>
          <Card className='bg-gradient-to-r from-orange-500 to-orange-600 text-white'>
            <div className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-orange-100'>Avg Bounty</p>
                  <p className='text-3xl font-bold'>
                    ${earnings?.averageBounty || 0}
                  </p>
                </div>
                <Target className='w-12 h-12 text-orange-200' />
              </div>
            </div>
          </Card>
        </div>
        {/* Quick Start */}
        <Card className='mb-8 bg-white/10 backdrop-blur-sm border-white/20'>
          <div className='p-6'>
            <h2 className='text-2xl font-bold text-white mb-4'>
              🚀 Quick Start Workflow
            </h2>
            <div className='flex gap-4'>
              <input
                type='text'
                placeholder='Enter target domain (e.g., example.com)'
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                className='flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60'
                onKeyPress={(e) => e.key === 'Enter' && startPersonalWorkflow()}
              />
              <Button
                onClick={startPersonalWorkflow}
                className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
              >
                <Play className='w-4 h-4 mr-2' />
                Start Hunt
              </Button>
            </div>
          </div>
        </Card>
        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className='flex space-x-1 mb-6'>
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'recommendations', label: 'Recommendations', icon: Target },
              { id: 'submissions', label: 'Submissions', icon: Send },
              { id: 'workflows', label: 'Active Workflows', icon: RefreshCw }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <tab.icon className='w-4 h-4 mr-2' />
                {tab.label}
              </button>
            ))}
          </div>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className='space-y-6'>
              {/* Goal Progress */}
              <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
                <div className='p-6'>
                  <h3 className='text-xl font-bold text-white mb-4'>
                    📈 Goal Progress
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    {dashboardData?.goals && Object.entries(dashboardData.goals).map(([period, goals]) => (
                      <div key={period} className='space-y-4'>
                        <h4 className='font-semibold text-white capitalize'>
                          {period}
                        </h4>
                        {Object.entries(goals).map(([metric, data]) => (
                          <div key={metric} className='space-y-2'>
                            <div className='flex justify-between text-sm'>
                              <span className='text-white/80 capitalize'>
                                {metric.replace(/([A-Z])/g, ' $1')}
                              </span>
                              <span className='text-white'>
                                {data.current}/{data.target}
                              </span>
                            </div>
                            <Progress
                              value={Math.min(data.progress, 100)}
                              className='h-2'
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              {/* Quick Actions */}
              <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
                <div className='p-6'>
                  <h3 className='text-xl font-bold text-white mb-4'>
                    ⚡ Quick Actions
                  </h3>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    {dashboardData?.quickActions?.map((action, index) => (
                      <Button
                        key={index}
                        variant='outline'
                        className='h-20 flex-col bg-white/5 border-white/20 text-white hover:bg-white/10'
                      >
                        <span className='text-2xl mb-2'>{action.icon}</span>
                        <span className='text-sm'>{action.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
              <div className='p-6'>
                <h3 className='text-xl font-bold text-white mb-4'>
                  🎯 Daily Recommendations
                </h3>
                <div className='space-y-4'>
                  {dashboardData?.recommendations?.map((rec, index) => (
                    <div key={index} className='p-4 bg-white/5 rounded-lg border border-white/10'>
                      <div className='flex justify-between items-start mb-2'>
                        <h4 className='font-semibold text-white'>{rec.domain}</h4>
                        <Badge
                          variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                          className='ml-2'
                        >
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className='text-white/80 text-sm mb-3'>{rec.reason}</p>
                      <div className='flex justify-between items-center'>
                        <div className='flex space-x-4 text-sm text-white/60'>
                          <span>⏱️ {rec.estimatedTime}m</span>
                          <span>💰 ${rec.bountyPotential}</span>
                          <span>📊 {(rec.successProbability * 100).toFixed(0)}%</span>
                        </div>
                        <Button
                          size='sm'
                          onClick={() => setTargetInput(rec.domain)}
                          className='bg-blue-500 hover:bg-blue-600'
                        >
                          <Play className='w-3 h-3 mr-1' />
                          Hunt
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
              <div className='p-6'>
                <h3 className='text-xl font-bold text-white mb-4'>
                  📤 Recent Submissions
                </h3>
                <div className='space-y-4'>
                  {submissions.slice(0, 10).map((submission) => (
                    <div key={submission.id} className='p-4 bg-white/5 rounded-lg border border-white/10'>
                      <div className='flex justify-between items-start mb-2'>
                        <div>
                          <h4 className='font-semibold text-white'>
                            {submission.reportData?.title || 'Vulnerability Report'}
                          </h4>
                          <p className='text-white/60 text-sm'>
                            Platform: {submission.platform} • {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <Badge
                            variant={
                              submission.status === 'submitted' ? 'default' :
                              submission.status === 'failed' ? 'destructive' : 'secondary'
                            }
                          >
                            {submission.status}
                          </Badge>
                          {submission.bountyAmount && (
                            <Badge variant='outline' className='text-green-400 border-green-400'>
                              ${submission.bountyAmount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {submission.platformUrl && (
                        <a
                          href={submission.platformUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-400 hover:text-blue-300 text-sm'
                        >
                          <Eye className='w-3 h-3 inline mr-1' />
                          View on Platform
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Active Workflows Tab */}
          {activeTab === 'workflows' && (
            <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
              <div className='p-6'>
                <h3 className='text-xl font-bold text-white mb-4'>
                  🔄 Active Workflows
                </h3>
                <div className='space-y-4'>
                  {dashboardData?.activeWorkflows?.length > 0 ? (
                    dashboardData.activeWorkflows.map((workflow) => (
                      <div key={workflow.id} className='p-4 bg-white/5 rounded-lg border border-white/10'>
                        <div className='flex justify-between items-start mb-3'>
                          <div>
                            <h4 className='font-semibold text-white'>{workflow.target}</h4>
                            <p className='text-white/60 text-sm'>
                              Started: {new Date(workflow.startTime).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant='outline' className='text-blue-400 border-blue-400'>
                            {workflow.status}
                          </Badge>
                        </div>
                        <div className='space-y-2'>
                          {Object.entries(workflow.phases).map(([phase, data]) => (
                            <div key={phase} className='flex items-center space-x-3'>
                              <div className={`w-3 h-3 rounded-full ${
                                data.status === 'completed' ? 'bg-green-500' :
                                data.status === 'running' ? 'bg-blue-500 animate-pulse' :
                                'bg-gray-500';
                              }`} />
                              <span className='text-white/80 text-sm capitalize'>
                                {phase.replace(/_/g, ' ')}
                              </span>
                              {data.status === 'running' && (
                                <RefreshCw className='w-3 h-3 animate-spin text-blue-400' />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  ) : (
                    <div className='text-center py-8'>
                      <Clock className='w-12 h-12 text-white/40 mx-auto mb-4' />
                      <p className='text-white/60'>No active workflows</p>
                      <p className='text-white/40 text-sm'>Start a new hunt to see workflows here</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default PersonalBugBountyDashboard;