import { screen, act, waitFor, fireEvent } from '../test-utils';
import { renderWithProviders } from '../test-utils';
import { Settings } from '../../src/pages/Settings';
import { settingsService } from '../../src/services/settings';

// Mock settingsService
vi.mock('../../src/services/settings', () => ({
  settingsService: {
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
    getIntegrations: vi.fn(),
  },
}));

// Mock authService
vi.mock('../../src/services/auth', () => ({
  authService: {
    getMe: vi.fn(),
  },
}));

describe('Settings page tabs and general auto-save configurations', () => {
  const mockSettings = {
    companyName: 'Acme Corp',
    timezone: 'UTC',
    autoPurgeEnabled: false,
    autoPurgeDays: 30,
    skipPaymentWarning: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('switches tabs and displays different setting panels', async () => {
    vi.mocked(settingsService.getSettings).mockResolvedValue(mockSettings);

    renderWithProviders(<Settings />, {
      authState: {
        user: { id: 'u1', name: 'Admin Jane', email: 'j@a.com', role: 'admin', tenantId: 't1' },
        isLoading: false,
        isAuthenticated: true,
      },
    });

    // General page renders initially by default
    await waitFor(() => {
      expect(screen.getByText('Display Name')).toBeInTheDocument();
    });

    // Click Profile & Security Tab
    const profileTabBtn = screen.getByRole('button', { name: /Profile/i });
    await act(async () => {
      profileTabBtn.click();
    });

    await waitFor(() => {
      expect(screen.getByText('Account Session & Authentication')).toBeInTheDocument();
    });
  });

  it('submits general settings form when clicking Save Changes button', async () => {
    vi.mocked(settingsService.getSettings).mockResolvedValue(mockSettings);
    vi.mocked(settingsService.updateSettings).mockResolvedValue({} as any);

    renderWithProviders(<Settings />, {
      authState: {
        user: { id: 'u1', name: 'Admin Jane', email: 'j@a.com', role: 'admin', tenantId: 't1' },
        isLoading: false,
        isAuthenticated: true,
      },
    });

    // Switch to General tab
    const generalTabBtn = screen.getByRole('button', { name: /General/i });
    await act(async () => {
      generalTabBtn.click();
    });

    await waitFor(() => {
      expect(screen.getByText('Display Name')).toBeInTheDocument();
    });

    // Trigger form change
    const nameInput = screen.getByDisplayValue('Acme Corp');
    act(() => {
      fireEvent.change(nameInput, { target: { value: 'Updated Company Name' } });
    });

    // Click Save Changes button
    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    await act(async () => {
      saveBtn.click();
    });

    expect(settingsService.updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ companyName: 'Updated Company Name' })
    );
  });
});
