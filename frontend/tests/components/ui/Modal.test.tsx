import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../../../src/components/ui/Modal';

describe('Modal component', () => {
  it('does not render modal structure when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="Test Title">
        <div>Modal Content</div>
      </Modal>
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders modal title, description, and children when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Modal Title" description="Modal description text">
        <div>Modal Content Body</div>
      </Modal>
    );

    expect(screen.getByText('Modal Title')).toBeInTheDocument();
    expect(screen.getByText('Modal description text')).toBeInTheDocument();
    expect(screen.getByText('Modal Content Body')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(
      <Modal isOpen={true} onClose={onCloseMock} title="Modal Title">
        <div>Modal Content</div>
      </Modal>
    );

    const closeBtn = screen.getByLabelText('Close modal');
    fireEvent.click(closeBtn);

    expect(onCloseMock).toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', () => {
    const onCloseMock = vi.fn();
    render(
      <Modal isOpen={true} onClose={onCloseMock} title="Modal Title">
        <div>Modal Content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCloseMock).toHaveBeenCalled();
  });
});
