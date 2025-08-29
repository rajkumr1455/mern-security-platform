import React from 'react';
import { Button as MuiButton } from '@mui/material';


export const Button = ({ children, variant = 'default', size = 'default', className = '', disabled = false, ...props }) => {
  const variantMap = {
    default: 'contained',
    destructive: 'contained',
    outline: 'outlined',
    secondary: 'contained',
    ghost: 'text'
  };

  const colorMap = {
    default: 'primary',
    destructive: 'error',
    outline: 'primary',
    secondary: 'secondary',
    ghost: 'primary'
  };

  const sizeMap = {
    default: 'medium',
    sm: 'small',
    lg: 'large'
  };

  return (
    <MuiButton
      variant={variantMap[variant]}
      color={colorMap[variant]}
      size={sizeMap[size]}
      disabled={disabled}
      className={className}
      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 500 }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};