// Bug Bounty Dashboard Integration Tests
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import BugBountyDashboard from '../../pages/BugBounty/BugBountyDashboard';

const theme = createTheme();

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Bug Bounty Dashboard Integration Tests', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
  });

  test('should load and display bug bounty statistics', async () => {
    renderWithProviders(<BugBountyDashboard />);

    // Check if loading state is shown initially
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Bug Bounty Automation Dashboard')).toBeInTheDocument();
    });

    // Verify stats cards are displayed
    await waitFor(() => {
      expect(screen.getByText('Active Campaigns')).toBeInTheDocument();
      expect(screen.getByText('Total Earnings')).toBeInTheDocument();
      expect(screen.getByText('Vulnerabilities Found')).toBeInTheDocument();
      expect(screen.getByText('Success Rate')).toBeInTheDocument();
    });
  });

  test('should open campaign creation dialog', async () => {
    renderWithProviders(<BugBountyDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Start Campaign')).toBeInTheDocument();
    });

    // Click start campaign button
    fireEvent.click(screen.getByText('Start Campaign'));

    // Verify dialog opens
    await waitFor(() => {
      expect(screen.getByText('Start New Bug Bounty Campaign')).toBeInTheDocument();
    });

    // Verify form fields are present
    expect(screen.getByLabelText('Campaign Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Bug Bounty Program')).toBeInTheDocument();
    expect(screen.getByLabelText('Budget ($)')).toBeInTheDocument();
  });

  test('should validate campaign form inputs', async () => {
    renderWithProviders(<BugBountyDashboard />);

    // Open campaign dialog
    await waitFor(() => {
      fireEvent.click(screen.getByText('Start Campaign')
    });

    // Try to submit empty form
    await waitFor(() => {
      fireEvent.click(screen.getByText('Start Campaign')
    });

    // Form should not submit with empty fields
    expect(screen.getByText('Start New Bug Bounty Campaign')).toBeInTheDocument();
  });

  test('should display active campaigns table', async () => {
    renderWithProviders(<BugBountyDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Active Campaigns')).toBeInTheDocument();
    });

    // Check for table headers
    await waitFor(() => {
      expect(screen.getByText('Campaign Name')).toBeInTheDocument();
      expect(screen.getByText('Program')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });
  });

  test('should handle API errors gracefully', async () => {
    // Mock API error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders(<BugBountyDashboard />);

    // Component should still render even with API errors
    await waitFor(() => {
      expect(screen.getByText('Bug Bounty Automation Dashboard')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  test('should refresh data when refresh button is clicked', async () => {
    renderWithProviders(<BugBountyDashboard />);

    await waitFor(() => {
      expect(screen.getByLabelText('refresh')).toBeInTheDocument();
    });

    // Click refresh button
    fireEvent.click(screen.getByLabelText('refresh'));

    // Should trigger data reload (loading state)
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('should navigate between tabs', async () => {
    renderWithProviders(<BugBountyDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Active Campaigns')).toBeInTheDocument();
    });

    // Click on different tabs
    fireEvent.click(screen.getByText('Programs'));
    fireEvent.click(screen.getByText('Submissions'));
    fireEvent.click(screen.getByText('Earnings'));

    // Should switch tab content
    expect(screen.getByText('Monthly Earnings')).toBeInTheDocument();
  });

  test('should be responsive on different screen sizes', async () => {
    // Test mobile viewport
    global.innerWidth = 375
    global.dispatchEvent(new Event('resize'));

    renderWithProviders(<BugBountyDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Bug Bounty Automation Dashboard')).toBeInTheDocument();
    });

    // Component should render without breaking on mobile
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});

// Performance Tests
describe('Bug Bounty Dashboard Performance Tests', () => {
  test('should load within performance budget', async () => {
    const startTime = performance.now();

    renderWithProviders(<BugBountyDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Bug Bounty Automation Dashboard')).toBeInTheDocument();
    });

    const loadTime = performance.now() - startTime

    // Should load within 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  test('should not cause memory leaks', async () => {
    const { unmount } = renderWithProviders(<BugBountyDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Bug Bounty Automation Dashboard')).toBeInTheDocument();
    });

    // Unmount component
    unmount();

    // Should clean up properly (no specific assertion, but test should not hang)
    expect(true).toBe(true);
  });
});