import React from 'react';
import { screen, act } from '../../test-utils';
import { renderWithProviders } from '../../test-utils';
import { CommunicationList } from '../../../src/components/invoices/CommunicationList';

describe('CommunicationList component', () => {
  const mockCommunications = [
    {
      id: 'comm-1',
      recipient: 'client@ex.com',
      subject: 'First Reminder',
      body: 'Hi, this is a reminder.',
      status: 'sent',
      createdAt: '2026-07-12T00:00:00.000Z',
    },
    {
      id: 'comm-2',
      recipient: 'client@ex.com',
      subject: 'Second Reminder',
      body: 'Please pay immediately.',
      status: 'failed',
      errorMsg: 'SMTP Connection failure',
      createdAt: '2026-07-12T01:00:00.000Z',
    },
  ];

  it('renders "No communications" when array is empty', () => {
    renderWithProviders(<CommunicationList communications={[]} />);
    expect(screen.getByText('No communications')).toBeInTheDocument();
  });

  it('renders communications list and expands detail content on click', async () => {
    renderWithProviders(<CommunicationList communications={mockCommunications as any} />);

    expect(screen.getByText('First Reminder')).toBeInTheDocument();
    expect(screen.getByText('Second Reminder')).toBeInTheDocument();

    // Body is hidden initially
    expect(screen.queryByText('Hi, this is a reminder.')).not.toBeInTheDocument();

    // Click first item to expand
    const firstItem = screen.getByText('First Reminder');
    await act(async () => {
      firstItem.click();
    });

    expect(screen.getByText('Hi, this is a reminder.')).toBeInTheDocument();

    // Click second item with failure details to expand
    const secondItem = screen.getByText('Second Reminder');
    await act(async () => {
      secondItem.click();
    });

    expect(screen.getByText('Please pay immediately.')).toBeInTheDocument();
    expect(screen.getByText(/Email service unavailable/i)).toBeInTheDocument();
  });
});
