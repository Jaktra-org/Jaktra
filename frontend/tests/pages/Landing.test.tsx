import { renderWithProviders, screen, fireEvent } from '../test-utils';
import { Landing } from '../../src/pages/Landing';
import App from '../../src/App';

describe('Landing page & Root routing', () => {
  it('renders Welcome to Jaktra and Login / Sign Up buttons', () => {
    renderWithProviders(<Landing />);

    expect(screen.getByText(/welcome to jaktra/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('renders Landing page on "/" when user is not authenticated', () => {
    renderWithProviders(<App />, {
      route: '/',
      authState: { user: null, isLoading: false, isAuthenticated: false },
    });

    expect(screen.getByText(/welcome to jaktra/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('navigates to /login when Login button is clicked', () => {
    renderWithProviders(<App />, {
      route: '/',
      authState: { user: null, isLoading: false, isAuthenticated: false },
    });

    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    expect(screen.getByText(/sign in to your jaktra account/i)).toBeInTheDocument();
  });

  it('navigates to /register when Sign Up button is clicked', () => {
    renderWithProviders(<App />, {
      route: '/',
      authState: { user: null, isLoading: false, isAuthenticated: false },
    });

    const signUpButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signUpButton);

    expect(screen.getByText(/create an account/i)).toBeInTheDocument();
  });

  it('renders Dashboard with AppLayout on "/" when user is authenticated', () => {
    renderWithProviders(<App />, {
      route: '/',
      authState: {
        user: { id: '1', name: 'Test User', email: 'test@jaktra.site', role: 'admin', tenantId: 't1' },
        isLoading: false,
        isAuthenticated: true,
      },
    });

    expect(screen.queryByText(/welcome to jaktra/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Total Portfolio/i)).toBeInTheDocument();
  });
});
