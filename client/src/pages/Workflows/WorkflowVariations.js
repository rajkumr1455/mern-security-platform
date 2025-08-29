import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Tooltip,
  Badge,
  Paper,
  Divider
} from '@mui/material';
import {
  Security as SecurityIcon,
  Code as CodeIcon,
  
} from '@mui/icons-material';
  import {
    Cloud as CloudIcon,
  } from '@mui/icons-material';
  import {
    BugReport as BugIcon,
  } from '@mui/icons-material';
  import {
    Assessment as AssessmentIcon,
  } from '@mui/icons-material';
  import {
    Speed as SpeedIcon,
  } from '@mui/icons-material';
  import {
    Schedule as ScheduleIcon,
  } from '@mui/icons-material';
  import {
    ExpandMore as ExpandMoreIcon,
  } from '@mui/icons-material';
  import {
    PlayArrow as PlayIcon,
  } from '@mui/icons-material';
  import {
    Edit as EditIcon,
  } from '@mui/icons-material';
  import {
    Favorite as FavoriteIcon,
  } from '@mui/icons-material';
  import {
    FavoriteBorder as FavoriteBorderIcon,
  } from '@mui/icons-material';
  import {
    Info as InfoIcon,
  } from '@mui/icons-material';
  import {
    Timeline as TimelineIcon,
  } from '@mui/icons-material';
  import {
    Settings as SettingsIcon
  } from '@mui/icons-material';
} from '@mui/icons-material';

