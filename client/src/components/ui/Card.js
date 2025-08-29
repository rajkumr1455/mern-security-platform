import React from 'react';
import { Paper } from '@mui/material';


export const Card = ({ children, className = '', ...props }) => {
  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 2,
        border: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
        ...props.sx
      }}
      className={className}
      {...props}
    >
      {children}
    </Paper>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div
      style={{
        padding: '16px 24px',
        borderBottom: '1px solid #e5e7eb',
        ...props.style
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div
      style={{
        padding: '16px 24px',
        ...props.style
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};