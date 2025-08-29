import React from 'react';
import { Chip } from '@mui/material';


const SecurityBadge = ({ severity, label, size = 'small', variant = 'filled' }) => {
  const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'security-badge critical';
      case 'high': return 'security-badge high';
      case 'medium': return 'security-badge medium';
      case 'low': return 'security-badge low';
      case 'secure': return 'security-badge secure';
      case 'safe': return 'security-badge secure';
      default: return 'security-badge medium';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      case 'secure': return '🛡️';
      case 'safe': return '✅';
      default: return '🔵';
    }
  };

  return (
    <span className={getSeverityClass(severity)}>
      <span style={{ marginRight: '4px' }}>{getSeverityIcon(severity)}</span>
      {label || severity}
    </span>
  );
};

export default SecurityBadge;