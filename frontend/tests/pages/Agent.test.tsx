import React from 'react';
import { screen, act, waitFor } from '../test-utils';
import { renderWithProviders } from '../test-utils';
import { Agent } from '../../src/pages/Agent';
import { agentService } from '../../src/services/agent';
import { settingsService } from '../../src/services/settings';

// Mock services
vi.mock('../../src/services/agent', () => ({
  agentService: {
    getRuns: vi.fn(),
    runAgent: vi.fn(),
  },
}));

vi.mock('../../src/services/settings', () => ({
  settingsService: {
    getSettings: vi.fn(),
    getIntegrations: vi.fn(),
  },
}));
describe('Agent page controls', () => {
  const mockSettings = {
    defaultEmailProvider: 'smtp',
    senderEmail: 'notify@ex.com',
  };

  const mockIntegrations = {
    razorpay: { isConfigured: true, lastValidationResult: 'valid' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders control elements and displays warning if email integrations are not configured', async () => {
    vi.mocked(agentService.getRuns).mockResolvedValue({ runs: [] });
    vi.mocked(settingsService.getSettings).mockResolvedValue({ defaultEmailProvider: null, senderEmail: null } as any);
    vi.mocked(settingsService.getIntegrations).mockResolvedValue(mockIntegrations as any);

    renderWithProviders(<Agent />);

    await waitFor(() => {
      expect(screen.getByText('Email not configured')).toBeInTheDocument();
      // Run button should be disabled
      expect(screen.getByRole('button', { name: /Run Agent Now/i })).toBeDisabled();
    });
  });

  it('runs the agent using the selected tone when the run button is clicked', async () => {
    vi.mocked(agentService.getRuns).mockResolvedValue({ runs: [] });
    vi.mocked(settingsService.getSettings).mockResolvedValue(mockSettings as any);
    vi.mocked(settingsService.getIntegrations).mockResolvedValue(mockIntegrations as any);
    vi.mocked(agentService.runAgent).mockResolvedValue({} as any);

    renderWithProviders(<Agent />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Run Agent Now/i })).toBeEnabled();
    });

    const runBtn = screen.getByRole('button', { name: /Run Agent Now/i });
    await act(async () => {
      runBtn.click();
    });

    expect(agentService.runAgent).toHaveBeenCalled();
  });
});
