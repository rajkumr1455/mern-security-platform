import React from 'react';
import { TextField } from '@mui/material';


export const Textarea = ({ className = '', ...props }) => {
  return (
    <TextField
      variant='outlined'
      multiline
      minRows={3}
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