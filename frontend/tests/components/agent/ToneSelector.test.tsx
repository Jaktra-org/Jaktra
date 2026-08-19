import { render, screen, fireEvent } from '@testing-library/react';
import { ToneSelector } from '../../../src/components/agent/ToneSelector';

describe('ToneSelector component', () => {
  it('renders select with options and triggers onChange when changed', () => {
    const onChangeMock = vi.fn();
    render(<ToneSelector value="" onChange={onChangeMock} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    // Open dropdown and select option
    fireEvent.click(select);
    const option = screen.getByText('Firm (Stage 2)');
    fireEvent.click(option);

    expect(onChangeMock).toHaveBeenCalledWith('stage_2_firm');
  });

  it('hides Auto option if includeAuto is false', () => {
    render(<ToneSelector value="" onChange={() => {}} includeAuto={false} />);
    
    expect(screen.queryByText('Triage Engine (Auto)')).not.toBeInTheDocument();
  });
});
