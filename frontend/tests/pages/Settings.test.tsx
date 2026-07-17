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

    // Profile page renders initially
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();

    // Click General Tab
    const generalTabBtn = screen.getByRole('button', { name: /General/i });
    await act(async () => {
      generalTabBtn.click();
    });

    await waitFor(() => {
      expect(screen.getByText('General Settings')).toBeInTheDocument();
    });
  });

  it('runs debounced auto-saves on form input changes, discarding unsaved state if tabbed out early', async () => {
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
      expect(screen.getByText('General Settings')).toBeInTheDocument();
    });

    // Turn on fake timers for input change auto-save checks
    // Trigger form change
    const nameInput = screen.getByDisplayValue('Acme Corp');
    act(() => {
      fireEvent.change(nameInput, { target: { value: 'Updated Company Name' } });
    });

    // Switch tab immediately within 500ms
    const profileTabBtn = screen.getByRole('button', { name: /Profile/i });
    await act(async () => {
      profileTabBtn.click();
    });

    // Verify updateSettings was not called (aborted/cleared)
    expect(settingsService.updateSettings).not.toHaveBeenCalled();

    // Switch back to General tab
    await act(async () => {
      generalTabBtn.click();
    });

    await waitFor(() => {
      // Input value should have reverted to mockSettings value 'Acme Corp'
      expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument();
    });

    // Make change again
    const nameInput2 = screen.getByDisplayValue('Acme Corp');
    act(() => {
      fireEvent.change(nameInput2, { target: { value: 'New Auto Save Name' } });
    });

    // Wait for the 1000ms debounce save timer to fire
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    expect(settingsService.updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ companyName: 'New Auto Save Name' })
    );
  });
});
