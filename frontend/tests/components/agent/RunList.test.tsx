import React from 'react';
import { screen, act } from '../../test-utils';
import { renderWithProviders } from '../../test-utils';
import { RunList } from '../../../src/components/agent/RunList';
import { agentService } from '../../../src/services/agent';

// Mock services
vi.mock('../../../src/services/agent', () => ({
  agentService: {
    getRunDetails: vi.fn(),
  },
}));

describe('RunList component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRuns = [
    {
      id: 'run-completed-short',
      startTime: '2026-07-12T00:00:00.000Z',
      endTime: '2026-07-12T00:00:45.000Z', // 45 seconds
      status: 'completed' as const,
      invoicesProcessed: 5,
      emailsSent: 4,
      errors: 0,
    },
    {
      id: 'run-completed-long',
      startTime: '2026-07-12T01:00:00.000Z',
      endTime: '2026-07-12T01:02:15.000Z', // 2 minutes 15 seconds
      status: 'completed' as const,
      invoicesProcessed: 10,
      emailsSent: 9,
      errors: 1,
    },
    {
      id: 'run-active',
      startTime: '2026-07-12T02:00:00.000Z',
      endTime: null, // Active!
      status: 'running' as const,
      invoicesProcessed: 2,
      emailsSent: 1,
      errors: 0,
    },
  ];

  it('renders list of runs with correctly formatted durations and handles toggle panels', async () => {
    vi.mocked(agentService.getRunDetails).mockResolvedValue({
      run: mockRuns[0],
      logs: [],
    } as any);

    renderWithProviders(<RunList runs={mockRuns} />);

    // Check duration formatting
    expect(screen.getByText('45s')).toBeInTheDocument();
    expect(screen.getByText('2m 15s')).toBeInTheDocument();
    expect(screen.getByText('Running...')).toBeInTheDocument();

    // Toggle expand row
    const firstRow = screen.getByText('45s');
    await act(async () => {
      firstRow.click();
    });

    // Check details panel query is made
    expect(agentService.getRunDetails).toHaveBeenCalledWith('run-completed-short');
  });
});
