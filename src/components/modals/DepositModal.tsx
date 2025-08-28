import React from 'react';
import { Modal } from './Modal';
import { DepositForm } from '../trading';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const handleSuccess = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      showCloseButton={false}
    >
      <div className="p-6">
        <DepositForm 
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </div>
    </Modal>
  );
};