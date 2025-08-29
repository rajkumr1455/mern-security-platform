import React from 'react';
import { Chip } from '@mui/material';


export const Badge = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
  const colorMap = {
    default: 'primary',
    destructive: 'error',
    warning: 'warning',
    success: 'success',
    secondary: 'default',
    outline: 'default'
  };

  const sizeMap = {
    default: 'medium',
    sm: 'small',
    lg: 'medium'
  };

  return (
    <Chip
      label={children}
      color={colorMap[variant]}
      size={sizeMap[size]}
      variant={variant === 'outline' ? 'outlined' : 'filled'}
      className={className}
      sx={{ borderRadius: 4, fontSize: size === 'sm' ? '0.75rem' : '0.875rem' }}
      {...props}
    />
  );
};