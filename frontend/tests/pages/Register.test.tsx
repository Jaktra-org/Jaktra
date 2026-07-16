import { screen, act, waitFor, fireEvent } from '../test-utils';
import { renderWithProviders, userEvent } from '../test-utils';
import { Register } from '../../src/pages/Register';
import { authService } from '../../src/services/auth';

// Mock authService
vi.mock('../../src/services/auth', () => ({
  authService: {
    onboard: vi.fn(),
    verifyEmail: vi.fn(),
    resendVerification: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...original,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  };
});

describe('Register page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates password matching on register submit', async () => {
    renderWithProviders(<Register />);

    await userEvent.type(screen.getByPlaceholderText('Jane Doe'), 'Jane Doe');
    await userEvent.type(screen.getByPlaceholderText('Acme Corp'), 'Jane Corp');
    await userEvent.type(screen.getByPlaceholderText('you@company.com'), 'jane@corp.com');

    const passInputs = screen.getAllByPlaceholderText('••••••••');
    await userEvent.type(passInputs[0], 'pass1234');
    await userEvent.type(passInputs[1], 'pass9999'); // Mismatch!

    const submitBtn = screen.getByRole('button', { name: /^Register$/i });
    await act(async () => {
      submitBtn.click();
    });

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(authService.onboard).not.toHaveBeenCalled();
  });

  it('transitions to verify step when onboard response indicates verification pending', async () => {
    vi.mocked(authService.onboard).mockResolvedValue({ pendingVerification: true });

    renderWithProviders(<Register />);

    await userEvent.type(screen.getByPlaceholderText('Jane Doe'), 'Jane Doe');
    await userEvent.type(screen.getByPlaceholderText('Acme Corp'), 'Jane Corp');
    await userEvent.type(screen.getByPlaceholderText('you@company.com'), 'jane@corp.com');

    const passInputs = screen.getAllByPlaceholderText('••••••••');
    await userEvent.type(passInputs[0], 'pass1234');
    await userEvent.type(passInputs[1], 'pass1234');

    const submitBtn = screen.getByRole('button', { name: /^Register$/i });
    await act(async () => {
      submitBtn.click();
    });

    expect(authService.onboard).toHaveBeenCalledWith({
      name: 'Jane Doe',
      companyName: 'Jane Corp',
      email: 'jane@corp.com',
      password: 'pass1234',
    });

    // Should transition to verify screen
    await waitFor(() => {
      expect(screen.getByText('Verify your email')).toBeInTheDocument();
    });

    // Mock verify code submit success
    const mockUser = { id: 'u1', name: 'Jane Doe', email: 'jane@corp.com', role: 'admin' as const, tenantId: 't1' };
    vi.mocked(authService.verifyEmail).mockResolvedValue({ token: 'jwt-auth', user: mockUser });

    const codeInput = screen.getByPlaceholderText('123456');
    await userEvent.type(codeInput, '123456');

    const verifyBtn = screen.getByRole('button', { name: /Verify Code/i });
    await act(async () => {
      verifyBtn.click();
    });

    expect(authService.verifyEmail).toHaveBeenCalledWith('jane@corp.com', '123456');
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('handles resending verification code and shows success messages', async () => {
    const originalTimeout = global.setTimeout;
    const mockTimeout = vi.fn().mockImplementation((cb: Function, ms: number) => {
      if (ms === 1000) {
        // Execute cooldown timer tick in next macrotask
        originalTimeout(cb as any, 0);
        return 999;
      }
      return originalTimeout(cb as any, ms);
    });
    global.setTimeout = mockTimeout as any;
    window.setTimeout = mockTimeout as any;

    vi.mocked(authService.onboard).mockResolvedValue({ pendingVerification: true });
    vi.mocked(authService.resendVerification).mockResolvedValue({ success: true, message: 'Sent' });

    renderWithProviders(<Register />);

    // Quick fill using fireEvent so fake timers don't block typing simulation
    fireEvent.change(screen.getByPlaceholderText('Jane Doe'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Acme Corp'), { target: { value: 'Jane Corp' } });
    fireEvent.change(screen.getByPlaceholderText('you@company.com'), { target: { value: 'jane@corp.com' } });

    const passInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passInputs[0], { target: { value: 'pass1234' } });
    fireEvent.change(passInputs[1], { target: { value: 'pass1234' } });

    await act(async () => {
      screen.getByRole('button', { name: /^Register$/i }).click();
    });

    await waitFor(() => {
      expect(screen.getByText('Verify your email')).toBeInTheDocument();
    });

    // Yield control to the event loop 65 times sequentially to execute the countdown macrotasks
    for (let i = 0; i < 65; i++) {
      await act(async () => {
        await new Promise(resolve => originalTimeout(resolve, 0));
      });
    }

    const resendBtn = screen.getByRole('button', { name: /Resend code/i });
    await act(async () => {
      resendBtn.click();
    });

    expect(authService.resendVerification).toHaveBeenCalledWith('jane@corp.com');
    await waitFor(() => {
      expect(screen.getByText('A new code has been sent to your email.')).toBeInTheDocument();
    });

    global.setTimeout = originalTimeout;
    window.setTimeout = originalTimeout;
  });
});
