import React from 'react';
import { TextField } from '@mui/material';


export const Input = ({ className = '', ...props }) => {
  return (
    <TextField
      variant='outlined'
      size='small'
      fullWidth
      className={className}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          backgroundColor: '#ffffff'
        }
      }}
      {...props}
    />
  );
};