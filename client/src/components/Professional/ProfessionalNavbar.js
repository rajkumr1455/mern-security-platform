import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Chip

} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfessionalNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleSettings = () => {
    navigate('/settings');
    handleMenuClose();
  };

  return (
    <AppBar
      position='fixed'
      className='professional-navbar'
      sx={{
        height: '70px',
        background: 'var(--bg-navbar)',
        borderBottom: '1px solid var(--border-primary)',
        left: '280px',
        width: 'calc(100% - 280px)',
        boxShadow: 'var(--shadow-md)',
        '@media (max-width: 768px)': {
          left: 0,
          width: '100%'
        }
      }}
      elevation={0}
    >
      <Toolbar sx={{
        height: '70px',
        padding: '0 2rem',
        justifyContent: 'space-between',
        '@media (max-width: 768px)': {
          padding: '0 1rem'
        }
      }}>
        {/* Left side - Brand/Title */}
        <Typography
          variant='h6'
          className='navbar-brand'
          sx={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Security Platform
        </Typography>
        {/* Right side - User menu */}
        <Box className='navbar-nav' sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Status Indicator */}
          <Chip
            label='Online'
            size='small'
            sx={{
              background: 'var(--gradient-success)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          />
          {/* Notifications */}
          <IconButton
            color='inherit'
            sx={{
              color: 'var(--text-secondary)',
              '&:hover': { color: 'var(--text-primary)' }
            }}
          >
            <NotificationsIcon />
          </IconButton>
          {/* User Profile */}
          <Box
            className='nav-user'
            onClick={handleProfileMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 1rem',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-secondary)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              '&:hover': {
                background: 'var(--bg-card)',
                borderColor: 'var(--border-accent)'
              }
            }}
          >
            <Avatar
              className='user-avatar'
              sx={{
                width: 32,
                height: 32,
                background: 'var(--gradient-primary)',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              {user?.username?.charAt(0)?.toUpperCase() || 'A'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography
                variant='body2'
                sx={{
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  lineHeight: 1.2
                }}
              >
                {user?.username || 'Admin'}
              </Typography>
              <Typography
                variant='caption'
                sx={{
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem'
                }}
              >
                {user?.role || 'Administrator'}
              </Typography>
            </Box>
          </Box>
          {/* User Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                minWidth: 200,
                mt: 1
              }
            }}
          >
            <MenuItem
              onClick={handleSettings}
              sx={{
                color: 'var(--text-secondary)',
                '&:hover': {
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)'
                }
              }}
            >
              <SettingsIcon sx={{ mr: 1, fontSize: '1.25rem' }} />
              Settings
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              sx={{
                color: 'var(--text-secondary)',
                '&:hover': {
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)'
                }
              }}
            >
              <LogoutIcon sx={{ mr: 1, fontSize: '1.25rem' }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default ProfessionalNavbar;