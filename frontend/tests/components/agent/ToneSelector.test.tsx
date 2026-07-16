import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToneSelector } from '../../../src/components/agent/ToneSelector';

describe('ToneSelector component', () => {
  it('renders select with options and triggers onChange when changed', () => {
    const onChangeMock = vi.fn();
    render(<ToneSelector value="" onChange={onChangeMock} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    // Change value
    fireEvent.change(select, { target: { value: 'stage_2_firm' } });
    expect(onChangeMock).toHaveBeenCalledWith('stage_2_firm');
  });

  it('hides Auto option if includeAuto is false', () => {
    render(<ToneSelector value="" onChange={() => {}} includeAuto={false} />);
    
    expect(screen.queryByText('Auto (Triage Engine)')).not.toBeInTheDocument();
  });
});
