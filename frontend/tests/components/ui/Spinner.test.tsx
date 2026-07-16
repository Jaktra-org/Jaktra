import React from 'react';
import { render, screen } from '@testing-library/react';
import { Spinner } from '../../../src/components/ui/Spinner';

describe('Spinner component', () => {
  it('renders spinner elements with svg tag', () => {
    render(<Spinner />);
    const spinnerSvg = screen.getByTestId('spinner');
    expect(spinnerSvg).toBeInTheDocument();
    expect(spinnerSvg).toHaveClass('animate-spin');
  });
});
