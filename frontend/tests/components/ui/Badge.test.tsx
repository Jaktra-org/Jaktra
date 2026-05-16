import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from '../../../src/components/ui/Badge';

describe('Badge component', () => {
  it('renders children correctly', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('applies default styling classes', () => {
    render(<Badge>Default</Badge>);
    const element = screen.getByText('Default');
    expect(element).toHaveClass('bg-[#141516]');
    expect(element).toHaveClass('text-[#d0d6e0]');
  });

  it('applies success variant classes', () => {
    render(<Badge variant="success">Success</Badge>);
    const element = screen.getByText('Success');
    expect(element).toHaveClass('bg-[#27a644]/10');
    expect(element).toHaveClass('text-[#27a644]');
  });

  it('applies warning variant classes', () => {
    render(<Badge variant="warning">Warning</Badge>);
    const element = screen.getByText('Warning');
    expect(element).toHaveClass('bg-amber-500/10');
    expect(element).toHaveClass('text-amber-400');
  });

  it('applies danger variant classes', () => {
    render(<Badge variant="danger">Danger</Badge>);
    const element = screen.getByText('Danger');
    expect(element).toHaveClass('bg-red-500/10');
    expect(element).toHaveClass('text-red-400');
  });

  it('applies outline variant classes', () => {
    render(<Badge variant="outline">Outline</Badge>);
    const element = screen.getByText('Outline');
    expect(element).toHaveClass('border');
    expect(element).toHaveClass('border-[#23252a]');
  });
});
