import { renderWithProviders, screen, fireEvent } from '../test-utils';
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

  it('navigates to /login when Sign in link is clicked', () => {
    renderWithProviders(<App />, {
      route: '/',
      authState: { user: null, isLoading: false, isAuthenticated: false },
    });

    const signInLink = screen.getAllByRole('link', { name: /sign in/i })[0];
    fireEvent.click(signInLink);

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('navigates to /register when Get started link is clicked', () => {
    renderWithProviders(<App />, {
      route: '/',
      authState: { user: null, isLoading: false, isAuthenticated: false },
    });

    const getStartedLink = screen.getAllByRole('link', { name: /get started/i })[0];
    fireEvent.click(getStartedLink);

    expect(screen.getByRole('heading', { name: /create an account/i })).toBeInTheDocument();
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

    expect(screen.queryByText(/Autonomous AR Collection/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Total Portfolio/i)).toBeInTheDocument();
  });
});

