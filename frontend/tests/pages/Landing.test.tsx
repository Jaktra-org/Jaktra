import { renderWithProviders, screen, fireEvent, waitFor } from '../test-utils';
import { Landing } from '../../src/pages/Landing';
import App from '../../src/App';

describe('Landing page & Root routing', () => {
  it('renders Jaktra branding and Sign in / Get started links', () => {
    renderWithProviders(<Landing />);

    expect(screen.getAllByText(/jaktra/i)[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /sign in/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /get started/i })[0]).toBeInTheDocument();
  });

  it('renders Landing page on "/" when user is not authenticated', () => {
    renderWithProviders(<App />, {
      route: '/',
      authState: { user: null, isLoading: false, isAuthenticated: false },
    });

    expect(screen.getAllByText(/jaktra/i)[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /sign in/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /get started/i })[0]).toBeInTheDocument();
  });

  it('navigates to /login when Sign in link is clicked', async () => {
    renderWithProviders(<App />, {
      route: '/',
      authState: { user: null, isLoading: false, isAuthenticated: false },
    });

    const signInLink = screen.getAllByRole('link', { name: /sign in/i })[0];
    fireEvent.click(signInLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('navigates to /register when Get started link is clicked', async () => {
    renderWithProviders(<App />, {
      route: '/',
      authState: { user: null, isLoading: false, isAuthenticated: false },
    });

    const getStartedLink = screen.getAllByRole('link', { name: /get started/i })[0];
    fireEvent.click(getStartedLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create an account/i })).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('renders Dashboard with AppLayout on "/" when user is authenticated', async () => {
    renderWithProviders(<App />, {
      route: '/',
      authState: {
        user: { id: '1', name: 'Test User', email: 'test@jaktra.site', role: 'admin', tenantId: 't1' },
        isLoading: false,
        isAuthenticated: true,
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/Total Portfolio/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    expect(screen.queryByText(/Autonomous AR Collection/i)).not.toBeInTheDocument();
  });
});