const WorkflowVariations = () => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customizationDialog, setCustomizationDialog] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadWorkflowTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, selectedCategory, selectedDifficulty, searchTerm]);

  const loadWorkflowTemplates = async () => {
    // Mock data - replace with actual API call
    const mockTemplates = [
      {
        id: 'quick_recon',
        name: 'Quick Reconnaissance',
        description: 'Fast asset discovery and basic enumeration for initial assessment',
        category: 'reconnaissance',
        difficulty: 'beginner',
        estimatedDuration: '15-30 minutes',
        tags: ['recon', 'discovery', 'fast'],
        icon: SpeedIcon,
        color: '#4CAF50',
        steps: 3,
        popularity: 95
      },
      {
        id: 'comprehensive_recon',
        name: 'Comprehensive Reconnaissance',
        description: 'Deep asset discovery and enumeration with OSINT gathering',
        category: 'reconnaissance',
        difficulty: 'intermediate',
        estimatedDuration: '2-4 hours',
        tags: ['recon', 'osint', 'comprehensive'],
        icon: AssessmentIcon,
        color: '#2196F3',
        steps: 4,
        popularity: 87
      },
      {
        id: 'web_app_security',
        name: 'Web Application Security Assessment',
        description: 'Complete web application security testing following OWASP methodology',
        category: 'web_security',
        difficulty: 'intermediate',
        estimatedDuration: '4-8 hours',
        tags: ['web', 'owasp', 'vulnerability'],
        icon: SecurityIcon,
        color: '#FF9800',
        steps: 5,
        popularity: 92
      },
      {
        id: 'api_security',
        name: 'API Security Assessment',
        description: 'Comprehensive API security testing including REST, GraphQL, and SOAP',
        category: 'api_security',
        difficulty: 'advanced',
        estimatedDuration: '3-6 hours',
        tags: ['api', 'rest', 'graphql', 'security'],
        icon: CodeIcon,
        color: '#9C27B0',
        steps: 5,
        popularity: 78
      },
      {
        id: 'bug_bounty_workflow',
        name: 'Bug Bounty Hunting Workflow',
        description: 'Optimized workflow for bug bounty hunting with automation and manual testing',
        category: 'bug_bounty',
        difficulty: 'advanced',
        estimatedDuration: '6-12 hours',
        tags: ['bug_bounty', 'automation', 'manual'],
        icon: BugIcon,
        color: '#F44336',
        steps: 5,
        popularity: 89
      },
      {
        id: 'web3_audit',
        name: 'Web3 Security Audit',
        description: 'Complete Web3 and DeFi security assessment including smart contracts',
        category: 'web3',
        difficulty: 'expert',
        estimatedDuration: '8-16 hours',
        tags: ['web3', 'defi', 'smart_contracts', 'blockchain'],
        icon: CloudIcon,
        color: '#607D8B',
        steps: 4,
        popularity: 65
      },
      {
        id: 'ci_cd_security',
        name: 'CI/CD Security Pipeline',
        description: 'Continuous security testing integrated into CI/CD pipeline',
        category: 'devops',
        difficulty: 'intermediate',
        estimatedDuration: 'Continuous',
        tags: ['cicd', 'devops', 'automation'],
        icon: ScheduleIcon,
        color: '#795548',
        steps: 4,
        popularity: 73
      }
    ];

    setTemplates(mockTemplates);
  };

  const filterTemplates = () => {
    let filtered = templates

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(template => template.difficulty === selectedDifficulty);
    }

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredTemplates(filtered);
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: '#4CAF50',
      intermediate: '#FF9800',
      advanced: '#F44336',
      expert: '#9C27B0'
    };
    return colors[difficulty] || '#757575';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      reconnaissance: AssessmentIcon,
      web_security: SecurityIcon,
      api_security: CodeIcon,
      bug_bounty: BugIcon,
      web3: CloudIcon,
      devops: ScheduleIcon,
      compliance: SecurityIcon
    };
    return icons[category] || SecurityIcon
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCustomizationDialog(true);
  };

  const handleFavoriteToggle = (templateId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId);
    } else {
      newFavorites.add(templateId);
    }
    setFavorites(newFavorites);
  };

  const handleCreateWorkflow = (template, customConfig = {}) => {
    // logger.info('Creating workflow from template:', template.id, customConfig); // TODO: Implement client-side logging
    setCustomizationDialog(false);
    // Implement workflow creation logic
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'reconnaissance', label: 'Reconnaissance' },
    { value: 'web_security', label: 'Web Security' },
    { value: 'api_security', label: 'API Security' },
    { value: 'bug_bounty', label: 'Bug Bounty' },
    { value: 'web3', label: 'Web3 & DeFi' },
    { value: 'devops', label: 'DevOps' },
    { value: 'compliance', label: 'Compliance' }
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];

  return (
    <Container maxWidth='xl'>
      <Box sx={{ mb: 4 }}>
        {/* Header */}
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
          <Typography variant='h4' component='h1'>
            Workflow Variations
          </Typography>
          <Button
            variant='contained'
            startIcon={<SettingsIcon />}
            onClick={() => setTabValue(2)}
          >
            Create Custom
          </Button>
        </Box>
        {/* Tabs */}
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label='Browse Templates' />
          <Tab label='Popular Workflows' />
          <Tab label='Custom Builder' />
        </Tabs>
        {/* Filters */}
        {tabValue === 0 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3} alignItems='center'>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label='Search workflows...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  variant='outlined'
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    label='Category'
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(category => (
                      <MenuItem key={category.value} value={category.value}>
                        {category.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={selectedDifficulty}
                    label='Difficulty'
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                  >
                    {difficulties.map(difficulty => (
                      <MenuItem key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Templates Grid */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {filteredTemplates.map((template) => {
              const IconComponent = template.icon
              return (
                <Grid item xs={12} md={6} lg={4} key={template.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {/* Popularity Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1
                      }}
                    >
                      <Badge
                        badgeContent={`${template.popularity}%`}
                        color='primary'
                        sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                      {/* Header */}
                      <Box display='flex' alignItems='center' mb={2}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            backgroundColor: template.color,
                            color: 'white',
                            mr: 2
                          }}
                        >
                          <IconComponent />
                        </Box>
                        <Box flexGrow={1}>
                          <Typography variant='h6' component='h3' noWrap>
                            {template.name}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {template.steps} steps • {template.estimatedDuration}
                          </Typography>
                        </Box>
                      </Box>
                      {/* Description */}
                      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                        {template.description}
                      </Typography>
                      {/* Tags */}
                      <Box display='flex' flexWrap='wrap' gap={0.5} mb={2}>
                        {template.tags.slice(0, 3).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size='small'
                            variant='outlined'
                          />
                        ))}
                        {template.tags.length > 3 && (
                          <Chip
                            label={`+${template.tags.length - 3}`}
                            size='small'
                            variant='outlined'
                          />
                        )}
                      </Box>
                      {/* Difficulty */}
                      <Chip
                        label={template.difficulty}
                        size='small'
                        sx={{
                          backgroundColor: getDifficultyColor(template.difficulty),
                          color: 'white',
                          textTransform: 'capitalize'
                        }}
                      />
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                      <Box>
                        <Button
                          size='small'
                          startIcon={<PlayIcon />}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          Use Template
                        </Button>
                        <IconButton
                          size='small'
                          onClick={() => handleFavoriteToggle(template.id)}
                        >
                          {favorites.has(template.id) ? (
                            <FavoriteIcon color='error' />
                          ) : (
                            <FavoriteBorderIcon />
                          )}
                        </IconButton>
                      </Box>
                      <Tooltip title='View Details'>
                        <IconButton size='small'>
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Popular Workflows Tab */}
        {tabValue === 1 && (
          <Box>
            <Typography variant='h5' gutterBottom>
              Most Popular Workflows
            </Typography>
            <Grid container spacing={3}>
              {templates
                .sort((a, b) => b.popularity - a.popularity)
                .slice(0, 6)
                .map((template, index) => {
                  const IconComponent = template.icon
                  return (
                    <Grid item xs={12} md={6} key={template.id}>
                      <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            backgroundColor: template.color,
                            color: 'white',
                            mr: 2,
                            fontSize: '1.5rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {index + 1}
                        </Box>
                        <Box flexGrow={1}>
                          <Typography variant='h6'>{template.name}</Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {template.popularity}% popularity • {template.estimatedDuration}
                          </Typography>
                        </Box>
                        <Button
                          variant='outlined'
                          startIcon={<PlayIcon />}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          Use
                        </Button>
                      </Card>
                    </Grid>
                  );
                })}
            </Grid>
          </Box>
        )}

        {/* Custom Builder Tab */}
        {tabValue === 2 && (
          <Box>
            <Typography variant='h5' gutterBottom>
              Custom Workflow Builder
            </Typography>
            <Paper sx={{ p: 3 }}>
              <Typography variant='body1' color='text.secondary'>
                Create your own custom security testing workflow by combining different steps and modules.
                This feature allows you to build tailored workflows for specific testing scenarios.
              </Typography>
              <Box mt={3}>
                <Button variant='contained' size='large'>
                  Launch Workflow Builder
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
      {/* Template Customization Dialog */}
      <Dialog
        open={customizationDialog}
        onClose={() => setCustomizationDialog(false)}
        maxWidth='md'
        fullWidth
      >
        {selectedTemplate && (
          <>
            <DialogTitle>
              <Box display='flex' alignItems='center'>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: selectedTemplate.color,
                    color: 'white',
                    mr: 2
                  }}
                >
                  <selectedTemplate.icon />
                </Box>
                <Box>
                  <Typography variant='h6'>{selectedTemplate.name}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Customize this workflow template
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant='h6' gutterBottom>
                  Workflow Overview
                </Typography>
                <Typography variant='body2' color='text.secondary' paragraph>
                  {selectedTemplate.description}
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Typography variant='h6' gutterBottom>
                  Configuration Options
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label='Workflow Name'
                      defaultValue={selectedTemplate.name}
                      variant='outlined'
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Priority Level</InputLabel>
                      <Select defaultValue='normal' label='Priority Level'>
                        <MenuItem value='low'>Low</MenuItem>
                        <MenuItem value='normal'>Normal</MenuItem>
                        <MenuItem value='high'>High</MenuItem>
                        <MenuItem value='urgent'>Urgent</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label='Target URL/Domain'
                      placeholder='example.com'
                      variant='outlined'
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3 }}>
                  <Typography variant='h6' gutterBottom>
                    Workflow Steps Preview
                  </Typography>
                  <Stepper orientation='vertical'>
                    {[1, 2, 3, selectedTemplate.steps].slice(0, selectedTemplate.steps).map((step, index) => (
                      <Step key={index} active>
                        <StepLabel>
                          Step {index + 1}: {
                            ['Discovery', 'Analysis', 'Testing', 'Reporting', 'Validation'][index] || 'Processing'
                          }
                        </StepLabel>
                        <StepContent>
                          <Typography variant='body2' color='text.secondary'>
                            Automated security testing step with configurable parameters
                          </Typography>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCustomizationDialog(false)}>
                Cancel
              </Button>
              <Button
                variant='contained'
                startIcon={<PlayIcon />}
                onClick={() => handleCreateWorkflow(selectedTemplate)}
              >
                Create & Start Workflow
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default WorkflowVariations;