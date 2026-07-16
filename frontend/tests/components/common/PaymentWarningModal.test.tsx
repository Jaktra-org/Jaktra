import React from 'react';
import { screen, act } from '../../test-utils';
import { renderWithProviders } from '../../test-utils';
import { PaymentWarningModal } from '../../../src/components/common/PaymentWarningModal';

describe('PaymentWarningModal component', () => {
  it('calls onCancel when close button or cancel button is clicked', async () => {
    const onCancelMock = vi.fn();
    const onConfirmMock = vi.fn();

    renderWithProviders(<PaymentWarningModal onConfirm={onConfirmMock} onCancel={onCancelMock} />);

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    await act(async () => {
      cancelBtn.click();
    });

    expect(onCancelMock).toHaveBeenCalled();
  });

  it('calls onConfirm with dontAskAgain checkbox value parameter', async () => {
    const onCancelMock = vi.fn();
    const onConfirmMock = vi.fn();

    renderWithProviders(<PaymentWarningModal onConfirm={onConfirmMock} onCancel={onCancelMock} />);

    const continueBtn = screen.getByRole('button', { name: /Continue Anyway/i });
    const checkbox = screen.getByLabelText("Don't ask me again");

    // Click continue directly (dontAskAgain is false)
    await act(async () => {
      continueBtn.click();
    });
    expect(onConfirmMock).toHaveBeenLastCalledWith(false);

    // Toggle checkbox and click continue (dontAskAgain is true)
    await act(async () => {
      checkbox.click();
    });
    await act(async () => {
      continueBtn.click();
    });
    expect(onConfirmMock).toHaveBeenLastCalledWith(true);
  });
});
