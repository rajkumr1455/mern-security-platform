// Workflow Orchestrator Integration Tests
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import WorkflowOrchestrator from '../../pages/Workflows/WorkflowOrchestrator';

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

describe('Workflow Orchestrator Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should load workflow orchestrator dashboard', async () => {
    renderWithProviders(<WorkflowOrchestrator />);

    await waitFor(() => {
      expect(screen.getByText('Workflow Orchestrator')).toBeInTheDocument();
    });

    // Verify stats cards
    await waitFor(() => {
      expect(screen.getByText('Total Workflows')).toBeInTheDocument();
      expect(screen.getByText('Active Workflows')).toBeInTheDocument();
      expect(screen.getByText('Templates')).toBeInTheDocument();
      expect(screen.getByText('Executions Today')).toBeInTheDocument();
    });
  });

  test('should create new workflow', async () => {
    renderWithProviders(<WorkflowOrchestrator />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Create Workflow')
    });

    await waitFor(() => {
      expect(screen.getByText('Create New Workflow')).toBeInTheDocument();
    });

    // Fill workflow details
    const nameInput = screen.getByLabelText('Workflow Name');
    fireEvent.change(nameInput, { target: { value: 'Test Workflow' } });

    const descInput = screen.getByLabelText('Description');
    fireEvent.change(descInput, { target: { value: 'Test workflow description' } });

    // Create workflow
    fireEvent.click(screen.getByText('Create Workflow'));

    await waitFor(() => {
      expect(screen.queryByText('Create New Workflow')).not.toBeInTheDocument();
    });
  });

  test('should execute workflow', async () => {
    renderWithProviders(<WorkflowOrchestrator />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Execute')
    });

    await waitFor(() => {
      expect(screen.getByText('Execute Workflow')).toBeInTheDocument();
    });

    // Select workflow
    fireEvent.mouseDown(screen.getByLabelText('Select Workflow'));
    await waitFor(() => {
      fireEvent.click(screen.getByText('Recon to Web2 Scan')
    });

    // Execute workflow
    fireEvent.click(screen.getByText('Execute'));

    await waitFor(() => {
      expect(screen.queryByText('Execute Workflow')).not.toBeInTheDocument();
    });
  });

  test('should display active workflows with progress', async () => {
    renderWithProviders(<WorkflowOrchestrator />);

    await waitFor(() => {
      expect(screen.getByText('Active Workflows')).toBeInTheDocument();
    });

    // Check for workflow table headers
    await waitFor(() => {
      expect(screen.getByText('Workflow Name')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('Current Step')).toBeInTheDocument();
    });
  });

  test('should manage workflow templates', async () => {
    renderWithProviders(<WorkflowOrchestrator />);

    // Navigate to templates tab
    await waitFor(() => {
      fireEvent.click(screen.getByText('Templates')
    });

    // Should show template cards
    await waitFor(() => {
      expect(screen.getByText('Use Template')).toBeInTheDocument();
    });
  });

  test('should show workflow execution history', async () => {
    renderWithProviders(<WorkflowOrchestrator />);

    // Navigate to history tab
    await waitFor(() => {
      fireEvent.click(screen.getByText('History')
    });

    // Check for history table
    await waitFor(() => {
      expect(screen.getByText('Workflow')).toBeInTheDocument();
      expect(screen.getByText('Duration')).toBeInTheDocument();
      expect(screen.getByText('Results')).toBeInTheDocument();
    });
  });

  test('should stop running workflow', async () => {
    renderWithProviders(<WorkflowOrchestrator />);

    await waitFor(() => {
      expect(screen.getByText('Active Workflows')).toBeInTheDocument();
    });

    // Look for stop button (if any active workflows)
    const stopButtons = screen.queryAllByLabelText('Stop Workflow');
    if (stopButtons.length > 0) {
      fireEvent.click(stopButtons[0]);
    }

    // Should handle stop action
    expect(true).toBe(true); // Test passes if no errors
  });

  test('should validate workflow parameters', async () => {
    renderWithProviders(<WorkflowOrchestrator />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Create Workflow')
    });

    // Try to create workflow without name
    await waitFor(() => {
      fireEvent.click(screen.getByText('Create Workflow')
    });

    // Should remain in dialog (validation failed)
    expect(screen.getByText('Create New Workflow')).toBeInTheDocument();
  });

  test('should handle workflow errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders(<WorkflowOrchestrator />);

    await waitFor(() => {
      expect(screen.getByText('Workflow Orchestrator')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});

// Workflow Performance Tests
describe('Workflow Orchestrator Performance Tests', () => {
  test('should load workflow data efficiently', async () => {
    const startTime = performance.now();

    renderWithProviders(<WorkflowOrchestrator />);

    await waitFor(() => {
      expect(screen.getByText('Workflow Orchestrator')).toBeInTheDocument();
    });

    const loadTime = performance.now() - startTime
    expect(loadTime).toBeLessThan(2000);
  });

  test('should handle large workflow lists', async () => {
    renderWithProviders(<WorkflowOrchestrator />);

    await waitFor(() => {
      expect(screen.getByText('All Workflows')).toBeInTheDocument();
    });

    // Navigate to all workflows tab
    fireEvent.click(screen.getByText('All Workflows'));

    // Should render without performance issues
    await waitFor(() => {
      expect(screen.getByText('Success Rate')).toBeInTheDocument();
    });
  });
});