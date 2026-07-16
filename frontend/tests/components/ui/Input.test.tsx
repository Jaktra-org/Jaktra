import React from 'react';
import { render, screen } from '@testing-library/react';
import { Input } from '../../../src/components/ui/Input';

describe('Input component', () => {
  it('renders input with label and placeholder', () => {
    render(<Input label="Test Label" placeholder="placeholder text" />);

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder text')).toBeInTheDocument();
  });

  it('renders input errors and applies border-red styling classes', () => {
    render(<Input error="This field is required" />);

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
  });

  it('forwards ref to native input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
