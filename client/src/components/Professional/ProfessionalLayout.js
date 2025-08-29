import ProfessionalNavbar from './ProfessionalNavbar';
import ProfessionalSidebar from './ProfessionalSidebar';
import React, { useState } from 'react';
import { Box } from '@mui/material';


const ProfessionalLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <Box className='professional-layout' sx={{ display: 'flex', height: '100vh' }}>
      <ProfessionalSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ProfessionalNavbar />
        <Box
          component='main'
          className='professional-main'
          sx={{
            flex: 1,
            marginLeft: sidebarCollapsed ? '70px' : '280px',
            marginTop: '70px',
            padding: '2rem',
            background: 'var(--bg-primary)',
            transition: 'margin-left 0.3s ease',
            '@media (max-width: 768px)': {
              marginLeft: 0,
              padding: '1rem'
            }
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default ProfessionalLayout;