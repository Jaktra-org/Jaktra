import React from 'react';
import { screen, act, waitFor } from '../test-utils';
import { renderWithProviders, userEvent } from '../test-utils';
import { AcceptInvitation } from '../../src/pages/AcceptInvitation';
import { teamService } from '../../src/services/team';

// Mock teamService
vi.mock('../../src/services/team', () => ({
  teamService: {
    acceptInvitation: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

describe('AcceptInvitation page', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    delete window.location;
    window.location = { ...originalLocation, hash: '' };
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  it('displays error message if token is missing from location hash', () => {
    renderWithProviders(<AcceptInvitation />);
    expect(screen.getByText('Invalid or missing invitation token.')).toBeInTheDocument();
  });

  it('parses token from location hash and submits profile signup details on form submit', async () => {
    window.location.hash = '#token=my-secret-invite-token';
    vi.mocked(teamService.acceptInvitation).mockResolvedValue(undefined);

    renderWithProviders(<AcceptInvitation />);

    // No error displayed
    expect(screen.queryByText('Invalid or missing invitation token.')).not.toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('Jane Doe');
    const passInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Accept Invitation/i });

    // Validate name constraints
    await userEvent.type(nameInput, 'J'); // < 2 chars
    await userEvent.type(passInput, 'password123'); // Valid password
    await act(async () => {
      submitBtn.click();
    });
    expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();

    // Complete correctly
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Jane Doe');

    await act(async () => {
      submitBtn.click();
    });

    expect(teamService.acceptInvitation).toHaveBeenCalledWith('my-secret-invite-token', 'Jane Doe', 'password123');
    
    // Shows final success layout
    await waitFor(() => {
      expect(screen.getByText('Invitation Accepted!')).toBeInTheDocument();
    });
  });
});
