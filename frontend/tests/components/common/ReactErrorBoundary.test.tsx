import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReactErrorBoundary } from '../../../src/components/common/ReactErrorBoundary';

// A component that intentionally throws an error during render to test the boundary
function BuggyComponent() {
  throw new Error('Test rendering crash');
}

describe('ReactErrorBoundary component', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    // Suppress console.error logging in tests for expected React boundary logs
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children normal view when no error is thrown', () => {
    render(
      <ReactErrorBoundary>
        <div>All Good</div>
      </ReactErrorBoundary>
    );

    expect(screen.getByText('All Good')).toBeInTheDocument();
  });

  it('catches exceptions and renders fallback error UI when a child crashes', () => {
    render(
      <ReactErrorBoundary>
        <BuggyComponent />
      </ReactErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
    expect(screen.getByText('Go to Home')).toBeInTheDocument();

    // Verify console.error was called for the crash (supressed in output)
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('toggles location reload when reload button is clicked', () => {
    const originalLocation = window.location;
    const reloadMock = vi.fn();
    // @ts-ignore
    delete window.location;
    window.location = { ...originalLocation, reload: reloadMock } as any;

    render(
      <ReactErrorBoundary>
        <BuggyComponent />
      </ReactErrorBoundary>
    );

    const reloadBtn = screen.getByRole('button', { name: /Reload Page/i });
    fireEvent.click(reloadBtn);

    expect(reloadMock).toHaveBeenCalled();

    window.location = originalLocation;
  });

  it('updates location href when go to home button is clicked', () => {
    const originalLocation = window.location;
    const mockLocation = { href: '' } as any;
    // @ts-ignore
    delete window.location;
    window.location = mockLocation;

    render(
      <ReactErrorBoundary>
        <BuggyComponent />
      </ReactErrorBoundary>
    );

    const homeBtn = screen.getByRole('button', { name: /Go to Home/i });
    fireEvent.click(homeBtn);

    expect(window.location.href).toBe('/');

    window.location = originalLocation;
  });
});
