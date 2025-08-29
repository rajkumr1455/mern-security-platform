// Complete Elite AI Integration Tests
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CompleteEliteAI from '../../pages/AI/CompleteEliteAI';

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

describe('Complete Elite AI Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should load Elite AI engine status', async () => {
    renderWithProviders(<CompleteEliteAI />);

    await waitFor(() => {
      expect(screen.getByText('Elite AI Security Engine')).toBeInTheDocument();
    });

    // Verify status cards
    await waitFor(() => {
      expect(screen.getByText('Engine Status')).toBeInTheDocument();
      expect(screen.getByText('Vulnerabilities Found')).toBeInTheDocument();
      expect(screen.getByText('Zero-Days Found')).toBeInTheDocument();
      expect(screen.getByText('Success Rate')).toBeInTheDocument();
    });
  });

  test('should execute vulnerability discovery', async () => {
    renderWithProviders(<CompleteEliteAI />);

    await waitFor(() => {
      expect(screen.getByText('Discovery')).toBeInTheDocument();
    });

    // Click discovery button
    fireEvent.click(screen.getByText('Discovery'));

    // Verify dialog opens
    await waitFor(() => {
      expect(screen.getByText('Execute Elite Vulnerability Discovery')).toBeInTheDocument();
    });

    // Fill in target URL
    const targetInput = screen.getByLabelText('Target URL');
    fireEvent.change(targetInput, { target: { value: 'https://example.com' } });

    // Execute discovery
    fireEvent.click(screen.getByText('Execute Discovery'));

    // Should close dialog and show results
    await waitFor(() => {
      expect(screen.queryByText('Execute Elite Vulnerability Discovery')).not.toBeInTheDocument();
    });
  });

  test('should gather OSINT intelligence', async () => {
    renderWithProviders(<CompleteEliteAI />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('OSINT')
    });

    await waitFor(() => {
      expect(screen.getByText('Gather OSINT Intelligence')).toBeInTheDocument();
    });

    // Fill target domain
    const domainInput = screen.getByLabelText('Target Domain');
    fireEvent.change(domainInput, { target: { value: 'example.com' } });

    // Execute OSINT gathering
    fireEvent.click(screen.getByText('Gather Intelligence'));

    await waitFor(() => {
      expect(screen.queryByText('Gather OSINT Intelligence')).not.toBeInTheDocument();
    });
  });

  test('should generate AI exploits with safety controls', async () => {
    renderWithProviders(<CompleteEliteAI />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Exploit')
    });

    await waitFor(() => {
      expect(screen.getByText('Generate AI Exploit')).toBeInTheDocument();
    });

    // Select vulnerability type
    fireEvent.mouseDown(screen.getByLabelText('Vulnerability Type'));
    await waitFor(() => {
      fireEvent.click(screen.getByText('Cross-Site Scripting (XSS)')
    });

    // Fill target context
    const contextInput = screen.getByLabelText('Target Context');
    fireEvent.change(contextInput, { target: { value: 'web application' } });

    // Generate exploit
    fireEvent.click(screen.getByText('Generate Exploit'));

    await waitFor(() => {
      expect(screen.queryByText('Generate AI Exploit')).not.toBeInTheDocument();
    });
  });

  test('should hunt zero-day vulnerabilities', async () => {
    renderWithProviders(<CompleteEliteAI />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Zero-Day')
    });

    await waitFor(() => {
      expect(screen.getByText('Hunt Zero-Day Vulnerabilities')).toBeInTheDocument();
    });

    // Fill target URL
    const targetInput = screen.getByLabelText('Target URL');
    fireEvent.change(targetInput, { target: { value: 'https://example.com' } });

    // Hunt zero-days
    fireEvent.click(screen.getByText('Hunt Zero-Days'));

    await waitFor(() => {
      expect(screen.queryByText('Hunt Zero-Day Vulnerabilities')).not.toBeInTheDocument();
    });
  });

  test('should display pending exploits for approval', async () => {
    renderWithProviders(<CompleteEliteAI />);

    await waitFor(() => {
      expect(screen.getByText('Pending Exploits')).toBeInTheDocument();
    });

    // Check for pending exploits table
    await waitFor(() => {
      expect(screen.getByText('Exploit ID')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Risk Level')).toBeInTheDocument();
    });
  });

  test('should navigate between result tabs', async () => {
    renderWithProviders(<CompleteEliteAI />);

    await waitFor(() => {
      expect(screen.getByText('Discovery Results')).toBeInTheDocument();
    });

    // Click different tabs
    fireEvent.click(screen.getByText('OSINT Results'));
    fireEvent.click(screen.getByText('Zero-Day Results'));

    // Should show appropriate content
    expect(screen.getByText('No zero-day results yet')).toBeInTheDocument();
  });

  test('should handle AI engine errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders(<CompleteEliteAI />);

    await waitFor(() => {
      expect(screen.getByText('Elite AI Security Engine')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  test('should validate safety controls', async () => {
    renderWithProviders(<CompleteEliteAI />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Exploit')
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Safety Level')).toBeInTheDocument();
    });

    // Verify safety level options
    fireEvent.mouseDown(screen.getByLabelText('Safety Level'));
    await waitFor(() => {
      expect(screen.getByText('Maximum Safety')).toBeInTheDocument();
      expect(screen.getByText('High Safety')).toBeInTheDocument();
      expect(screen.getByText('Medium Safety')).toBeInTheDocument();
    });
  });
});

// AI Engine Performance Tests
describe('Elite AI Performance Tests', () => {
  test('should load AI status within performance budget', async () => {
    const startTime = performance.now();

    renderWithProviders(<CompleteEliteAI />);

    await waitFor(() => {
      expect(screen.getByText('Elite AI Security Engine')).toBeInTheDocument();
    });

    const loadTime = performance.now() - startTime
    expect(loadTime).toBeLessThan(2000);
  });

  test('should handle concurrent AI operations', async () => {
    renderWithProviders(<CompleteEliteAI />);

    await waitFor(() => {
      expect(screen.getByText('Discovery')).toBeInTheDocument();
    });

    // Simulate multiple concurrent operations
    const buttons = ['Discovery', 'OSINT', 'Exploit', 'Zero-Day'];

    buttons.forEach(button => {
      fireEvent.click(screen.getByText(button)
    });

    // Should handle multiple dialogs gracefully
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});