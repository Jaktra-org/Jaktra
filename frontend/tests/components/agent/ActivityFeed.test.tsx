import React from 'react';
import { screen, waitFor } from '../../test-utils';
import { renderWithProviders, userEvent } from '../../test-utils';
import { ActivityFeed } from '../../../src/components/agent/ActivityFeed';
import { eventService } from '../../../src/services/event';

// Mock eventService
vi.mock('../../../src/services/event', () => ({
  eventService: {
    getFeed: vi.fn(),
  },
}));

describe('ActivityFeed component', () => {
  const mockFeedEvents = [
    {
      id: 'ev-1',
      invoiceId: 'inv-1',
      invoiceNo: 'INV-1',
      clientName: 'Client Alpha',
      eventType: 'email_sent',
      payload: { subject: 'Followup subject text' },
      createdAt: '2026-07-12T00:00:00.000Z',
    },
    {
      id: 'ev-2',
      invoiceId: 'inv-2',
      invoiceNo: 'INV-2',
      clientName: 'Client Beta',
      eventType: 'halted', // Halted/error event type
      payload: { error: 'SMTP connection failure' },
      createdAt: '2026-07-12T01:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders events feed list and applies classification filters', async () => {
    vi.mocked(eventService.getFeed).mockResolvedValue(mockFeedEvents);

    renderWithProviders(<ActivityFeed isRunning={false} />);

    await waitFor(() => {
      expect(screen.getByText('email sent')).toBeInTheDocument();
      expect(screen.getByText('Subject: Followup subject text')).toBeInTheDocument();
      expect(screen.getByText('halted')).toBeInTheDocument();
      // 'SMTP connection failure' is normalized to 'Email service unavailable'
      expect(screen.getByText('Email service unavailable')).toBeInTheDocument();
    });

    // Toggle filter select to errors only (which displays halted/errors)
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'errors');

    // Only halted is error type, email_sent is normal
    expect(screen.getByText('halted')).toBeInTheDocument();
    expect(screen.queryByText('email sent')).not.toBeInTheDocument();
  });
});
