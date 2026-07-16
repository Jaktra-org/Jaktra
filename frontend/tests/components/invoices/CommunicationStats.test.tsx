import React from 'react';
import { render, screen } from '@testing-library/react';
import { CommunicationStats } from '../../../src/components/invoices/CommunicationStats';

describe('CommunicationStats component', () => {
  const mockCommunications = [
    { id: '1', status: 'delivered', openedAt: '2026-07-12', clickedAt: '2026-07-12' },
    { id: '2', status: 'failed' },
  ];

  it('returns null when communications list is empty', () => {
    const { container } = render(<CommunicationStats communications={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('calculates metrics correctly and handles division by zero safely', () => {
    // 1. Safe division by zero test (all failed -> delivered = 0)
    const failedComms = [{ id: '1', status: 'failed' }];
    render(<CommunicationStats communications={failedComms as any} defaultEmailProvider="sendgrid" />);

    expect(screen.getByText('Total Sent')).toBeInTheDocument();
    // Delivered count should be 0, deliveredRate = 0%
    expect(screen.getAllByText('0%').length).toBeGreaterThan(0);
  });

  it('hides Opened and Clicked rates when defaultEmailProvider is smtp', () => {
    render(<CommunicationStats communications={mockCommunications as any} defaultEmailProvider="smtp" />);

    expect(screen.getByText('Total Sent')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();

    // Opened and Clicked rates should be hidden for SMTP provider profiles
    expect(screen.queryByText('Opened')).not.toBeInTheDocument();
    expect(screen.queryByText('Clicked')).not.toBeInTheDocument();
  });

  it('renders all rates when defaultEmailProvider is sendgrid', () => {
    render(<CommunicationStats communications={mockCommunications as any} defaultEmailProvider="sendgrid" />);

    expect(screen.getByText('Total Sent')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
    expect(screen.getByText('Opened')).toBeInTheDocument();
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
