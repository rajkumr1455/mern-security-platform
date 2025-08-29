import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

  import {

    Dashboard as DashboardIcon,

  } from '@mui/icons-material';
  import {
    MyLocation as TargetIcon,
  } from '@mui/icons-material';
  import {
    Search as ReconIcon,
  } from '@mui/icons-material';
  import {
    Security as SecurityIcon,
  } from '@mui/icons-material';
  import {
    Token as Web3Icon,
  } from '@mui/icons-material';
  import {
    Psychology as AIIcon,
  } from '@mui/icons-material';
  import {
    Assessment as AssessmentIcon,
  } from '@mui/icons-material';
  import {
    AccountTree as WorkflowIcon,
  } from '@mui/icons-material';
  import {
    Report as ReportIcon,
  } from '@mui/icons-material';
  import {
    Description as AdvancedReportIcon,
  } from '@mui/icons-material';
  import {
    Speed as PerformanceIcon,
  } from '@mui/icons-material';
  import {
    Build as ToolsIcon,
  } from '@mui/icons-material';
  import {
    Settings as SettingsIcon,
  } from '@mui/icons-material';
  import {
    Shield as ShieldIcon,
  } from '@mui/icons-material';
  import {
    AttachMoney as BugBountyIcon,
  } from '@mui/icons-material';
  import {
    WorkspacePremium as EliteIcon,
  } from '@mui/icons-material';
  import {
    Timeline as OrchestratorIcon
  } from '@mui/icons-material';

const ProfessionalSidebar = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuSections = [
    {
      title: 'Overview',
      items: [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Targets', icon: <TargetIcon />, path: '/targets' }
      ]
    },
    {
      title: 'Security Testing',
      items: [
        { text: 'Reconnaissance', icon: <ReconIcon />, path: '/reconnaissance' },
        { text: 'Enhanced Sudomy', icon: <ReconIcon />, path: '/reconnaissance/enhanced' },
        { text: 'Vulnerability Scans', icon: <SecurityIcon />, path: '/scans' },
        { text: 'Web2 Security', icon: <ShieldIcon />, path: '/scans/web2' },
        { text: 'Web3 Security', icon: <Web3Icon />, path: '/web3' },
        { text: 'AI Analysis', icon: <AIIcon />, path: '/ai-analysis' },
        { text: 'Complete Elite AI', icon: <EliteIcon />, path: '/ai/complete' },
        { text: 'Security Tools', icon: <ToolsIcon />, path: '/tools' },
        { text: 'All Tools Overview', icon: <AssessmentIcon />, path: '/tools' }
      ]
    },
    {
      title: 'Bug Bounty Automation',
      items: [
        { text: 'Bug Bounty Dashboard', icon: <BugBountyIcon />, path: '/bugbounty' }
      ]
    },
    {
      title: 'Management',
      items: [
        { text: 'Workflows', icon: <WorkflowIcon />, path: '/workflows' },
        { text: 'Workflow Orchestrator', icon: <OrchestratorIcon />, path: '/workflows/orchestrator' },
        { text: 'Reports', icon: <ReportIcon />, path: '/reports' },
        { text: 'Advanced Reports', icon: <AdvancedReportIcon />, path: '/advanced-reports' },
        { text: 'Advanced Reporting', icon: <AdvancedReportIcon />, path: '/reports/advanced' }
      ]
    },
    {
      title: 'System',
      items: [
        { text: 'Performance', icon: <PerformanceIcon />, path: '/performance' },
        { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
      ]
    }
  ];

  const isActive = (path) => location.pathname === path

  return (
    <Box
      className={`professional-sidebar ${collapsed ? 'collapsed' : ''}`}
      sx={{
        width: collapsed ? '70px' : '280px',
        height: '100vh',
        background: 'linear-gradient(180deg, #1a1b2e 0%, #2d1b69 100%)',
        borderRight: '2px solid rgba(139, 92, 246, 0.3)',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
        transition: 'width 0.3s ease',
        boxShadow: '4px 0 12px rgba(0, 0, 0, 0.1)',
        '@media (max-width: 768px)': {
          transform: collapsed ? 'translateX(-100%)' : 'translateX(0)',
          width: '280px'
        }
      }}
    >
      {/* Sidebar Header */}
      <Box className='sidebar-header' sx={{
        padding: '1.5rem',
        borderBottom: '1px solid var(--border-primary)',
        background: 'var(--gradient-primary)'
      }}>
        <Box
          className='sidebar-brand'
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: '1.25rem',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/dashboard')}
        >
          <ShieldIcon sx={{ fontSize: '1.5rem', marginRight: collapsed ? 0 : '0.75rem' }} />
          {!collapsed && <span>Security Platform</span>}
        </Box>
      </Box>
      {/* Navigation Menu */}
      <Box className='sidebar-nav' sx={{ padding: '1rem 0', height: 'calc(100vh - 100px)', overflowY: 'auto' }}>
        {menuSections.map((section, sectionIndex) => (
          <Box key={sectionIndex} className='nav-section' sx={{ marginBottom: '2rem' }}>
            {!collapsed && (
              <Typography
                className='nav-section-title'
                sx={{
                  padding: '0 1.5rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#94a3b8'
                }}
              >
                {section.title}
              </Typography>
            )}

            <List sx={{ padding: 0 }}>
              {section.items.map((item, itemIndex) => (
                <ListItem
                  key={itemIndex}
                  className='nav-item'
                  sx={{
                    margin: '0.25rem 1rem',
                    padding: 0
                  }}
                >
                  <Box
                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      color: isActive(item.path) ? 'white' : '#e2e8f0',
                      textDecoration: 'none',
                      borderRadius: 'var(--radius-md)',
                      transition: 'var(--transition-fast)',
                      fontWeight: 500,
                      cursor: 'pointer',
                      width: '100%',
                      background: isActive(item.path) ? 'var(--gradient-primary)' : 'transparent',
                      boxShadow: isActive(item.path) ? 'var(--shadow-glow)' : 'none',
                      '&:hover': {
                        background: isActive(item.path) ? 'var(--gradient-primary)' : 'rgba(139, 92, 246, 0.2)',
                        color: '#ffffff',
                        transform: 'translateX(4px)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{
                      minWidth: '20px',
                      marginRight: collapsed ? 0 : '0.75rem',
                      color: 'inherit'
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.text}
                        sx={{
                          margin: 0,
                          '& .MuiListItemText-primary': {
                            fontSize: '0.875rem',
                            fontWeight: 'inherit'
                          }
                        }}
                      />
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
            {sectionIndex < menuSections.length - 1 && !collapsed && (
              <Divider sx={{
                margin: '1rem 1.5rem 0',
                borderColor: 'var(--border-primary)'
              }} />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ProfessionalSidebar;