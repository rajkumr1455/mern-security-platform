import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Card,
  CardContent,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProfessionalLogin = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: 'admin@security.com',
      password: 'admin123'
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      // logger.info('Professional Login: Submitting with data:', data); // TODO: Implement client-side logging
      const result = await login(data.email, data.password);

      if (result.success) {
        // logger.info('Professional Login: Success, navigating to dashboard'); // TODO: Implement client-side logging
        navigate('/dashboard', { replace: true });
      } else {
        // logger.error('Professional Login: Failed:', result.error); // TODO: Implement client-side logging
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      // logger.error('Professional Login: Exception:', err); // TODO: Implement client-side logging
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'var(--gradient-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
    >
      <Container maxWidth='sm'>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <ShieldIcon sx={{ fontSize: '2.5rem', color: 'white' }} />
          </Box>
          <Typography
            variant='h3'
            component='h1'
            sx={{
              fontWeight: 800,
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 1
            }}
          >
            Security Platform
          </Typography>
          <Typography
            variant='h6'
            sx={{
              color: 'var(--text-secondary)',
              fontWeight: 400
            }}
          >
            Advanced Security Testing & Analysis
          </Typography>
        </Box>
        <Card className='professional-card'>
          <CardContent sx={{ padding: '3rem' }}>
            <Typography
              variant='h4'
              component='h2'
              sx={{
                textAlign: 'center',
                mb: 3,
                fontWeight: 700,
                color: 'var(--text-primary)'
              }}
            >
              Welcome Back
            </Typography>
            {error && (
              <Alert
                severity='error'
                className='professional-alert alert-danger'
                sx={{ mb: 3 }}
              >
                {error}
              </Alert>
            )}

            <Box component='form' onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='body2'
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}
                >
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  type='email'
                  className='professional-form-field'
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <EmailIcon sx={{ color: 'var(--text-muted)' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-secondary)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      '&:hover': {
                        borderColor: 'var(--border-accent)'
                      },
                      '&.Mui-focused': {
                        borderColor: 'var(--primary-blue)',
                        boxShadow: '0 0 0 3px rgba(0, 102, 204, 0.1)'
                      }
                    }
                  }}
                />
              </Box>
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant='body2'
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}
                >
                  Password
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  className='professional-form-field'
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <LockIcon sx={{ color: 'var(--text-muted)' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge='end'
                          sx={{ color: 'var(--text-muted)' }}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-secondary)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      '&:hover': {
                        borderColor: 'var(--border-accent)'
                      },
                      '&.Mui-focused': {
                        borderColor: 'var(--primary-blue)',
                        boxShadow: '0 0 0 3px rgba(0, 102, 204, 0.1)'
                      }
                    }
                  }}
                />
              </Box>
              <Button
                type='submit'
                fullWidth
                variant='contained'
                disabled={loading}
                className='professional-btn btn-primary'
                sx={{
                  height: '56px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  mb: 3,
                  background: 'var(--gradient-primary)',
                  '&:hover': {
                    background: 'var(--gradient-primary)',
                    transform: 'translateY(-1px)',
                    boxShadow: 'var(--shadow-lg)'
                  }
                }}
              >
                {loading ? 'Signing In...' : 'Sign In to Platform'}
              </Button>
              <Box
                className='professional-alert alert-info'
                sx={{
                  textAlign: 'center',
                  background: 'rgba(0, 102, 204, 0.1)',
                  borderLeft: '4px solid var(--primary-blue)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <Typography
                  variant='body2'
                  sx={{
                    color: '#66b3ff',
                    fontWeight: 500
                  }}
                >
                  <strong>Demo Credentials:</strong><br />
                  Email: admin@security.com<br />
                  Password: admin123
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography
            variant='body2'
            sx={{
              color: 'var(--text-muted)',
              fontSize: '0.875rem'
            }}
          >
            © 2024 Security Platform. Advanced Security Testing Suite.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ProfessionalLogin;