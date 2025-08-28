import React from 'react';
import { Modal } from './Modal';
import { DepositHistory } from '../trading';

interface DepositHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositHistoryModal: React.FC<DepositHistoryModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      showCloseButton={false}
    >
      <div className="p-6">
        <DepositHistory onClose={onClose} />
      </div>
    </Modal>
  );
};