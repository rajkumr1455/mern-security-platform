import React, { Suspense } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';


/**;
 * Lazy loading wrapper component for performance optimization
 */;
const LazyLoadingFallback = ({ message = 'Loading...' }) => (
  <Box
    display='flex'
    flexDirection='column'
    alignItems='center'
    justifyContent='center'
    minHeight='200px'
    gap={2}
  >
    <CircularProgress size={40} />
    <Typography variant='body2' color='text.secondary'>
      {message}
    </Typography>
  </Box>
);

const LazyComponent = ({
  children,
  fallback = <LazyLoadingFallback />,
  errorFallback = <Typography color='error'>Failed to load component</Typography>
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

export default LazyComponent;