import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../../src/components/ui/Button';

describe('Button component', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /Click me/i })).toBeInTheDocument();
  });

  it('triggers onClick handler on click event', () => {
    const onClickMock = vi.fn();
    render(<Button onClick={onClickMock}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onClickMock).toHaveBeenCalled();
  });

  it('disables interactions and renders loading spinner when isLoading is true', () => {
    const onClickMock = vi.fn();
    render(<Button isLoading={true} onClick={onClickMock}>Submit</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toHaveClass('animate-spin');
    
    fireEvent.click(button);
    expect(onClickMock).not.toHaveBeenCalled();
  });

  it('applies variant classes', () => {
    const { rerender } = render(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-slate-100');
  });
});
