import React from 'react';
import { screen, act, waitFor } from '../../test-utils';
import { renderWithProviders, userEvent } from '../../test-utils';
import { ConfirmDestructiveModal } from '../../../src/components/common/ConfirmDestructiveModal';

describe('ConfirmDestructiveModal component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    invoiceNo: 'INV-777',
    clientName: 'Acme Corp',
    amountDisplay: 'â‚¹5,000.00',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders invoice summary details correctly', () => {
    renderWithProviders(<ConfirmDestructiveModal {...defaultProps} />);

    expect(screen.getAllByText('INV-777').length).toBeGreaterThan(0);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('â‚¹5,000.00')).toBeInTheDocument();
  });

  it('disables the confirmation button until the user types the exact invoice number', async () => {
    renderWithProviders(<ConfirmDestructiveModal {...defaultProps} />);

    const deleteBtn = screen.getByRole('button', { name: /Permanently Delete/i });
    const inputField = screen.getByPlaceholderText('Enter invoice number');

    // Initially disabled
    expect(deleteBtn).toBeDisabled();

    // Type incorrect value
    await userEvent.type(inputField, 'INV-77');
    expect(deleteBtn).toBeDisabled();

    // Type correct value
    await userEvent.type(inputField, '7'); // Complete "INV-777"
    expect(deleteBtn).toBeEnabled();
  });

  it('triggers onConfirm callback and closes modal on submission success', async () => {
    const onConfirmMock = vi.fn().mockResolvedValue(undefined);
    renderWithProviders(<ConfirmDestructiveModal {...defaultProps} onConfirm={onConfirmMock} />);

    const deleteBtn = screen.getByRole('button', { name: /Permanently Delete/i });
    const inputField = screen.getByPlaceholderText('Enter invoice number');

    await userEvent.type(inputField, 'INV-777');
    
    await act(async () => {
      deleteBtn.click();
    });

    expect(onConfirmMock).toHaveBeenCalled();
    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('displays API error message when deletion fails', async () => {
    const onConfirmMock = vi.fn().mockRejectedValue(new Error('Internal Database Error'));
    renderWithProviders(<ConfirmDestructiveModal {...defaultProps} onConfirm={onConfirmMock} />);

    const deleteBtn = screen.getByRole('button', { name: /Permanently Delete/i });
    const inputField = screen.getByPlaceholderText('Enter invoice number');

    await userEvent.type(inputField, 'INV-777');
    
    await act(async () => {
      deleteBtn.click();
    });

    await waitFor(() => {
      expect(screen.getByText('Internal Database Error')).toBeInTheDocument();
    });
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });
});
