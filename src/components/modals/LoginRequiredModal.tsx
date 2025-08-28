import React from 'react';
import { Lock, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { Button } from '../ui';

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({ 
  isOpen, 
  onClose, 
  message = 'Você precisa estar logado para acessar esta funcionalidade.' 
}) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleSignUp = () => {
    onClose();
    navigate('/signup');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="Acesso Restrito"
    >
      <div className="p-6">
        {/* Icon and Message */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Login Necessário
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleLogin}
            variant="primary"
            fullWidth
            className="flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Fazer Login</span>
          </Button>
          
          <Button
            onClick={handleSignUp}
            variant="secondary"
            fullWidth
            className="flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Criar Conta</span>
          </Button>
          
          <Button
            onClick={onClose}
            variant="ghost"
            fullWidth
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cancelar
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
            <p>• Acompanhe seus trades e performance</p>
            <p>• Gerencie depósitos e saques</p>
            <p>• Acesse relatórios detalhados</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};